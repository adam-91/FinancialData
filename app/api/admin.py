from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import get_current_user
from db.database import get_session
from db.models.user import User
from db.repositories.user import UserRepository
from dto.user_dto import (
    ResetLinkResponse,
    UserCreateDTO,
    UserDTO,
    UserUpdateDTO,
)
from services.auth_service import AuthService

router = APIRouter(prefix="/api/admin", tags=["admin"])


def get_auth_service(db: AsyncSession = Depends(get_session)) -> AuthService:
    return AuthService(UserRepository(db))


@router.get("/users", response_model=list[UserDTO])
async def list_users(
    service: AuthService = Depends(get_auth_service),
    _: User = Depends(get_current_user),
):
    return await service.list_users()


@router.post("/users", response_model=UserDTO, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateDTO,
    service: AuthService = Depends(get_auth_service),
    _: User = Depends(get_current_user),
):
    return await service.create_user(payload.email, payload.password)


@router.put("/users/{user_id}", response_model=UserDTO)
async def update_user(
    user_id: int,
    payload: UserUpdateDTO,
    service: AuthService = Depends(get_auth_service),
    _: User = Depends(get_current_user),
):
    user = await service.user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return await service.update_user(user, payload)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    service: AuthService = Depends(get_auth_service),
    current_user: User = Depends(get_current_user),
):
    user = await service.user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    await service.delete_user(user, current_user)
    return {"status": "ok"}


@router.post("/users/{user_id}/reset-password", response_model=ResetLinkResponse)
async def generate_reset_link(
    user_id: int,
    service: AuthService = Depends(get_auth_service),
    _: User = Depends(get_current_user),
):
    user = await service.user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    reset_url = await service.request_password_reset(user.email)
    return ResetLinkResponse(reset_url=reset_url, email=user.email)
