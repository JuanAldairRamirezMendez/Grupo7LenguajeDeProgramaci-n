# tests/test_db.py
import asyncio
import pytest
from sqlalchemy import text
from app.database import engine

pytestmark = pytest.mark.asyncio


async def test_conn():
    try:
        async with engine.connect() as conn:
            val = await conn.scalar(text("SELECT 1"))
            print("DB test OK:", val)
    except Exception as e:
        pytest.fail(f"DB test FAILED: {e}")


if __name__ == "__main__":
    asyncio.run(test_conn())