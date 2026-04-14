import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import sys

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model setup (same as training)
model = models.resnet50(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)

# Load weights
model.load_state_dict(torch.load("model/meningioma_model.pth", map_location=device))
model.to(device)
model.eval()

# Transform (same as validation!)
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

class_names = ["meningioma", "non_meningioma"]

def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():                    # fixed: was outside function before
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, pred = torch.max(probs, 1)

    return {                                 # fixed: return dict instead of print
        "prediction": class_names[pred.item()],
        "confidence": confidence.item()
    }

# fixed: only runs when executed directly, not when imported by pipeline.py
if __name__ == "__main__":
    if len(sys.argv) < 2:
        test_image = "Tr-aug-me_1.jpg"
        print(f"ℹ️  No argument given. Using: {test_image}")
    else:
        test_image = sys.argv[1]

    result = predict(test_image)
    print(f"Prediction : {result['prediction']}")
    print(f"Confidence : {result['confidence']:.4f}")