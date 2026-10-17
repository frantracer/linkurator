import logging
import re
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timezone
from typing import Callable, Union
from uuid import UUID

import logfire
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models import Model
from pydantic_ai.settings import ModelSettings
from pydantic_ai.tools import ToolDefinition
from pydantic_ai.usage import RunUsage

from linkurator_core.application.items.find_similar_items_handler import find_items_similar_to_query
from linkurator_core.application.subscriptions.get_user_subscriptions_handler import GetUserSubscriptionsHandler
from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.agents.search_query_parser_service import SearchQuery
from linkurator_core.domain.chats.chat import Chat, ChatRole, ChatScope
from linkurator_core.domain.common.units import Seconds
from linkurator_core.domain.items.item import Item, ItemProvider
from linkurator_core.domain.items.item_repository import (
    AnyItemInteraction,
    ItemFilterCriteria,
    ItemRepository,
    SimilarItemsFilter,
)
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.topic import Topic
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user_repository import UserRepository
from linkurator_core.infrastructure.ai_agents.chat_scope_resolver import (
    resolve_scope_candidate_item_ids,
    scope_item_interactions,
)
from linkurator_core.infrastructure.ai_agents.utils import (
    build_similar_items_filter,
    clean_concepts,
    format_duration,
)

SEARCH_RESULTS_LIMIT = 20
LATEST_ITEMS_LIMIT = 20
MAX_ITEMS_DETAILS = 10
MAX_SEARCH_CONTENT_CALLS = 3
MAX_GET_LATEST_ITEMS_CALLS = 1
# Search results only carry the beginning of the description to keep the context small,
# get_items_details returns the whole description of the items the assistant needs to read.
SEARCH_DESCRIPTION_LENGTH = 500
SHORT_ID_LENGTH = 8
MAX_PREVIOUS_CHAT_ITEMS = 100
UNKNOWN_SUBSCRIPTION_NAME = "Unknown"


def short_id(uuid: UUID) -> str:
    return str(uuid)[:SHORT_ID_LENGTH]


def resolve_short_ids(ids: list[str] | None, mapping: dict[str, UUID]) -> list[UUID]:
    if not ids:
        return []
    resolved: list[UUID] = []
    for id_text in ids:
        full_uuid = mapping.get(id_text.lower())
        if full_uuid is not None:
            resolved.append(full_uuid)
            continue
        try:
            resolved.append(UUID(id_text))
        except ValueError:
            logging.warning("Could not resolve short id %r", id_text)
    return resolved


@dataclass
class ContentAssistantDependencies:
    user_uuid: UUID | None
    user_repository: UserRepository
    subscription_repository: SubscriptionRepository
    item_repository: ItemRepository
    topic_repository: TopicRepository
    embedding_service: EmbeddingService | None
    previous_chat: Chat | None
    item_id_map: dict[str, UUID] = field(default_factory=dict)
    subscription_id_map: dict[str, UUID] = field(default_factory=dict)
    topic_id_map: dict[str, UUID] = field(default_factory=dict)
    search_content_calls: int = 0
    get_latest_items_calls: int = 0
    scope: ChatScope | None = None
    candidate_item_ids: set[UUID] = field(default_factory=set)

    def entity_scope(self) -> ChatScope | None:
        if self.scope is None or not self.scope.has_entity_restriction():
            return None
        return self.scope

    def is_scoped(self) -> bool:
        return self.entity_scope() is not None

    def register_item_id(self, item_uuid: UUID) -> None:
        self.item_id_map[short_id(item_uuid)] = item_uuid

    def register_subscription_id(self, sub_uuid: UUID) -> None:
        self.subscription_id_map[short_id(sub_uuid)] = sub_uuid

    def register_topic(self, topic: Topic) -> None:
        self.topic_id_map[short_id(topic.uuid)] = topic.uuid
        for sub_uuid in topic.subscriptions_ids:
            self.register_subscription_id(sub_uuid)


def _stricter_bound(
    first: Seconds | None,
    second: Seconds | None,
    pick: Callable[[Seconds, Seconds], Seconds],
) -> Seconds | None:
    if first is None:
        return second
    if second is None:
        return first
    return pick(first, second)


def apply_scope_filters(criteria: ItemFilterCriteria, deps: ContentAssistantDependencies) -> ItemFilterCriteria:
    """Layer the scope's filters over the criteria the LLM asked for, when the scope has no entity."""
    scope = deps.scope
    if scope is None:
        return criteria
    return replace(
        criteria,
        text=criteria.text or scope.text_search,
        min_duration=scope.min_duration,
        max_duration=scope.max_duration,
        interactions_from_user=deps.user_uuid,
        interactions=scope_item_interactions(scope),
    )


async def resolve_subscription_ids(
    deps: ContentAssistantDependencies,
    topic_ids: list[str] | None,
    subscription_ids: list[str] | None,
) -> set[UUID]:
    subscription_uuids = set(resolve_short_ids(subscription_ids, deps.subscription_id_map))
    resolved_topic_ids = resolve_short_ids(topic_ids, deps.topic_id_map)
    if len(resolved_topic_ids) > 0:
        topics = await deps.topic_repository.find_topics(resolved_topic_ids)
        for topic in topics:
            subscription_uuids.update(topic.subscriptions_ids)
    return subscription_uuids


async def build_latest_items_criteria(
    deps: ContentAssistantDependencies,
    topic_ids: list[str] | None,
    subscription_ids: list[str] | None,
) -> ItemFilterCriteria:
    """
    Build the criteria for the get_latest_items tool from the short ids the LLM asked for.

    When the chat is scoped, the LLM's own ids are ignored in favour of the scope candidate items.
    """
    if deps.is_scoped():
        return ItemFilterCriteria(item_ids=deps.candidate_item_ids)

    subscription_uuids = await resolve_subscription_ids(deps, topic_ids, subscription_ids)
    criteria = ItemFilterCriteria(
        subscription_ids=None if len(subscription_uuids) == 0 else list(subscription_uuids),
        interactions_from_user=deps.user_uuid,
        interactions=AnyItemInteraction(without_interactions=True),
    )
    return apply_scope_filters(criteria, deps)


async def build_search_filter(
    deps: ContentAssistantDependencies,
    topic_ids: list[str] | None,
    subscription_ids: list[str] | None,
    min_duration_minutes: int | None,
    max_duration_minutes: int | None,
    published_after: date | None,
    published_before: date | None,
    providers: list[ItemProvider] | None,
) -> SimilarItemsFilter:
    """
    When the chat is scoped, the LLM's own ids are ignored in favour of the scope candidate items.
    When the scope has no entity, its duration bounds are combined with the LLM's ones.
    """
    search_filter = build_similar_items_filter(
        min_duration_minutes=min_duration_minutes,
        max_duration_minutes=max_duration_minutes,
        published_after=published_after,
        published_before=published_before,
        providers=providers or [],
    )
    if deps.scope is not None:
        search_filter.min_duration = _stricter_bound(search_filter.min_duration, deps.scope.min_duration, max)
        search_filter.max_duration = _stricter_bound(search_filter.max_duration, deps.scope.max_duration, min)

    if deps.is_scoped():
        search_filter.item_ids = deps.candidate_item_ids
    else:
        subscription_uuids = await resolve_subscription_ids(deps, topic_ids, subscription_ids)
        if len(subscription_uuids) > 0:
            search_filter.subscription_ids = list(subscription_uuids)

    return search_filter


class TopicForAI(BaseModel):
    id: str = Field(
        description="Short identifier for the topic (8 hex chars)",
    )
    name: str = Field(
        description="Name of the topic",
    )
    subscription_ids: list[str] = Field(
        description="List of subscription short IDs (8 hex chars) associated with this topic",
    )

    @classmethod
    def from_topic(cls, topic: Topic) -> "TopicForAI":
        return cls(
            id=short_id(topic.uuid),
            name=topic.name,
            subscription_ids=[short_id(sub_uuid) for sub_uuid in topic.subscriptions_ids],
        )

    def as_context(self) -> str:
        subs = ", ".join(self.subscription_ids) if self.subscription_ids else "none"
        return f"Name: {self.name} | ID: {self.id} | Subscriptions: {subs}"


class SubscriptionForAI(BaseModel):
    id: str = Field(
        description="Short identifier for the subscription (8 hex chars)",
    )
    name: str = Field(
        description="Name of the subscription",
    )
    description: str | None = Field(
        default=None,
        description="Description of the subscription, if available",
    )
    provider: ItemProvider = Field(
        description="Provider of the subscription (e.g., 'youtube', 'spotify')",
    )

    @classmethod
    def from_subscription(cls, subscription: Subscription) -> "SubscriptionForAI":
        return cls(
            id=short_id(subscription.uuid),
            name=subscription.name,
            description=subscription.summary,
            provider=subscription.provider,
        )

    def as_context(self) -> str:
        return (f"Name: {self.name} | ID: {self.id} | Provider: {self.provider} | "
                f"Description: {self.description or 'No description'}")


class ItemForAI(BaseModel):
    id: str = Field(
        description="Short identifier for the item (8 hex chars)",
    )
    name: str = Field(
        description="Name of the item",
    )
    subscription_name: str = Field(
        description="Name of the subscription this item belongs to",
    )
    description: str = Field(
        description="Description of the item. It can be truncated, ending with '...'",
    )
    provider: ItemProvider = Field(
        description="Provider of the item (e.g., 'youtube', 'spotify')",
    )
    published_at: datetime = Field(
        description="Publication date of the item, if available",
    )
    duration: str | None = Field(
        default=None,
        description="Duration of the item in a readable format (e.g. '1h 5m 3s'). Null means the duration is unknown",
    )
    relevance: float | None = Field(
        default=None,
        description="Semantic similarity between the item and the search query, from 0 to 1. Only set for search "
                    "results",
    )

    @classmethod
    def from_item(
        cls,
        item: Item,
        sub_name: str,
        description_length: int | None = None,
        relevance: float | None = None,
    ) -> "ItemForAI":
        description = item.description
        if description_length is not None and len(description) > description_length:
            description = description[:description_length] + "..."
        return cls(
            id=short_id(item.uuid),
            name=item.name,
            subscription_name=sub_name,
            description=description,
            provider=item.provider,
            published_at=item.published_at,
            duration=format_duration(item.duration),
            relevance=None if relevance is None else round(relevance, 2),
        )


class AgentOutput(BaseModel):
    response: str = Field(
        description="Human-readable answer for the user, written in the user's language. "
                    "This field is mandatory and must never be empty.",
    )
    items_ids: list[str] = Field(
        default_factory=list,
        description="Short IDs (8 hex chars) of the content items referenced in the response. "
                    "Can be empty if the response does not reference any item.",
    )


class ContentAssistantOutput(BaseModel):
    response: str = Field(
        default="",
        description="Response for the user based on their query",
    )
    items_uuids: list[str] = Field(
        default_factory=list,
        description="List of content items UUIDs referenced in the response.",
    )


class ContentAssistantAgent:
    def __init__(
            self,
            model: Model,
            base_url: str,
            user_repository: UserRepository,
            subscription_repository: SubscriptionRepository,
            item_repository: ItemRepository,
            topic_repository: TopicRepository,
            embedding_service: EmbeddingService | None,
            providers: list[ItemProvider],
    ) -> None:
        self.agent = create_content_assistant_agent(model, providers)
        self.base_url = base_url
        self.user_repository = user_repository
        self.subscription_repository = subscription_repository
        self.item_repository = item_repository
        self.topic_repository = topic_repository
        self.embedding_service = embedding_service

    async def query(
            self,
            query: str,
            user_id: UUID | None,
            previous_chat: Chat | None,
            usage: RunUsage,
    ) -> ContentAssistantOutput:
        deps = ContentAssistantDependencies(
            user_uuid=user_id,
            user_repository=self.user_repository,
            subscription_repository=self.subscription_repository,
            item_repository=self.item_repository,
            topic_repository=self.topic_repository,
            embedding_service=self.embedding_service,
            previous_chat=previous_chat,
            scope=previous_chat.latest_scope() if previous_chat is not None else None,
        )
        entity_scope = deps.entity_scope()
        if entity_scope is not None:
            deps.candidate_item_ids = await resolve_scope_candidate_item_ids(
                scope=entity_scope,
                user_id=user_id,
                item_repository=self.item_repository,
                topic_repository=self.topic_repository,
            )

        result = await self.agent.run(query, deps=deps, usage=usage)

        final_message = _expand_short_id_links(result.output.response, deps, self.base_url)

        items_uuids: list[str] = []
        for sid in result.output.items_ids:
            full = deps.item_id_map.get(sid.lower())
            if full is not None:
                items_uuids.append(str(full))

        return ContentAssistantOutput(
            response=final_message,
            items_uuids=items_uuids,
        )


def _expand_short_id_links(response: str, deps: ContentAssistantDependencies, base_url: str) -> str:
    short_id_re = re.compile(rf"\]\(([0-9a-fA-F]{{{SHORT_ID_LENGTH}}})\)")
    full_url_re = re.compile(
        rf"https://linkurator\.com/(items|subscriptions)/([0-9a-fA-F]{{{SHORT_ID_LENGTH}}})",
    )

    def replace_markdown(match: re.Match[str]) -> str:
        sid = match.group(1).lower()
        if sid in deps.item_id_map:
            return f"]({base_url}/items/{deps.item_id_map[sid]}/url)"
        if sid in deps.subscription_id_map:
            return f"]({base_url}/subscriptions/{deps.subscription_id_map[sid]}/url)"
        return match.group(0)

    def replace_full_url(match: re.Match[str]) -> str:
        kind = match.group(1)
        sid = match.group(2).lower()
        mapping = deps.item_id_map if kind == "items" else deps.subscription_id_map
        full = mapping.get(sid)
        if full is None:
            return match.group(0)
        return f"{base_url}/{kind}/{full}/url"

    response = short_id_re.sub(replace_markdown, response)
    return full_url_re.sub(replace_full_url, response)


async def _items_for_ai(
    deps: ContentAssistantDependencies,
    items: list[Item],
    description_length: int | None = None,
    relevances: dict[UUID, float] | None = None,
) -> list[ItemForAI]:
    """Register the items so the LLM can reference them and convert them to the LLM format, keeping their order"""
    subscriptions = await deps.subscription_repository.get_list(
        list({item.subscription_uuid for item in items}),
    )
    indexed_subs_names = {sub.uuid: sub.name for sub in subscriptions}

    for item in items:
        deps.register_item_id(item.uuid)

    return [
        ItemForAI.from_item(
            item=item,
            sub_name=indexed_subs_names.get(item.subscription_uuid, UNKNOWN_SUBSCRIPTION_NAME),
            description_length=description_length,
            relevance=None if relevances is None else relevances.get(item.uuid),
        )
        for item in items
    ]


def create_content_assistant_agent(
    model: Model,
    providers: list[ItemProvider],
) -> Agent[ContentAssistantDependencies, AgentOutput]:
    ai_agent = Agent[ContentAssistantDependencies, AgentOutput](
        model,
        name="ContentAssistantAgent",
        deps_type=ContentAssistantDependencies,
        output_type=AgentOutput,
        model_settings=ModelSettings(
            temperature=0.2,
        ),
        system_prompt=(
            "You are a content assistant that helps users explore videos, podcasts and articles. "
            "You find and recommend content, and you answer questions about it: what an item is about, "
            "what a channel has published on a subject, how several items compare, what is available about a topic, "
            "what is new in the user's subscriptions, etc.\n"
            "Answer in the same language the user is using. "
            "Always use the customer's name in your responses.\n"
            "You do not have access to the full content, only to the title, the description and the metadata of "
            "each item. Base every statement about an item on that information and never invent facts about it. "
            "If the available information does not answer the question, say so.\n"
            "Tools:\n"
            "- search_content is a semantic search over the items. Write the query as a short description of the "
            "subject in natural language, not as a list of keywords. Pass exclusions, durations, publish dates and "
            "services as their own arguments instead of writing them in the query. If the question is about several "
            "subjects, search each one separately. Results are sorted by relevance, most relevant first.\n"
            "- get_latest_items returns the newest items the user has not interacted with yet, from all their "
            "subscriptions or from the given topics or subscriptions. Use it for questions about what is new.\n"
            "- get_items_details returns the full description of items already present in the context. Use it "
            "before answering detailed questions about specific items, since the search results only contain the "
            "beginning of the descriptions.\n"
            "Items that belong to a subscription included in any of the user topics are considered more relevant. "
            "Avoid asking the user to provide more information, use the information you have.\n"
            "Formatting rules:\n"
            "- Use markdown formatting, make titles bold and use bullet points for lists.\n"
            "- When recommending items, include a list of them and a short summary of the recommendations.\n"
            "- Summarize the titles if they are similar. If the same title from different providers is found, "
            "summarize them in a single item with links, adding the provider name (YouTube, Spotify...) to "
            "distinguish them.\n"
            "- Items, subscriptions and topics are identified by short IDs of 8 hex characters in the context. "
            "When you reference an item or subscription in the response, use a markdown link with the short ID as "
            "the URL: [Title](id). Do not invent IDs and do not write full URLs; only use IDs that appear in the "
            "context provided to you. Link titles cannot be multiline in markdown.\n"
            "- The items_ids field in your output must contain the 8-hex-char short IDs (never full UUIDs) of the "
            "items referenced in the response.\n"
            "- The response must have 1000 words maximum.\n"
        ),
        prepare_tools=filter_tools,
    )

    @ai_agent.system_prompt
    async def add_user_name(ctx: RunContext[ContentAssistantDependencies]) -> str:
        user_uuid = ctx.deps.user_uuid
        if user_uuid is None:
            return "The customer's name is unknown"

        user = await ctx.deps.user_repository.get(user_uuid)
        if user is None:
            logfire.warning(
                "User not found for customer UUID",
                customer_uuid=ctx.deps.user_uuid,
            )
            return "The customer's name is unknown"
        return f"The customer's name is {user.first_name!r}"

    @ai_agent.system_prompt
    async def add_today_date(_ctx: RunContext[ContentAssistantDependencies]) -> str:
        now = datetime.now(tz=timezone.utc)
        return f"Today is {now.strftime('%A %Y-%m-%d')}"

    @ai_agent.system_prompt
    async def add_providers(_ctx: RunContext[ContentAssistantDependencies]) -> str:
        return f"The services the items can come from are: {', '.join(providers)}"

    @ai_agent.system_prompt
    async def scope_information(
        ctx: RunContext[ContentAssistantDependencies],
    ) -> str:
        if not ctx.deps.is_scoped():
            return ""
        return (
            "This chat is restricted to a subset of the customer's items. "
            "The search_content and get_latest_items tools are already constrained to this scope and its "
            "active filters; do not pass topic or subscription ids to them.\n"
        )

    @ai_agent.system_prompt
    async def user_subscriptions_and_topics(
        ctx: RunContext[ContentAssistantDependencies],
    ) -> str:
        if ctx.deps.is_scoped():
            return ""

        handler = GetUserSubscriptionsHandler(
            user_repository=ctx.deps.user_repository,
            subscription_repository=ctx.deps.subscription_repository,
        )
        user_uuid = ctx.deps.user_uuid

        subs_for_ai: list[SubscriptionForAI] = []
        if user_uuid is not None:
            subs = await handler.handle(user_id=user_uuid)
            for sub in subs:
                ctx.deps.register_subscription_id(sub.uuid)
            subs_for_ai = [SubscriptionForAI.from_subscription(sub) for sub in subs]

        topics_for_ai: list[TopicForAI] = []
        if user_uuid is not None:
            topics = await ctx.deps.topic_repository.get_by_user_id(user_uuid)
            for topic in topics:
                ctx.deps.register_topic(topic)
            topics_for_ai = [TopicForAI.from_topic(topic) for topic in topics]

        context = "User's subscriptions:\n"
        if len(subs_for_ai) == 0:
            context += "The user has no subscriptions.\n"
        else:
            context += "\n\n".join([sub_ai.as_context() for sub_ai in subs_for_ai]) + "\n"

        context += "\nUser's topics:\n"
        if len(topics_for_ai) == 0:
            context += "The user has no topics.\n"
        else:
            context += "\n\n".join([topic_ai.as_context() for topic_ai in topics_for_ai]) + "\n"

        context += "End of user's subscriptions and topics.\n"

        return context

    @ai_agent.system_prompt
    async def previous_items_information(
        ctx: RunContext[ContentAssistantDependencies],
    ) -> str:
        chat = ctx.deps.previous_chat
        if chat is None:
            return ""

        items_uuids: set[UUID] = set()
        for message in chat.messages:
            if message.role == ChatRole.ASSISTANT:
                items_uuids = items_uuids.union(set(message.item_uuids))

        if len(items_uuids) == 0:
            return ""

        items = await ctx.deps.item_repository.find_items(
            criteria=ItemFilterCriteria(
                item_ids=items_uuids,
            ),
            page_number=0,
            limit=MAX_PREVIOUS_CHAT_ITEMS,
        )
        items_for_ai = await _items_for_ai(ctx.deps, items, description_length=SEARCH_DESCRIPTION_LENGTH)

        context = "Items referenced previously in the chat:\n"
        context += "\n".join([item_for_ai.model_dump_json() for item_for_ai in items_for_ai]) + "\n"
        context += "End of previously referenced items.\n"

        return context

    @ai_agent.tool()
    async def search_content(
        ctx: RunContext[ContentAssistantDependencies],
        query: str,
        excluded_concepts: list[str] | None = None,
        topic_ids: list[str] | None = None,
        subscription_ids: list[str] | None = None,
        min_duration_minutes: int | None = None,
        max_duration_minutes: int | None = None,
        published_after: date | None = None,
        published_before: date | None = None,
        providers: list[ItemProvider] | None = None,
    ) -> list[ItemForAI]:
        """
        Semantic search of the items whose title and description are about the query, most relevant first.

        Args:
        ----
            ctx: RunContext with dependencies
            query: Short natural language description of the subject to search for, without exclusions nor filters
            excluded_concepts: Short concepts (one to three words) the items must not be about
            topic_ids: Topic short IDs (8 hex chars) from the context to restrict the search to their subscriptions
            subscription_ids: Subscription short IDs (8 hex chars) from the context to restrict the search to
            min_duration_minutes: Minimum duration of the items in minutes
            max_duration_minutes: Maximum duration of the items in minutes
            published_after: First day (included) the items can be published on
            published_before: First day (excluded) the items can no longer be published on
            providers: Services the items must come from. Leave empty unless the user names a service

        """
        ctx.deps.search_content_calls += 1

        embedding_service = ctx.deps.embedding_service
        if embedding_service is None or query.strip() == "":
            return []

        filters = await build_search_filter(
            deps=ctx.deps,
            topic_ids=topic_ids,
            subscription_ids=subscription_ids,
            min_duration_minutes=min_duration_minutes,
            max_duration_minutes=max_duration_minutes,
            published_after=published_after,
            published_before=published_before,
            providers=providers,
        )
        similar_items = await find_items_similar_to_query(
            item_repository=ctx.deps.item_repository,
            embedding_service=embedding_service,
            search_query=SearchQuery(
                positive=query.strip(),
                negatives=clean_concepts(excluded_concepts or []),
                filters=filters,
            ),
            limit=SEARCH_RESULTS_LIMIT,
            discard_unrelated=True,
        )

        return await _items_for_ai(
            deps=ctx.deps,
            items=[similar_item.item for similar_item in similar_items],
            description_length=SEARCH_DESCRIPTION_LENGTH,
            relevances={similar_item.item.uuid: similar_item.similarity for similar_item in similar_items},
        )

    @ai_agent.tool()
    async def get_latest_items(
        ctx: RunContext[ContentAssistantDependencies],
        topic_ids: list[str] | None = None,
        subscription_ids: list[str] | None = None,
    ) -> list[ItemForAI]:
        """
        Get the newest items the user has not interacted with, newest first.

        Args:
        ----
            ctx: RunContext with dependencies
            topic_ids: List of topic short IDs (8 hex chars) from the context to filter items by
            subscription_ids: List of subscription short IDs (8 hex chars) from the context to filter items by

        """
        ctx.deps.get_latest_items_calls += 1

        criteria = await build_latest_items_criteria(ctx.deps, topic_ids, subscription_ids)

        items = await ctx.deps.item_repository.find_items(
            criteria=criteria,
            page_number=0,
            limit=LATEST_ITEMS_LIMIT,
        )
        items = sorted(items, key=lambda item: item.created_at, reverse=True)

        return await _items_for_ai(ctx.deps, items, description_length=SEARCH_DESCRIPTION_LENGTH)

    @ai_agent.tool()
    async def get_items_details(
        ctx: RunContext[ContentAssistantDependencies],
        item_ids: list[str],
    ) -> list[ItemForAI]:
        """
        Get the full description of items present in the context.

        Args:
        ----
            ctx: RunContext with dependencies
            item_ids: Item short IDs (8 hex chars) from the context

        """
        known_item_ids = set(ctx.deps.item_id_map.values())
        resolved_ids = dict.fromkeys(resolve_short_ids(item_ids, ctx.deps.item_id_map))
        ids_in_context = [item_id for item_id in resolved_ids if item_id in known_item_ids]
        requested_ids = ids_in_context[:MAX_ITEMS_DETAILS]
        if len(requested_ids) == 0:
            return []

        items = await ctx.deps.item_repository.find_items(
            criteria=ItemFilterCriteria(item_ids=set(requested_ids)),
            page_number=0,
            limit=MAX_ITEMS_DETAILS,
        )

        return await _items_for_ai(ctx.deps, items)

    return ai_agent


async def filter_tools(
    ctx: RunContext[ContentAssistantDependencies], tool_defs: list[ToolDefinition],
) -> Union[list[ToolDefinition], None]:
    filtered_tools = []
    for tool_def in tool_defs:
        if tool_def.name == "search_content":
            if ctx.deps.embedding_service is not None and ctx.deps.search_content_calls < MAX_SEARCH_CONTENT_CALLS:
                filtered_tools.append(tool_def)
        elif tool_def.name == "get_latest_items":
            if ctx.deps.get_latest_items_calls < MAX_GET_LATEST_ITEMS_CALLS:
                filtered_tools.append(tool_def)
        else:
            filtered_tools.append(tool_def)
    return filtered_tools
