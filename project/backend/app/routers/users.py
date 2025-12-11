from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.utils.jwt import get_current_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserOut])
async def get_all_users(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    q = await db.execute(select(User))
    users = q.scalars().all()
    return users


@router.post("/", response_model=UserOut)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    # import password hasher lazily to avoid circular imports
    from app.routers.auth import get_password_hash

    try:
        hashed_pass = get_password_hash(data.password)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    user = User(
        email=data.email,
        password_hash=hashed_pass,
        role_id=data.role_id,
        phone=data.phone,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    q = await db.execute(select(User).where(User.id == user_id))
    user = q.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}
