import csv
from app.services.POIService import POIService

QUERIES_FILE = "results/validation_queries_without_city.txt"
OUTPUT_CSV   = "./candidates.csv"
TOP_K        = 10
CITY         = None

def main():
    svc = POIService()
    with open(QUERIES_FILE, encoding="utf-8") as fin, \
         open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as fout:

        writer = csv.writer(fout)
        writer.writerow(["query", "rank", "poi_id", "name", "type", "city"])

        for line in fin:
            q = line.strip()
            if not q:
                continue

            results = svc.search_in_city(query=q, city=CITY, top_n=TOP_K)
            for rank, r in enumerate(results, start=1):
                writer.writerow([
                    q,
                    rank,
                    r.id,
                    r.name,
                    r.type,
                    r.city
                ])

    print(f"Candidates written to `{OUTPUT_CSV}` ({TOP_K} per query)")

if __name__ == "__main__":
    main()
