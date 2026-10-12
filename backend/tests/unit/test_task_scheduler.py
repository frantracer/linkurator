import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from linkurator_core.application.items.embed_items_handler import EmbedItemsHandler
from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.infrastructure.asyncio_impl.scheduler import TaskScheduler
from linkurator_core.infrastructure.in_memory.item_embedding_queue_repository import (
    InMemoryItemEmbeddingQueueRepository,
)
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository


@pytest.mark.asyncio()
async def test_slow_task_does_not_block_other_tasks_or_overlap_itself() -> None:
    scheduler = TaskScheduler()
    started = asyncio.Event()
    fast_finished = asyncio.Event()
    calls = 0

    async def blocked() -> None:
        nonlocal calls
        calls += 1
        started.set()
        await asyncio.Event().wait()

    async def fast() -> None:
        await started.wait()
        await asyncio.sleep(0.03)
        fast_finished.set()
        await scheduler.stop()

    scheduler.schedule_recurring_task(blocked, interval_seconds=0.01)
    scheduler.schedule_recurring_task(fast, interval_seconds=1)
    await asyncio.wait_for(scheduler.start(), timeout=1)
    assert fast_finished.is_set()
    assert calls == 1


@pytest.mark.asyncio()
async def test_failures_are_retried_without_stopping_other_tasks() -> None:
    scheduler = TaskScheduler()
    calls = 0
    other = AsyncMock()

    async def flaky() -> None:
        nonlocal calls
        calls += 1
        if calls == 1:
            msg = "API unavailable"
            raise RuntimeError(msg)
        await scheduler.stop()

    scheduler.schedule_recurring_task(flaky, interval_seconds=0.01)
    scheduler.schedule_recurring_task(other, interval_seconds=1)
    await asyncio.wait_for(scheduler.start(), timeout=1)
    assert calls == 2
    other.assert_awaited_once()


@pytest.mark.asyncio()
async def test_cancelling_scheduler_cancels_and_awaits_running_callbacks() -> None:
    scheduler = TaskScheduler()
    started = asyncio.Event()
    cancelled = asyncio.Event()

    async def blocked() -> None:
        started.set()
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.set()

    scheduler.schedule_recurring_task(blocked, interval_seconds=1)
    running = asyncio.create_task(scheduler.start())
    await asyncio.wait_for(started.wait(), timeout=1)
    running.cancel()
    with pytest.raises(asyncio.CancelledError):
        await running
    assert cancelled.is_set()
    assert not scheduler.is_running


@pytest.mark.asyncio()
async def test_timed_out_embedding_batch_remains_recoverable() -> None:
    item = mock_item()
    items = InMemoryItemRepository()
    queue = InMemoryItemEmbeddingQueueRepository()
    await items.upsert_items([item])
    await queue.enqueue([item.uuid])
    scheduler = TaskScheduler()
    cancelled = asyncio.Event()

    async def blocked_embedding(documents: list[str]) -> list[list[float] | None]:
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.set()
        return []

    async def stop_after_timeout() -> None:
        await cancelled.wait()
        await scheduler.stop()

    service = AsyncMock(spec=EmbeddingService)
    service.embed_documents.side_effect = blocked_embedding
    handler = EmbedItemsHandler(items, queue, service)
    scheduler.schedule_recurring_task(handler.handle, interval_seconds=60, timeout_seconds=0.01)
    scheduler.schedule_recurring_task(stop_after_timeout, interval_seconds=60)
    await asyncio.wait_for(scheduler.start(), timeout=1)
    assert list(queue.queue) == [item.uuid]
    assert await queue.find_pending(limit=1, enqueued_until=datetime.now(timezone.utc)) == [item.uuid]


@pytest.mark.parametrize(("interval", "timeout"), [(0, None), (1, 0)])
def test_rejects_non_positive_intervals_and_timeout(
        interval: float, timeout: float | None,
) -> None:
    with pytest.raises(ValueError, match="must be positive"):
        TaskScheduler().schedule_recurring_task(
            AsyncMock(), interval_seconds=interval, timeout_seconds=timeout,
        )
