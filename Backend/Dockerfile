FROM python:3.11-slim AS deps

ENV PIP_NO_CACHE_DIR=1 \
    PIP_INDEX_URL=https://pypi.org/simple \
    PIP_TRUSTED_HOST="pypi.org pypi.python.org files.pythonhosted.org"

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential ca-certificates && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install --upgrade pip \
    && pip install torch==2.3.1+cpu --index-url https://download.pytorch.org/whl/cpu --trusted-host download.pytorch.org --no-cache-dir \
    && pip install -r requirements.txt --no-cache-dir

FROM python:3.11-slim

ENV PIP_NO_CACHE_DIR=1 \
    PIP_INDEX_URL=https://pypi.org/simple

WORKDIR /usr/src/app

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

COPY . .

ENV PYTHONUNBUFFERED=1 \
    APP_MODULE="app.main:app" \
    UVI_WORKERS=4 \
    UVI_HOST=0.0.0.0 \
    UVI_PORT=8000

EXPOSE 8000

CMD ["uvicorn", "--workers", "4", "--host", "0.0.0.0", "--port", "8000", "app.main:app"]
