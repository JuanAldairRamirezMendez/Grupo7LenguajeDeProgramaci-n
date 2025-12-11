from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.role import Role
from app.config import settings

security = HTTPBearer()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM


async def _get_user_from_token(token: str) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    async with AsyncSessionLocal() as session:
        q = await session.execute(select(User).where(User.id == int(sub)))
        user = q.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    return await _get_user_from_token(token)


async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    # verify role is admin
    async with AsyncSessionLocal() as session:
        q = await session.execute(select(Role).where(Role.id == user.role_id))
        role = q.scalar_one_or_none()
        if not role or role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
