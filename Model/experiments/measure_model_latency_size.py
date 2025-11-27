import os, time, faiss, numpy as np, pandas as pd
from sentence_transformers import SentenceTransformer


MODELS = {
    "LaBSE":                "sentence-transformers/LaBSE",           # 768-d
    "MiniLM-6-L12":         "paraphrase-MiniLM-L6-v2",               # 384-d
    "MiniLM-12-L6":         "all-MiniLM-L12-v2",                     # 384-d
}
VALIDATION_QUERIES = "./results/validation_queries_without_city.txt"
TOP_K = 10

RESULT = []
for model_name, model_path in MODELS.items():
    # load index
    idx_file = f"./indexes/{model_name}.index"
    t0 = time.time()
    index = faiss.read_index(idx_file)
    load_time = time.time() - t0

    # measure size
    size_mb = os.path.getsize(idx_file) / (1024*1024)

    # measure encode/search latency on validation set
    embedder = SentenceTransformer(model_path)
    queries  = open(VALIDATION_QUERIES).read().splitlines()
    enc_times = []
    srch_times = []
    for q in queries:
        t1 = time.time()
        v = embedder.encode([q], convert_to_numpy=True)
        faiss.normalize_L2(v)
        t2 = time.time()
        _ = index.search(v, TOP_K)
        t3 = time.time()
        enc_times.append((t2 - t1)*1000)
        srch_times.append((t3 - t2)*1000)

    RESULT.append({
        "model": model_name,
        "load_ms": round(load_time*1000,1),
        "index_mb": round(size_mb,1),
        "avg_enc_ms": round(sum(enc_times)/len(enc_times),1),
        "avg_srch_ms": round(sum(srch_times)/len(srch_times),1),
    })

pd.DataFrame(RESULT).to_csv("results/latency_size_models.csv", index=False)
print("Saved latency/size metrics")
