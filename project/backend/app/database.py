from ssl import create_default_context
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# crear un contexto SSL por seguridad
ssl_context = create_default_context()

Base = declarative_base()

# Read DATABASE_URL from centralized settings
DATABASE_URL = settings.DATABASE_URL

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está definida. Crea un archivo .env con DATABASE_URL=postgresql+asyncpg://... "
        "o exporta la variable de entorno antes de ejecutar el script."
    )

# Crea engine async
engine = create_async_engine(
    DATABASE_URL,
    future=True,
    echo=False,
    connect_args={"ssl": ssl_context},
)

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
