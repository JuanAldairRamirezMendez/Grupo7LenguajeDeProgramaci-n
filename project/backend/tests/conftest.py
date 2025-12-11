import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text

from app.main import app
from app.database import engine


@pytest_asyncio.fixture
async def async_client():
    """Async test client that runs the ASGI app in-process.

    After the test, truncate key tables to leave the DB clean for the next test.
    This is a pragmatic approach for the current test suite; in CI you may prefer
    a dedicated ephemeral database or transactional SAVEPOINT approach.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    # Cleanup - truncate tables created by tests
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE discounts RESTART IDENTITY CASCADE"))
        await conn.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE"))
        await conn.execute(text("TRUNCATE TABLE roles RESTART IDENTITY CASCADE"))
