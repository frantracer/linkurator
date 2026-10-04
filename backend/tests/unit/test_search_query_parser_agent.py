from datetime import datetime, timezone

import pytest
from pydantic_ai import UnexpectedModelBehavior, capture_run_messages
from pydantic_ai.messages import ModelRequest, SystemPromptPart
from pydantic_ai.models.test import TestModel

from linkurator_core.domain.agents.search_query_parser_service import SearchQuery
from linkurator_core.domain.items.item_repository import SimilarItemsFilter
from linkurator_core.infrastructure.ai_agents.search_query_parser_agent import SearchQueryParserAgent

PROVIDERS = ["youtube", "spotify", "patreon", "rss"]


@pytest.mark.asyncio()
async def test_parse_returns_the_positive_and_negative_parts_of_the_prompt() -> None:
    model = TestModel(custom_output_args={
        "positive": " recetas de comida italiana ",
        "negatives": ["alcachofas", " ", " setas "],
    })

    search_query = await SearchQueryParserAgent(model=model, providers=PROVIDERS).parse(
        "quiero recetas de comida italiana sin alcachofas",
    )

    assert search_query == SearchQuery(positive="recetas de comida italiana", negatives=["alcachofas", "setas"])


@pytest.mark.asyncio()
async def test_parse_returns_the_filters_of_the_prompt() -> None:
    model = TestModel(custom_output_args={
        "positive": "videos about card games",
        "negatives": [],
        "min_duration_minutes": 30,
        "max_duration_minutes": 90,
        "published_after": "2024-01-01",
        "published_before": "2025-01-01",
        "providers": ["youtube", "spotify", "youtube"],
    })

    search_query = await SearchQueryParserAgent(model=model, providers=PROVIDERS).parse(
        "youtube or spotify videos about card games from 2024 between 30 and 90 minutes",
    )

    assert search_query == SearchQuery(
        positive="videos about card games",
        filters=SimilarItemsFilter(
            min_duration=30 * 60,
            max_duration=90 * 60,
            published_after=datetime(2024, 1, 1, tzinfo=timezone.utc),
            published_before=datetime(2025, 1, 1, tzinfo=timezone.utc),
            providers=["youtube", "spotify"],
        ),
    )


@pytest.mark.asyncio()
async def test_parse_includes_today_date_in_the_instructions() -> None:
    model = TestModel(custom_output_args={"positive": "news", "negatives": []})
    agent = SearchQueryParserAgent(
        model=model,
        providers=PROVIDERS,
        now_function=lambda: datetime(2025, 6, 15, tzinfo=timezone.utc),
    )

    with capture_run_messages() as messages:
        await agent.parse("news from last week")

    system_prompts = [
        part.content for message in messages if isinstance(message, ModelRequest)
        for part in message.parts if isinstance(part, SystemPromptPart)
    ]
    assert "Today is Sunday 2025-06-15" in system_prompts


@pytest.mark.asyncio()
async def test_parse_includes_the_available_providers_in_the_instructions() -> None:
    model = TestModel(custom_output_args={"positive": "news", "negatives": []})
    agent = SearchQueryParserAgent(model=model, providers=["youtube", "rss"])

    with capture_run_messages() as messages:
        await agent.parse("youtube news")

    system_prompts = [
        part.content for message in messages if isinstance(message, ModelRequest)
        for part in message.parts if isinstance(part, SystemPromptPart)
    ]
    assert any("Services are youtube, rss." in system_prompt for system_prompt in system_prompts)


@pytest.mark.asyncio()
async def test_parse_rejects_providers_that_are_not_available() -> None:
    model = TestModel(custom_output_args={"positive": "news", "negatives": [], "providers": ["tiktok"]})
    agent = SearchQueryParserAgent(model=model, providers=PROVIDERS)

    with pytest.raises(UnexpectedModelBehavior):
        await agent.parse("tiktok news")
