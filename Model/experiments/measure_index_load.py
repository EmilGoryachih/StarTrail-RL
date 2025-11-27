import time
import psutil
import tracemalloc
import faiss
import os

INDEX_PATH = os.path.expanduser("../Indexes/poi_ivfpq.index")

def measure_load(index_path: str):
    proc = psutil.Process()

    tracemalloc.start()
    mem_before = proc.memory_info().rss

    t0 = time.perf_counter()
    index = faiss.read_index(index_path)
    t1 = time.perf_counter()

    mem_after = proc.memory_info().rss
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    print(f"\n=== FAISS index load metrics ===")
    print(f"Index file        : {index_path}")
    print(f"Load time         : {(t1-t0):.3f} s")
    print(f"RSS before load   : {mem_before/1024**2:.2f} MB")
    print(f"RSS after load    : {mem_after/1024**2:.2f} MB")
    print(f"tracemalloc curr  : {current/1024**2:.2f} MB")
    print(f"tracemalloc peak  : {peak/1024**2:.2f} MB")
    print(f"Index nlist       : {index.nlist if hasattr(index, 'nlist') else 'N/A'}")

if __name__ == "__main__":
    if not os.path.isfile(INDEX_PATH):
        raise FileNotFoundError(f"Не найден индекс: {INDEX_PATH}")
    measure_load(INDEX_PATH)

'''
=== FAISS index load metrics ===
Index file        : ../Indexes/poi_ivfpq.index
Load time         : 0.006 s
RSS before load   : 103.84 MB
RSS after load    : 106.16 MB
tracemalloc curr  : 0.00 MB
tracemalloc peak  : 0.00 MB
Index nlist       : 128
'''