import faiss, numpy as np

embs = np.load("../Embeddings/poi_embeddings.npy")
for nlist in [128, 256, 512]:
    quant = faiss.IndexFlatL2(embs.shape[1])
    ivf   = faiss.IndexIVFPQ(quant, embs.shape[1], nlist, 8, 8)
    ivf.train(embs)
    ivf.add(embs)
    faiss.write_index(ivf, f"./poi_ivfpq_nlist{nlist}.index")
