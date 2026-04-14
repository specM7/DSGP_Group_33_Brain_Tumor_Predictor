import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import os
import sys

# =========================================================
# 1. LOAD MODEL
# =========================================================
MODEL_PATH = "model/NoTumor_CNN_Model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# =========================================================
# 2. CONFIG
# =========================================================
IMG_SIZE = 224

# Class labels (IMPORTANT: match training order)
class_labels = {0: "No Tumor", 1: "Tumor"}

# =========================================================
# 3. PREDICT FUNCTION
# =========================================================
def predict_mri(img_path: str) -> dict:
    # Check file exists
    if not os.path.exists(img_path):
        return {"prediction": "Error", "confidence": 0.0}

    # Load and preprocess
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    prediction = model.predict(img_array, verbose=0)[0][0]

    # Convert to label
    label = class_labels[1] if prediction > 0.5 else class_labels[0]

    return {
        "prediction": label,
        "confidence": float(prediction)
    }

# =========================================================
# 4. MAIN — only runs when executed directly, NOT on import
# =========================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        test_image = "Tr-pi_64.jpg"   # change this
        print(f"ℹ️  No argument given. Using: {test_image}")
    else:
        test_image = sys.argv[1]

    result = predict_mri(test_image)
    print(f"Prediction : {result['prediction']}")
    print(f"Confidence : {result['confidence']:.4f}")