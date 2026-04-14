import tensorflow as tf
import numpy as np
from PIL import Image
import sys
import os

# =========================================================
# 1. CUSTOM LAYER (must match training script exactly)
# =========================================================
class EfficientNetPreprocess(tf.keras.layers.Layer):
    def call(self, inputs):
        return tf.keras.applications.efficientnet.preprocess_input(inputs)

    def get_config(self):
        return super().get_config()

# =========================================================
# 2. CONFIG
# =========================================================
MODEL_PATH = "model/glioma_model.keras"   # Change to your actual model filename
IMG_SIZE   = 380
THRESHOLD  = 0.5

# Class mapping — as per your training directory order:
# class 0 = glioma, class 1 = not glioma
# model outputs a sigmoid score closer to 0 = glioma, closer to 1 = not glioma
CLASS_NAMES = {
    0: "GLIOMA DETECTED",
    1: "NO GLIOMA"
}

# =========================================================
# 3. LOAD MODEL
# =========================================================
print(f"\n📦 Loading model from: {MODEL_PATH}")

if not os.path.exists(MODEL_PATH):
    print(f"❌ Model file not found at: {MODEL_PATH}")
    sys.exit(1)

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={"EfficientNetPreprocess": EfficientNetPreprocess}
)
print("Model loaded successfully\n")

# =========================================================
# 4. PREDICT FUNCTION
# =========================================================
def predict(image_path: str):
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return

    # Load and preprocess
    img = Image.open(image_path).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)  # shape: (1, 380, 380, 3)

    # Predict
    # Sigmoid score: close to 0 = glioma (class 0), close to 1 = not glioma (class 1)
    score = model.predict(img_array, verbose=0)[0][0]
    predicted_class = 1 if score >= THRESHOLD else 0
    label = CLASS_NAMES[predicted_class]

    # Confidence is how far the score is from the decision boundary
    confidence = score if predicted_class == 1 else (1 - score)

    # Output
    print(f"  Image          : {image_path}")
    print(f"  Result         : {label}")
    print(f"  Confidence     : {confidence * 100:.2f}%")
    print(f"  Raw Score      : {score:.4f}  (< {THRESHOLD} = Glioma, >= {THRESHOLD} = Not Glioma)")
    print()

# =========================================================
# 5. MAIN — pass image path as argument or edit list below
# =========================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        # -------------------------------------------------------
        # No argument given — edit this list to test local images
        # -------------------------------------------------------
        test_images = [
            "Tr-no_1.jpg",       # <- change these to your actual image paths
            "Tr-pi_64.jpg",
        ]
        print("ℹ️  No image path provided. Testing hardcoded list...\n")
        for path in test_images:
            predict(path)
    else:
        # Run with:  python test_model.py path/to/image.jpg
        for path in sys.argv[1:]:
            predict(path)