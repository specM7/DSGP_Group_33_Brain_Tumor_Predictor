import os
import uuid
import logging
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
from pipeline import run_pipeline
from gradcam import generate_gradcam

# ==============================
# 🔹 LOGGING
# ==============================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ==============================
# 🔹 FLASK APP
# ==============================

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

UPLOAD_FOLDER      = "uploads"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==============================
# 🔹 LOAD CHATBOT MODEL
# ==============================

MODEL_BASE = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
MODEL_PATH = "./neurolens_chatbot"

SYSTEM_PROMPT = (
    "You are NeuroLens, a professional AI medical assistant specialized in brain tumor diagnosis, MRI scans, and treatment guidance. "
    "Always give clear, accurate, and structured answers. "
    "Be polite and human-like. "
    "If question is unrelated, politely say you only handle brain tumor related queries."
)

logger.info("Loading NeuroLens chatbot model...")
tokenizer  = AutoTokenizer.from_pretrained(MODEL_BASE)
tokenizer.pad_token = tokenizer.eos_token
base_model = AutoModelForCausalLM.from_pretrained(MODEL_BASE, torch_dtype=torch.float32)
chat_model = PeftModel.from_pretrained(base_model, MODEL_PATH)
chat_model.eval()
logger.info("Chatbot model loaded.")

# ==============================
# 🔹 CHATBOT HELPERS
# ==============================

def is_greeting(q):
    return any(w in q for w in ["hi","hello","hey","yo","hii","good morning","good evening","good afternoon"])

def is_thanks(q):
    return any(w in q for w in ["thank","thanks","thx","appreciate","grateful"])

def is_bye(q):
    return any(w in q for w in ["bye","goodbye","see you","take care","gn","good night"])

def is_brain_related(q):
    keywords = [
        "tumor","brain","glioma","meningioma","pituitary",
        "mri","scan","cancer","treatment","symptom","diagnosis",
        "hospital","doctor","neurolens","founder"
    ]
    return any(k in q for k in keywords)

def get_answer(question: str) -> str:
    q = question.lower().strip()

    if is_greeting(q):
        return "Hello 👋 Welcome to NeuroLens. I can help you with brain tumor, MRI scans, and medical information. What would you like to know?"
    if is_thanks(q):
        return "You're very welcome 😊 I'm always here to help you with any brain-related medical questions."
    if is_bye(q):
        return "Goodbye 👋 Stay healthy and take care. If you need help again, feel free to come back anytime."
    if "founder" in q:
        return "NeuroLens was developed by Malindu Manchanayake, Adrian Vethanayagam, Vidu Liyanage, and Mohamed Ahshaan from IIT Campus Colombo."
    if "tumor types" in q or "types of tumor" in q:
        return "The main brain tumor types are: Glioma, Meningioma, Pituitary tumor, and No Tumor."
    if "what is brain tumor" in q:
        return "A brain tumor is an abnormal growth of cells in the brain. It can be benign or malignant and requires proper diagnosis."
    if "symptom" in q:
        return "Symptoms include headaches, seizures, vision problems, memory loss, and weakness in the body."
    if "mri or ct" in q:
        return "MRI is more accurate for brain tumors. CT scan is faster and used in emergencies."
    if not is_brain_related(q):
        return "I specialize in brain tumor and MRI related questions. Please ask something related to brain health."

    # LLM fallback
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": question},
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(prompt, return_tensors="pt")

    with torch.no_grad():
        output = chat_model.generate(
            **inputs,
            max_new_tokens=180,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
            repetition_penalty=1.2,
        )

    new_tokens = output[0][inputs["input_ids"].shape[-1]:]
    answer = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
    return answer if len(answer) >= 5 else "Could you please rephrase your question? I will help you."

# ==============================
# 🔹 FILE UPLOAD HELPERS
# ==============================

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def _save_upload(file) -> str:
    if file.filename == "":
        raise ValueError("Empty filename received.")
    if not allowed_file(file.filename):
        raise ValueError("Unsupported file format. Please upload JPG or PNG.")
    ext       = file.filename.rsplit(".", 1)[1].lower()
    temp_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}.{ext}")
    file.save(temp_path)
    logger.info(f"Saved upload: {temp_path}")
    return temp_path

# ==============================
# 🔹 ROUTES
# ==============================

@app.route("/health", methods=["GET"])
def health():
    """Health check."""
    return jsonify({"status": "ok"})


@app.route("/chat", methods=["POST"])
def chat():
    """
    NeuroLens chatbot endpoint.
    Request  : { "message": "What is glioma?" }
    Response : { "response": "Glioma is ..." }
    """
    body = request.get_json(silent=True)
    if not body or "message" not in body:
        return jsonify({"error": "Send a JSON body with a 'message' field."}), 400

    user_input = body["message"].strip()
    if not user_input:
        return jsonify({"error": "Message cannot be empty."}), 400

    try:
        reply = get_answer(user_input)
        logger.info(f"Chat | user: {user_input[:60]} | reply: {reply[:60]}")
        return jsonify({"response": reply}), 200
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        return jsonify({"error": f"Chatbot error: {str(e)}"}), 500


@app.route("/predict", methods=["POST"])
def predict():
    """
    Run the full 4-step diagnostic pipeline.
    Response shape:
    {
        "image": "uploads/abc123.jpg",
        "steps": { ... },
        "final": { "diagnosis": "Glioma", "confidence": 0.93, "message": "..." }
    }
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send a 'file' field in the form data."}), 400

    temp_path = None
    try:
        temp_path = _save_upload(request.files["file"])
        result    = run_pipeline(temp_path)
        logger.info(f"Pipeline result: {result['final']}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f"Cleaned up: {temp_path}")


@app.route("/gradcam", methods=["POST"])
def gradcam():
    """
    Run Grad-CAM++ and return base64-encoded visualisation images.
    Optional form field:
        mask_threshold  float  default 0.6
    Response shape:
    {
        "predicted_class": "glioma",
        "class_index":     0,
        "overlay":  "<base64 PNG>",
        "heatmap":  "<base64 PNG>",
        "mask":     "<base64 PNG>"
    }
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send a 'file' field in the form data."}), 400

    temp_path = None
    try:
        threshold = float(request.form.get("mask_threshold", 0.6))
        temp_path = _save_upload(request.files["file"])
        result    = generate_gradcam(temp_path, mask_threshold=threshold)
        logger.info(f"Grad-CAM++ predicted: {result['predicted_class']}")
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Grad-CAM error: {e}", exc_info=True)
        return jsonify({"error": f"Grad-CAM failed: {str(e)}"}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f"Cleaned up: {temp_path}")


# ==============================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    logger.info(f"Starting NeuroLens API on http://localhost:{port}")
    app.run(
        host="0.0.0.0",
        port=port,
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
