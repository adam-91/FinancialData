from sqlalchemy import select

from db.models.user_preference import UserPreference
from dto.user_preference_dto import UserPreferencesUpdateDTO


class UserPreferenceRepository:
    def __init__(self, session):
        self.session = session

    async def get_by_user_id(self, user_id: int) -> UserPreference | None:
        stmt = select(UserPreference).where(UserPreference.user_id == user_id)
        return await self.session.scalar(stmt)

    async def upsert(
        self,
        user_id: int,
        payload: UserPreferencesUpdateDTO,
    ) -> UserPreference:
        preference = await self.get_by_user_id(user_id)

        if preference is None:
            preference = UserPreference(
                user_id=user_id,
                default_exchange=payload.default_exchange,
                default_currencies=payload.default_currencies,
            )
            self.session.add(preference)
        else:
            preference.default_exchange = payload.default_exchange
            preference.default_currencies = payload.default_currencies

        await self.session.commit()
        await self.session.refresh(preference)
        return preference
