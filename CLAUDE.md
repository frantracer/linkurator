# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a **monorepo** containing the two Linkurator services as real subdirectories.

- `backend/` — FastAPI + PostgreSQL + RabbitMQ; Python. See `backend/CLAUDE.md`.
- `frontend/` — Next.js App Router + React Query; TypeScript. See `frontend/CLAUDE.md`.

When working on app-level code, `cd` into the appropriate directory and follow its `CLAUDE.md`. Each app also still has its own independent deploy path (see `backend/CLAUDE.md`) — the root `docker-compose.yml` below is for local full-stack dev only.

## Local full-stack dev

The root `docker-compose.yml` builds and runs the whole stack (Postgres, RabbitMQ, backend API, backend processor, frontend) from source:

```bash
docker compose build
docker compose up
```

It's independent from `backend/docker-compose.yml`, which is scoped to backend-only local dev / production deployment (pulls the published image, uses profiles). The root compose file builds `backend/` and `frontend/` directly. All app services use `network_mode: host` (Linux only) so the frontend's hardcoded `http://localhost:9000` API URL and the backend's `127.0.0.1` DB/queue config keep working unmodified.

`api`/`processor` read their settings from a root-level `.config.json`, bind-mounted read-only into both containers (same convention as `backend/docker-compose.yml`) — it is gitignored, never committed. Bootstrap it once with `cp backend/config/app_config_develop.json .config.json`, then fill in real credentials (YouTube API key, OAuth, Spotify, etc.) as needed; the app refuses to boot several handlers without them (e.g. `YoutubeService` raises if `google.youtube_api_keys` is empty). Editing `.config.json` takes effect on the next `docker compose up` — no rebuild needed.

## CI

`.github/workflows/backend-ci.yml` and `.github/workflows/frontend-ci.yml` are each scoped with `paths:` filters (`backend/**` / `frontend/**`), so a push only triggers the workflow for the service whose files actually changed. Backend CI also deploys to production on pushes to `main`. Keep new CI scoped to one service's directory — do not add a shared/root-triggered workflow without a path filter, since that would defeat the point of splitting them.

GitHub Actions only reads workflows from the repo-root `.github/workflows/`, so per-app workflow files nested inside `backend/` or `frontend/` are inert — new CI must live at the root.

## When changes span both services

End-to-end changes (e.g. a new API endpoint consumed by the frontend) can land in a single commit/PR across both `backend/` and `frontend/`. CI still runs independently per service via the path-filtered workflows above.
