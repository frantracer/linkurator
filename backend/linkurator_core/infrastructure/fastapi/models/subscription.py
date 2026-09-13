from __future__ import annotations

from uuid import UUID

from pydantic import AnyUrl, BaseModel

from linkurator_core.application.subscriptions.import_opml_subscriptions_handler import ImportOpmlResult
from linkurator_core.domain.items.item import ItemProvider
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.domain.users.user import User
from linkurator_core.infrastructure.fastapi.models.schema import Iso8601Datetime


class ImportOpmlResultSchema(BaseModel):
    """Result of importing subscriptions from an OPML file."""

    imported: int
    already_followed: int
    failed: int
    topics_created: int

    @classmethod
    def from_domain(cls, result: ImportOpmlResult) -> ImportOpmlResultSchema:
        return cls(imported=result.imported, already_followed=result.already_followed,
                   failed=result.failed, topics_created=result.topics_created)


class SubscriptionSchema(BaseModel):
    """Information about the different channels the user is subscribed to."""

    uuid: UUID
    name: str
    url: AnyUrl
    thumbnail: AnyUrl
    provider: ItemProvider
    created_at: Iso8601Datetime
    scanned_at: Iso8601Datetime
    followed: bool

    @classmethod
    def from_domain_subscription(cls, subscription: Subscription, user: User | None) -> SubscriptionSchema:
        followed = False if user is None else subscription.uuid in user.get_subscriptions()
        return cls(uuid=subscription.uuid, name=subscription.name, url=subscription.url,
                   thumbnail=subscription.thumbnail, created_at=subscription.created_at,
                   scanned_at=subscription.scanned_at, followed=followed, provider=subscription.provider)
