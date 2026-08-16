from pydantic import BaseModel


class UserPreferencesDTO(BaseModel):
    default_exchange: str | None
    default_currencies: list[str]


class UserPreferencesUpdateDTO(BaseModel):
    default_exchange: str | None = None
    default_currencies: list[str] = []
