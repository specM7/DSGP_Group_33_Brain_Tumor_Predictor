import sys
import importlib
import numpy as np
from PIL import Image
import torch

# =========================================================
# Import all modules
# All files must be in the same folder as this file
# =========================================================
mri_validation = importlib.import_module("mri_validation")
no_tumor       = importlib.import_module("no_tumor")
import meningioma
import glioma
import pituitary   # <-- new module


# =========================================================
# PIPELINE — returns a structured dict instead of printing
# =========================================================
def run_pipeline(image_path: str, pituitary_model_dir: str = "model") -> dict:

    result = {
        "image": image_path,
        "steps": {},
        "final": {
            "diagnosis": None,
            "confidence": None,
            "message": None
        }
    }

    # ----------------------------------------------------------
    # STEP 1 — MRI Validation
    # ----------------------------------------------------------
    label, confidence = mri_validation.predict_image(image_path)

    result["steps"]["mri_validation"] = {
        "result": label,
        "confidence": round(float(confidence), 4)
    }

    if label == "Invalid":
        result["final"] = {
            "diagnosis": "Invalid MRI",
            "confidence": round(float(confidence), 4),
            "message": "Image is not a valid MRI scan. Please upload a proper brain MRI."
        }
        return result

    # ----------------------------------------------------------
    # STEP 2 — No Tumour Check
    # ----------------------------------------------------------
    tumor_result = no_tumor.predict_mri(image_path)

    result["steps"]["tumor_detection"] = {
        "result": tumor_result["prediction"],
        "confidence": round(float(tumor_result["confidence"]), 4)
    }

    if tumor_result["prediction"] == "No Tumor":
        result["final"] = {
            "diagnosis": "No Tumor",
            "confidence": round(float(tumor_result["confidence"]), 4),
            "message": "No tumour detected in the MRI scan."
        }
        return result

    # ----------------------------------------------------------
    # STEP 3 — Meningioma Check
    # ----------------------------------------------------------
    mening_result = meningioma.predict(image_path)

    result["steps"]["meningioma"] = {
        "result": mening_result["prediction"],
        "confidence": round(float(mening_result["confidence"]), 4)
    }

    if mening_result["prediction"].lower() == "meningioma":
        result["final"] = {
            "diagnosis": "Meningioma",
            "confidence": round(float(mening_result["confidence"]), 4),
            "message": "Meningioma tumour detected. Please consult a specialist."
        }
        return result

    # ----------------------------------------------------------
    # STEP 4 — Pituitary Check
    # ----------------------------------------------------------
    pit_result = pituitary.predict(image_path, model_dir=pituitary_model_dir)

    result["steps"]["pituitary"] = {
        "result": pit_result["prediction"],
        "confidence": round(float(pit_result["confidence"]), 4),
        "raw_label": pit_result["raw_label"],
        "probabilities": [round(float(p), 4) for p in pit_result["probabilities"]]
    }

    if pit_result["prediction"] == "pituitary":
        result["final"] = {
            "diagnosis": "Pituitary",
            "confidence": round(float(pit_result["confidence"]), 4),
            "message": "Pituitary tumour detected. Please consult a specialist."
        }
        return result

    # ----------------------------------------------------------
    # STEP 5 — Glioma Check
    # ----------------------------------------------------------
    img = Image.open(image_path).convert("RGB")
    img = img.resize((glioma.IMG_SIZE, glioma.IMG_SIZE))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    score = glioma.model.predict(img_array, verbose=0)[0][0]
    predicted_class = 1 if score >= glioma.THRESHOLD else 0
    glioma_label = glioma.CLASS_NAMES[predicted_class]
    glioma_conf = float(score if predicted_class == 1 else (1 - score))

    result["steps"]["glioma"] = {
        "result": glioma_label,
        "confidence": round(glioma_conf, 4),
        "raw_score": round(float(score), 4)
    }

    # IMPORTANT:
    # Your original logic says predicted_class == 0 means Glioma.
    # Keep it only if that matches your trained label mapping.
    if predicted_class == 0:
        result["final"] = {
            "diagnosis": "Glioma",
            "confidence": round(glioma_conf, 4),
            "message": "Glioma tumour detected. Please consult a specialist immediately."
        }
    else:
        result["final"] = {
            "diagnosis": "Tumour (Unclassified)",
            "confidence": round(glioma_conf, 4),
            "message": "A tumour was detected but could not be classified as meningioma, pituitary, or glioma. Further analysis recommended."
        }

    return result


# =========================================================
# MAIN — for standalone testing
# =========================================================
if __name__ == "__main__":
    import json

    if len(sys.argv) < 2:
        test_image = "test.jpg"
        print(f"ℹ️  No argument given. Using: {test_image}")
    else:
        test_image = sys.argv[1]

    output = run_pipeline(test_image, pituitary_model_dir="/model")
    print(json.dumps(output, indent=2))