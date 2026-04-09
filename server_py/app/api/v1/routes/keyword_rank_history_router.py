from fastapi import APIRouter
from app.services.keyword_rank_history_service import KeywordRankHistoryService

router = APIRouter(tags=["KeywordRankHistory"])
service = KeywordRankHistoryService()
