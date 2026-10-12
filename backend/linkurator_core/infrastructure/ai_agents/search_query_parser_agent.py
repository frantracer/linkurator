from dataclasses import dataclass
from datetime import date, datetime, time, timezone
from typing import Callable

from pydantic import BaseModel, Field, ValidationInfo, model_validator
from pydantic_ai import Agent
from pydantic_ai.models import Model
from pydantic_ai.settings import ModelSettings

from linkurator_core.domain.agents.search_query_parser_service import SearchQuery, SearchQueryParserService
from linkurator_core.domain.common.utils import datetime_now
from linkurator_core.domain.items.item import ItemProvider
from linkurator_core.domain.items.item_repository import SimilarItemsFilter


@dataclass
class SearchQueryValidationContext:
    providers: list[ItemProvider]


class SearchQueryOutput(BaseModel):
    positive: str = Field(
        description="The search prompt with every exclusion and filter removed, describing only what the user wants",
    )
    negatives: list[str] = Field(
        description="Short concepts the user wants to exclude from the results. Empty if there are none.",
    )
    min_duration_minutes: int | None = Field(
        default=None,
        description="Minimum duration of the items in minutes, or null if the user does not set one",
    )
    max_duration_minutes: int | None = Field(
        default=None,
        description="Maximum duration of the items in minutes, or null if the user does not set one",
    )
    published_after: date | None = Field(
        default=None,
        description="First day (included) the items can be published on, or null if the user does not set one",
    )
    published_before: date | None = Field(
        default=None,
        description="First day (excluded) the items can no longer be published on, or null if the user does not "
                    "set one",
    )
    providers: list[ItemProvider] = Field(
        default_factory=list,
        description="Services the items must come from. Empty if the user does not name any service.",
    )

    @model_validator(mode="after")
    def check_providers_are_available(self, info: ValidationInfo) -> "SearchQueryOutput":
        context = info.context
        if not isinstance(context, SearchQueryValidationContext):
            return self
        unknown_providers = [provider for provider in self.providers if provider not in context.providers]
        if len(unknown_providers) > 0:
            msg = f"Unknown providers {unknown_providers}, the available ones are {context.providers}"
            raise ValueError(msg)
        return self


def _start_of_day(day: date | None) -> datetime | None:
    if day is None:
        return None
    return datetime.combine(day, time.min, tzinfo=timezone.utc)


def _minutes_to_seconds(minutes: int | None) -> int | None:
    if minutes is None:
        return None
    return minutes * 60


class SearchQueryParserAgent(SearchQueryParserService):
    def __init__(
            self,
            model: Model,
            providers: list[ItemProvider],
            now_function: Callable[[], datetime] = datetime_now,
    ) -> None:
        self.agent = create_search_query_parser_agent(model, providers, now_function)

    async def parse(self, prompt: str) -> SearchQuery:
        result = await self.agent.run(user_prompt=prompt)
        output = result.output
        return SearchQuery(
            positive=output.positive.strip(),
            negatives=[negative.strip() for negative in output.negatives if negative.strip() != ""],
            filters=SimilarItemsFilter(
                min_duration=_minutes_to_seconds(output.min_duration_minutes),
                max_duration=_minutes_to_seconds(output.max_duration_minutes),
                published_after=_start_of_day(output.published_after),
                published_before=_start_of_day(output.published_before),
                providers=list(dict.fromkeys(output.providers)),
            ),
        )


def create_search_query_parser_agent(
        model: Model,
        providers: list[ItemProvider],
        now_function: Callable[[], datetime] = datetime_now,
) -> Agent[None, SearchQueryOutput]:
    agent = Agent[None, SearchQueryOutput](
        model,
        name="SearchQueryParserAgent",
        output_type=SearchQueryOutput,
        validation_context=SearchQueryValidationContext(providers=providers),
        model_settings=ModelSettings(
            temperature=0.0,
        ),
        system_prompt=(
            "You split search prompts for videos and podcasts into what the user wants (positive), "
            "what the user wants to exclude (negatives) and filters on the duration, publish date and service "
            "of the items. The positive part is used for a semantic search, each negative is used to discard "
            "results similar to it and the filters discard the items that do not match them.\n\n"
            "Guidelines:\n"
            "- Detect exclusions in any language: 'without', 'no', 'except', 'not about', 'sin', 'que no', "
            "'excepto', 'menos', etc.\n"
            "- Remove the exclusions and their negation words from the positive part, keep everything else\n"
            "- Each negative is a short concept of one to three words, without negation words\n"
            "- Only set a filter when the user explicitly restricts the duration, publish date or service. "
            "Leave the rest null or empty\n"
            "- Durations are in whole minutes: 'more than 30 minutes' is min 30, 'short, under 5 minutes' is max 5, "
            "'around an hour' is min 45 and max 75\n"
            "- Publish dates are days: published_after is the first day included and published_before is the first "
            "day excluded. Resolve relative dates ('last week', 'this year', 'el mes pasado') from today's date\n"
            f"- Services are {', '.join(providers)}. Only set them when the user names the service, words like "
            "'videos' or 'podcasts' alone are not a service\n"
            "- Remove the text used for filters from the positive part\n"
            "- If there are no exclusions nor filters, return the prompt unchanged as positive\n"
            "- Preserve the language of the user's prompt (do not translate)\n"
            "\nExamples (today is 2025-06-15):\n"
            "- Prompt: 'quiero recetas de comida italiana sin alcachofas'\n"
            "  positive: 'recetas de comida italiana', negatives: ['alcachofas']\n\n"
            "- Prompt: 'football videos but not about Real Madrid or Barcelona'\n"
            "  positive: 'football videos', negatives: ['Real Madrid', 'Barcelona']\n\n"
            "- Prompt: 'videos about card games that last more than 30 minutes'\n"
            "  positive: 'videos about card games', negatives: [], min_duration_minutes: 30\n\n"
            "- Prompt: 'spotify podcasts about history from 2024'\n"
            "  positive: 'podcasts about history', negatives: [], published_after: 2024-01-01, "
            "published_before: 2025-01-01, providers: ['spotify']\n\n"
            "- Prompt: 'vídeos de youtube de cocina de la última semana de menos de 10 minutos'\n"
            "  positive: 'vídeos de cocina', negatives: [], max_duration_minutes: 10, "
            "published_after: 2025-06-08, providers: ['youtube']\n\n"
            "- Prompt: 'podcasts about history'\n"
            "  positive: 'podcasts about history', negatives: []\n\n"
        ),
    )

    @agent.system_prompt
    def add_today_date() -> str:
        return f"Today is {now_function().strftime('%A %Y-%m-%d')}"

    return agent
