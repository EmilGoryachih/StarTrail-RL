import time
import os
import csv
import faiss
import pandas as pd
from sentence_transformers import SentenceTransformer

# Настройки
INDEX_PATH    = os.path.expanduser("../Indexes/poi_ivfpq.index")
MODEL_NAME    = "sentence-transformers/LaBSE"
QUERIES_FILE  = os.path.expanduser("results/validation_queries.txt")
EXPAND_K      = 1000
OUTPUT_CSV    = "search_latency.csv"

def load_index(path: str):
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Не найден индекс: {path}")
    idx = faiss.read_index(path)
    return idx

def load_model(name: str):
    return SentenceTransformer(name)

def load_queries(path: str):
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Не найден файл запросов: {path}")
    with open(path, encoding="utf-8") as f:
        return [l.strip() for l in f if l.strip()]

def measure_latency(index, model, queries, expand_k: int):
    records = []
    for q in queries:
        t0 = time.perf_counter()
        vec = model.encode([q], convert_to_numpy=True)
        faiss.normalize_L2(vec)
        t1 = time.perf_counter()

        D, I = index.search(vec, expand_k)
        t2 = time.perf_counter()

        encode_ms = (t1 - t0) * 1e3
        search_ms = (t2 - t1) * 1e3
        records.append((q, encode_ms, search_ms))
        print(f"Query: {q!r}\tencode: {encode_ms:.1f} ms\tsearch: {search_ms:.1f} ms")

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as fout:
        writer = csv.writer(fout)
        writer.writerow(["query", "encode_ms", "search_ms"])
        writer.writerows(records)

    df = pd.DataFrame(records, columns=["query", "encode_ms", "search_ms"])
    print("\n=== Summary ===")
    print(df[["encode_ms", "search_ms"]].describe())
    print(f"\nСохранили подробные данные в {OUTPUT_CSV}")

if __name__ == "__main__":
    idx   = load_index(INDEX_PATH)
    model = load_model(MODEL_NAME)
    qs    = load_queries(QUERIES_FILE)
    measure_latency(idx, model, qs, EXPAND_K)


'''
=== Summary ===
        encode_ms  search_ms
count   60.000000  60.000000
mean    92.603205   0.767092
std     93.860902   2.648405
min     59.535000   0.270000
25%     68.501800   0.341725
50%     76.242950   0.385700
75%     87.196325   0.488200
max    793.487800  20.913600
'''