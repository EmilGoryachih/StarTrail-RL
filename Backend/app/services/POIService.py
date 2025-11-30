import os
import time
import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from functools import lru_cache
from typing import List, Optional

from app.config.interest_tags import interest_tags
from app.models import InterestsEnum
from app.models.dtoModels.POIOutDTO import POIOutDTO
from app.infrastructure.logger import logger

REPO_ROOT    = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INDEX_FILE   = os.path.join(REPO_ROOT, "Model", "Indexes", "poi_ivfpq.index")
META_FILE    = os.path.join(REPO_ROOT, "Model", "Dataset", "poi_dataset_enriched_incremental.csv")
EMBED_MODEL  = os.getenv("EMBED_MODEL", "/app/cache/all-MiniLM-L6-v2")
DEVICE       = "cpu"
NLIST_PROBE  = 50
TOP_N        = 10
EXPAND_K     = 1000

ALCOHOL_TAGS  = {"amenity:bar", "amenity:pub", "shop:alcohol", "shop:beverages"}
ALCOHOL_TYPES = {"bar", "pub", "wine_shop", "beer", "liquor_store"}

t0 = time.time()
logger.info("Step 1/3: loading FAISS index (%s)...", INDEX_FILE)
index = faiss.read_index(INDEX_FILE)
index.nprobe = NLIST_PROBE
logger.info("FAISS index loaded in %.2fs", time.time() - t0)

t1 = time.time()
logger.info("Step 2/3: loading metadata CSV (%s)...", META_FILE)
df = pd.read_csv(META_FILE, dtype=str).set_index("id")
logger.info("Metadata loaded in %.2fs", time.time() - t1)

t2 = time.time()
logger.info("Step 3/3: loading SentenceTransformer model (%s)...", EMBED_MODEL)
embedder = SentenceTransformer(EMBED_MODEL, device=DEVICE)
logger.info("Model loaded in %.2fs", time.time() - t2)
logger.info("Total init time: %.2fs", time.time() - t0)

@lru_cache(maxsize=512)
def encode_query(q: str) -> np.ndarray:
    v = embedder.encode([q], convert_to_numpy=True)
    faiss.normalize_L2(v)
    return v

class POIService:
    city_map = {
        "Moscow": "Москва",
        "Saint Petersburg": "Санкт-Петербург",
        "Nizhny Novgorod": "Нижний Новгород",
        "Ekaterinburg": "Екатеринбург",
        "Kazan": "Казань",
        "Ufa": "Уфа",
    }

    def search_in_city(
        self,
        query: str,
        city: Optional[str],
        tags: Optional[List[str]] = None,
        top_n: int = TOP_N,
        expand_k: int = EXPAND_K
    ) -> List[POIOutDTO]:
        if city and city in self.city_map:
            city = self.city_map[city]

        skip_alco_filter = bool(tags and any(t in ALCOHOL_TAGS for t in tags))

        qv = encode_query(query)
        D, I = index.search(qv, expand_k)
        D, I = D[0], I[0]

        results: List[POIOutDTO] = []
        for score, emb_idx in zip(D, I):
            row = df.iloc[emb_idx]
            poi_id   = row.name
            poi_tags = set(row.get("tags", "").split(","))
            poi_type = row.get("type", "").lower()

            if city is not None and row["city"] != city:
                continue

            if tags and not poi_tags.intersection(tags):
                continue

            if not skip_alco_filter and (
                poi_tags.intersection(ALCOHOL_TAGS) or poi_type in ALCOHOL_TYPES
            ):
                continue

            results.append(POIOutDTO(
                id=poi_id,
                name=row["name"],
                type=row["type"],
                city=row["city"],
                lat=float(row["lat"]),
                lon=float(row["lon"]),
                score=float(score),
                description=row["enriched_description"],
            ))
            if len(results) >= top_n:
                break

        return results

    def recommend_by_interests(
        self,
        interests: List[InterestsEnum],
        additional_interests: Optional[str],
        city: Optional[str],
        top_n: int = TOP_N
    ) -> List[POIOutDTO]:
        seen, recs = set(), []

        pool = list(interests)
        if additional_interests:
            pool.append(additional_interests)

        for intr in pool:
            if isinstance(intr, InterestsEnum):
                text_query = intr.value.replace("_", " ")
                key = intr.value
            else:
                text_query = str(intr).replace("_", " ")
                key = str(intr)

            tags = interest_tags.get(key, [])
            remaining = top_n - len(recs)
            if remaining <= 0:
                break

            hits = self.search_in_city(text_query, city, tags=tags, top_n=remaining)
            for poi in hits:
                if poi.id not in seen:
                    seen.add(poi.id)
                    recs.append(poi)
                    if len(recs) >= top_n:
                        return recs

        return recs

poi_service = POIService()
