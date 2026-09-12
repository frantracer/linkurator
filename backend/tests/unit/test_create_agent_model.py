from linkurator_core.infrastructure.ai_agents.model import create_agent_model


def test_create_agent_model_returns_none_without_credentials() -> None:
    assert create_agent_model(openai_api_key=None, mistral_api_key=None) is None


def test_create_agent_model_returns_a_model_with_only_openai_key() -> None:
    assert create_agent_model(openai_api_key="key", mistral_api_key=None) is not None


def test_create_agent_model_returns_a_model_with_only_mistral_key() -> None:
    assert create_agent_model(openai_api_key=None, mistral_api_key="key") is not None


def test_create_agent_model_returns_a_model_with_both_keys() -> None:
    assert create_agent_model(openai_api_key="key", mistral_api_key="key") is not None
