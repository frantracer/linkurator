from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest

from linkurator_core.application.subscriptions.allow_spotify_import_handler import AllowSpotifyImportHandler
from linkurator_core.domain.common.exceptions import SpotifyAllowlistUnavailableError
from linkurator_core.domain.subscriptions.spotify_allowlist import SpotifyAllowlist, SpotifyAllowlistedUser


class InMemorySpotifyAllowlist(SpotifyAllowlist):
    def __init__(self, users: list[SpotifyAllowlistedUser], client_id: str = "app") -> None:
        self.users = users
        self._client_id = client_id

    @property
    def client_id(self) -> str:
        return self._client_id

    async def get_users(self) -> list[SpotifyAllowlistedUser]:
        return list(self.users)

    async def add_user(self, name: str, email: str) -> None:  # noqa: ARG002
        self.users.append(SpotifyAllowlistedUser(email=email, created_at=datetime.now(timezone.utc)))

    async def remove_user(self, email: str) -> None:
        self.users = [user for user in self.users if user.email != email]


def _user(email: str, hours_ago: int) -> SpotifyAllowlistedUser:
    return SpotifyAllowlistedUser(email=email, created_at=datetime.now(timezone.utc) - timedelta(hours=hours_ago))


def _emails(allowlist: InMemorySpotifyAllowlist) -> list[str]:
    return [user.email for user in allowlist.users]


@pytest.mark.asyncio()
async def test_allow_spotify_import_adds_the_user_to_the_allowlist() -> None:
    allowlist = InMemorySpotifyAllowlist(users=[_user("old@example.com", hours_ago=30)])

    await AllowSpotifyImportHandler(spotify_allowlists=[allowlist]).handle(name="John Doe", email="john@example.com")

    assert _emails(allowlist) == ["old@example.com", "john@example.com"]


@pytest.mark.asyncio()
async def test_allow_spotify_import_evicts_the_oldest_user_when_the_allowlist_is_full() -> None:
    allowlist = InMemorySpotifyAllowlist(users=[
        _user("third@example.com", hours_ago=27),
        _user("oldest@example.com", hours_ago=29),
        _user("fourth@example.com", hours_ago=26),
        _user("second@example.com", hours_ago=28),
        _user("newest@example.com", hours_ago=1),
    ])

    await AllowSpotifyImportHandler(spotify_allowlists=[allowlist]).handle(name="John Doe", email="john@example.com")

    assert sorted(_emails(allowlist)) == sorted([
        "third@example.com", "fourth@example.com", "second@example.com", "newest@example.com", "john@example.com"])


@pytest.mark.asyncio()
async def test_allow_spotify_import_evicts_users_until_there_is_room_when_the_allowlist_is_over_the_limit() -> None:
    allowlist = InMemorySpotifyAllowlist(users=[_user(f"user{i}@example.com", hours_ago=30 - i) for i in range(6)])

    await AllowSpotifyImportHandler(spotify_allowlists=[allowlist]).handle(name="John Doe", email="john@example.com")

    assert _emails(allowlist) == [
        "user2@example.com", "user3@example.com", "user4@example.com", "user5@example.com", "john@example.com"]


@pytest.mark.asyncio()
async def test_allow_spotify_import_fails_when_the_oldest_user_was_added_less_than_24_hours_ago() -> None:
    users = [_user(f"user{i}@example.com", hours_ago=23 - i) for i in range(5)]
    allowlist = InMemorySpotifyAllowlist(users=list(users))

    with pytest.raises(SpotifyAllowlistUnavailableError):
        await AllowSpotifyImportHandler(spotify_allowlists=[allowlist]).handle(name="John Doe", email="john@example.com")

    assert allowlist.users == users


@pytest.mark.asyncio()
async def test_allow_spotify_import_does_nothing_when_the_user_is_already_allowlisted() -> None:
    users = [_user(f"user{i}@example.com", hours_ago=30) for i in range(4)] + [_user("John@Example.com", 1)]
    allowlist = InMemorySpotifyAllowlist(users=list(users))

    await AllowSpotifyImportHandler(spotify_allowlists=[allowlist]).handle(name="John Doe", email="john@example.com")

    assert allowlist.users == users


@pytest.mark.asyncio()
async def test_allow_spotify_import_fails_when_the_allowlist_is_unavailable() -> None:
    spotify_allowlist = AsyncMock(spec=SpotifyAllowlist)
    spotify_allowlist.client_id = "app"
    spotify_allowlist.get_users.side_effect = SpotifyAllowlistUnavailableError("sp_dc expired")

    with pytest.raises(SpotifyAllowlistUnavailableError):
        await AllowSpotifyImportHandler(spotify_allowlists=[spotify_allowlist]).handle(
            name="John Doe", email="john@example.com")

    spotify_allowlist.add_user.assert_not_called()


@pytest.mark.asyncio()
async def test_allow_spotify_import_returns_the_client_id_of_the_app_that_allowed_the_user() -> None:
    allowlist = InMemorySpotifyAllowlist(users=[])

    client_id = await AllowSpotifyImportHandler(spotify_allowlists=[allowlist]).handle(
        name="John Doe", email="john@example.com")

    assert client_id == "app"
    assert _emails(allowlist) == ["john@example.com"]


@pytest.mark.asyncio()
async def test_allow_spotify_import_uses_another_app_when_one_is_full() -> None:
    full_allowlist = InMemorySpotifyAllowlist(users=[_user(f"user{i}@example.com", hours_ago=1) for i in range(5)],
                                              client_id="full_app")
    free_allowlist = InMemorySpotifyAllowlist(users=[], client_id="free_app")
    handler = AllowSpotifyImportHandler(spotify_allowlists=[full_allowlist, free_allowlist])

    for _ in range(10):
        client_id = await handler.handle(name="John Doe", email="john@example.com")
        assert client_id == "free_app"

    assert len(full_allowlist.users) == 5
    assert _emails(free_allowlist) == ["john@example.com"]


@pytest.mark.asyncio()
async def test_allow_spotify_import_selects_the_app_randomly() -> None:
    allowlists: list[SpotifyAllowlist] = []
    for i in range(3):
        allowlist = AsyncMock(spec=SpotifyAllowlist)
        allowlist.client_id = f"app{i}"
        allowlist.get_users.return_value = []
        allowlists.append(allowlist)
    handler = AllowSpotifyImportHandler(spotify_allowlists=allowlists)

    client_ids = {await handler.handle(name="John Doe", email="john@example.com") for _ in range(60)}

    assert client_ids == {"app0", "app1", "app2"}


@pytest.mark.asyncio()
async def test_allow_spotify_import_fails_when_every_app_is_unavailable() -> None:
    full_allowlist = InMemorySpotifyAllowlist(users=[_user(f"user{i}@example.com", hours_ago=1) for i in range(5)])
    unreachable_allowlist = AsyncMock(spec=SpotifyAllowlist)
    unreachable_allowlist.client_id = "unreachable_app"
    unreachable_allowlist.get_users.side_effect = SpotifyAllowlistUnavailableError("sp_dc expired")
    handler = AllowSpotifyImportHandler(spotify_allowlists=[full_allowlist, unreachable_allowlist])

    with pytest.raises(SpotifyAllowlistUnavailableError):
        await handler.handle(name="John Doe", email="john@example.com")

    unreachable_allowlist.get_users.assert_called_once()
    unreachable_allowlist.add_user.assert_not_called()
