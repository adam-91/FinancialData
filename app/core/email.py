from email.message import EmailMessage

import aiosmtplib
import structlog

from core.config import settings

logger = structlog.get_logger()


async def send_email(to: str, subject: str, body: str) -> None:
    if not settings.SMTP_HOST:
        logger.warning("SMTP not configured, skipping email", to=to, subject=subject)
        return

    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME or None,
            password=settings.SMTP_PASSWORD or None,
            start_tls=settings.SMTP_TLS,
        )
    except Exception as err:
        logger.error("Failed to send email", to=to, error=str(err))
