from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    email: str
    phone: str | None = None

class UserCreate(UserBase):
    password: str
    role_id: int | None = None

class UserOut(UserBase):
    id: int
    role_id: int
    created_at: datetime

class UserUpdate(BaseModel):
    phone: str | None = None

class ProfileOut(UserBase):
    id: int
    role_id: int
    created_at: datetime
    last_login: datetime | None

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
