from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class ItemCreationCursor:
    created_at: datetime
    item_uuid: UUID
