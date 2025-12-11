# tests/test_integration_discount.py
import pytest
import random
import string

pytestmark = pytest.mark.asyncio


def random_email():
    rnd = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"test_{rnd}@example.com"


async def test_register_login_create_discount(async_client):
    ac = async_client
    # Register
    email = random_email()
    pwd = "Secret123!"
    data = {"email": email, "password": pwd, "full_name": "Test User"}
    r = await ac.post("/auth/register", json=data)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    user = r.json()
    assert user.get("email") == email

    # Login (JSON payload matching UserCreate schema)
    r = await ac.post("/auth/login", json={"email": email, "password": pwd})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    token = r.json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}

    # Create discount
    discount_payload = {
        "title": "Descuento Test",
        "description": "Integration test discount",
        "expiration_date": None,
    }
    r = await ac.post("/discounts/", json=discount_payload, headers=headers)
    assert r.status_code in (200, 201), f"create discount failed: {r.status_code} {r.text}"
    disc = r.json()
    assert disc.get("title") == "Descuento Test"
    assert disc.get("description") == "Integration test discount"
    # created_by should match the created user id
    assert disc.get("created_by") == user.get("id")
