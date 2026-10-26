import logging
import random
from datetime import datetime, timedelta, timezone

from linkurator_core.domain.common.exceptions import SpotifyAllowlistUnavailableError
from linkurator_core.domain.subscriptions.spotify_allowlist import SpotifyAllowlist

MAX_ALLOWLISTED_USERS = 5
# Spotify only lets an app add MAX_ALLOWLISTED_USERS users per day
MIN_AGE_TO_EVICT = timedelta(hours=24)


class AllowSpotifyImportHandler:
    def __init__(self, spotify_allowlists: list[SpotifyAllowlist]) -> None:
        self.spotify_allowlists = spotify_allowlists

    async def handle(self, name: str, email: str) -> str:
        """
        Add the user to the allowlist of a random Spotify app, evicting its oldest users first if it is full.

        Apps are tried in random order until one accepts the user.
        :return: The client id of the Spotify app the user can authorize.
        Raises SpotifyAllowlistUnavailableError if no app could allow the user, because their allowlist could not
        be reached or is full of users added less than MIN_AGE_TO_EVICT ago.
        """
        allowlists = list(self.spotify_allowlists)
        random.shuffle(allowlists)
        for allowlist in allowlists:
            try:
                await self._allow_user(allowlist, name=name, email=email)
                return allowlist.client_id
            except SpotifyAllowlistUnavailableError as e:
                logging.exception("Failed to add the user to the allowlist of Spotify app %s: %s",
                                  allowlist.client_id, e)

        msg = "No Spotify app could add the user to its allowlist"
        raise SpotifyAllowlistUnavailableError(msg)

    @staticmethod
    async def _allow_user(spotify_allowlist: SpotifyAllowlist, name: str, email: str) -> None:
        users = await spotify_allowlist.get_users()
        if any(user.email.lower() == email.lower() for user in users):
            return

        users_by_age = sorted(users, key=lambda user: user.created_at)
        users_over_capacity = max(0, len(users) + 1 - MAX_ALLOWLISTED_USERS)
        users_to_evict = users_by_age[:users_over_capacity]
        evictable_before = datetime.now(timezone.utc) - MIN_AGE_TO_EVICT
        if any(user.created_at > evictable_before for user in users_to_evict):
            msg = f"The Spotify allowlist is full of users added in the last {MIN_AGE_TO_EVICT}"
            raise SpotifyAllowlistUnavailableError(msg)

        for user in users_to_evict:
            await spotify_allowlist.remove_user(email=user.email)

        await spotify_allowlist.add_user(name=name, email=email)
