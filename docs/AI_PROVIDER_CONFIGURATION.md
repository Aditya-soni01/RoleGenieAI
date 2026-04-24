# AI Provider Configuration

RoleGenie uses one backend AI provider for resume optimization, resume parsing,
cover letter generation, match scoring, and interview prep.

The active provider is controlled from the backend `.env` file in the project
root, not from the frontend.

## Current Anthropic Setup

Use Anthropic Claude:

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

The backend reads these values in `app/core/config.py`, then creates the AI
client in `app/services/ai_service.py`.

After changing any provider or model value, restart the FastAPI backend. A
frontend refresh alone is not enough because the AI client is created in the
backend process.

## OpenAI Setup

Use OpenAI GPT-5.2:

```env
AI_PROVIDER=openai
AI_MODEL=gpt-5.2
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Switching Providers

Only one provider should be active at a time.

### Anthropic

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Use this when you want the app's resume optimization, resume parsing, cover
letter generation, match scoring, and interview prep to call Claude. Keep the
key in the backend root `.env` only; do not put Anthropic keys in frontend
environment files.

### OpenAI

```env
AI_PROVIDER=openai
AI_MODEL=gpt-5.2
OPENAI_API_KEY=sk-your-openai-api-key-here
```

RoleGenie can call OpenAI through the existing `httpx` dependency. If the
official `openai` Python package is installed later, the adapter will use it
automatically.

### OpenRouter

```env
AI_PROVIDER=openrouter
AI_MODEL=nvidia/nemotron-3-super-120b-a12b:free
OPENROUTER_API_KEY=sk-or-your-api-key-here
```

OpenRouter uses the existing `httpx` dependency through its OpenAI-compatible
chat completions API. You can also use `AI_MODEL=openrouter/free` to let
OpenRouter pick from available free models for each request.

The OpenRouter free-model rankings change over time. As of April 2026,
OpenRouter lists NVIDIA Nemotron 3 Super as the top free model. For a dynamic
free model router instead, set `AI_MODEL=openrouter/free`.

## How To Change The AI Provider Yourself

1. Open the backend root `.env` file.
2. Set `AI_PROVIDER` to one of: `anthropic`, `openai`, or `openrouter`.
3. Set `AI_MODEL` to a model supported by that provider.
4. Make sure the matching key is present:
   - `ANTHROPIC_API_KEY` for `AI_PROVIDER=anthropic`
   - `OPENAI_API_KEY` for `AI_PROVIDER=openai`
   - `OPENROUTER_API_KEY` for `AI_PROVIDER=openrouter`
5. Save `.env`.
6. Restart the FastAPI backend.
7. Test one AI action from the app, such as resume optimization or profile
   import.

`CLAUDE_MODEL` is still supported as a legacy Anthropic fallback, but new
changes should use `AI_MODEL`.

## Adding Another LLM Company Later

To add a new provider such as Google, Mistral, Groq, or another hosted LLM:

1. Add the package to `requirements.txt` if the provider needs a dedicated SDK.
2. Add the key to `.env.example`, for example `NEW_PROVIDER_API_KEY=...`.
3. Add the setting in `app/core/config.py`.
4. Add the provider name to the `ai_provider` validator in `app/core/config.py`.
5. Add a small adapter in `app/services/ai_service.py` that returns text in the
   same shape as `_ProviderResponse`.
6. Update `Settings.ai_api_key` so the selected provider returns the right key.
7. Restart the backend and test resume optimization plus profile import.

The resume and profile routes do not need provider-specific code. They call
`AIService` with:

```python
AIService(
    api_key=settings.ai_api_key,
    model=settings.resolved_ai_model,
    provider=settings.ai_provider,
)
```

So provider changes should stay inside config and the AI service adapter.

## Common Errors

`AI provider authentication failed`

The selected provider key is missing, invalid, or belongs to another account.
Check `AI_PROVIDER` and the matching key.

`AI model is not available`

The value in `AI_MODEL` is wrong or unavailable for the selected provider.

`insufficient_quota`, `quota`, `billing`, or `credit balance`

The provider key was accepted, but the account/project has no usable quota. Add
credits, enable billing, increase the project limit, or use a funded provider
key.

`rate limit` or `too many requests`

The provider account is temporarily throttling requests. Retry after a short
wait or increase the provider rate limit.

## Local Checklist

1. Put keys in root `.env`.
2. Run the backend after installing dependencies.
3. Confirm the frontend points to the running backend through
   `frontend/.env` and `frontend/vite.config.ts`.
4. Test both:
   - Resume page: optimize resume
   - Profile page: upload resume to import

## Deployment Checklist

Set these as backend environment variables in the hosting platform:

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-your-production-anthropic-key
```

Do not put provider keys in frontend env variables. Vite frontend variables are
public after build.
