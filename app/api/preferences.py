from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth import get_current_user
from db.database import get_session
from db.models.user import User
from db.repositories.user_preference import UserPreferenceRepository
from dto.user_preference_dto import (
    UserPreferencesDTO,
    UserPreferencesUpdateDTO,
)
from services.preferences_service import PreferencesService

router = APIRouter(prefix="/api/auth/preferences", tags=["preferences"])


def get_preferences_service(
    db: AsyncSession = Depends(get_session),
) -> PreferencesService:
    return PreferencesService(UserPreferenceRepository(db))


@router.get("/", response_model=UserPreferencesDTO)
async def get_preferences(
    user: User = Depends(get_current_user),
    service: PreferencesService = Depends(get_preferences_service),
) -> UserPreferencesDTO:
    return await service.get(user)


@router.put("/", response_model=UserPreferencesDTO)
async def update_preferences(
    payload: UserPreferencesUpdateDTO,
    user: User = Depends(get_current_user),
    service: PreferencesService = Depends(get_preferences_service),
) -> UserPreferencesDTO:
    return await service.update(user, payload)
