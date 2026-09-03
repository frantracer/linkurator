# Linkurator

Linkurator helps you explore and categorize your subscriptions from content providers like YouTube, Spotify, Patreon, and RSS.

This is a monorepo with two independently deployed services:

- [`backend/`](backend/README.md) — FastAPI + PostgreSQL + RabbitMQ API and background processor.
- [`frontend/`](frontend/README.md) — Next.js web app.

Each service keeps its own README, CLAUDE.md, dependencies, and CI workflow (`.github/workflows/backend-ci.yml`, `.github/workflows/frontend-ci.yml`), which only run when files under their respective directory change. See the root [CLAUDE.md](CLAUDE.md) for layout and CI details.
