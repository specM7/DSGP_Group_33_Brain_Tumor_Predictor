import io
import base64
import numpy as np
import cv2
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms
from pytorch_grad_cam import GradCAMPlusPlus
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import timm

# ========================
# CONFIG
# ========================
IMG_SIZE = 380
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Must match your training setup
CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]  # ← adjust to your classes


# ========================
# MODEL (loaded once at import time)
# ========================
def _build_model() -> nn.Module:
    m = timm.create_model("efficientnet_b4", pretrained=False)
    m.classifier = nn.Linear(m.classifier.in_features, len(CLASS_NAMES))
    m.load_state_dict(
        torch.load("model/tumor_mapping.pth", map_location=device)
    )
    m.to(device).eval()
    return m


_model = _build_model()
_cam   = GradCAMPlusPlus(model=_model, target_layers=[_model.blocks[-1]])

# ========================
# TRANSFORM
# ========================
_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


# ========================
# HELPERS
# ========================
def _crop_brain(img: Image.Image) -> Image.Image:
    """Crop to the tightest bounding box around the brain region."""
    img_np = np.array(img)
    gray   = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return img
    x, y, w, h = cv2.boundingRect(max(contours, key=cv2.contourArea))
    return Image.fromarray(img_np[y:y + h, x:x + w])


def _to_base64_png(rgb_array: np.ndarray) -> str:
    """Convert an H×W×3 uint8 RGB array to a base64-encoded PNG string."""
    pil = Image.fromarray(rgb_array.astype(np.uint8))
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ========================
# PUBLIC API
# ========================
def generate_gradcam(img_path: str, mask_threshold: float = 0.6) -> dict:
    """
    Run Grad-CAM++ on *img_path* and return a dict with base64 image strings.

    Returns
    -------
    {
        "predicted_class": "glioma",
        "class_index":     0,
        "overlay":         "<base64 PNG>",   ← CAM heatmap blended onto image
        "heatmap":         "<base64 PNG>",   ← raw jet-coloured CAM
        "mask":            "<base64 PNG>",   ← binary mask above threshold
    }
    """
    # ---------- load & preprocess ----------
    pil         = Image.open(img_path).convert("RGB")
    pil         = _crop_brain(pil)
    pil_resized = pil.resize((IMG_SIZE, IMG_SIZE))

    x = _transform(pil_resized).unsqueeze(0).to(device)

    # ---------- predict ----------
    with torch.no_grad():
        class_idx = _model(x).argmax(1).item()

    # ---------- Grad-CAM++ ----------
    grayscale_cam = _cam(
        input_tensor=x,
        targets=[ClassifierOutputTarget(class_idx)],
    )[0]                                          # shape: (H, W)
    grayscale_cam = cv2.resize(grayscale_cam, (IMG_SIZE, IMG_SIZE))

    # ---------- build output images ----------
    original_np = np.array(pil_resized).astype(np.float32) / 255.0

    # 1. Overlay  — heatmap blended onto the original image
    overlay_rgb = show_cam_on_image(original_np, grayscale_cam, use_rgb=True)

    # 2. Heatmap  — jet-coloured CAM as a standalone image
    heatmap_jet = cv2.applyColorMap(
        (grayscale_cam * 255).astype(np.uint8), cv2.COLORMAP_JET
    )
    heatmap_rgb = cv2.cvtColor(heatmap_jet, cv2.COLOR_BGR2RGB)

    # 3. Binary mask
    mask = ((grayscale_cam > mask_threshold) * 255).astype(np.uint8)
    mask_rgb = np.stack([mask, mask, mask], axis=-1)   # grey → RGB for consistency

    return {
        "predicted_class": CLASS_NAMES[class_idx],
        "class_index":     class_idx,
        "overlay":         _to_base64_png(overlay_rgb),
        "heatmap":         _to_base64_png(heatmap_rgb),
        "mask":            _to_base64_png(mask_rgb),
    }
