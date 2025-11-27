import pandas as pd

INPUT_CSV   = "./candidates.csv"
OUTPUT_CSV  = "./precision_metrics.csv"
KS          = [5, 10]

def compute_precision(df: pd.DataFrame, ks):
    records = []
    for query, grp in df.groupby("query"):
        for k in ks:
            topk = grp[grp["rank"] <= k]
            prec = topk["relevant"].sum() / k
            records.append({
                "query":     query,
                "k":         k,
                "precision": prec
            })
    return pd.DataFrame(records)

def main():
    df = pd.read_csv(INPUT_CSV)
    df_prec = compute_precision(df, KS)
    df_prec.to_csv(OUTPUT_CSV, index=False)
    print(f"✔ precision@{KS} written to `{OUTPUT_CSV}`")

if __name__ == "__main__":
    main()
