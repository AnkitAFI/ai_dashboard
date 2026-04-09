import os

entities = [
    ("AmazonProductDetails", "amazon_product_details"),
    ("IndianProduct", "indian_product"),
    ("ProductTrackerAnalysis", "product_tracker_analysis"),
    ("TrackedProduct", "tracked_product"),
    ("KeywordRankHistory", "keyword_rank_history"),
    ("PriceAlert", "price_alert"),
    ("RankUpdateRatelimit", "rank_update_ratelimit"),
    ("Feedback", "feedback"),
    ("CompetitorSnapshot", "competitor_snapshot"),
    ("TimeSeriesForcasting", "time_series_forcasting")
]

base_dir = r"c:\Users\afidi\Desktop\dash_1\ai_dashboard\server_py\app"

for class_name, file_prefix in entities:
    # Model
    model_content = f"""from sqlalchemy import Column, Integer
from app.db.base import Base

class {class_name}(Base):
    __tablename__ = "{file_prefix}_placeholder"
    id = Column(Integer, primary_key=True, index=True)
"""
    with open(os.path.join(base_dir, "db", "models", f"{file_prefix}_model.py"), "w") as f:
        f.write(model_content)

    # Schema
    schema_content = f"""from pydantic import BaseModel

class {class_name}Schema(BaseModel):
    pass
"""
    with open(os.path.join(base_dir, "schemas", f"{file_prefix}_schema.py"), "w") as f:
        f.write(schema_content)

    # Repository
    repo_content = f"""from sqlalchemy.orm import Session
from app.db.models.{file_prefix}_model import {class_name}

class {class_name}Repository:
    pass
"""
    with open(os.path.join(base_dir, "repositories", f"{file_prefix}_repository.py"), "w") as f:
        f.write(repo_content)

    # Service
    service_content = f"""from app.repositories.{file_prefix}_repository import {class_name}Repository

repo = {class_name}Repository()

class {class_name}Service:
    pass
"""
    with open(os.path.join(base_dir, "services", f"{file_prefix}_service.py"), "w") as f:
        f.write(service_content)

    # Router
    router_content = f"""from fastapi import APIRouter
from app.services.{file_prefix}_service import {class_name}Service

router = APIRouter(tags=["{class_name}"])
service = {class_name}Service()
"""
    with open(os.path.join(base_dir, "api", "routes", f"{file_prefix}_router.py"), "w") as f:
        f.write(router_content)

print("Generated boilerplate for all missing entities!")
