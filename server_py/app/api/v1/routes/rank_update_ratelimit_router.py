from fastapi import APIRouter
from app.services.rank_update_ratelimit_service import RankUpdateRatelimitService

router = APIRouter(tags=["RankUpdateRatelimit"])
service = RankUpdateRatelimitService()
