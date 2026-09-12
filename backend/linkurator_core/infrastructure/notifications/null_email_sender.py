import logging

from linkurator_core.domain.notifications.email_sender import EmailSender


class NullEmailSender(EmailSender):
    async def send_email(self, user_email: str, subject: str, message_text: str) -> bool:  # noqa: ARG002
        logging.info("Email sending is disabled, skipping email to %s", user_email)
        return False
