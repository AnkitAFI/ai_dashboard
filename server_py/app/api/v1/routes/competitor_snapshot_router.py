from fastapi import APIRouter
from app.services.competitor_snapshot_service import CompetitorSnapshotService

router = APIRouter(tags=["CompetitorSnapshot"])
service = CompetitorSnapshotService()
