import os
import glob
import pandas as pd

OUT = "./precision_models.csv"
records = []

for labeled_csv in glob.glob("./candidates/candidates_*_labeled.csv"):
    basename = os.path.basename(labeled_csv)
    parts = basename.split("_")
    if len(parts) < 3:
        print(f"⚠️  неожиданный формат имени: {basename}, пропускаем")
        continue
    model = parts[1]

    try:
        df = pd.read_csv(
            labeled_csv,
            engine="python",
            usecols=["query", "rank", "relevant"],
            on_bad_lines="skip"
        )
    except Exception as e:
        print(f"не смогли прочитать {basename}: {e}")
        continue

    # приведение типов
    df["relevant"] = pd.to_numeric(df["relevant"], errors="coerce").fillna(0).astype(int)
    df["rank"]     = pd.to_numeric(df["rank"],     errors="coerce").fillna(0).astype(int)

    # убеждаемся, что есть нужные колонки
    if not {"query", "rank", "relevant"}.issubset(df.columns):
        print(f"в {basename} нет необходимых колонок, пропускаем")
        continue

    # Всех уникальных запросов в абсолюте
    total_queries = df["query"].nunique()
    print(f"== {model}: всего запросов в файле = {total_queries}")

    # теперь для каждого k считаем динамическое число запросов, для которых есть хоть 1 кандидат в топ-k
    for k in (5, 10):
        subset = df[df["rank"] <= k]
        queries_with_candidates = subset["query"].nunique()
        if queries_with_candidates == 0:
            print(f"⚠️  для модели {model} и k={k} нет ни одного запроса с rank≤{k}, пропускаем")
            continue

        total_hits = subset["relevant"].sum()
        precision   = total_hits / (queries_with_candidates * k)

        records.append({
            "model":      model,
            "k":          k,
            "precision":  round(precision, 4),
            "queries":    queries_with_candidates,
            "hits":       int(total_hits)
        })

out_df = pd.DataFrame(records)
out_df.to_csv(OUT, index=False)
print(f"Saved {OUT}")
