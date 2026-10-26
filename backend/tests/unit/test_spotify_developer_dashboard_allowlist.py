from __future__ import annotations

import base64
import hashlib
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import pytest
from aiohttp import web
from aiohttp.test_utils import TestServer

from linkurator_core.domain.common.exceptions import SpotifyAllowlistUnavailableError
from linkurator_core.domain.subscriptions.spotify_allowlist import SpotifyAllowlistedUser
from linkurator_core.infrastructure.spotify.spotify_developer_dashboard_allowlist import (
    SpotifyDeveloperDashboardAllowlist,
)

CLIENT_ID = "3ad40757d4f36b621339ad84d4cd3fff"
DASHBOARD_CLIENT_ID = "d5a59ddc3ec8466fea0c64df7ea956a7"
SP_DC = "valid_sp_dc"
AUTHORIZATION_CODE = "authorization_code"
DASHBOARD_TOKEN = "dashboard_token"
USERS_PATH = f"/api/ws4d/warp/clients/{CLIENT_ID}/users"


@dataclass
class FakeSpotify:
    """Fake of the Spotify accounts and developer dashboard endpoints the allowlist calls."""

    users: list[dict[str, Any]] = field(default_factory=list)
    token_requests: int = 0
    code_challenge: str = ""
    redirected_code: str = AUTHORIZATION_CODE
    add_user_status: int = 200
    list_users_status: int = 200
    delete_user_status: int | None = None

    async def authorize(self, request: web.Request) -> web.Response:
        assert request.query["client_id"] == DASHBOARD_CLIENT_ID
        assert request.query["code_challenge_method"] == "S256"
        if request.cookies.get("sp_dc") != SP_DC:
            return web.Response(status=302, headers={"Location": "/login"})
        self.code_challenge = request.query["code_challenge"]
        return web.Response(status=302,
                            headers={"Location": f"{request.query['redirect_uri']}/?code={self.redirected_code}"})

    async def token(self, request: web.Request) -> web.Response:
        form = await request.post()
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(str(form["code_verifier"]).encode()).digest()).rstrip(b"=").decode()
        if form["code"] != AUTHORIZATION_CODE or code_challenge != self.code_challenge:
            return web.json_response({"error": "invalid_grant"}, status=400)
        self.token_requests += 1
        return web.json_response({"access_token": DASHBOARD_TOKEN, "expires_in": 3600})

    async def add_user(self, request: web.Request) -> web.Response:
        self._check_authorization(request)
        if self.add_user_status != 200:
            return web.json_response({"code": 8, "message": "Error"}, status=self.add_user_status)
        body = await request.json()
        if any(user["email"] == body["email"] for user in self.users):
            return web.json_response({"code": 6, "message": "Already exists"}, status=409)
        user = {"name": body["name"], "email": body["email"], "clientId": body["clientId"],
                "createdAt": "2026-10-25T12:04:51.013Z", "id": f"id-{len(self.users)}"}
        self.users.append(user)
        return web.json_response({**user, "id": ""})

    async def list_users(self, request: web.Request) -> web.Response:
        self._check_authorization(request)
        if self.list_users_status != 200:
            return web.json_response({"code": 13, "message": "Error"}, status=self.list_users_status)
        return web.json_response({"users": self.users})

    async def delete_user(self, request: web.Request) -> web.Response:
        self._check_authorization(request)
        if self.delete_user_status is not None:
            return web.json_response({"code": 13, "message": "Error"}, status=self.delete_user_status)
        self.users = [user for user in self.users if user["id"] != request.match_info["user_id"]]
        return web.json_response({})

    @staticmethod
    def _check_authorization(request: web.Request) -> None:
        assert request.headers.get("Authorization") == f"Bearer {DASHBOARD_TOKEN}"


@asynccontextmanager
async def fake_spotify_server(fake: FakeSpotify) -> AsyncIterator[str]:
    app = web.Application()
    app.router.add_get("/oauth2/v2/auth", fake.authorize)
    app.router.add_post("/api/token", fake.token)
    app.router.add_post(USERS_PATH, fake.add_user)
    app.router.add_get(USERS_PATH, fake.list_users)
    app.router.add_delete(USERS_PATH + "/id/{user_id}", fake.delete_user)
    server = TestServer(app)
    await server.start_server()
    try:
        yield str(server.make_url("")).rstrip("/")
    finally:
        await server.close()


def _allowlist(base_url: str, sp_dc: str = SP_DC) -> SpotifyDeveloperDashboardAllowlist:
    return SpotifyDeveloperDashboardAllowlist(
        client_id=CLIENT_ID, dashboard_client_id=DASHBOARD_CLIENT_ID, sp_dc=sp_dc,
        accounts_base_url=base_url, dashboard_base_url=base_url)


@pytest.mark.asyncio()
async def test_add_and_remove_user_reuse_the_dashboard_token() -> None:
    fake = FakeSpotify()
    async with fake_spotify_server(fake) as base_url:
        allowlist = _allowlist(base_url)

        await allowlist.add_user(name="John Doe", email="john@example.com")
        assert [user["email"] for user in fake.users] == ["john@example.com"]

        await allowlist.remove_user(email="John@Example.com")
        assert fake.users == []

    assert fake.token_requests == 1


@pytest.mark.asyncio()
async def test_get_users_returns_the_email_and_creation_date_of_each_user() -> None:
    fake = FakeSpotify(users=[{"name": "John Doe", "email": "john@example.com", "clientId": CLIENT_ID,
                               "createdAt": "2026-10-25T12:04:51.013Z", "id": "id-0"}])
    async with fake_spotify_server(fake) as base_url:
        users = await _allowlist(base_url).get_users()

    assert users == [SpotifyAllowlistedUser(
        email="john@example.com", created_at=datetime(2026, 10, 25, 12, 4, 51, 13000, tzinfo=timezone.utc))]


@pytest.mark.asyncio()
async def test_add_already_allowlisted_user_succeeds() -> None:
    fake = FakeSpotify(users=[{"name": "John Doe", "email": "john@example.com",
                               "createdAt": "2026-10-25T12:04:51.013Z", "id": "id-0"}])
    async with fake_spotify_server(fake) as base_url:
        await _allowlist(base_url).add_user(name="John Doe", email="john@example.com")

    assert len(fake.users) == 1


@pytest.mark.asyncio()
async def test_add_user_fails_when_the_dashboard_rejects_it() -> None:
    fake = FakeSpotify(add_user_status=400)
    async with fake_spotify_server(fake) as base_url:
        with pytest.raises(SpotifyAllowlistUnavailableError):
            await _allowlist(base_url).add_user(name="John Doe", email="john@example.com")


@pytest.mark.asyncio()
async def test_add_user_fails_when_the_sp_dc_cookie_is_not_valid() -> None:
    fake = FakeSpotify()
    async with fake_spotify_server(fake) as base_url:
        with pytest.raises(SpotifyAllowlistUnavailableError):
            await _allowlist(base_url, sp_dc="expired_sp_dc").add_user(name="John Doe", email="john@example.com")

    assert fake.users == []


@pytest.mark.asyncio()
async def test_add_user_fails_when_the_code_cannot_be_exchanged() -> None:
    fake = FakeSpotify(redirected_code="wrong_code")
    async with fake_spotify_server(fake) as base_url:
        with pytest.raises(SpotifyAllowlistUnavailableError):
            await _allowlist(base_url).add_user(name="John Doe", email="john@example.com")

    assert fake.users == []


@pytest.mark.asyncio()
async def test_add_user_fails_when_spotify_is_unreachable() -> None:
    fake = FakeSpotify()
    async with fake_spotify_server(fake) as base_url:
        allowlist = _allowlist(base_url)

    with pytest.raises(SpotifyAllowlistUnavailableError):
        await allowlist.add_user(name="John Doe", email="john@example.com")


@pytest.mark.asyncio()
async def test_remove_user_that_is_not_allowlisted_does_nothing() -> None:
    fake = FakeSpotify(users=[{"name": "Jane Doe", "email": "jane@example.com",
                               "createdAt": "2026-10-25T12:04:51.013Z", "id": "id-0"}])
    async with fake_spotify_server(fake) as base_url:
        await _allowlist(base_url).remove_user(email="john@example.com")

    assert [user["email"] for user in fake.users] == ["jane@example.com"]


@pytest.mark.asyncio()
async def test_remove_user_already_deleted_succeeds() -> None:
    fake = FakeSpotify(users=[{"name": "John Doe", "email": "john@example.com",
                               "createdAt": "2026-10-25T12:04:51.013Z", "id": "id-0"}],
                       delete_user_status=404)
    async with fake_spotify_server(fake) as base_url:
        await _allowlist(base_url).remove_user(email="john@example.com")


@pytest.mark.asyncio()
async def test_remove_user_fails_when_the_dashboard_cannot_delete_it() -> None:
    fake = FakeSpotify(users=[{"name": "John Doe", "email": "john@example.com",
                               "createdAt": "2026-10-25T12:04:51.013Z", "id": "id-0"}],
                       delete_user_status=500)
    async with fake_spotify_server(fake) as base_url:
        with pytest.raises(SpotifyAllowlistUnavailableError):
            await _allowlist(base_url).remove_user(email="john@example.com")


@pytest.mark.asyncio()
async def test_remove_user_fails_when_the_users_cannot_be_listed() -> None:
    fake = FakeSpotify(list_users_status=500)
    async with fake_spotify_server(fake) as base_url:
        with pytest.raises(SpotifyAllowlistUnavailableError):
            await _allowlist(base_url).remove_user(email="john@example.com")
