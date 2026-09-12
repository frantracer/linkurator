
import pytest

from linkurator_core.infrastructure.config.settings import SpotifySettings


def test_spotify_client_secrets_rejects_empty_list_when_enabled() -> None:
    """Test that an empty credential list is rejected when Spotify is enabled."""
    with pytest.raises(ValueError, match="At least one Spotify credential pair must be provided"):
        SpotifySettings(enabled=True, credentials=[])


def test_spotify_client_secrets_allows_empty_list_when_disabled() -> None:
    """Test that an empty credential list is allowed when Spotify is disabled."""
    settings = SpotifySettings(enabled=False, credentials=[])
    assert settings.credentials == []


def test_spotify_is_disabled_by_default() -> None:
    settings = SpotifySettings()
    assert settings.enabled is False
    assert settings.credentials == []
