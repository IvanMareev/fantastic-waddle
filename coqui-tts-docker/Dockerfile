FROM --platform=linux/amd64 python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    espeak-ng \
    build-essential \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# ---- важный фикс: сначала torch ----
RUN pip install --no-cache-dir torch==2.1.2 torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

RUN mkdir -p outputs

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
