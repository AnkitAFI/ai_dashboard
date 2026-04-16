from sqlalchemy.orm import Session
from datetime import datetime
from app.db.models.payment_order_model import PaymentOrder

class PaymentOrderRepository:
    def get_active_order(self, db: Session, user_id: int) -> PaymentOrder:
        return (
            db.query(PaymentOrder)
            .filter(
                PaymentOrder.user_id    == user_id,
                PaymentOrder.status     == "paid",
                PaymentOrder.expires_at >  datetime.now(),
            )
            .order_by(PaymentOrder.expires_at.desc())
            .first()
        )

    def get_by_id_and_user(self, db: Session, order_id: int, user_id: int) -> PaymentOrder:
        return db.query(PaymentOrder).filter(PaymentOrder.id == order_id, PaymentOrder.user_id == user_id).first()

    def get_by_razorpay_order_id(self, db: Session, razorpay_order_id: str) -> PaymentOrder:
        return db.query(PaymentOrder).filter(PaymentOrder.razorpay_order_id == razorpay_order_id).first()

    def get_history_by_user(self, db: Session, user_id: int, limit: int = 20):
        return db.query(PaymentOrder).filter(PaymentOrder.user_id == user_id).order_by(PaymentOrder.created_at.desc()).limit(limit).all()

    def get_pending_recent_order(self, db: Session, user_id: int, plan_id: str):
        return (
            db.query(PaymentOrder)
            .filter(PaymentOrder.user_id == user_id,
                    PaymentOrder.plan_id == plan_id,
                    PaymentOrder.status  == "created")
            .order_by(PaymentOrder.created_at.desc())
            .first()
        )

    def create(self, db: Session, order: PaymentOrder):
        db.add(order)
        db.commit()
        db.refresh(order)
        return order
