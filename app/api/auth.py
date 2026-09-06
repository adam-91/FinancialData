from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.security import get_current_user
from db.database import get_session
from db.models.user import User
from db.repositories.user import UserRepository
from dto.user_dto import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest,
    UserDTO,
)
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_auth_service(db: AsyncSession = Depends(get_session)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    service: AuthService = Depends(get_auth_service),
):
    user, token = await service.login(payload.email, payload.password)
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )
    return LoginResponse(
        email=user.email,
        must_change_password=user.must_change_password,
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=settings.AUTH_COOKIE_NAME, path="/")
    return {"status": "ok"}


@router.get("/me", response_model=UserDTO)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password", response_model=UserDTO)
async def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    await service.change_password(user, payload.current_password, payload.new_password)
    return user


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    await service.request_password_reset(payload.email)
    return {"status": "ok"}


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    service: AuthService = Depends(get_auth_service),
):
    await service.reset_password(payload.token, payload.new_password)
    return {"status": "ok"}
