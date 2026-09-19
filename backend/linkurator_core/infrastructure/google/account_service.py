from __future__ import annotations

import base64
import http
import logging
from urllib.parse import urlencode

import google.auth.transport.requests
from google.oauth2.service_account import Credentials

from linkurator_core.domain.common.exceptions import FailToRevokeCredentialsError
from linkurator_core.domain.common.utils import parse_url
from linkurator_core.domain.users.account_service import AccountService, CodeValidationResponse, UserDetails, UserInfo
from linkurator_core.infrastructure.asyncio_impl.http_client import AsyncHttpClient


class GoogleAccountService(AccountService):
    """
    GoogleAccountService allows to authenticate users with Google.

    More documentation: https://developers.google.com/identity/protocols/oauth2/openid-connect
    """

    def __init__(self, client_id: str, client_secret: str, http_client: AsyncHttpClient | None = None) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.http_client = http_client if http_client is not None else AsyncHttpClient()

    def authorization_url(self, scopes: list[str], redirect_uri: str) -> str:
        google_oauth_url = "https://accounts.google.com/o/oauth2/auth"
        query_params: dict[str, str] = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "scope": " ".join(scopes),
            "state": "ETL04Oop9e1yFQQFRM2KpHvbWwtMRV",
            "include_granted_scopes": "false",
            "access_type": "offline",
            "prompt": "select_account",
        }
        return f"{google_oauth_url}?{urlencode(query_params)}"

    def _client_auth_headers(self) -> dict[str, str]:
        credentials = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
        return {"Authorization": f"Basic {credentials}"}

    async def validate_code(self, code: str, redirect_uri: str) -> CodeValidationResponse | None:
        google_oauth_url = "https://oauth2.googleapis.com/token"
        query_params: dict[str, str] = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }
        token_response = await self.http_client.post(
            google_oauth_url, data=query_params,
            headers=self._client_auth_headers())

        if token_response.status != http.HTTPStatus.OK:
            logging.warning("Failed to validate code: %s %s", token_response.status, token_response.json)
            return None

        return CodeValidationResponse(
            access_token=token_response.json["access_token"],
            refresh_token=token_response.json.get("refresh_token"),
        )

    async def revoke_credentials(self, access_token: str) -> None:
        revoke_response = await self.http_client.post("https://oauth2.googleapis.com/revoke",
                                                      data={"token": access_token})

        if revoke_response.status != http.HTTPStatus.OK:
            msg = f"Failed to revoke token: {revoke_response.json!s}"
            raise FailToRevokeCredentialsError(msg)

    async def generate_access_token_from_refresh_token(self, refresh_token: str) -> str | None:
        google_oauth_url = "https://oauth2.googleapis.com/token"
        query_params: dict[str, str] = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        token_response = await self.http_client.post(
            google_oauth_url,
            data=query_params,
            headers=self._client_auth_headers())

        if token_response.status != http.HTTPStatus.OK:
            logging.warning("Failed to refresh access token: %s %s", token_response.status, token_response.json)
            return None

        return token_response.json.get("access_token", None)

    async def get_user_info(self, access_token: str) -> UserInfo | None:
        user_info_url = "https://openidconnect.googleapis.com/v1/userinfo"
        user_info_response = await self.http_client.get_json(
            user_info_url,
            headers={"Authorization": f"Bearer {access_token}"})

        if user_info_response.status != http.HTTPStatus.OK:
            return None

        user_info = dict(user_info_response.json)
        user_details: UserDetails | None = None
        if user_info.get("given_name") is not None:
            user_details = UserDetails(
                given_name=user_info["given_name"],
                family_name=user_info.get("family_name", ""),
                picture=parse_url(user_info.get("picture", "")),
                locale=user_info.get("locale", "en"),
            )
        return UserInfo(
            email=user_info["email"],
            details=user_details,
        )


class GoogleDomainAccountService:
    def __init__(self, service_credentials: dict[str, str], email: str) -> None:
        self.service_credentials = service_credentials
        self.email = email

    def generate_access_token_from_service_credentials(self) -> str | None:
        credentials = Credentials.from_service_account_info(
            self.service_credentials,
            scopes=["https://www.googleapis.com/auth/gmail.send"],
        ).with_subject(self.email)

        request = google.auth.transport.requests.Request()
        credentials.refresh(request)
        return credentials.token
