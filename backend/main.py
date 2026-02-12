import os
import shutil
import torch
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = FastAPI(title="Speech to Translate Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Faster-Whisper (ASR)
# 'tiny' or 'base' are best for CPU without a GPU. 
# compute_type="int8" reduces memory usage by 4x.
logger.info("Loading ASR Model (Faster-Whisper)...")
stt_model = WhisperModel("base", device="cpu", compute_type="int8")

# 2. M2M100 (NMT)
# M2M100 is a true many-to-many model, much more powerful than basic translators.
logger.info("Loading Translation Model (M2M100)...")
model_name = "facebook/m2m100_418M"
tokenizer = M2M100Tokenizer.from_pretrained(model_name)
translation_model = M2M100ForConditionalGeneration.from_pretrained(model_name)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/translate") 
async def translate_speech(file: UploadFile = File(...), target_lang: str = Form(...)):

    file_path = os.path.join(UPLOAD_DIR, f"temp_{file.filename}")
    
    try:
        # Save the uploaded audio chunk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # STEP 1: TRANSCRIPTION & LANGUAGE DETECTION
        # beam_size=5 provides higher accuracy for complex sentences
        segments, info = stt_model.transcribe(file_path, beam_size=5)
        transcription = " ".join([segment.text for segment in segments]).strip()
        detected_lang = info.language 
        
        logger.info(f"Detected: {detected_lang} | Text: {transcription}")

        if not transcription:
            return {
                "transcription": "", 
                "translation": "No speech detected. Please try again.", 
                "detected_language": detected_lang
            }

        # STEP 2: MULTILINGUAL TRANSLATION
        # Set source language for the tokenizer
        tokenizer.src_lang = detected_lang
        encoded_input = tokenizer(transcription, return_tensors="pt")
        
        # Generate translation
        # forced_bos_token_id tells the model which language to output
        generated_tokens = translation_model.generate(
            **encoded_input, 
            forced_bos_token_id=tokenizer.get_lang_id(target_lang)
        )
        
        translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
        
        return {
            "detected_language": detected_lang,
            "transcription": transcription,
            "translation": translation,
            "status": "success"
        }

    except Exception as e:
        logger.error(f"Processing Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup to prevent disk bloat
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/health")
async def health():
    return {"status": "ok", "torch_version": torch.__version__}