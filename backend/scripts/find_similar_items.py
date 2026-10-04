import argparse
import asyncio
import logging
import sys

from linkurator_core.application.items.find_similar_items_handler import FindSimilarItemsHandler
from linkurator_core.infrastructure.ai_agents.embeddings import OpenAIEmbeddingService
from linkurator_core.infrastructure.ai_agents.model import create_agent_model
from linkurator_core.infrastructure.ai_agents.search_query_parser_agent import SearchQueryParserAgent
from linkurator_core.infrastructure.ai_agents.utils import format_duration
from linkurator_core.infrastructure.config.settings import ApplicationSettings
from linkurator_core.infrastructure.google.youtube_service import YOUTUBE_PROVIDER_NAME
from linkurator_core.infrastructure.patreon.patreon_service import PATREON_PROVIDER_NAME
from linkurator_core.infrastructure.postgres.item_repository import PostgresItemRepository
from linkurator_core.infrastructure.rss.rss_service import RSS_PROVIDER_NAME
from linkurator_core.infrastructure.spotify.spotify_service import SPOTIFY_PROVIDER_NAME

logging.basicConfig(format="%(asctime)s - %(levelname)s: %(message)s", level=logging.INFO, datefmt="%Y-%m-%d %H:%M:%S")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Find the items most related to a prompt")
    parser.add_argument("--prompt", type=str, required=True)
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    settings = ApplicationSettings.from_file()
    openai_settings = settings.ai_agent.openai
    if not openai_settings.enabled or openai_settings.api_key is None:
        logging.error("OpenAI must be enabled in the settings to compute embeddings")
        sys.exit(1)

    agent_model = create_agent_model(
        openai_api_key=openai_settings.api_key,
        mistral_api_key=settings.ai_agent.mistral_ai.api_key if settings.ai_agent.mistral_ai.enabled else None,
    )
    if agent_model is None:
        logging.error("No LLM credentials configured")
        sys.exit(1)

    db_settings = settings.postgres
    item_repository = PostgresItemRepository(
        ip=db_settings.ip_address, port=db_settings.port, db_name=db_settings.database,
        username=db_settings.user, password=db_settings.password)

    handler = FindSimilarItemsHandler(
        item_repository=item_repository,
        embedding_service=OpenAIEmbeddingService(api_key=openai_settings.api_key),
        search_query_parser=SearchQueryParserAgent(
            model=agent_model,
            providers=[YOUTUBE_PROVIDER_NAME, SPOTIFY_PROVIDER_NAME, PATREON_PROVIDER_NAME, RSS_PROVIDER_NAME],
        ),
    )

    response = await handler.handle(prompt=args.prompt, limit=args.limit)
    logging.info("Positive: %s", response.search_query.positive)
    logging.info("Negatives: %s", response.search_query.negatives)
    logging.info("Filters: %s", response.search_query.filters)
    for similar_item in response.items:
        item = similar_item.item
        logging.info(
            "%.4f | %s | %s | %s | %s | %s",
            similar_item.similarity, item.provider, item.published_at.date().isoformat(),
            format_duration(item.duration), item.name, item.url,
        )


if __name__ == "__main__":
    asyncio.run(main())
