from pydantic import BaseModel
from datetime import date, datetime

class DiscountBase(BaseModel):
    title: str
    description: str | None = None
    expiration_date: date | None = None

class DiscountCreate(DiscountBase):
    created_by: int | None = None

class DiscountOut(DiscountBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        orm_mode = True
