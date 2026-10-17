from linkurator_core.domain.items.item import ItemProvider
from linkurator_core.infrastructure.google.youtube_service import YOUTUBE_PROVIDER_NAME
from linkurator_core.infrastructure.patreon.patreon_service import PATREON_PROVIDER_NAME
from linkurator_core.infrastructure.rss.rss_service import RSS_PROVIDER_NAME
from linkurator_core.infrastructure.spotify.spotify_service import SPOTIFY_PROVIDER_NAME

ALL_PROVIDER_NAMES: list[ItemProvider] = [
    YOUTUBE_PROVIDER_NAME,
    SPOTIFY_PROVIDER_NAME,
    PATREON_PROVIDER_NAME,
    RSS_PROVIDER_NAME,
]
