import pytest

from linkurator_core.infrastructure.config.settings import OpenAISettings


def test_openai_settings_rejects_missing_api_key_when_enabled() -> None:
    """Test that a missing api key is rejected when OpenAI is enabled."""
    with pytest.raises(ValueError, match="An OpenAI API key must be provided"):
        OpenAISettings(enabled=True)


def test_openai_settings_allows_missing_api_key_when_disabled() -> None:
    """Test that a missing api key is allowed when OpenAI is disabled."""
    settings = OpenAISettings(enabled=False)
    assert settings.api_key is None


def test_openai_settings_accepts_api_key_when_enabled() -> None:
    settings = OpenAISettings(enabled=True, api_key="some-key")
    assert settings.enabled is True
    assert settings.api_key == "some-key"


def test_openai_is_disabled_by_default() -> None:
    settings = OpenAISettings()
    assert settings.enabled is False
    assert settings.api_key is None
