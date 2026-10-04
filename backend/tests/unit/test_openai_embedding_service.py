from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from linkurator_core.infrastructure.ai_agents.embeddings import OpenAIEmbeddingService


def _embedding_service(chunk_size: int, max_concurrent_chunks: int = 5) -> tuple[OpenAIEmbeddingService, AsyncMock]:
    service = OpenAIEmbeddingService(api_key="test", chunk_size=chunk_size, max_concurrent_chunks=max_concurrent_chunks)
    embedder = AsyncMock()
    embedder.embed_documents.side_effect = lambda documents: SimpleNamespace(
        embeddings=[[float(document), 1.0] for document in documents],
    )
    service.embedder = embedder
    return service, embedder


@pytest.mark.asyncio()
async def test_splits_documents_into_chunks_and_keeps_order() -> None:
    service, embedder = _embedding_service(chunk_size=2)

    vectors = await service.embed_documents(["0", "1", "2", "3", "4"])

    assert [len(call.args[0]) for call in embedder.embed_documents.call_args_list] == [2, 2, 1]
    assert vectors == [[0.0, 1.0], [1.0, 1.0], [2.0, 1.0], [3.0, 1.0], [4.0, 1.0]]


@pytest.mark.asyncio()
async def test_failed_chunk_yields_none_without_affecting_the_other_chunks() -> None:
    service, embedder = _embedding_service(chunk_size=2, max_concurrent_chunks=1)
    embedder.embed_documents.side_effect = [
        RuntimeError("rate limited"),
        SimpleNamespace(embeddings=[[1.0, 0.0], [0.0, 1.0]]),
    ]

    vectors = await service.embed_documents(["0", "1", "2", "3"])

    assert vectors == [None, None, [1.0, 0.0], [0.0, 1.0]]


@pytest.mark.asyncio()
async def test_does_not_call_the_api_when_there_are_no_documents() -> None:
    service, embedder = _embedding_service(chunk_size=2)

    assert await service.embed_documents([]) == []
    embedder.embed_documents.assert_not_called()
