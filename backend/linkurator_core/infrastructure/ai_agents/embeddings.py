import asyncio
import logging

import tiktoken
from pydantic_ai.embeddings import Embedder, EmbeddingSettings
from pydantic_ai.embeddings.openai import OpenAIEmbeddingModel
from pydantic_ai.providers.openai import OpenAIProvider

from linkurator_core.domain.agents.embedding_service import EmbeddingService

OPENAI_EMBEDDING_MODEL_NAME = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
# OpenAI accepts at most 8191 tokens per input, and 2048 inputs and 300k tokens per request. A character
# can be anything from 0.2 to 2+ tokens, so chunks are filled by token count, with some margin.
MAX_INPUT_TOKENS = 8191
MAX_CHUNK_DOCUMENTS = 2048
DEFAULT_MAX_CHUNK_TOKENS = 250_000
DEFAULT_MAX_CONCURRENT_CHUNKS = 5
# OpenAI embeddings do not spread over the whole [-1, 1] range. As a rough guide, unrelated
# texts usually score around 0.1-0.25, loosely related texts around 0.3-0.4 and clearly
# on-topic texts 0.45 and up, so 0.4 separates texts about the same concept from those that
# only share some vocabulary.
RELATED_SIMILARITY_THRESHOLD = 0.4
# Below 0.3 a text shares little more than vocabulary with the query, so it is not worth showing.
UNRELATED_SIMILARITY_THRESHOLD = 0.3


class OpenAIEmbeddingService(EmbeddingService):
    def __init__(
            self,
            api_key: str,
            max_chunk_tokens: int = DEFAULT_MAX_CHUNK_TOKENS,
            max_concurrent_chunks: int = DEFAULT_MAX_CONCURRENT_CHUNKS,
    ) -> None:
        self.embedder = Embedder(
            OpenAIEmbeddingModel(
                OPENAI_EMBEDDING_MODEL_NAME,
                provider=OpenAIProvider(api_key=api_key),
            ),
            settings=EmbeddingSettings(dimensions=EMBEDDING_DIMENSIONS),
        )
        self.encoding = tiktoken.encoding_for_model(OPENAI_EMBEDDING_MODEL_NAME)
        self.max_chunk_tokens = max_chunk_tokens
        self.max_concurrent_chunks = max_concurrent_chunks

    async def embed_documents(self, documents: list[str]) -> list[list[float] | None]:
        if len(documents) == 0:
            return []
        semaphore = asyncio.Semaphore(self.max_concurrent_chunks)
        chunks = await self._split_in_chunks(documents)
        chunk_vectors = await asyncio.gather(*(self._embed_chunk(chunk, semaphore) for chunk in chunks))
        return [vector for vectors in chunk_vectors for vector in vectors]

    async def _split_in_chunks(self, documents: list[str]) -> list[list[str]]:
        """Split the documents, in order, into chunks that fit in one request, truncating the too long ones"""
        tokenized_documents = await asyncio.to_thread(self.encoding.encode_ordinary_batch, documents)
        chunks: list[list[str]] = []
        chunk: list[str] = []
        chunk_tokens = 0
        for document, tokens in zip(documents, tokenized_documents, strict=True):
            input_tokens = tokens[:MAX_INPUT_TOKENS]
            input_document = document if len(tokens) <= MAX_INPUT_TOKENS else self.encoding.decode(input_tokens)
            chunk_is_full = chunk_tokens + len(input_tokens) > self.max_chunk_tokens
            if len(chunk) == MAX_CHUNK_DOCUMENTS or (len(chunk) > 0 and chunk_is_full):
                chunks.append(chunk)
                chunk = []
                chunk_tokens = 0
            chunk.append(input_document)
            chunk_tokens += len(input_tokens)
        chunks.append(chunk)
        return chunks

    async def _embed_chunk(self, documents: list[str], semaphore: asyncio.Semaphore) -> list[list[float] | None]:
        """Embed a chunk of documents. Failures are logged and yield None so the other chunks are still returned."""
        async with semaphore:
            try:
                result = await self.embedder.embed_documents(documents)
            except Exception as e:
                logging.exception("Failed to embed a chunk of %d documents", len(documents))
                logging.debug("Embedding error: %s", e)
                return [None] * len(documents)
            return [list(embedding) for embedding in result.embeddings]

    async def embed_query(self, query: str) -> list[float]:
        result = await self.embedder.embed_query(query)
        return list(result.embeddings[0])

    def related_similarity_threshold(self) -> float:
        return RELATED_SIMILARITY_THRESHOLD

    def unrelated_similarity_threshold(self) -> float:
        return UNRELATED_SIMILARITY_THRESHOLD


def create_embedding_service(openai_api_key: str | None) -> EmbeddingService | None:
    if openai_api_key is None:
        return None
    return OpenAIEmbeddingService(api_key=openai_api_key)
