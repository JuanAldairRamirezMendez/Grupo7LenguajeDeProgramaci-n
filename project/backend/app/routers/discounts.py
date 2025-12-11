from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.discount import Discount
from app.schemas.discount import DiscountCreate, DiscountOut
from app.utils.jwt import get_current_admin, get_current_user

router = APIRouter(prefix="/discounts", tags=["Discounts"])

@router.get("/", response_model=list[DiscountOut])
def list_discounts(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Discount).all()

@router.post("/", response_model=DiscountOut)
def create_discount(data: DiscountCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    discount = Discount(
        title=data.title,
        description=data.description,
        expiration_date=data.expiration_date,
        created_by=admin.id
    )

    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount

@router.delete("/{discount_id}")
def delete_discount(discount_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    item = db.query(Discount).filter(Discount.id == discount_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Discount not found")

    db.delete(item)
    db.commit()
    return {"message": "Discount deleted"}
