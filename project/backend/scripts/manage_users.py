"""Herramienta simple para listar y borrar usuarios de la base de datos.

Uso:
  - Listar usuarios:
      python scripts/manage_users.py --list

  - Borrar usuario por email:
      python scripts/manage_users.py --delete-email test@example.com

  - Borrar usuarios de prueba (emails que empiezan por "test" o dominio example.com):
      python scripts/manage_users.py --delete-test-users

Este script usa la configuración de `app.database` (AsyncSessionLocal).
"""

import asyncio
import argparse
from typing import Optional
import sys
from pathlib import Path

# Ensure project `backend` folder is on sys.path so `import app` works
# This makes the script runnable as `python scripts/manage_users.py` from the
# `project/backend` folder regardless of how Python sets sys.path.
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sqlalchemy import select, delete, or_

from app.database import AsyncSessionLocal
from app.models.user import User


async def list_users(limit: Optional[int] = 100):
    async with AsyncSessionLocal() as session:
        q = await session.execute(select(User).order_by(User.created_at.desc()).limit(limit))
        users = q.scalars().all()
        if not users:
            print("No users found.")
            return
        for u in users:
            print(f"id={u.id}\temail={u.email}\trole_id={u.role_id}\tcreated_at={u.created_at}")


async def delete_user_by_email(email: str):
    async with AsyncSessionLocal() as session:
        q = await session.execute(select(User).where(User.email == email))
        user = q.scalar_one_or_none()
        if not user:
            print("User not found:", email)
            return
        await session.delete(user)
        await session.commit()
        print("Deleted:", email)


async def delete_test_users(prefix: str = "test", domain: str = "example.com"):
    async with AsyncSessionLocal() as session:
        stmt = select(User).where(or_(User.email.ilike(f"{prefix}%"), User.email.ilike(f"%@{domain}")))
        q = await session.execute(stmt)
        users = q.scalars().all()
        if not users:
            print("No test users found.")
            return
        for u in users:
            print("Deleting:", u.email)
            await session.delete(u)
        await session.commit()
        print(f"Deleted {len(users)} users")


def build_args():
    p = argparse.ArgumentParser(description="Manage users in DB (list/delete)")
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--list", action="store_true", help="List users")
    group.add_argument("--delete-email", metavar="EMAIL", help="Delete user by email")
    group.add_argument("--delete-test-users", action="store_true", help="Delete test users (prefix 'test' or domain example.com)")
    p.add_argument("--limit", type=int, default=100, help="Max users to list")
    return p.parse_args()


async def main():
    args = build_args()
    if args.list:
        await list_users(limit=args.limit)
    elif args.delete_email:
        await delete_user_by_email(args.delete_email)
    elif args.delete_test_users:
        await delete_test_users()


if __name__ == "__main__":
    asyncio.run(main())
