import uuid
from unittest.mock import AsyncMock

import pytest

from linkurator_core.application.subscriptions.import_spotify_subscriptions_handler import (
    ImportSpotifySubscriptionsHandler,
)
from linkurator_core.domain.common.event_bus_service import EventBusService
from linkurator_core.domain.common.mock_factory import mock_sub, mock_user
from linkurator_core.domain.subscriptions.subscription_service import SubscriptionService
from linkurator_core.infrastructure.in_memory.subscription_repository import InMemorySubscriptionRepository
from linkurator_core.infrastructure.in_memory.user_repository import InMemoryUserRepository


@pytest.mark.asyncio()
async def test_import_follows_new_and_registered_shows() -> None:
    new_sub = mock_sub(provider="spotify", url="https://open.spotify.com/show/new")
    registered_sub = mock_sub(provider="spotify", url="https://open.spotify.com/show/registered")
    fetched_registered_sub = mock_sub(provider="spotify", url="https://open.spotify.com/show/registered")
    subscription_service = AsyncMock(spec=SubscriptionService)
    subscription_service.get_subscriptions.return_value = [new_sub, fetched_registered_sub]
    subscription_repository = InMemorySubscriptionRepository()
    await subscription_repository.add(registered_sub)
    user_repository = InMemoryUserRepository()
    user = mock_user()
    await user_repository.add(user)
    event_bus_service = AsyncMock(spec=EventBusService)

    await ImportSpotifySubscriptionsHandler(
        spotify_subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        event_bus_service=event_bus_service,
    ).handle(user_id=user.uuid, access_token="access_token")

    updated_user = await user_repository.get(user.uuid)
    assert updated_user is not None
    assert updated_user.get_subscriptions() == {new_sub.uuid, registered_sub.uuid}
    assert await subscription_repository.get(new_sub.uuid) == new_sub
    assert await subscription_repository.get(fetched_registered_sub.uuid) is None
    assert event_bus_service.publish.call_count == 2
    subscription_service.get_subscriptions.assert_called_once_with(user_id=user.uuid, access_token="access_token")


@pytest.mark.asyncio()
async def test_import_does_not_fail_when_fetching_the_shows_fails() -> None:
    subscription_service = AsyncMock(spec=SubscriptionService)
    subscription_service.get_subscriptions.side_effect = Exception("Spotify is down")
    user_repository = InMemoryUserRepository()
    user = mock_user()
    await user_repository.add(user)

    await ImportSpotifySubscriptionsHandler(
        spotify_subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=InMemorySubscriptionRepository(),
        event_bus_service=AsyncMock(spec=EventBusService),
    ).handle(user_id=user.uuid, access_token="access_token")

    updated_user = await user_repository.get(user.uuid)
    assert updated_user is not None
    assert updated_user.get_subscriptions() == set()


@pytest.mark.asyncio()
async def test_import_for_non_existing_user_does_nothing() -> None:
    subscription_service = AsyncMock(spec=SubscriptionService)

    await ImportSpotifySubscriptionsHandler(
        spotify_subscription_service=subscription_service,
        user_repository=InMemoryUserRepository(),
        subscription_repository=InMemorySubscriptionRepository(),
        event_bus_service=AsyncMock(spec=EventBusService),
    ).handle(user_id=uuid.UUID("3577da9f-2d85-4475-9aaf-5f38cd01bc2a"), access_token="access_token")

    subscription_service.get_subscriptions.assert_not_called()
