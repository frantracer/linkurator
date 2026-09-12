# Linkurator

Linkurator is a tool that helps you explore and categorize your subscriptions from content providers like YouTube, Spotify, Patreon, and RSS.

<img src="frontend/public/linkurator_main_page.png" alt="Linkurator landing page" width="1024">


## Running the app

Requirements: [Docker and Docker Compose](https://docs.docker.com/engine/install/).

Bootstrap the configuration files `.config.json`/`.env` once with:
```bash
docker compose run --rm generate-env
```

Then start the application with:
```bash
docker compose up
```

- Frontend: http://localhost:3000
- API docs: http://localhost:9000/docs

Stop everything with:
```bash
docker compose down
```

## Changing the configuration

The `.config.json` file holds all the settings for the api and processor containers.

It's created for you by generate-env docker command.

Just edit the values you need and restart with `docker compose up`, no rebuild required.

### `api`

How the web server runs.

- `host`, `port`, `workers` — what address and port to listen on, and how many worker processes.
- `debug`, `reload` — turn these on for local development.
- `with_gunicorn` — `true` runs multiple Gunicorn workers (production-style); `false` runs a single Uvicorn process, which supports `reload`.

### `postgres` / `rabbitmq`

Connection details for the database and message queue. If you change these, re-run `docker compose run --rm generate-env` 
so `.env` picks up the new values too.

### `logging`

- `level` — how verbose the logs are (`INFO`, `DEBUG`, ...).
- `logfire` — optional tracing via [Pydantic Logfire](https://logfire.pydantic.dev). Set `enabled: true` and paste a
token from your [Logfire project's settings](https://logfire.pydantic.dev).

### `google`

Needed for Google sign-in, YouTube subscriptions, and outgoing emails.

- `oauth.web` — OAuth client used for login and for reading YouTube subscriptions.
  Get it: [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) → *Create Credentials → OAuth client ID → Web application*.
- `email_service_credentials` — a service account key used to send emails through Gmail.
  Get it: [Google Cloud Console → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) → create one → *Keys → Add key → JSON*.
- `service_account_email` — the mailbox that service account sends as. Leave it empty to turn off email sending entirely.

### `providers`

Each provider has its own `enabled` flag — turn one on and fill in its credentials:

- `youtube.api_keys` — one or more API keys.
  Get one: enable the [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com), then create a key under [Credentials](https://console.cloud.google.com/apis/credentials).
- `spotify.credentials` — a list of `client_id`/`client_secret` pairs.
  Get one: [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → *Create app*.
- `patreon.client_id` / `client_secret` — a Patreon API client.
  Get one: [Patreon Platform](https://www.patreon.com/portal/registration/register-clients) → *Create Client*.
  `use_vpn` routes Patreon requests through the proxy configured in `vpn` below (leave `false` unless you need it).

### `ai_agent`

Powers the AI chat and recommendation features. Enable at least one of `openai`/`mistral_ai` to use them — both can stay disabled.

- `base_url` — this app's own public URL; used to build links inside AI-generated replies. Leave the default unless you've changed how the API is exposed.
- `openai.api_key` — from the [OpenAI API keys page](https://platform.openai.com/api-keys).
- `mistral_ai.api_key` — from the [Mistral AI console](https://console.mistral.ai/api-keys/).

### `vpn`

Optional proxy for outgoing provider requests, useful if a provider blocks your server's location.

- `enabled` — turns the proxy client on.
- `wireguard_private_key`, `wireguard_addresses`, `server_country` — from your WireGuard/VPN provider.
- `http_proxy_port` — local port the proxy is reachable on.

Turning `vpn` on doesn't route anything by itself. It is only used if a provider's `use_vpn` is set to `true`.

### `website`

- `host` — this app's public URL, used in emails (e.g. the welcome email link).
- `valid_domains` — domains allowed in registration/password-reset links, so they can't be crafted to point somewhere else.

### `cloudflare`

Not read by the app itself, it's for backup scripts which backs up PostgreSQL to a Cloudflare R2 bucket.
Get credentials: [Cloudflare dashboard → R2](https://dash.cloudflare.com/?to=/:account/r2/overview) → 
create a bucket, then *Manage R2 API Tokens* to create `access_key_id`/`secret_access_key`.

## Building the app

To build the backend and frontend images from source, run:
```bash
docker compose build
```
