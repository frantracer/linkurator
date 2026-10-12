from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from linkurator_core.application.items.refresh_items_handler import RefreshItemsHandler
from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.domain.items.item_repository import ItemRepository
from linkurator_core.domain.subscriptions.subscription_service import SubscriptionService


@pytest.mark.asyncio()
async def test_refresh_items_handler_updates_items_with_latest_info() -> None:
    item_repository = MagicMock(spec=ItemRepository)
    subscription_service = AsyncMock(spec=SubscriptionService)
    queue_repository = AsyncMock(spec=ItemEmbeddingQueueRepository)
    refresh_items_handler = RefreshItemsHandler(item_repository, subscription_service, queue_repository)

    items = [mock_item(item_uuid=uuid4()),
             mock_item(item_uuid=uuid4())]

    item_repository.find_items.return_value = items
    subscription_service.get_items.return_value = items

    await refresh_items_handler.handle({items[0].uuid, items[1].uuid})

    item_repository.upsert_items.assert_called_once_with(items)
    queue_repository.enqueue.assert_called_once_with([items[0].uuid, items[1].uuid])
    subscription_service.get_items.assert_called_once_with({items[0].uuid, items[1].uuid})


@pytest.mark.asyncio()
async def test_refresh_items_handler_deletes_items_that_are_not_returned_by_subscription_service() -> None:
    item_repository = MagicMock(spec=ItemRepository)
    subscription_service = AsyncMock(spec=SubscriptionService)
    queue_repository = AsyncMock(spec=ItemEmbeddingQueueRepository)
    refresh_items_handler = RefreshItemsHandler(item_repository, subscription_service, queue_repository)

    items = [mock_item(item_uuid=uuid4()),
             mock_item(item_uuid=uuid4())]

    item_repository.find_items.return_value = items
    subscription_service.get_items.return_value = [items[0]]

    await refresh_items_handler.handle({items[0].uuid, items[1].uuid})

    item_repository.upsert_items.assert_called_once_with([items[0]])
    queue_repository.enqueue.assert_called_once_with([items[0].uuid])
    subscription_service.get_items.assert_called_once_with({items[0].uuid, items[1].uuid})
    item_repository.delete_item.assert_called_once_with(items[1].uuid)
