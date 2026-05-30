from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from db.models.exchange_buy_and_sell_rate import ExchangeBuyAndSellRate

class ExchangeRateBuyAndSellRepository:

    async def save_bas_rates(self, session: AsyncSession, rates: list[ExchangeBuyAndSellRate]):
        session.add_all(rates)
        await session.commit()
        
    async def clear_bas_rates(session: AsyncSession):
        await session.execute(delete(ExchangeBuyAndSellRate))
        await session.commit()

