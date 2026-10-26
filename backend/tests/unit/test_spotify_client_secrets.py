
import pytest

from linkurator_core.infrastructure.config.settings import (
    SpotifyCredentialPair,
    SpotifySettings,
    SpotifyUserImportSettings,
)


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


def test_spotify_user_import_rejects_missing_dashboard_credentials_when_enabled() -> None:
    with pytest.raises(ValueError, match="dashboard_client_id and dashboard_sp_dc must be provided"):
        SpotifyUserImportSettings(enabled=True, dashboard_client_id="dashboard_client_id")


def test_spotify_user_import_requires_spotify_to_be_enabled() -> None:
    with pytest.raises(ValueError, match="Spotify must be enabled when Spotify user import is enabled"):
        SpotifySettings(
            enabled=False,
            credentials=[SpotifyCredentialPair(
                client_id="client_id",
                client_secret="client_secret",
                user_import=SpotifyUserImportSettings(
                    enabled=True, dashboard_client_id="dashboard_client_id", dashboard_sp_dc="sp_dc"),
            )],
        )


def test_spotify_user_import_is_disabled_by_default() -> None:
    credentials = SpotifyCredentialPair(client_id="client_id", client_secret="client_secret")
    assert credentials.user_import.enabled is False
