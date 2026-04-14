import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import sys

# =========================================================
# 1. LOAD MODEL
# =========================================================
model = tf.keras.models.load_model("model/MRI_Validation_CNN_Model.h5")

# =========================================================
# 2. CONFIG
# =========================================================
IMG_SIZE = 224

# Class labels (IMPORTANT: match training order)
class_labels = {0: "Valid", 1: "Invalid"}

# =========================================================
# 3. PREDICT FUNCTION
# =========================================================
def predict_image(img_path: str) -> tuple:
    # Load and preprocess
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    prediction = model.predict(img_array, verbose=0)[0][0]

    # Convert to label
    label = class_labels[1] if prediction > 0.5 else class_labels[0]

    return label, float(prediction)

# =========================================================
# 4. MAIN — only runs when executed directly, NOT on import
# =========================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        img_path = "Tr-aug-me_19.jpg"   # change this
        print(f"ℹ️  No argument given. Using: {img_path}")
    else:
        img_path = sys.argv[1]

    label, confidence = predict_image(img_path)
    print(f"Prediction : {label}")
    print(f"Confidence : {confidence:.4f}")