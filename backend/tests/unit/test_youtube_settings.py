import pytest

from linkurator_core.infrastructure.config.settings import YoutubeSettings


def test_youtube_settings_rejects_empty_api_keys_when_enabled() -> None:
    """Test that an empty api key list is rejected when Youtube is enabled."""
    with pytest.raises(ValueError, match="At least one Youtube API key must be provided"):
        YoutubeSettings(enabled=True, api_keys=[])


def test_youtube_settings_allows_empty_api_keys_when_disabled() -> None:
    """Test that an empty api key list is allowed when Youtube is disabled."""
    settings = YoutubeSettings(enabled=False, api_keys=[])
    assert settings.api_keys == []


def test_youtube_is_disabled_by_default() -> None:
    settings = YoutubeSettings()
    assert settings.enabled is False
    assert settings.api_keys == []
