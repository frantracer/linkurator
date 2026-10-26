from unittest.mock import AsyncMock
from urllib.parse import parse_qs, urlparse

import pytest

from linkurator_core.infrastructure.asyncio_impl.http_client import AsyncHttpClient, JsonHttpResponse
from linkurator_core.infrastructure.spotify.spotify_api_client import SpotifyCredentials
from linkurator_core.infrastructure.spotify.spotify_user_auth_client import (
    SpotifyAuthorizationState,
    SpotifyUserAuthClient,
)

CREDENTIALS = [
    SpotifyCredentials(client_id="client_id", client_secret="client_secret"),
    SpotifyCredentials(client_id="other_client_id", client_secret="other_client_secret"),
]


def test_authorization_url_requests_access_to_the_saved_shows_through_the_given_app() -> None:
    client = SpotifyUserAuthClient(credentials=CREDENTIALS, http_client=AsyncMock(spec=AsyncHttpClient))

    url = urlparse(client.authorization_url(
        client_id="other_client_id",
        redirect_uri="https://api.linkurator.com/subscriptions/sync/spotify_auth",
        state=SpotifyAuthorizationState(client_id="other_client_id", nonce="nonce"),
    ))

    assert f"{url.scheme}://{url.netloc}{url.path}" == "https://accounts.spotify.com/authorize"
    assert parse_qs(url.query) == {
        "response_type": ["code"],
        "client_id": ["other_client_id"],
        "redirect_uri": ["https://api.linkurator.com/subscriptions/sync/spotify_auth"],
        "scope": ["user-library-read"],
        "state": ["other_client_id:nonce"],
    }


@pytest.mark.asyncio()
async def test_exchange_code_for_token_returns_the_access_token() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(json={"access_token": "access_token"}, status=200)
    client = SpotifyUserAuthClient(credentials=CREDENTIALS, http_client=http_client)

    access_token = await client.exchange_code_for_token(
        client_id="other_client_id", code="code", redirect_uri="https://redirect")

    assert access_token == "access_token"
    http_client.post.assert_called_once_with("https://accounts.spotify.com/api/token", data={
        "code": "code",
        "grant_type": "authorization_code",
        "client_id": "other_client_id",
        "client_secret": "other_client_secret",
        "redirect_uri": "https://redirect",
    })


@pytest.mark.asyncio()
async def test_exchange_code_for_token_returns_none_on_failure() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(json={"error": "invalid_grant"}, status=400)
    client = SpotifyUserAuthClient(credentials=CREDENTIALS, http_client=http_client)

    assert await client.exchange_code_for_token(
        client_id="client_id", code="code", redirect_uri="https://redirect") is None


@pytest.mark.asyncio()
async def test_exchange_code_for_token_returns_none_for_an_unknown_app() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    client = SpotifyUserAuthClient(credentials=CREDENTIALS, http_client=http_client)

    assert await client.exchange_code_for_token(
        client_id="unknown_client_id", code="code", redirect_uri="https://redirect") is None
    http_client.post.assert_not_called()


def test_authorization_state_round_trips_through_its_encoding() -> None:
    state = SpotifyAuthorizationState.new("client_id")

    assert SpotifyAuthorizationState.decode(state.encode()) == state


@pytest.mark.parametrize("encoded_state", ["", "client_id", "client_id:", ":nonce"])
def test_authorization_state_cannot_be_decoded_without_client_id_and_nonce(encoded_state: str) -> None:
    assert SpotifyAuthorizationState.decode(encoded_state) is None
