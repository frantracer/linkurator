from typing import Any
from unittest.mock import AsyncMock

import pytest

from linkurator_core.domain.common.exceptions import FailToRevokeCredentialsError
from linkurator_core.infrastructure.asyncio_impl.http_client import AsyncHttpClient, JsonHttpResponse
from linkurator_core.infrastructure.google.account_service import GoogleAccountService

# Basic authentication for "client-id:client-secret"
BASIC_AUTH_HEADERS = {"Authorization": "Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ="}

ERROR_RESPONSES = [
    pytest.param(400, {"error": "invalid_grant", "error_description": "Bad Request"}, id="bad-request"),
    pytest.param(401, {"error": "invalid_client"}, id="unauthorized"),
    pytest.param(403, {"error": {"code": 403, "status": "PERMISSION_DENIED"}}, id="forbidden"),
    pytest.param(500, {"error": {"code": 500, "status": "INTERNAL"}}, id="server-error"),
    pytest.param(503, {"error": {"code": 503, "status": "UNAVAILABLE"}}, id="unavailable"),
]


def new_service(http_client: AsyncMock) -> GoogleAccountService:
    return GoogleAccountService(client_id="client-id", client_secret="client-secret", http_client=http_client)


# validate_code

@pytest.mark.asyncio()
async def test_validate_code_returns_tokens() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(
        status=200, json={"access_token": "access", "refresh_token": "refresh"})

    result = await new_service(http_client).validate_code(code="code", redirect_uri="http://localhost/cb")

    assert result is not None
    assert result.access_token == "access"
    assert result.refresh_token == "refresh"
    http_client.post.assert_awaited_once_with(
        "https://oauth2.googleapis.com/token",
        data={"grant_type": "authorization_code", "code": "code", "redirect_uri": "http://localhost/cb"},
        headers=BASIC_AUTH_HEADERS,
    )


@pytest.mark.asyncio()
async def test_validate_code_without_refresh_token() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(status=200, json={"access_token": "access"})

    result = await new_service(http_client).validate_code(code="code", redirect_uri="http://localhost/cb")

    assert result is not None
    assert result.access_token == "access"
    assert result.refresh_token is None


@pytest.mark.asyncio()
@pytest.mark.parametrize(("status_code", "body"), ERROR_RESPONSES)
async def test_validate_code_returns_none_on_error_status(status_code: int, body: dict[str, Any]) -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(status=status_code, json=body)

    result = await new_service(http_client).validate_code(code="code", redirect_uri="http://localhost/cb")

    assert result is None


# generate_access_token_from_refresh_token

@pytest.mark.asyncio()
async def test_generate_access_token_from_refresh_token() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(status=200, json={"access_token": "new-access"})

    result = await new_service(http_client).generate_access_token_from_refresh_token("refresh")

    assert result == "new-access"
    http_client.post.assert_awaited_once_with(
        "https://oauth2.googleapis.com/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": "refresh",
            "client_id": "client-id",
            "client_secret": "client-secret",
        },
        headers=BASIC_AUTH_HEADERS,
    )


@pytest.mark.asyncio()
@pytest.mark.parametrize(("status_code", "body"), ERROR_RESPONSES)
async def test_generate_access_token_from_refresh_token_returns_none_on_error_status(
        status_code: int, body: dict[str, Any]) -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    # The token in the body must not be trusted: only the status code tells the request failed
    http_client.post.return_value = JsonHttpResponse(status=status_code, json={**body, "access_token": "stale"})

    result = await new_service(http_client).generate_access_token_from_refresh_token("refresh")

    assert result is None


# revoke_credentials

@pytest.mark.asyncio()
async def test_revoke_credentials() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(status=200, json={})

    await new_service(http_client).revoke_credentials("access")

    http_client.post.assert_awaited_once_with("https://oauth2.googleapis.com/revoke", data={"token": "access"})


@pytest.mark.asyncio()
@pytest.mark.parametrize(("status_code", "body"), ERROR_RESPONSES)
async def test_revoke_credentials_raises_on_error_status(status_code: int, body: dict[str, Any]) -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.post.return_value = JsonHttpResponse(status=status_code, json=body)

    with pytest.raises(FailToRevokeCredentialsError):
        await new_service(http_client).revoke_credentials("access")


# get_user_info

@pytest.mark.asyncio()
async def test_get_user_info() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.get_json.return_value = JsonHttpResponse(status=200, json={
        "email": "user@example.com",
        "given_name": "Jane",
        "family_name": "Doe",
        "picture": "https://example.com/picture.png",
        "locale": "es",
    })

    result = await new_service(http_client).get_user_info("access")

    assert result is not None
    assert result.email == "user@example.com"
    assert result.details is not None
    assert result.details.given_name == "Jane"
    assert result.details.family_name == "Doe"
    assert result.details.locale == "es"
    http_client.get_json.assert_awaited_once_with(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={"Authorization": "Bearer access"},
    )


@pytest.mark.asyncio()
async def test_get_user_info_without_profile_details() -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.get_json.return_value = JsonHttpResponse(status=200, json={"email": "user@example.com"})

    result = await new_service(http_client).get_user_info("access")

    assert result is not None
    assert result.email == "user@example.com"
    assert result.details is None


@pytest.mark.asyncio()
@pytest.mark.parametrize(("status_code", "body"), ERROR_RESPONSES)
async def test_get_user_info_returns_none_on_error_status(status_code: int, body: dict[str, Any]) -> None:
    http_client = AsyncMock(spec=AsyncHttpClient)
    http_client.get_json.return_value = JsonHttpResponse(status=status_code, json=body)

    result = await new_service(http_client).get_user_info("access")

    assert result is None
