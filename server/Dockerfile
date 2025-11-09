# syntax=docker/dockerfile:1.7
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser
WORKDIR /app

# Build context will be ./server, so these paths are relative to server/
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY . /app
RUN [ -f "app/__init__.py" ] || echo > app/__init__.py

USER appuser
EXPOSE 8000
ENV PORT=${UVICORN_PORT}
CMD ["sh", "-c", "uvicorn app.main:app --host ${UVICORN_HOST} --port ${PORT}"]