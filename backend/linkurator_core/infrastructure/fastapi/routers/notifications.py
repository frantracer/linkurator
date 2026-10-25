from __future__ import annotations

from typing import Any, Callable, Coroutine

from fastapi import APIRouter, Depends, Request, status
from pydantic import NonNegativeInt, PositiveInt

from linkurator_core.application.notifications.count_unread_notifications_handler import (
    CountUnreadNotificationsHandler,
)
from linkurator_core.application.notifications.get_user_notifications_handler import GetUserNotificationsHandler
from linkurator_core.application.notifications.mark_all_notifications_as_read_handler import (
    MarkAllNotificationsAsReadHandler,
)
from linkurator_core.domain.users.session import Session
from linkurator_core.infrastructure.fastapi.models import default_responses
from linkurator_core.infrastructure.fastapi.models.default_responses import EmptyResponse
from linkurator_core.infrastructure.fastapi.models.notification import (
    NotificationSchema,
    UnreadNotificationsCountSchema,
)
from linkurator_core.infrastructure.fastapi.models.page import Page


def get_router(
        get_session: Callable[[Request], Coroutine[Any, Any, Session | None]],
        get_user_notifications_handler: GetUserNotificationsHandler,
        count_unread_notifications_handler: CountUnreadNotificationsHandler,
        mark_all_notifications_as_read_handler: MarkAllNotificationsAsReadHandler,
) -> APIRouter:
    router = APIRouter()

    @router.get("/",
                responses={
                    status.HTTP_401_UNAUTHORIZED: {"model": None},
                })
    async def get_notifications(
            request: Request,
            page_number: NonNegativeInt = 0,
            page_size: PositiveInt = 20,
            session: Session | None = Depends(get_session),
    ) -> Page[NotificationSchema]:
        if session is None:
            raise default_responses.not_authenticated()

        notifications = await get_user_notifications_handler.handle(
            user_id=session.user_id,
            page_number=page_number,
            page_size=page_size,
        )

        return Page[NotificationSchema].create(
            elements=[NotificationSchema.from_domain(notification) for notification in notifications],
            page_number=page_number,
            page_size=page_size,
            current_url=request.url.include_query_params(page_number=page_number, page_size=page_size),
        )

    @router.get("/unread/count",
                responses={
                    status.HTTP_401_UNAUTHORIZED: {"model": None},
                })
    async def count_unread_notifications(
            session: Session | None = Depends(get_session),
    ) -> UnreadNotificationsCountSchema:
        if session is None:
            raise default_responses.not_authenticated()

        count = await count_unread_notifications_handler.handle(session.user_id)
        return UnreadNotificationsCountSchema(count=count)

    @router.post("/read",
                 status_code=status.HTTP_204_NO_CONTENT,
                 responses={
                     status.HTTP_401_UNAUTHORIZED: {"model": None},
                 })
    async def mark_all_notifications_as_read(
            session: Session | None = Depends(get_session),
    ) -> EmptyResponse:
        if session is None:
            raise default_responses.not_authenticated()

        await mark_all_notifications_as_read_handler.handle(session.user_id)
        return EmptyResponse()

    return router
