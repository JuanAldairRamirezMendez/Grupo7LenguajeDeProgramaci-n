from ssl import create_default_context
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# crear un contexto SSL por seguridad
ssl_context = create_default_context()

Base = declarative_base()

# Read DATABASE_URL from centralized settings
DATABASE_URL = settings.DATABASE_URL

# Inicialización perezosa del engine/sessionmaker para evitar excepciones en import
engine: Optional[object] = None
AsyncSessionLocal: Optional[async_sessionmaker] = None

if DATABASE_URL:
    engine = create_async_engine(
        DATABASE_URL,
        future=True,
        echo=False,
        connect_args={"ssl": ssl_context},
    )

    # Async session factory
    AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


async def get_db():
    """Dependencia para FastAPI que lanza un error claro si la DB no está configurada."""
    if AsyncSessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL no está definida en el entorno del proceso. Asegúrate de configurar \n"
            "la variable de entorno DATABASE_URL en Render o en tu entorno antes de arrancar la app."
        )

    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Función opcional para crear tablas en dev (usa metadata). Requiere engine configurado."""
    if engine is None:
        raise RuntimeError("Engine de base de datos no inicializado. Define DATABASE_URL antes de usar init_db().")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
