import os
import re
import threading
from typing import Tuple

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel


# ---------------------------
# Configuration (env overridable)
# ---------------------------
BASE_MODEL = os.getenv("BASE_MODEL", "meta-llama/Llama-3.2-3B")
ADAPTER_PATH = os.getenv("ADAPTER_PATH", "adapter_model.safetensors")
SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    "You are NeuroLens, a professional AI medical assistant specialized in brain tumor diagnosis, "
    "MRI scans, and treatment guidance. Always give clear, accurate, and structured answers. "
    "Be polite and human-like. If a question is unrelated, politely say you only handle brain tumor "
    "related queries.",
)
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "256"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
TOP_P = float(os.getenv("TOP_P", "0.9"))


def normalize_question(text: str) -> str:
    text = text.casefold()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _tokenize(text: str) -> Tuple[str, ...]:
    return tuple(text.split())


def _has_any_token(tokens: Tuple[str, ...], words: Tuple[str, ...]) -> bool:
    token_set = set(tokens)
    return any(w in token_set for w in words)


def _has_any_phrase(text: str, phrases: Tuple[str, ...]) -> bool:
    return any(p in text for p in phrases)


def is_greeting(q: str) -> bool:
    tokens = _tokenize(q)
    greeting_words = ("hi", "hello", "hey", "yo", "hii")
    greeting_phrases = ("good morning", "good evening", "good afternoon")
    return _has_any_token(tokens, greeting_words) or _has_any_phrase(q, greeting_phrases)


def is_thanks(q: str) -> bool:
    tokens = _tokenize(q)
    thanks_words = ("thank", "thanks", "thx", "appreciate", "grateful")
    thanks_phrases = ("thank you",)
    return _has_any_token(tokens, thanks_words) or _has_any_phrase(q, thanks_phrases)


def is_bye(q: str) -> bool:
    tokens = _tokenize(q)
    bye_words = ("bye", "goodbye", "gn")
    bye_phrases = ("see you", "take care", "good night")
    return _has_any_token(tokens, bye_words) or _has_any_phrase(q, bye_phrases)


def is_brain_related(q: str) -> bool:
    tokens = _tokenize(q)
    keywords = (
        "tumor",
        "brain",
        "glioma",
        "meningioma",
        "pituitary",
        "mri",
        "scan",
        "cancer",
        "treatment",
        "symptom",
        "diagnosis",
        "hospital",
        "doctor",
        "neurolens",
        "founder",
    )
    phrases = ("brain tumor", "mri scan", "ct scan")
    return _has_any_token(tokens, keywords) or _has_any_phrase(q, phrases)


def get_predefined_response(question: str) -> str | None:
    q = normalize_question(question)

    if is_greeting(q):
        return (
            "Hello! Welcome to NeuroLens. I can help you with brain tumor, MRI scans, "
            "and medical information. What would you like to know?"
        )

    if is_thanks(q):
        return "You're very welcome. I'm always here to help with brain-related medical questions."

    if is_bye(q):
        return "Goodbye. Stay healthy and take care. If you need help again, feel free to come back."

    if "founder" in q:
        return (
            "NeuroLens was developed by Malindu Manchanayake, Adrian Vethanayagam, "
            "Vidu Liyanage, and Mohamed Ahshaan from IIT Campus Colombo."
        )

    if "tumor types" in q or "types of tumor" in q:
        return "The main brain tumor types are: Glioma, Meningioma, Pituitary tumor, and No Tumor."

    if "what is brain tumor" in q:
        return (
            "A brain tumor is an abnormal growth of cells in the brain. "
            "It can be benign or malignant and requires proper diagnosis."
        )

    if "symptom" in q:
        return "Symptoms can include headaches, seizures, vision problems, memory loss, and weakness."

    if ("mri" in q and "ct" in q) or "mri or ct" in q:
        return "MRI is generally more accurate for brain tumors. CT is faster and used in emergencies."

    if not is_brain_related(q):
        return (
            "I specialize in brain tumor and MRI related questions. "
            "Please ask something related to brain health."
        )

    return None


# ---------------------------
# Model loading (once)
# ---------------------------
_model = None
_tokenizer = None
_model_lock = threading.Lock()


def _resolve_adapter_dir(adapter_path: str) -> str:
    if os.path.isdir(adapter_path):
        return adapter_path
    return os.path.dirname(adapter_path) or "."


def _verify_adapter_files(adapter_path: str) -> None:
    adapter_dir = _resolve_adapter_dir(adapter_path)
    config_path = os.path.join(adapter_dir, "adapter_config.json")
    if not os.path.exists(config_path):
        raise RuntimeError(
            "adapter_config.json not found. "
            "PEFT adapters require both adapter_config.json and adapter_model.safetensors "
            "in the same directory. Set ADAPTER_PATH to that directory."
        )


def _load_model():
    global _model, _tokenizer

    with _model_lock:
        if _model is not None and _tokenizer is not None:
            return _model, _tokenizer

        if not os.path.exists(ADAPTER_PATH):
            raise RuntimeError(f"Adapter not found at: {ADAPTER_PATH}")

        _verify_adapter_files(ADAPTER_PATH)

        if torch.cuda.is_available():
            dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
            device_map = "auto"
        else:
            dtype = torch.float32
            device_map = None

        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        tokenizer.padding_side = "left"

        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL,
            torch_dtype=dtype,
            device_map=device_map,
        )

        adapter_dir = _resolve_adapter_dir(ADAPTER_PATH)
        model = PeftModel.from_pretrained(base_model, adapter_dir)
        model.eval()

        _model, _tokenizer = model, tokenizer
        return _model, _tokenizer


# ---------------------------
# FastAPI app
# ---------------------------
app = FastAPI(title="Chatbot Backend", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    reply: str
    source: str  # "faq" or "model"


def _build_prompt(user_text: str, tokenizer) -> str:
    if hasattr(tokenizer, "apply_chat_template"):
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ]
        return tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
    return f"{SYSTEM_PROMPT}\nUser: {user_text}\nAssistant:"


@app.on_event("startup")
def _startup():
    # Warm load the model on startup for lower latency on first request.
    _load_model()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty.")

    predefined = get_predefined_response(query)
    if predefined:
        return ChatResponse(reply=predefined, source="faq")

    model, tokenizer = _load_model()
    prompt = _build_prompt(query, tokenizer)

    inputs = tokenizer(prompt, return_tensors="pt")
    if hasattr(model, "device"):
        inputs = {k: v.to(model.device) for k, v in inputs.items()}

    do_sample = TEMPERATURE > 0
    with torch.inference_mode():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=do_sample,
            temperature=TEMPERATURE if do_sample else None,
            top_p=TOP_P if do_sample else None,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )

    new_tokens = output_ids[0][inputs["input_ids"].shape[-1] :]
    reply = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
    return ChatResponse(reply=reply, source="model")
