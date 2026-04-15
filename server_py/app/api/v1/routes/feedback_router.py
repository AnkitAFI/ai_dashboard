from fastapi import APIRouter
from app.services.feedback_service import FeedbackService

router = APIRouter(tags=["Feedback"])
service = FeedbackService()
