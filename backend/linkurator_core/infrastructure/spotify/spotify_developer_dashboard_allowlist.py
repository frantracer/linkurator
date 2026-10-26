from __future__ import annotations

import asyncio
import base64
import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlencode, urlparse

import aiohttp
from pydantic import BaseModel, Field, ValidationError

from linkurator_core.domain.common.exceptions import SpotifyAllowlistUnavailableError
from linkurator_core.domain.subscriptions.spotify_allowlist import SpotifyAllowlist, SpotifyAllowlistedUser

ACCOUNTS_BASE_URL = "https://accounts.spotify.com"
DASHBOARD_BASE_URL = "https://developer.spotify.com"
DASHBOARD_SCOPE = "user-self-provisioning"
TOKEN_EXPIRATION_MARGIN = timedelta(seconds=60)
# The dashboard API rejects requests that don't look like they come from a browser
BROWSER_USER_AGENT = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/155.0.0.0 Safari/537.36")


class DashboardUser(BaseModel):
    id: str
    email: str
    created_at: datetime = Field(alias="createdAt")


class DashboardUsersResponse(BaseModel):
    users: list[DashboardUser] = []


class DashboardTokenResponse(BaseModel):
    access_token: str
    expires_in: int


class SpotifyDeveloperDashboardAllowlist(SpotifyAllowlist):
    """
    Manages the users of a Spotify app through the (undocumented) API of the Spotify developer dashboard.

    It logs in with the sp_dc session cookie of the app owner: as the owner already authorized the dashboard,
    Spotify redirects the authorization request straight back with a code, which is exchanged with PKCE for a
    dashboard access token.
    """

    def __init__(
        self,
        client_id: str,
        dashboard_client_id: str,
        sp_dc: str,
        accounts_base_url: str = ACCOUNTS_BASE_URL,
        dashboard_base_url: str = DASHBOARD_BASE_URL,
    ) -> None:
        self._client_id = client_id
        self.dashboard_client_id = dashboard_client_id
        self.sp_dc = sp_dc
        self.accounts_base_url = accounts_base_url
        self.dashboard_base_url = dashboard_base_url
        self._access_token: str | None = None
        self._access_token_expires_at = datetime.min.replace(tzinfo=timezone.utc)
        self._access_token_lock = asyncio.Lock()

    @property
    def client_id(self) -> str:
        return self._client_id

    async def get_users(self) -> list[SpotifyAllowlistedUser]:
        return [
            SpotifyAllowlistedUser(email=user.email, created_at=user.created_at)
            for user in await self._list_users()
        ]

    async def add_user(self, name: str, email: str) -> None:
        status, body = await self._dashboard_request(
            method="POST",
            path=f"/api/ws4d/warp/clients/{self.client_id}/users",
            payload={"name": name, "email": email, "clientId": self.client_id},
        )
        if status == 409:
            return
        if status != 200:
            logging.error("Failed to add a user to the Spotify allowlist: %s -> %s",
                          status, body.replace(email, "<email>"))
            msg = f"Failed to add user to the Spotify allowlist: {status}"
            raise SpotifyAllowlistUnavailableError(msg)

    async def remove_user(self, email: str) -> None:
        users = await self._list_users()
        user_id = next((user.id for user in users if user.email.lower() == email.lower()), None)
        if user_id is None:
            return

        status, body = await self._dashboard_request(
            method="DELETE",
            path=f"/api/ws4d/warp/clients/{self.client_id}/users/id/{user_id}",
        )
        if status not in {200, 404}:
            logging.error("Failed to remove user %s from the Spotify allowlist: %s -> %s",
                          user_id, status, body.replace(email, "<email>"))
            msg = f"Failed to remove user from the Spotify allowlist: {status}"
            raise SpotifyAllowlistUnavailableError(msg)

    async def _list_users(self) -> list[DashboardUser]:
        status, body = await self._dashboard_request(
            method="GET",
            path=f"/api/ws4d/warp/clients/{self.client_id}/users",
        )
        if status != 200:
            logging.error("Failed to list the Spotify allowlist: %s -> %s", status, body)
            msg = f"Failed to list the Spotify allowlist: {status}"
            raise SpotifyAllowlistUnavailableError(msg)
        try:
            return DashboardUsersResponse.model_validate_json(body).users
        except ValidationError as e:
            logging.exception("Unexpected Spotify allowlist response: %s", e)
            msg = "Unexpected Spotify allowlist response"
            raise SpotifyAllowlistUnavailableError(msg) from e

    async def _dashboard_request(
        self,
        method: str,
        path: str,
        payload: dict[str, str] | None = None,
    ) -> tuple[int, str]:
        access_token = await self._get_access_token()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "User-Agent": BROWSER_USER_AGENT,
        }
        try:
            async with aiohttp.ClientSession() as session, session.request(
                method, f"{self.dashboard_base_url}{path}", headers=headers, json=payload,
            ) as response:
                return response.status, await response.text()
        except aiohttp.ClientError as e:
            logging.exception("Failed to reach the Spotify developer dashboard on %s %s: %s", method, path, e)
            msg = f"Failed to reach the Spotify developer dashboard: {e}"
            raise SpotifyAllowlistUnavailableError(msg) from e

    async def _get_access_token(self) -> str:
        async with self._access_token_lock:
            now = datetime.now(timezone.utc)
            if self._access_token is None or now >= self._access_token_expires_at - TOKEN_EXPIRATION_MARGIN:
                self._access_token, expires_in = await self._request_access_token()
                self._access_token_expires_at = now + timedelta(seconds=expires_in)
            return self._access_token

    async def _request_access_token(self) -> tuple[str, int]:
        code_verifier = secrets.token_urlsafe(64)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()).rstrip(b"=").decode()
        authorization_params = {
            "response_type": "code",
            "client_id": self.dashboard_client_id,
            "redirect_uri": self.dashboard_base_url,
            "code_challenge_method": "S256",
            "code_challenge": code_challenge,
            "scope": DASHBOARD_SCOPE,
        }
        headers = {"User-Agent": BROWSER_USER_AGENT}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.accounts_base_url}/oauth2/v2/auth?{urlencode(authorization_params)}",
                    headers=headers, cookies={"sp_dc": self.sp_dc}, allow_redirects=False,
                ) as response:
                    location = response.headers.get("Location", "")
                codes = parse_qs(urlparse(location).query).get("code", [])
                if len(codes) == 0:
                    redirected_to = urlparse(location)
                    logging.error("Spotify did not authorize the developer dashboard, the sp_dc cookie may have "
                                  "expired: status %s, redirected to '%s%s' with query keys %s",
                                  response.status, redirected_to.netloc, redirected_to.path,
                                  list(parse_qs(redirected_to.query)))
                    msg = "Failed to authorize the Spotify developer dashboard"
                    raise SpotifyAllowlistUnavailableError(msg)

                token_data = {
                    "grant_type": "authorization_code",
                    "client_id": self.dashboard_client_id,
                    "code": codes[0],
                    "redirect_uri": self.dashboard_base_url,
                    "code_verifier": code_verifier,
                }
                async with session.post(
                    f"{self.accounts_base_url}/api/token", headers=headers, data=token_data,
                ) as response:
                    if response.status != 200:
                        logging.error("Failed to get a Spotify developer dashboard token: %s -> %s",
                                      response.status, await response.text())
                        msg = "Failed to get a Spotify developer dashboard token"
                        raise SpotifyAllowlistUnavailableError(msg)
                    token = DashboardTokenResponse.model_validate_json(await response.text())
                    return token.access_token, token.expires_in
        except ValidationError as e:
            logging.exception("Unexpected Spotify developer dashboard token response: %s", e)
            msg = "Unexpected Spotify developer dashboard token response"
            raise SpotifyAllowlistUnavailableError(msg) from e
        except aiohttp.ClientError as e:
            logging.exception("Failed to reach Spotify accounts to get a developer dashboard token: %s", e)
            msg = f"Failed to reach Spotify accounts: {e}"
            raise SpotifyAllowlistUnavailableError(msg) from e
