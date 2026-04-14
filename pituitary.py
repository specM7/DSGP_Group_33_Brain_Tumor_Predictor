import json
import os

import joblib
import numpy as np
from PIL import Image, ImageOps
import torch
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights


FEATURE_EXTRACTOR_NAME = "efficientnet_b0"


def load_config(model_dir):
    cfg_path = os.path.join(model_dir, "config.json")
    if os.path.exists(cfg_path):
        with open(cfg_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def load_feature_extractor(model_dir, device):
    preprocess = EfficientNet_B0_Weights.DEFAULT.transforms()

    model = efficientnet_b0(weights=None)
    model.classifier = torch.nn.Identity()

    ckpt_path = os.path.join(model_dir, "feature_extractor.pth")
    if not os.path.exists(ckpt_path):
        raise FileNotFoundError(f"Missing feature extractor weights: {ckpt_path}")

    state_dict = torch.load(ckpt_path, map_location=device)
    try:
        model.load_state_dict(state_dict)
    except RuntimeError:
        model.load_state_dict(state_dict, strict=False)

    model.eval()
    model.to(device)

    return model, preprocess


def load_hybrid_model(model_dir):
    rf_path = os.path.join(model_dir, "rf_classifier.pkl")
    if not os.path.exists(rf_path):
        raise FileNotFoundError(f"Missing rf classifier: {rf_path}")

    rf_classifier = joblib.load(rf_path)

    pca = None
    if hasattr(rf_classifier, "named_steps") and "pca" in rf_classifier.named_steps:
        pca = rf_classifier.named_steps.get("pca")
    else:
        pca_path = os.path.join(model_dir, "pca.pkl")
        if os.path.exists(pca_path):
            pca = joblib.load(pca_path)

    return rf_classifier, pca


def extract_features(image_path, feature_extractor, preprocess, device):
    img = Image.open(image_path).convert("RGB")
    img = ImageOps.exif_transpose(img)
    img_tensor = preprocess(img).unsqueeze(0).to(device)

    with torch.no_grad():
        feats = feature_extractor(img_tensor).cpu().numpy()

    return feats


def _validate_and_transform_features(feats, rf_classifier, pca):
    feat_dim = feats.shape[1]

    if hasattr(rf_classifier, "named_steps"):
        pca_step = rf_classifier.named_steps.get("pca")
        if pca_step is not None and hasattr(pca_step, "n_features_in_"):
            if pca_step.n_features_in_ != feat_dim:
                raise ValueError(
                    f"Feature dim mismatch: pipeline PCA expects {pca_step.n_features_in_} "
                    f"features, got {feat_dim}. Check preprocessing or feature extractor."
                )
        return feats

    if pca is not None:
        if hasattr(pca, "n_features_in_") and pca.n_features_in_ != feat_dim:
            raise ValueError(
                f"PCA expects {pca.n_features_in_} features, got {feat_dim}."
            )
        feats = pca.transform(feats)
        feat_dim = feats.shape[1]

    expected = getattr(rf_classifier, "n_features_in_", None)
    if expected is not None and expected != feat_dim:
        raise ValueError(
            f"RF expects {expected} features, got {feat_dim}. "
            "This usually means PCA was not applied or the wrong model files were loaded."
        )

    return feats


def predict_image(image_path, feature_extractor, preprocess, rf_classifier, pca, device):
    label_map = {0: "no", 1: "pi"}

    feats = extract_features(image_path, feature_extractor, preprocess, device)
    feats = _validate_and_transform_features(feats, rf_classifier, pca)

    pred = rf_classifier.predict(feats)[0]
    prob = rf_classifier.predict_proba(feats)[0]

    pred = int(pred)
    label = label_map.get(pred, str(pred))
    confidence = float(prob[pred])

    return label, confidence, prob


def predict(image_path, model_dir="/model", device=None):
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")

    _cfg = load_config(model_dir)
    _ = _cfg.get("feature_extractor", FEATURE_EXTRACTOR_NAME)

    rf_classifier, pca = load_hybrid_model(model_dir)
    feature_extractor, preprocess = load_feature_extractor(model_dir, device)

    label, confidence, prob = predict_image(
        image_path=image_path,
        feature_extractor=feature_extractor,
        preprocess=preprocess,
        rf_classifier=rf_classifier,
        pca=pca,
        device=device
    )

    return {
        "prediction": "pituitary" if label == "pi" else "not pituitary",
        "raw_label": label,
        "confidence": confidence,
        "probabilities": prob.tolist()
    }