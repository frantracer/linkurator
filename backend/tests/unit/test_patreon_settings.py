import pytest

from linkurator_core.infrastructure.config.settings import PatreonSettings


def test_patreon_settings_rejects_missing_credentials_when_enabled() -> None:
    """Test that missing client_id/client_secret are rejected when Patreon is enabled."""
    with pytest.raises(ValueError, match="client_id and client_secret must be provided"):
        PatreonSettings(enabled=True)


def test_patreon_settings_allows_missing_credentials_when_disabled() -> None:
    """Test that missing client_id/client_secret are allowed when Patreon is disabled."""
    settings = PatreonSettings(enabled=False)
    assert settings.client_id == ""
    assert settings.client_secret == ""


def test_patreon_is_disabled_by_default() -> None:
    settings = PatreonSettings()
    assert settings.enabled is False
