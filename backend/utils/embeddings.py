from functools import lru_cache
from typing import Iterable, List, Sequence, Tuple

import numpy as np
from sentence_transformers import SentenceTransformer

from backend.model import Paper


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def generate_embedding(text: str) -> List[float]:
    if not text:
        return []

    model = _get_model()
    vector = model.encode(text, show_progress_bar=False, normalize_embeddings=True)
    return vector.tolist()


def rank_papers_for_query(
    query: str,
    papers: Sequence[Paper],
    top_k: int = 3,
) -> List[Tuple[Paper, float]]:
    if not query or not papers:
        return []

    model = _get_model()

    query_vec = model.encode(
        query,
        show_progress_bar=False,
        normalize_embeddings=True,
    )

    query_vec = np.asarray(query_vec, dtype=np.float32)

    scored: List[Tuple[Paper, float]] = []

    for paper in papers:
        if not paper.embedding:
            continue

        doc_vec = np.asarray(paper.embedding, dtype=np.float32)

        if doc_vec.shape != query_vec.shape:
            continue

        similarity = float(np.dot(query_vec, doc_vec))
        scored.append((paper, similarity))

    scored.sort(key=lambda item: item[1], reverse=True)

    return scored[:top_k]

