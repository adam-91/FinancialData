from db.models.user import User
from db.repositories.user_preference import UserPreferenceRepository
from dto.user_preference_dto import (
    UserPreferencesDTO,
    UserPreferencesUpdateDTO,
)


class PreferencesService:
    def __init__(self, repo: UserPreferenceRepository):
        self.repo = repo

    async def get(self, user: User) -> UserPreferencesDTO:
        preference = await self.repo.get_by_user_id(user.id)

        if preference is None:
            return UserPreferencesDTO(
                default_exchange=None,
                default_currencies=[],
            )

        return UserPreferencesDTO(
            default_exchange=preference.default_exchange,
            default_currencies=list(preference.default_currencies or []),
        )

    async def update(
        self,
        user: User,
        payload: UserPreferencesUpdateDTO,
    ) -> UserPreferencesDTO:
        preference = await self.repo.upsert(user.id, payload)
        return UserPreferencesDTO(
            default_exchange=preference.default_exchange,
            default_currencies=list(preference.default_currencies or []),
        )
