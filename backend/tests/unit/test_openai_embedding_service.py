from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from linkurator_core.infrastructure.ai_agents.embeddings import (
    MAX_INPUT_TOKENS,
    OpenAIEmbeddingService,
    create_embedding_service,
)


def _embedding_service(
        max_chunk_tokens: int, max_concurrent_chunks: int = 5,
) -> tuple[OpenAIEmbeddingService, AsyncMock]:
    service = OpenAIEmbeddingService(
        api_key="test", max_chunk_tokens=max_chunk_tokens, max_concurrent_chunks=max_concurrent_chunks,
    )
    embedder = AsyncMock()
    embedder.embed_documents.side_effect = lambda documents: SimpleNamespace(
        embeddings=[[float(len(document)), 1.0] for document in documents],
    )
    service.embedder = embedder
    return service, embedder


@pytest.mark.asyncio()
async def test_splits_documents_into_chunks_and_keeps_order() -> None:
    service, embedder = _embedding_service(max_chunk_tokens=2)

    vectors = await service.embed_documents(["a", "bb", "ccc", "dddd", "eeeee"])

    assert [len(call.args[0]) for call in embedder.embed_documents.call_args_list] == [2, 2, 1]
    assert vectors == [[1.0, 1.0], [2.0, 1.0], [3.0, 1.0], [4.0, 1.0], [5.0, 1.0]]


@pytest.mark.asyncio()
async def test_chunks_are_filled_by_token_count() -> None:
    service, embedder = _embedding_service(max_chunk_tokens=10)

    await service.embed_documents([" one" * 6, " two" * 3, " three" * 4, " four"])

    chunks = [call.args[0] for call in embedder.embed_documents.call_args_list]
    assert chunks == [[" one" * 6, " two" * 3], [" three" * 4, " four"]]


@pytest.mark.asyncio()
async def test_document_above_the_chunk_tokens_is_sent_alone() -> None:
    service, embedder = _embedding_service(max_chunk_tokens=3)

    await service.embed_documents([" one", " two" * 5, " three"])

    chunks = [call.args[0] for call in embedder.embed_documents.call_args_list]
    assert chunks == [[" one"], [" two" * 5], [" three"]]


@pytest.mark.asyncio()
async def test_truncates_documents_above_the_max_input_tokens() -> None:
    service, embedder = _embedding_service(max_chunk_tokens=100_000)

    await service.embed_documents([" word" * (MAX_INPUT_TOKENS + 10), " short"])

    sent_documents = embedder.embed_documents.call_args.args[0]
    assert sent_documents == [" word" * MAX_INPUT_TOKENS, " short"]


@pytest.mark.asyncio()
async def test_failed_chunk_yields_none_without_affecting_the_other_chunks() -> None:
    service, embedder = _embedding_service(max_chunk_tokens=2, max_concurrent_chunks=1)
    embedder.embed_documents.side_effect = [
        RuntimeError("rate limited"),
        SimpleNamespace(embeddings=[[1.0, 0.0], [0.0, 1.0]]),
    ]

    vectors = await service.embed_documents(["0", "1", "2", "3"])

    assert vectors == [None, None, [1.0, 0.0], [0.0, 1.0]]


@pytest.mark.asyncio()
async def test_does_not_call_the_api_when_there_are_no_documents() -> None:
    service, embedder = _embedding_service(max_chunk_tokens=2)

    assert await service.embed_documents([]) == []
    embedder.embed_documents.assert_not_called()


def test_create_embedding_service_needs_an_api_key() -> None:
    assert create_embedding_service(openai_api_key=None) is None
    assert isinstance(create_embedding_service(openai_api_key="test"), OpenAIEmbeddingService)
