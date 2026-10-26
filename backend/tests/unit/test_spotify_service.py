import datetime
import uuid
from unittest.mock import AsyncMock, call

import pytest
from pydantic import AnyUrl

from linkurator_core.domain.common.mock_factory import mock_sub
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository
from linkurator_core.infrastructure.in_memory.subscription_repository import InMemorySubscriptionRepository
from linkurator_core.infrastructure.in_memory.user_repository import InMemoryUserRepository
from linkurator_core.infrastructure.spotify.spotify_api_client import (
    Episode,
    GetEpisodesResponse,
    GetSavedShowsResponse,
    ReleaseDataPrecision,
    Show,
    ShowImage,
    SpotifyApiClient,
    SpotifyApiNotFoundError,
    SpotifyApiRateLimitError,
)
from linkurator_core.infrastructure.spotify.spotify_service import SpotifySubscriptionService


@pytest.mark.asyncio()
async def test_get_subscription_items_returns_empty_when_show_not_found() -> None:
    spotify_api_client = AsyncMock(spec=SpotifyApiClient)
    spotify_api_client.get_show_episodes.side_effect = SpotifyApiNotFoundError("Show not found: abc123")

    sub_repo = InMemorySubscriptionRepository()
    sub = mock_sub(provider="spotify", url="https://open.spotify.com/show/abc123")
    sub.external_data = {"show_id": "abc123"}
    await sub_repo.add(sub)

    spotify_service = SpotifySubscriptionService(
        spotify_client=spotify_api_client,
        user_repository=InMemoryUserRepository(),
        item_repository=InMemoryItemRepository(),
        subscription_repository=sub_repo,
    )

    items = await spotify_service.get_subscription_items(
        sub_id=sub.uuid,
        from_date=datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc),
    )

    assert items == []


@pytest.mark.asyncio()
async def test_get_subscription_items_returns_empty_when_rate_limited() -> None:
    spotify_api_client = AsyncMock(spec=SpotifyApiClient)
    spotify_api_client.get_show_episodes.side_effect = SpotifyApiRateLimitError(
        'Failed to retrieve episodes: 429 -> {"error":{"status":429,"message":"Too many requests"}}')

    sub_repo = InMemorySubscriptionRepository()
    sub = mock_sub(provider="spotify", url="https://open.spotify.com/show/abc123")
    sub.external_data = {"show_id": "abc123"}
    await sub_repo.add(sub)

    spotify_service = SpotifySubscriptionService(
        spotify_client=spotify_api_client,
        user_repository=InMemoryUserRepository(),
        item_repository=InMemoryItemRepository(),
        subscription_repository=sub_repo,
    )

    items = await spotify_service.get_subscription_items(
        sub_id=sub.uuid,
        from_date=datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc),
    )

    assert items == []


@pytest.mark.asyncio()
async def test_get_subscription_items_uses_subscription_thumbnail_for_episodes_without_images() -> None:
    episode = Episode(
        description="An episode",
        duration_ms=60000,
        id="episode1",
        images=[],
        name="Episode 1",
        release_date="2024-01-01",
        release_date_precision=ReleaseDataPrecision.DAY,
    )
    spotify_api_client = AsyncMock(spec=SpotifyApiClient)
    spotify_api_client.get_show_episodes.side_effect = [
        GetEpisodesResponse(items=[episode], total=1),
        GetEpisodesResponse(items=[], total=1),
    ]

    sub_repo = InMemorySubscriptionRepository()
    sub = mock_sub(provider="spotify", url="https://open.spotify.com/show/abc123")
    sub.external_data = {"show_id": "abc123"}
    await sub_repo.add(sub)

    spotify_service = SpotifySubscriptionService(
        spotify_client=spotify_api_client,
        user_repository=InMemoryUserRepository(),
        item_repository=InMemoryItemRepository(),
        subscription_repository=sub_repo,
    )

    items = await spotify_service.get_subscription_items(
        sub_id=sub.uuid,
        from_date=datetime.datetime(2020, 1, 1, tzinfo=datetime.timezone.utc),
    )

    assert len(items) == 1
    assert items[0].thumbnail == sub.thumbnail


def _show(show_id: str, images: list[ShowImage]) -> Show:
    return Show(id=show_id, images=images, name=f"Show {show_id}", total_episodes=10, description="A show")


@pytest.mark.asyncio()
async def test_get_subscriptions_returns_all_the_saved_shows_with_images() -> None:
    image = ShowImage(url=AnyUrl("https://i.scdn.co/image/abc"), height=300, width=300)
    spotify_api_client = AsyncMock(spec=SpotifyApiClient)
    spotify_api_client.get_saved_shows.side_effect = [
        GetSavedShowsResponse(items=[_show(f"show{i}", [image]) for i in range(50)], total=52),
        GetSavedShowsResponse(items=[_show("show50", [image]), _show("no_images", [])], total=52),
    ]

    spotify_service = SpotifySubscriptionService(
        spotify_client=spotify_api_client,
        user_repository=InMemoryUserRepository(),
        item_repository=InMemoryItemRepository(),
        subscription_repository=InMemorySubscriptionRepository(),
    )

    subscriptions = await spotify_service.get_subscriptions(user_id=uuid.uuid4(), access_token="access_token")

    assert len(subscriptions) == 51
    assert str(subscriptions[50].url) == "https://open.spotify.com/show/show50"
    assert subscriptions[50].provider == "spotify"
    assert subscriptions[50].external_data == {"show_id": "show50"}
    assert spotify_api_client.get_saved_shows.call_args_list == [
        call("access_token", 0, 50),
        call("access_token", 50, 50),
    ]


@pytest.mark.asyncio()
async def test_get_subscriptions_without_saved_shows_returns_empty() -> None:
    spotify_api_client = AsyncMock(spec=SpotifyApiClient)
    spotify_api_client.get_saved_shows.return_value = GetSavedShowsResponse(items=[], total=0)

    spotify_service = SpotifySubscriptionService(
        spotify_client=spotify_api_client,
        user_repository=InMemoryUserRepository(),
        item_repository=InMemoryItemRepository(),
        subscription_repository=InMemorySubscriptionRepository(),
    )

    subscriptions = await spotify_service.get_subscriptions(user_id=uuid.uuid4(), access_token="access_token")

    assert subscriptions == []
    spotify_api_client.get_saved_shows.assert_called_once()
