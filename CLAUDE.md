# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a **monorepo** containing the Linkurator services as real subdirectories.

- `backend/` — FastAPI + PostgreSQL + RabbitMQ; Python. See `backend/CLAUDE.md`.

When working on app-level code, `cd` into the appropriate directory and follow its `CLAUDE.md`. Each app also still has its own independent deploy path (see `backend/CLAUDE.md`).

## CI

`.github/workflows/backend-ci.yml` is scoped with a `paths:` filter (`backend/**`), so a push only triggers it when backend files actually change. It also deploys to production on pushes to `main`.

GitHub Actions only reads workflows from the repo-root `.github/workflows/`, so per-app workflow files nested inside `backend/` would be inert — new CI must live at the root.
