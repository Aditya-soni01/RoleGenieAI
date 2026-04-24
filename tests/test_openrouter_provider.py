from unittest.mock import MagicMock, patch

from app.core.config import Settings
from app.services.ai_service import AIService


def test_settings_supports_anthropic_key_and_default_model():
    settings = Settings(
        secret_key="x" * 32,
        ai_provider="anthropic",
        ai_model="",
        anthropic_api_key="sk-ant-test",
    )

    assert settings.ai_api_key == "sk-ant-test"
    assert settings.resolved_ai_model == "claude-sonnet-4-6"


def test_settings_supports_openrouter_key_and_default_model():
    settings = Settings(
        secret_key="x" * 32,
        ai_provider="openrouter",
        ai_model="",
        openrouter_api_key="sk-or-test",
    )

    assert settings.ai_api_key == "sk-or-test"
    assert settings.resolved_ai_model == "nvidia/nemotron-3-super-120b-a12b:free"


@patch("httpx.post")
def test_openrouter_adapter_uses_chat_completions(mock_post):
    response = MagicMock()
    response.is_error = False
    response.json.return_value = {
        "model": "nvidia/nemotron-3-super-120b-a12b:free",
        "choices": [{"message": {"content": "analysis complete"}}],
    }
    mock_post.return_value = response

    service = AIService(
        api_key="sk-or-test",
        model="nvidia/nemotron-3-super-120b-a12b:free",
        provider="openrouter",
    )

    result = service.client.messages.create(
        model=service.model,
        max_tokens=128,
        system="You are concise.",
        messages=[{"role": "user", "content": "Optimize this resume."}],
    )

    assert result.content[0].text == "analysis complete"
    mock_post.assert_called_once()

    url = mock_post.call_args.args[0]
    kwargs = mock_post.call_args.kwargs
    assert url == "https://openrouter.ai/api/v1/chat/completions"
    assert kwargs["headers"]["Authorization"] == "Bearer sk-or-test"
    assert kwargs["json"]["model"] == "nvidia/nemotron-3-super-120b-a12b:free"
    assert kwargs["json"]["messages"][0] == {
        "role": "system",
        "content": "You are concise.",
    }
