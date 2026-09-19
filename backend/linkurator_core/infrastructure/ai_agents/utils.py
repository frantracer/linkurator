import logging
from uuid import UUID

from linkurator_core.domain.chats.chat import Chat
from linkurator_core.domain.common.units import Seconds


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
