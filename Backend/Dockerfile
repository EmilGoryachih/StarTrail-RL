FROM python:3.11-slim AS deps

ENV PIP_NO_CACHE_DIR=1 \
    PIP_INDEX_URL=https://pypi.org/simple \
    HF_HOME=/usr/src/app/cache \
    EMBED_MODEL=/usr/src/app/cache/all-MiniLM-L6-v2

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.3.1+cpu \
    && pip install --no-cache-dir huggingface_hub hf_transfer \
    && pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /usr/src/app/cache && \
    HF_HUB_ENABLE_HF_TRANSFER=1 python - <<'PY' && echo "MiniLM model downloaded"
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id="sentence-transformers/all-MiniLM-L6-v2",
    local_dir="/usr/src/app/cache/all-MiniLM-L6-v2",
    local_dir_use_symlinks=False,
)
print("Done")
PY

FROM python:3.11-slim

ENV PIP_NO_CACHE_DIR=1 \
    PIP_INDEX_URL=https://pypi.org/simple \
    HF_HOME=/usr/src/app/cache \
    EMBED_MODEL=/usr/src/app/cache/all-MiniLM-L6-v2

WORKDIR /usr/src/app

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY --from=deps /usr/src/app/cache /usr/src/app/cache

COPY . .

ENV PYTHONUNBUFFERED=1 \
    APP_MODULE="app.main:app" \
    UVI_WORKERS=4 \
    UVI_HOST=0.0.0.0 \
    UVI_PORT=8000

EXPOSE 8000

CMD ["uvicorn", "--workers", "4", "--host", "0.0.0.0", "--port", "8000", "app.main:app"]
