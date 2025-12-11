("""Simple notification helpers (placeholders).

En un proyecto real reemplaza esto por integración con un servicio de correo
o proveedor de notificaciones (SendGrid, SES, Twilio, etc.).
""")

import asyncio
import logging

logger = logging.getLogger("app.notifications")


async def send_email(to: str, subject: str, body: str) -> None:
	"""Placeholder async function to 'send' an email. Currently logs the message.

	Use this during development and swap implementation when integrating a real provider.
	"""
	# Simulate async I/O
	await asyncio.sleep(0)
	logger.info("Sending email to %s: %s\n%s", to, subject, body)


def send_email_sync(to: str, subject: str, body: str) -> None:
	"""Synchronous wrapper that schedules the async sender.
	Useful for scripts or places where async context is not available.
	"""
	try:
		asyncio.get_running_loop()
	except RuntimeError:
		# No running loop; run one briefly
		asyncio.run(send_email(to, subject, body))
		return
	# If there is a running loop, schedule it
	asyncio.create_task(send_email(to, subject, body))

