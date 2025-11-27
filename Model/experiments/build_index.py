import os, faiss, numpy as np, pandas as pd
from sentence_transformers import SentenceTransformer

models = {
    "LaBSE":                "sentence-transformers/LaBSE",
    "MiniLM-6-L12":         "paraphrase-MiniLM-L6-v2",
    "MiniLM-12-L6":         "all-MiniLM-L12-v2",
}


META_FILE = "../Dataset/poi_dataset_enriched_incremental.csv"
OUTPUT_DIR = "./results/indexes/"
NLIST = 128
EMBED_DIM = None

for model_name, model_path in models.items():
    df = pd.read_csv(META_FILE, dtype=str)
    texts = (df["name"] + ". " + df["enriched_description"]).fillna("").tolist()
    embedder = SentenceTransformer(model_path)
    EMBED_DIM = embedder.get_sentence_embedding_dimension()

    embeddings = embedder.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    faiss.normalize_L2(embeddings)

    index = faiss.index_factory(EMBED_DIM, f"IVF{NLIST},PQ16")
    index.train(embeddings)
    index.add(embeddings)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    faiss.write_index(index, os.path.join(OUTPUT_DIR, f"{model_name}.index"))
    np.save(os.path.join(OUTPUT_DIR, f"{model_name}_emb.npy"), embeddings)
    print(f"Built and saved index for {model_name}")
