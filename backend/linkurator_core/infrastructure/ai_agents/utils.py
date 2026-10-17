import logging
from datetime import date, datetime, time, timezone
from uuid import UUID

from linkurator_core.domain.chats.chat import Chat
from linkurator_core.domain.common.units import Seconds
from linkurator_core.domain.items.item import ItemProvider
from linkurator_core.domain.items.item_repository import SimilarItemsFilter


def format_duration(seconds: Seconds | None) -> str | None:
    """Format a duration in seconds as e.g. '1h 5m 3s'. Returns None if the duration is unknown (None or zero)."""
    if seconds is None or seconds <= 0:
        return None

    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)

    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0:
        parts.append(f"{secs}s")
    return " ".join(parts)


def start_of_day_utc(day: date | None) -> datetime | None:
    if day is None:
        return None
    return datetime.combine(day, time.min, tzinfo=timezone.utc)


def minutes_to_seconds(minutes: int | None) -> Seconds | None:
    if minutes is None:
        return None
    return minutes * 60


def build_similar_items_filter(
    min_duration_minutes: int | None,
    max_duration_minutes: int | None,
    published_after: date | None,
    published_before: date | None,
    providers: list[ItemProvider],
) -> SimilarItemsFilter:
    return SimilarItemsFilter(
        min_duration=minutes_to_seconds(min_duration_minutes),
        max_duration=minutes_to_seconds(max_duration_minutes),
        published_after=start_of_day_utc(published_after),
        published_before=start_of_day_utc(published_before),
        providers=list(dict.fromkeys(providers)),
    )


def clean_concepts(concepts: list[str]) -> list[str]:
    return [concept.strip() for concept in concepts if concept.strip() != ""]


def parse_ids_to_uuids(ids: list[str] | None) -> list[UUID]:
    if ids is None:
        return []

    valid_uuids: list[UUID] = []
    for id_str in ids:
        try:
            valid_uuids.append(UUID(id_str))
        except ValueError as e:
            logging.exception(f"Failed to parse UUID {id_str}: {e}")

    return valid_uuids


def build_chat_context(previous_chat: Chat | None) -> str:
    context = ""
    if previous_chat is not None and len(previous_chat.messages) > 0:
        context = "Previous chat messages:\n"
        for message in previous_chat.messages:
            if message.role == "user":
                context += f"User: {message.content}\n"
            elif message.role == "assistant":
                context += f"Assistant: {message.content}\n"
        context += "End of previous chat messages.\n"
    return context
