## AI Module

This module enriches deterministic validation with heuristic AI-style assistance.

Responsibilities:
- suggest semantic column mappings with confidence scores
- flag near-duplicate rows using fuzzy matching
- produce user-facing explanations for ambiguous data

### Hugging Face setup

Set `HF_TOKEN` in the project `.env` file to enable live Hugging Face suggestions. The token must be allowed to make Inference Providers calls. `HF_MODEL` is optional and defaults to `Qwen/Qwen2.5-7B-Instruct-1M`. `HF_TIMEOUT_MS` controls how long each Hugging Face request can wait before falling back, and defaults to `15000`.

If Hugging Face is unavailable or returns malformed JSON, the backend automatically falls back to deterministic local suggestions so the dashboard remains usable.
