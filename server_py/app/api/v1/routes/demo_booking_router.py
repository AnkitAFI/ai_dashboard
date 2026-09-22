from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import os

from app.db.session import get_db
from app.models.schema_v2 import DemoBooking
from app.services.brevo_service import BrevoService

from collections import defaultdict

router = APIRouter()

class DemoBookingCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    context: Optional[str] = None
    date: str
    time_slot: str
    website: Optional[str] = None  # Honeypot field
    consent_given: bool = True # GDPR proof of consent

class DemoBookingResponse(DemoBookingCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

@router.get("/", response_model=List[str])
def get_booked_slots(date: str, db: Session = Depends(get_db)):
    bookings = db.query(DemoBooking).filter(DemoBooking.date == date).all()
    return [b.time_slot for b in bookings]

@router.post("/", response_model=DemoBookingResponse)
def create_booking(booking: DemoBookingCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. HONEYPOT CHECK: If 'website' is filled, it's a bot.
    if booking.website:
        return DemoBookingResponse(
            id=999999,
            name=booking.name,
            email=booking.email,
            phone=booking.phone,
            context=booking.context,
            date=booking.date,
            time_slot=booking.time_slot,
            website=booking.website,
            consent_given=booking.consent_given,
            created_at=datetime.utcnow()
        )

    # 2. IP RATE LIMITING: Max 3 bookings per 24 hours per IP address (Using Database Hash)
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    
    if client_ip != "unknown":
        ip_recent_bookings = db.query(DemoBooking).filter(
            DemoBooking.ip_hash == client_ip,
            DemoBooking.created_at >= yesterday
        ).count()
        
        if ip_recent_bookings >= 3:
            raise HTTPException(status_code=429, detail="Too many bookings from your network. Please try again tomorrow.")

    # 3. EMAIL RATE LIMITING: Max 2 bookings per 24 hours per email (Using Hash)
    recent_bookings = db.query(DemoBooking).filter(
        DemoBooking.email_hash == booking.email,
        DemoBooking.created_at >= yesterday
    ).count()

    if recent_bookings >= 2:
        raise HTTPException(status_code=429, detail="You have reached the maximum number of demo bookings for today.")

    # Check if slot is taken
    existing = db.query(DemoBooking).filter(DemoBooking.date == booking.date, DemoBooking.time_slot == booking.time_slot).first()
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already booked")
        
    db_booking = DemoBooking(
        name=booking.name,
        email=booking.email,
        phone=booking.phone,
        email_hash=booking.email,
        ip_hash=client_ip,
        context=booking.context,
        date=booking.date,
        time_slot=booking.time_slot,
        consent_given=booking.consent_given
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Send Brevo Email to Support via Background Task
    support_email = os.environ.get("SUPPORT_EMAIL", "radhika@afidigitalservices.com")
    background_tasks.add_task(
        BrevoService.send_demo_booking_email,
        {
            "name": booking.name,
            "email": booking.email,
            "phone": booking.phone,
            "date": booking.date,
            "time_slot": booking.time_slot,
            "context": booking.context
        },
        support_email
    )

    return db_booking
