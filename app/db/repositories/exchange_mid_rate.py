from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from db.models.exchange_mid_rate import ExchangeMidRate

class ExchangeRateMidRepository:

    async def save_mid_rates(self, session: AsyncSession, rates: list[ExchangeMidRate]):
        session.add_all(rates)
        await session.commit()
        
    async def clear_mid_rates(session: AsyncSession):
        await session.execute(delete(ExchangeMidRate))
        await session.commit()
