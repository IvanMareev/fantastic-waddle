from fastapi import FastAPI
from pydantic import BaseModel
from TTS.api import TTS
import uuid
import os

app = FastAPI()

# грузим модель один раз при старте контейнера
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")

OUTPUT_DIR = "outputs"


class SynthesisRequest(BaseModel):
    text: str
    language: str = "ru"


@app.post("/tts")
def synthesize(req: SynthesisRequest):
    file_id = str(uuid.uuid4())
    output_path = f"{OUTPUT_DIR}/{file_id}.wav"

    tts.tts_to_file(
        text=req.text,
        file_path=output_path,
        language=req.language
    )

    return {
        "file": output_path
    }


@app.get("/health")
def health():
    return {"status": "ok"}
