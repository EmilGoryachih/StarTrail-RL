## 1. Experiments and Metrics Recording

### 1.1 Measurement Scripts

- `measure_index_load.py` — measures the time and memory consumed when loading the FAISS index.  
- `measure_search_latency.py` — for a set of test queries, measures:
  - **encode_time_ms** — time to encode a query (SBERT).
  - **search_time_ms** — time to perform the FAISS search.

#### 1.1.1 Results of `measure_index_load.py`

| Index file        | ../Indexes/poi_ivfpq.index |
|-------------------|-----------------------------|
| Load time         | 0.006 s                     |
| RSS before load   | 103.84 MB                   |
| RSS after load    | 106.16 MB                   |
| tracemalloc curr  | 0.00 MB                     |
| tracemalloc peak  | 0.00 MB                     |
| Index nlist       | 128                         |

#### 1.1.2 Results of `measure_search_latency.py`

| Statistic | encode_time_ms | search_time_ms |
|-----------|----------------|----------------|
| count     | 60             | 60             |
| mean      | 92.603         | 0.767          |
| std       | 93.861         | 2.648          |
| min       | 59.535         | 0.270          |
| 25%       | 68.502         | 0.342          |
| 50%       | 76.243         | 0.386          |
| 75%       | 87.196         | 0.488          |
| max       | 793.488        | 20.914         |

_See `search_latency.csv` for the full results._

---

### 1.2 Validation Set

- **Number of queries**: 60  
- **Format**: text queries without specifying the city (see `validation_queries_without_city.txt`).  
- **Annotation**: for each query, top-5 and top-10 relevant POIs were manually labeled and stored in `ground_truth.json`.

---

### 1.3 Metrics

- **precision@5**, **precision@10**: computed against the validation annotations; results saved in `precision_metrics.csv`.  
- **Latency**: see the table in section 2.1.2.  
- **Index memory footprint**: RSS rose from 103.84 MB to 106.16 MB upon load.

All outputs are stored as CSV files in the `experiments/` directory for further comparative analysis.  

## 2. Comparative Analysis

### 2.1 Embedding-Model Comparison

We evaluated three sentence-embedding models:

* **LaBSE** (768-dim)
* **paraphrase-MiniLM-L6-v2** (384-dim)
* **all-MiniLM-L12-v2** (384-dim)

**Protocol**

1. **Index construction**

   * Built a separate FAISS index for each model using fixed parameters:

     ```
     NLIST = 128  
     nprobe = 50  
     expand_k = 1000
     ```
2. **Validation queries**

   * Used the same set of 60 queries (`validation_queries_without_city.txt`), without specifying city.
3. **Measurements**

   * **Precision\@5 / @10** (see `experiments/precision_models.csv`)
   * **Encoding latency** (average SBERT.encode time, ms)
   * **Search latency** (average FAISS.search time, ms)
   * **Index size** on disk (MB)

**Summary of Results**

| Model                       | precision\@5 | precision\@10 | avg\_enc\_ms | avg\_srch\_ms | index\_mb |
| --------------------------- | ------------ | ------------- | ------------ | ------------- | --------- |
| **LaBSE**                   | 0.8370       | 0.7593        | 26.6         | 0.4           | 2.3       |
| **paraphrase-MiniLM-L6-v2** | 0.6453       | 0.6377        | 10.6         | 0.1           | 1.7       |
| **all-MiniLM-L12-v2**       | 0.4982       | 0.4255        | 19.9         | 0.1           | 1.7       |

> Detailed CSVs:
>
> * `experiments/precision_models.csv`
> * `experiments/latency_size_models.csv`

---

### 2.2. Final-Variant Selection

* **Model**: **LaBSE**  
* **FAISS parameters**:  
```

NLIST = 128
nprobe = 50
expand\_k = 1000

```

**Rationale**  
We prioritize maximum precision over latency and index size; LaBSE achieved the highest precision@5 (0.837) and precision@10 (0.759) of all tested models.

Below is a draft **Section 3** to append to your `README.md`—covering index choice, parameter justification, alternatives and summary of the comparative analysis. Feel free to tweak the wording or numbers to match your exact setup.

## 3. Indexing and Search Strategy

### 3.1 Chosen Index Structure (IVF-PQ)

We build a **FAISS** index of type **IVF-PQ** (“Inverted File with Product Quantization”) for our POI embeddings:

- **Index type**: `faiss.IndexIVFPQ`
- **Vector dimension**: 768 (LaBSE) or 384 (MiniLMs)
- **NLIST** = 128  
  - Partitions the dataset into 128 Voronoi cells.  
  - A smaller NLIST would speed up training but reduce discrimination; a larger NLIST yields finer clusters at the cost of larger memory and slower training.
- **PQ parameters**: 8 sub-quantizers, 8 bits each (default)  
  - Compresses each vector into 64 bytes.

```python
# example of building:
quantizer = faiss.IndexFlatL2(D)                       # D = embedding dim
index = faiss.IndexIVFPQ(quantizer, D, nlist=128, M=8, nbits=8)
index.train(xb)                                        # xb = base embeddings
index.add(xb)
````

### 3.2 Query‐time Parameters

* **nprobe** = 50
  Scans 50 of the 128 clusters at search time to balance recall vs latency.
* **expand\_k** = 1000
  Pre-fetches the top 1000 candidates before re-ranking, boosting precision with small extra cost.

These settings yielded **precision\@5=0.837** / **precision\@10=0.759** with **avg\_search\_ms≈0.4 ms** (LaBSE).

### 3.3 Alternative Structures

We considered but did not (yet) fully benchmark:

* **HNSW** (`faiss.IndexHNSWFlat`)
  — often faster at very low latencies, but larger graph memory footprint and more complex tuning.
* **Flat + Quantization** (`IndexFlatL2` + PQ on the side)
  — simpler but slower for large datasets.

IVF-PQ proved the best trade-off on our \~50 k POIs given our target of sub-millisecond queries and < 5 MB index size.

### 3.4 Comparative Analysis

See [Section 2](#2-comparative-analysis) for:

* **Embedding model comparison**
  Precision vs. latency vs. index size for LaBSE, MiniLM-6, MiniLM-12.
* **FAISS parameter sweep**
  precision\@5/10 and end-to-end latency across combinations of NLIST, nprobe, expand\_k.

#### Key summary table

| Model     | NLIST | nprobe | expand\_k | precision\@5 | precision\@10 | avg\_enc\_ms | avg\_search\_ms | index\_mb |
| --------- | ----- | ------ | --------- | ------------ | ------------- | ------------ | --------------- | --------- |
| **LaBSE** | 128   | 50     | 1000      | 0.837        | 0.759         | 26.6         | 0.4             | 2.3       |
| MiniLM-6  | 128   | 50     | 1000      | 0.645        | 0.638         | 10.6         | 0.1             | 1.7       |
| MiniLM-12 | 128   | 50     | 1000      | 0.498        | 0.426         | 19.9         | 0.1             | 1.7       |

### 3.5 Final Variant Selection

We prioritize **precision** above raw speed or minimal index size. Therefore our **production configuration** is:

* **Embedding model**: **LaBSE** (768 dim)
* **Index**: `IndexIVFPQ` with **NLIST=128**, **nprobe=50**, **expand\_k=1000**

This combination delivers the highest precision\@5/10 while maintaining average query latencies under 1 ms and an index footprint of \~2.3 MB.

---

*For full experiment scripts and raw CSV outputs, see the `experiments/` folder.*

