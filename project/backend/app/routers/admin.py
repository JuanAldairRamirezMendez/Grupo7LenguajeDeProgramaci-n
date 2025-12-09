from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.discount import Discount
from app.models.user_activity_log import UserActivityLog
from app.utils.jwt import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    total_users = db.query(User).count()
    total_discounts = db.query(Discount).count()

    last_7_days = datetime.utcnow() - timedelta(days=7)

    active_users = db.query(UserActivityLog.user_id).filter(
        UserActivityLog.timestamp >= last_7_days
    ).distinct().count()

    return {
        "total_users": total_users,
        "total_discounts": total_discounts,
        "active_users_last_7_days": active_users
    }
