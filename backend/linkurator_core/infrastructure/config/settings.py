import json
from enum import StrEnum
from ipaddress import IPv4Address
from pathlib import Path
from typing import Any

from pydantic import AnyUrl, BaseModel, field_validator, model_validator

DEFAULT_CONFIG_FILENAME = ".config.json"


class ApiSettings(BaseModel):
    host: str
    port: int
    workers: int
    debug: bool
    reload: bool
    with_gunicorn: bool


class AIAgentSettings(BaseModel):
    base_url: str


class GoogleWebCredentials(BaseModel):
    client_id: str
    project_id: str
    auth_uri: str
    token_uri: str
    auth_provider_x509_cert_url: str
    client_secret: str
    redirect_uris: list[str]
    javascript_origins: list[str]


class GoogleOAuth(BaseModel):
    web: GoogleWebCredentials


class GoogleSettings(BaseModel):
    oauth: GoogleOAuth
    email_service_credentials: dict[str, str]
    service_account_email: str | None = None

    @field_validator("service_account_email", mode="after")
    @classmethod
    def empty_service_account_email_to_none(cls, value: str | None) -> str | None:
        return value or None


class MistralAISettings(BaseModel):
    api_key: str | None = None

    @field_validator("api_key", mode="after")
    @classmethod
    def empty_api_key_to_none(cls, value: str | None) -> str | None:
        return value or None


class OpenAISettings(BaseModel):
    api_key: str | None = None

    @field_validator("api_key", mode="after")
    @classmethod
    def empty_api_key_to_none(cls, value: str | None) -> str | None:
        return value or None


class YoutubeSettings(BaseModel):
    enabled: bool = False
    api_keys: list[str] = []

    @model_validator(mode="after")
    def check_api_keys_not_empty_when_enabled(self) -> "YoutubeSettings":
        if self.enabled and len(self.api_keys) == 0:
            msg = "At least one Youtube API key must be provided when Youtube is enabled."
            raise ValueError(msg)
        return self


class SpotifyCredentialPair(BaseModel):
    client_id: str
    client_secret: str


class SpotifySettings(BaseModel):
    enabled: bool = False
    credentials: list[SpotifyCredentialPair] = []

    @model_validator(mode="after")
    def check_credentials_not_empty_when_enabled(self) -> "SpotifySettings":
        if self.enabled and len(self.credentials) == 0:
            msg = "At least one Spotify credential pair must be provided when Spotify is enabled."
            raise ValueError(msg)
        return self


class PatreonSettings(BaseModel):
    enabled: bool = False
    client_id: str = ""
    client_secret: str = ""
    use_vpn: bool = False

    @model_validator(mode="after")
    def check_credentials_not_empty_when_enabled(self) -> "PatreonSettings":
        if self.enabled and (not self.client_id or not self.client_secret):
            msg = "Both client_id and client_secret must be provided when Patreon is enabled."
            raise ValueError(msg)
        return self


class ProvidersSettings(BaseModel):
    youtube: YoutubeSettings
    spotify: SpotifySettings
    patreon: PatreonSettings


class PostgresSettings(BaseModel):
    ip_address: IPv4Address
    port: int
    user: str
    password: str
    database: str


class RabbitMQSettings(BaseModel):
    ip_address: IPv4Address
    port: int
    user: str
    password: str


class LogfireEnvironment(StrEnum):
    PROD = "prod"
    DEV = "dev"
    TEST = "test"


class LogfireSettings(BaseModel):
    enabled: bool
    token: str
    environment: LogfireEnvironment


class LogSettings(BaseModel):
    level: str
    logfire: LogfireSettings


class WebsiteSettings(BaseModel):
    host: AnyUrl
    valid_domains: list[str]


class VpnSettings(BaseModel):
    enabled: bool
    wireguard_private_key: str
    wireguard_addresses: str
    server_country: str
    http_proxy_port: int


class CloudflareSettings(BaseModel):
    access_key_id: str
    secret_access_key: str
    account_id: str
    bucket_id: str
    backup_path: str


class ApplicationSettings(BaseModel):
    """
    Settings for the application.
    """

    api: ApiSettings
    ai_agent: AIAgentSettings
    google: GoogleSettings
    mistral_ai: MistralAISettings
    openai: OpenAISettings
    providers: ProvidersSettings
    postgres: PostgresSettings
    rabbitmq: RabbitMQSettings
    logging: LogSettings
    website: WebsiteSettings
    vpn: VpnSettings
    cloudflare: CloudflareSettings

    @classmethod
    def from_file(cls, file_path: str = DEFAULT_CONFIG_FILENAME) -> "ApplicationSettings":
        if not Path(file_path).exists():
            msg = f"Configuration file not found at {file_path}"
            raise FileNotFoundError(msg)

        with open(file_path, encoding="utf-8") as f:
            config: dict[str, Any] = json.load(f)

        providers_config = config.get("providers", {})
        providers_settings = ProvidersSettings(
            youtube=YoutubeSettings(**providers_config.get("youtube", {})),
            spotify=SpotifySettings(**providers_config.get("spotify", {})),
            patreon=PatreonSettings(**providers_config.get("patreon", {})),
        )

        openai_settings = OpenAISettings(**config.get("openai", {}))

        return cls(
            api=ApiSettings(**config["api"]),
            ai_agent=AIAgentSettings(**config["ai_agent"]),
            google=GoogleSettings(**config["google"]),
            mistral_ai=MistralAISettings(**config["mistral_ai"]),
            openai=openai_settings,
            providers=providers_settings,
            postgres=PostgresSettings(**config["postgres"]),
            rabbitmq=RabbitMQSettings(**config["rabbitmq"]),
            logging=LogSettings(**config["logging"]),
            website=WebsiteSettings(**config["website"]),
            vpn=VpnSettings(**config["vpn"]),
            cloudflare=CloudflareSettings(**config["cloudflare"]),
        )
