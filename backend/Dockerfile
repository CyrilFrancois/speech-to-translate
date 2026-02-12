FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --only-binary :all: -r requirements.txt

RUN python -c "from faster_whisper import WhisperModel; WhisperModel('base', device='cpu')"
RUN python -c "from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer; \
    M2M100Tokenizer.from_pretrained('facebook/m2m100_418M'); \
    M2M100ForConditionalGeneration.from_pretrained('facebook/m2m100_418M')"

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]