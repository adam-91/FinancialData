import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.security import create_access_token, decode_token
from db.database import get_session
from db.models.user import User, UserRole
from db.repositories.user import UserRepository
from dto.user_dto import (
    ChangePasswordDTO,
    ResetConfirmDTO,
    ResetRequestDTO,
    UserLoginDTO,
    UserRegisterDTO,
    UserResponseDTO,
)
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def get_user_repository(
    db: AsyncSession = Depends(get_session),
) -> UserRepository:
    return UserRepository(db)


def get_auth_service(
    repo: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(repo)


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.FRONTEND_URL.startswith("https"),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def get_current_user(
    request: Request,
    repo: UserRepository = Depends(get_user_repository),
) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_token(token)
    except jwt.exceptions.InvalidTokenError as err:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from err

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await repo.get_by_email(payload.get("sub", ""))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


async def get_current_admin_user(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user


@router.post("/register", response_model=UserResponseDTO, status_code=201)
async def register(
    payload: UserRegisterDTO,
    service: AuthService = Depends(get_auth_service),
) -> UserResponseDTO:
    return await service.register(payload.email, payload.password)


@router.post("/login", response_model=UserResponseDTO)
async def login(
    payload: UserLoginDTO,
    response: Response,
    service: AuthService = Depends(get_auth_service),
) -> UserResponseDTO:
    user = await service.authenticate(payload.email, payload.password)
    token = create_access_token(user.email, user.role.value)
    _set_auth_cookie(response, token)
    return UserResponseDTO.model_validate(user)


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(COOKIE_NAME)
    return {"status": "ok"}


@router.get("/me", response_model=UserResponseDTO)
async def me(user: User = Depends(get_current_user)) -> UserResponseDTO:
    return UserResponseDTO.model_validate(user)


@router.post("/password/reset-request")
async def request_password_reset(
    payload: ResetRequestDTO,
    service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    await service.request_password_reset(payload.email)
    return {"status": "ok"}


@router.post("/password/reset-confirm")
async def reset_password(
    payload: ResetConfirmDTO,
    service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    await service.reset_password(payload.token, payload.new_password)
    return {"status": "ok"}


@router.post("/password/change")
async def change_password(
    payload: ChangePasswordDTO,
    user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> dict[str, str]:
    await service.change_password(user, payload.old_password, payload.new_password)
    return {"status": "ok"}
