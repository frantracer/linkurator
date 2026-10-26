from __future__ import annotations

import logging
import secrets
from dataclasses import dataclass
from urllib.parse import urlencode

from pydantic import BaseModel, ValidationError

from linkurator_core.infrastructure.asyncio_impl.http_client import AsyncHttpClient
from linkurator_core.infrastructure.spotify.spotify_api_client import SpotifyCredentials

ACCOUNTS_BASE_URL = "https://accounts.spotify.com"
SAVED_SHOWS_SCOPE = "user-library-read"
STATE_SEPARATOR = ":"


class SpotifyTokenResponse(BaseModel):
    access_token: str


@dataclass
class SpotifyAuthorizationState:
    """OAuth state that tells the callback which Spotify app the user authorized, with a nonce against CSRF."""

    client_id: str
    nonce: str

    @staticmethod
    def new(client_id: str) -> SpotifyAuthorizationState:
        return SpotifyAuthorizationState(client_id=client_id, nonce=secrets.token_urlsafe(16))

    @staticmethod
    def decode(state: str) -> SpotifyAuthorizationState | None:
        client_id, separator, nonce = state.partition(STATE_SEPARATOR)
        if separator == "" or client_id == "" or nonce == "":
            return None
        return SpotifyAuthorizationState(client_id=client_id, nonce=nonce)

    def encode(self) -> str:
        return f"{self.client_id}{STATE_SEPARATOR}{self.nonce}"


class SpotifyUserAuthClient:
    """OAuth2 authorization code flow to act on behalf of a Spotify user, through any of the given Spotify apps."""

    def __init__(self, credentials: list[SpotifyCredentials], http_client: AsyncHttpClient) -> None:
        self.client_secrets = {credential.client_id: credential.client_secret for credential in credentials}
        self.http_client = http_client

    def authorization_url(self, client_id: str, redirect_uri: str, state: SpotifyAuthorizationState) -> str:
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": SAVED_SHOWS_SCOPE,
            "state": state.encode(),
        }
        return f"{ACCOUNTS_BASE_URL}/authorize?{urlencode(params)}"

    async def exchange_code_for_token(self, client_id: str, code: str, redirect_uri: str) -> str | None:
        """Returns None on failure."""
        client_secret = self.client_secrets.get(client_id)
        if client_secret is None:
            logging.error("Cannot exchange a Spotify code for unknown app %s", client_id)
            return None

        data = {
            "code": code,
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        }

        response = await self.http_client.post(f"{ACCOUNTS_BASE_URL}/api/token", data=data)
        if response.status != 200:
            logging.error("Failed to exchange Spotify code: %s -> %s", response.status, response.json)
            return None

        try:
            return SpotifyTokenResponse.model_validate(response.json).access_token
        except ValidationError as e:
            logging.exception("Unexpected Spotify token response: %s", e)
            return None
