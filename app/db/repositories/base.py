from typing import Generic, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

ModelType = TypeVar("ModelType")


class AsyncRepository(Generic[ModelType]):

    model = None

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        obj: ModelType,
    ) -> ModelType:

        self.session.add(obj)

        await self.session.commit()
        await self.session.refresh(obj)

        return obj

    async def create_many(
        self,
        objects: list[ModelType],
    ) -> list[ModelType]:

        self.session.add_all(objects)

        await self.session.commit()

        return objects

    async def get_by_id(
        self,
        object_id: int,
    ) -> ModelType | None:

        return await self.session.get(
            self.model,
            object_id,
        )

    async def get_all(self) -> list[ModelType]:

        stmt = select(self.model)

        result = await self.session.scalars(stmt)

        return list(result.all())

    async def delete(
        self,
        obj: ModelType,
    ) -> None:

        await self.session.delete(obj)

    async def save(self) -> None:
        await self.session.commit()