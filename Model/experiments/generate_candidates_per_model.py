# DLS/experiments/results/generate_candidates_per_model.py

import os
import csv
import faiss
import pandas as pd
from sentence_transformers import SentenceTransformer

# ── 1) Конфигурация ────────────────────────────────────────────────────────────────
# Тут ключи должны точно совпадать с именами файлов-индексов в ./indexes/*.index (без “.index”)
MODELS = {
    "LaBSE":           "sentence-transformers/LaBSE",
    "MiniLM-6-L12":    "paraphrase-MiniLM-L6-v2",
    "MiniLM-12-L6":    "all-MiniLM-L12-v2",
}

# Папка, где лежат .index-файлы для каждого из MODELS
INDEX_DIR  = "./indexes"
# Метаданные POI
META_FILE  = "../Dataset/poi_dataset_enriched_incremental.csv"
# Ваши валидационные запросы (вообще лежит рядом со скриптом)
QUERIES    = "./results/validation_queries_without_city.txt"
# Куда писать выходные candidates_*.csv
OUT_DIR    = "./"
# Сколько топ-к кандидатур брать
TOP_K      = 10
# ────────────────────────────────────────────────────────────────────────────────

# 2) Подготовка
os.makedirs(OUT_DIR, exist_ok=True)

# 3) Читаем метаданные в DataFrame
#    У нас есть колонка "id", "name", "type", "city" и т.п.
df = pd.read_csv(META_FILE, dtype=str)

# 4) Для каждого 모델 загружаем индекс, энбеддер и генерим candidates
for model_name, model_path in MODELS.items():
    idx_fname = f"{model_name}.index"
    idx_path  = os.path.join(INDEX_DIR, idx_fname)

    if not os.path.exists(idx_path):
        raise FileNotFoundError(f"FAISS index not found: {idx_path}")

    # 4.1) Загрузка FAISS-индекса
    index = faiss.read_index(idx_path)

    # 4.2) Создаём Sentence-Transformer
    embedder = SentenceTransformer(model_path)

    # 4.3) Открываем файлы для чтения запросов и записи результатов
    out_csv = os.path.join(OUT_DIR, f"candidates_{model_name}.csv")
    with open(QUERIES, encoding="utf-8") as fin, \
         open(out_csv, "w", newline="", encoding="utf-8") as fout:

        writer = csv.writer(fout)
        writer.writerow(["model", "query", "rank", "poi_id", "name", "type", "city"])

        for line in fin:
            q = line.strip()
            if not q:
                continue

            # 4.4) Кодируем и ищем топ-K
            vec = embedder.encode([q], convert_to_numpy=True)
            faiss.normalize_L2(vec)
            D, I = index.search(vec, TOP_K)

            # 4.5) Для каждого результата достаём данные из df по индексу
            for rank, idx in enumerate(I[0], start=1):
                row = df.iloc[idx]
                writer.writerow([
                    model_name,
                    q,
                    rank,
                    row["id"],
                    row["name"],
                    row.get("type", ""),
                    row.get("city", "")
                ])

    print(f"→ Written candidates for {model_name} → {out_csv}")
