# Linkurator

Linkurator helps you explore and categorize your subscriptions from content providers like YouTube, Spotify, Patreon, and RSS.

This is a monorepo containing the Linkurator services as real subdirectories:

- [`backend/`](backend/README.md) — FastAPI + PostgreSQL + RabbitMQ API and background processor.

Each service keeps its own README, CLAUDE.md, dependencies, and CI workflow (`.github/workflows/backend-ci.yml`), which only runs when files under its directory change. See the root [CLAUDE.md](CLAUDE.md) for layout and CI details.
