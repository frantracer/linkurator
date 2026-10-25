from uuid import UUID, uuid4

from linkurator_core.domain.common.types import DateGenerator, UuidGenerator
from linkurator_core.domain.common.utils import datetime_now
from linkurator_core.domain.items.interaction import InteractionType
from linkurator_core.domain.items.item_repository import ItemRepository
from linkurator_core.domain.notifications.notification import Notification
from linkurator_core.domain.notifications.notification_repository import NotificationRepository
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.users.user_repository import UserRepository


class NotifyFollowersOfRecommendationHandler:
    def __init__(
            self,
            user_repository: UserRepository,
            item_repository: ItemRepository,
            subscription_repository: SubscriptionRepository,
            notification_repository: NotificationRepository,
            uuid_generator: UuidGenerator = uuid4,
            date_generator: DateGenerator = datetime_now,
    ) -> None:
        self.user_repository = user_repository
        self.item_repository = item_repository
        self.subscription_repository = subscription_repository
        self.notification_repository = notification_repository
        self.uuid_generator = uuid_generator
        self.date_generator = date_generator

    async def handle(self, curator_id: UUID, item_id: UUID) -> None:
        item = await self.item_repository.get_item(item_id)
        if item is None:
            return

        curator_interactions = await self.item_repository.get_user_interactions_by_item_id(
            user_id=curator_id, item_ids=[item_id])
        is_still_recommended = any(
            interaction.type == InteractionType.RECOMMENDED
            for interaction in curator_interactions.get(item_id, [])
        )
        if not is_still_recommended:
            return

        curator = await self.user_repository.get(curator_id)
        if curator is None:
            return

        subscription = await self.subscription_repository.get(item.subscription_uuid)
        if subscription is None:
            return

        followers = await self.user_repository.find_followers_of_curator(curator_id)
        now = self.date_generator()
        notifications = [
            Notification.new_curator_recommended_item(
                uuid=self.uuid_generator(),
                user_id=follower.uuid,
                curator=curator,
                item=item,
                subscription=subscription,
                created_at=now,
            )
            for follower in followers
            if item.subscription_uuid in follower.get_subscriptions()
        ]

        await self.notification_repository.add(notifications)
