import json
import pandas as pd

df = pd.read_csv("results/candidates.csv", encoding="utf-8")

ground_truth = {}
for q, grp in df.groupby("query"):
    rel_ids = grp.loc[grp["relevant"] == 1, "poi_id"].tolist()
    ground_truth[q] = rel_ids

# пишем в JSON
with open("results/ground_truth.json", "w", encoding="utf-8") as f:
    json.dump(ground_truth, f, ensure_ascii=False, indent=2)

print("✅ ground_truth.json сгенерирован")
