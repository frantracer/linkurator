import pytest

from linkurator_core.infrastructure.config.settings import MistralAISettings


def test_mistral_ai_settings_rejects_missing_api_key_when_enabled() -> None:
    """Test that a missing api key is rejected when Mistral AI is enabled."""
    with pytest.raises(ValueError, match="A Mistral AI API key must be provided"):
        MistralAISettings(enabled=True)


def test_mistral_ai_settings_allows_missing_api_key_when_disabled() -> None:
    """Test that a missing api key is allowed when Mistral AI is disabled."""
    settings = MistralAISettings(enabled=False)
    assert settings.api_key is None


def test_mistral_ai_settings_accepts_api_key_when_enabled() -> None:
    settings = MistralAISettings(enabled=True, api_key="some-key")
    assert settings.enabled is True
    assert settings.api_key == "some-key"


def test_mistral_ai_is_disabled_by_default() -> None:
    settings = MistralAISettings()
    assert settings.enabled is False
    assert settings.api_key is None
