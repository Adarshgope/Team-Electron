from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once
model = WhisperModel("base", compute_type="int8")

def speech_to_text(audio_path):
    segments, _ = model.transcribe(audio_path)
    text = " ".join([segment.text for segment in segments])
    return text.strip()

@app.post("/speech-to-text")
async def convert_speech(file: UploadFile = File(...)):
    temp_audio = "temp_audio.wav"

    with open(temp_audio, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    transcript = speech_to_text(temp_audio)
    return {"transcript": transcript}
