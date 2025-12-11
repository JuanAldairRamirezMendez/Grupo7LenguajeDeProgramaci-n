from ssl import create_default_context
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv

#crear un contexto SSL por seguridad
ssl_context = create_default_context()
# Cargar variables desde .env para desarrollo/local
load_dotenv()

Base = declarative_base()

# Lee DATABASE_URL desde env (.env cargado por main.py / python-dotenv)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está definida. Crea un archivo .env con DATABASE_URL=postgresql+asyncpg://... "
        "o exporta la variable de entorno antes de ejecutar el script."
    )

# Crea engine async
engine = create_async_engine(DATABASE_URL, future=True, echo=False)

# Async session factory
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

# Dependencia para FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Función opcional para crear tablas en dev (usa metadata)
async def init_db():
    # Crea tablas según Base.metadata (solo para dev; en prod usa Alembic)
    async with engine.begin() as conn:
        # run_sync ejecuta funciones síncronas con la conexión async
        await conn.run_sync(Base.metadata.create_all)

engine = create_async_engine(
    DATABASE_URL,
    future=True,
    echo=False,
    connect_args={"ssl": ssl_context}
)