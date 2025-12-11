from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.discount import Discount
from app.models.user import User
from app.schemas.discount import DiscountCreate, DiscountOut
from app.utils.jwt import get_current_user, get_current_admin

router = APIRouter(prefix="/discounts", tags=["discounts"])


@router.get("/", response_model=list[DiscountOut])
async def list_discounts(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Discount).offset(skip).limit(limit))
    discounts = q.scalars().all()
    return discounts


@router.get("/{discount_id}", response_model=DiscountOut)
async def get_discount(discount_id: int, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Discount).where(Discount.id == discount_id))
    discount = q.scalar_one_or_none()
    if not discount:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    return discount


@router.post("/", response_model=DiscountOut, status_code=status.HTTP_201_CREATED)
async def create_discount(data: DiscountCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    discount = Discount(
        title=data.title,
        description=data.description,
        expiration_date=data.expiration_date,
        created_by=user.id,
    )
    db.add(discount)
    await db.commit()
    await db.refresh(discount)
    return discount


@router.put("/{discount_id}", response_model=DiscountOut)
async def update_discount(discount_id: int, data: DiscountCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    q = await db.execute(select(Discount).where(Discount.id == discount_id))
    discount = q.scalar_one_or_none()
    if not discount:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")

    # Only creator or admin can update
    if discount.created_by != user.id:
        # check admin role
        admin_user = await get_current_admin(user)
        # if not admin, get_current_admin will raise

    discount.title = data.title
    discount.description = data.description
    discount.expiration_date = data.expiration_date

    db.add(discount)
    await db.commit()
    await db.refresh(discount)
    return discount


@router.delete("/{discount_id}")
async def delete_discount(discount_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    q = await db.execute(select(Discount).where(Discount.id == discount_id))
    discount = q.scalar_one_or_none()
    if not discount:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discount not found")
    await db.delete(discount)
    await db.commit()
    return {"detail": "deleted"}
