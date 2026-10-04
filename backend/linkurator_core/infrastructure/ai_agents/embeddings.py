import asyncio
import logging

from pydantic_ai.embeddings import Embedder, EmbeddingSettings
from pydantic_ai.embeddings.openai import OpenAIEmbeddingModel
from pydantic_ai.providers.openai import OpenAIProvider

from linkurator_core.domain.agents.embedding_service import EmbeddingService

OPENAI_EMBEDDING_MODEL_NAME = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
# OpenAI accepts at most 2048 inputs and 300k tokens per embeddings request. Descriptions are
# truncated to ~1k tokens, so 200 documents per request stays well below both limits.
DEFAULT_EMBEDDING_CHUNK_SIZE = 200
DEFAULT_MAX_CONCURRENT_CHUNKS = 5
# OpenAI embeddings do not spread over the whole [-1, 1] range. As a rough guide, unrelated
# texts usually score around 0.1-0.25, loosely related texts around 0.3-0.4 and clearly
# on-topic texts 0.45 and up, so 0.4 separates texts about the same concept from those that
# only share some vocabulary.
RELATED_SIMILARITY_THRESHOLD = 0.4


class OpenAIEmbeddingService(EmbeddingService):
    def __init__(
            self,
            api_key: str,
            chunk_size: int = DEFAULT_EMBEDDING_CHUNK_SIZE,
            max_concurrent_chunks: int = DEFAULT_MAX_CONCURRENT_CHUNKS,
    ) -> None:
        self.embedder = Embedder(
            OpenAIEmbeddingModel(
                OPENAI_EMBEDDING_MODEL_NAME,
                provider=OpenAIProvider(api_key=api_key),
            ),
            settings=EmbeddingSettings(dimensions=EMBEDDING_DIMENSIONS),
        )
        self.chunk_size = chunk_size
        self.max_concurrent_chunks = max_concurrent_chunks

    async def embed_documents(self, documents: list[str]) -> list[list[float] | None]:
        if len(documents) == 0:
            return []
        semaphore = asyncio.Semaphore(self.max_concurrent_chunks)
        chunks = [documents[i:i + self.chunk_size] for i in range(0, len(documents), self.chunk_size)]
        chunk_vectors = await asyncio.gather(*(self._embed_chunk(chunk, semaphore) for chunk in chunks))
        return [vector for vectors in chunk_vectors for vector in vectors]

    async def _embed_chunk(self, documents: list[str], semaphore: asyncio.Semaphore) -> list[list[float] | None]:
        """Embed a chunk of documents. Failures are logged and yield None so the other chunks are still returned."""
        async with semaphore:
            try:
                result = await self.embedder.embed_documents(documents)
            except Exception:
                logging.exception("Failed to embed a chunk of %d documents", len(documents))
                return [None] * len(documents)
            return [list(embedding) for embedding in result.embeddings]

    async def embed_query(self, query: str) -> list[float]:
        result = await self.embedder.embed_query(query)
        return list(result.embeddings[0])

    def related_similarity_threshold(self) -> float:
        return RELATED_SIMILARITY_THRESHOLD
