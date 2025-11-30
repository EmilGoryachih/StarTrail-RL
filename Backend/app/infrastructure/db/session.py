from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.infrastructure.core import settings

async_engine = create_async_engine(
    str(settings.ASYNC_DATABASE_URI),
    echo=True,
    future=True,
)

async_session_maker = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
    autoflush=False,
)

async def fastapi_get_db():
    async with async_session_maker() as db:
        yield db

