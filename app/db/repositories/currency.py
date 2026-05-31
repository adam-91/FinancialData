from sqlalchemy import select
from db.models.currency import Currency
from db.repositories.base import AsyncRepository
 
class CurrencyRepository(AsyncRepository):

    async def create(self, currency: Currency) -> Currency:
        self.session.add(currency)
        await self.session.commit()
        return currency

    async def create_many(self, currencies: list[Currency]) -> list[Currency]:
        self.session.add_all(currencies)
        await self.session.commit()
        return currencies

    async def get_by_id(self, currency_id: int) -> Currency | None:
        stmt = select(Currency).where(Currency.id == currency_id)
        return await self.session.scalar(stmt)

    async def get_by_code(self, code: str) -> Currency | None:
        stmt = select(Currency).where(Currency.code == code)
        return await self.session.scalar(stmt)

    async def get_all(self) -> list[Currency]:
        stmt = select(Currency)
        return await list(self.session.scalars(stmt).all())

    async def update(self, currency: Currency) -> Currency:
        return await self.session.merge(currency)

    async def delete(self, currency: Currency) -> None:
        await self.session.delete(currency)

    async def delete_by_id(self, currency_id: int) -> bool:
        currency = self.get_by_id(currency_id)

        if not currency:
            return False

        await self.session.delete(currency)
        return True

