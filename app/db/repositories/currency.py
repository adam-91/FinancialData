from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models.currency import Currency


class CurrencyRepository:

   
    async def get_all_currencies(self, session: AsyncSession) -> list[Currency]:
        result = await session.get_all()
        return result
    
    async def get_by_code(self, session: AsyncSession, code: str) -> Currency:
        result = await session.execute(
            select(Currency).where(Currency.code == code)
        )
        return result.scalar_one_or_none()

    async def create(self, session: AsyncSession, code: str, name: str):
        obj = Currency(code=code, name=name)
        session.add(obj)
        await session.flush()
        return obj
    
