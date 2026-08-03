from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from core.config import settings


class Base(DeclarativeBase):
    pass


load_dotenv()

engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)

AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncSession:
    async with AsyncSessionFactory() as session:
        yield session
