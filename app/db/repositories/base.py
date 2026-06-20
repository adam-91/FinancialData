from typing import TypeVar

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
OutputSchemaType = TypeVar("OutputSchemaType", bound=BaseModel)


class AsyncRepository[ModelType, CreateSchemaType, OutputSchemaType]:
    model: type[ModelType]
    output_schema: type[OutputSchemaType]

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        obj: CreateSchemaType,
    ) -> OutputSchemaType:

        object = self.model(**obj.model_dump())
        self.session.add(object)

        await self.session.flush()
        await self.session.refresh(object)

        return object

    async def create_many(
        self,
        dtos: list[CreateSchemaType],
    ) -> list[OutputSchemaType]:
        db_objects = [self.model(**dto.model_dump()) for dto in dtos]

        self.session.add_all(db_objects)
        await self.session.flush()

        return [self.output_schema.model_validate(obj) for obj in db_objects]

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
