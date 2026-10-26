from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime


@dataclass
class SpotifyAllowlistedUser:
    email: str
    created_at: datetime


class SpotifyAllowlist(ABC):
    """
    Users a Spotify app in development mode lets log in with OAuth.

    Spotify only lets allowlisted users authorize an app in development mode, so a user has to be added before
    they can import their saved shows. The allowlist has a limited number of slots, so the oldest users are
    removed to make room for new ones.
    """

    @property
    @abstractmethod
    def client_id(self) -> str:
        """Id of the Spotify app the users are allowed to authorize."""

    @abstractmethod
    async def get_users(self) -> list[SpotifyAllowlistedUser]:
        """Raises SpotifyAllowlistUnavailableError if the allowlist could not be reached."""

    @abstractmethod
    async def add_user(self, name: str, email: str) -> None:
        """Raises SpotifyAllowlistUnavailableError if the user could not be added, e.g. because it is full."""

    @abstractmethod
    async def remove_user(self, email: str) -> None:
        """Raises SpotifyAllowlistUnavailableError if the allowlist could not be reached."""
