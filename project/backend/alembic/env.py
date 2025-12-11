from __future__ import with_statement
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy import engine_from_config
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import os
# importa tus módulos de modelos aquí para que target_metadata los vea
import app.models.user
import app.models.discount
import app.models.role

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# Import your metadata object here
# para autogenerate: target_metadata debe ser Base.metadata
# Asegúrate de que los módulos de modelos se importen para que Base.metadata incluya las tablas.
from app.database import Base, DATABASE_URL  # <- tu Base y la variable con URL
# Si tus modelos están en app.models.* y no se importan automáticamente, impórtalos explícitamente:
# import app.models.user
# import app.models.discount

target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""

    url = DATABASE_URL or config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode using an async engine."""

    connectable = create_async_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )

    async def do_run_migrations():
        async with connectable.connect() as connection:
            # configure context with a sync connection inside run_sync
            await connection.run_sync(
                lambda sync_conn: context.configure(
                    connection=sync_conn,
                    target_metadata=target_metadata,
                    compare_type=True,
                )
            )
            # run migrations in the same sync context
            await connection.run_sync(lambda sync_conn: context.run_migrations())

    asyncio.run(do_run_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
