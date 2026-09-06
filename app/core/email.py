import contextlib
from email.message import EmailMessage

import structlog
from aiosmtplib import SMTP

from core.config import settings

logger = structlog.get_logger()


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM)


async def send_email(to: str, subject: str, body: str) -> bool:
    if not _smtp_configured():
        logger.info(
            "SMTP not configured - skipping email delivery",
            to=to,
            subject=subject,
            body=body,
        )
        return False

    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    smtp = SMTP(
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        use_tls=settings.SMTP_TLS,
        username=settings.SMTP_USERNAME or None,
        password=settings.SMTP_PASSWORD or None,
    )

    try:
        await smtp.connect()
        await smtp.send_message(message)
        return True
    except Exception as err:
        logger.error("Failed to send email", to=to, error=str(err))
        return False
    finally:
        with contextlib.suppress(Exception):
            await smtp.quit()
