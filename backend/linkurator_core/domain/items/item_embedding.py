from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import datetime
from typing import Callable
from uuid import UUID

from linkurator_core.domain.common.utils import datetime_now
from linkurator_core.domain.items.item import Item

MAX_EMBEDDING_DESCRIPTION_LENGTH = 4000


@dataclass
class ItemEmbedding:
    item_uuid: UUID
    vector: list[float]
    text_hash: UUID
    created_at: datetime

    @classmethod
    def new(
        cls,
        item_uuid: UUID,
        vector: list[float],
        text_hash: UUID,
        now_function: Callable[[], datetime] = datetime_now,
    ) -> ItemEmbedding:
        return cls(
            item_uuid=item_uuid,
            vector=vector,
            text_hash=text_hash,
            created_at=now_function(),
        )


def item_embedding_text(item: Item) -> str:
    """Text representation of an item used to compute its embedding"""
    description = item.description[:MAX_EMBEDDING_DESCRIPTION_LENGTH]
    return (
        f"Title: {item.name}\n"
        f"Provider: {item.provider}\n"
        f"Description: {description}"
    )


def item_embedding_text_hash(text: str) -> UUID:
    """MD5 of the text used to compute an embedding, stored in 16 bytes as a UUID"""
    return UUID(bytes=hashlib.md5(text.encode(), usedforsecurity=False).digest())
