# app/api/v1/routes/saved_products_router.py
# Drop into: server_py/app/api/v1/routes/saved_products_router.py
# Register in api.py: api_router.include_router(saved_products_router)

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import text
import json, uuid

from app.db.session import get_db
from app.services.profitability_service import get_user_tier, TIER_FEATURES

router = APIRouter(prefix="/profitability/saved", tags=["Saved Products"])


class SaveProductRequest(BaseModel):
    user_id: str
    name: str
    inputs: dict
    calc_snapshot: dict


class SavedProduct(BaseModel):
    id: str
    user_id: str
    name: str
    inputs: dict
    calc_snapshot: dict
    profit_per_unit: float
    net_margin_pct: float
    monthly_profit: float
    created_at: str


def ensure_table(db: Session):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS profitability_saved_products (
            id              TEXT PRIMARY KEY,
            user_id         TEXT NOT NULL,
            name            TEXT NOT NULL,
            inputs          JSONB NOT NULL DEFAULT '{}',
            calc_snapshot   JSONB NOT NULL DEFAULT '{}',
            profit_per_unit NUMERIC(12,2) DEFAULT 0,
            net_margin_pct  NUMERIC(8,2)  DEFAULT 0,
            monthly_profit  NUMERIC(14,2) DEFAULT 0,
            created_at      TIMESTAMPTZ   DEFAULT NOW()
        )
    """))
    db.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_saved_products_user
        ON profitability_saved_products(user_id)
    """))
    db.commit()


@router.get("/{user_id}", response_model=List[SavedProduct])
def list_saved(user_id: str, db: Session = Depends(get_db)):
    ensure_table(db)
    rows = db.execute(text("""
        SELECT id, user_id, name, inputs, calc_snapshot,
               profit_per_unit, net_margin_pct, monthly_profit, created_at
        FROM profitability_saved_products
        WHERE user_id = :uid
        ORDER BY created_at DESC
        LIMIT 100
    """), {"uid": user_id}).fetchall()

    return [
        SavedProduct(
            id=r[0], user_id=r[1], name=r[2],
            inputs=r[3] if isinstance(r[3], dict) else json.loads(r[3]),
            calc_snapshot=r[4] if isinstance(r[4], dict) else json.loads(r[4]),
            profit_per_unit=float(r[5] or 0),
            net_margin_pct=float(r[6] or 0),
            monthly_profit=float(r[7] or 0),
            created_at=r[8].isoformat() if hasattr(r[8], "isoformat") else str(r[8]),
        )
        for r in rows
    ]


@router.post("", response_model=SavedProduct)
def save_product(req: SaveProductRequest, db: Session = Depends(get_db)):
    ensure_table(db)

    tier = get_user_tier(req.user_id, db)
    limit = TIER_FEATURES[tier]["save_limit"]

    if limit != 9999:
        count = db.execute(text("""
            SELECT COUNT(*) FROM profitability_saved_products WHERE user_id = :uid
        """), {"uid": req.user_id}).scalar()
        if (count or 0) >= limit:
            raise HTTPException(status_code=403, detail={
                "error": "save_limit_reached",
                "limit": limit,
                "tier": tier,
                "message": f"Upgrade to save more than {limit} products.",
            })

    pid = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO profitability_saved_products
            (id, user_id, name, inputs, calc_snapshot,
             profit_per_unit, net_margin_pct, monthly_profit)
        VALUES (:id, :uid, :name, :inp, :snap, :p, :m, :mo)
    """), {
        "id": pid, "uid": req.user_id, "name": req.name.strip(),
        "inp": json.dumps(req.inputs),
        "snap": json.dumps(req.calc_snapshot),
        "p":  float(req.calc_snapshot.get("profit_per_unit", 0) or 0),
        "m":  float(req.calc_snapshot.get("net_margin_pct",  0) or 0),
        "mo": float(req.calc_snapshot.get("monthly_profit",  0) or 0),
    })
    db.commit()

    row = db.execute(text("""
        SELECT id, user_id, name, inputs, calc_snapshot,
               profit_per_unit, net_margin_pct, monthly_profit, created_at
        FROM profitability_saved_products WHERE id = :id
    """), {"id": pid}).fetchone()

    return SavedProduct(
        id=row[0], user_id=row[1], name=row[2],
        inputs=row[3] if isinstance(row[3], dict) else json.loads(row[3]),
        calc_snapshot=row[4] if isinstance(row[4], dict) else json.loads(row[4]),
        profit_per_unit=float(row[5] or 0),
        net_margin_pct=float(row[6] or 0),
        monthly_profit=float(row[7] or 0),
        created_at=row[8].isoformat() if hasattr(row[8], "isoformat") else str(row[8]),
    )


@router.delete("/{user_id}/{product_id}")
def delete_saved(user_id: str, product_id: str, db: Session = Depends(get_db)):
    ensure_table(db)
    result = db.execute(text("""
        DELETE FROM profitability_saved_products
        WHERE id = :pid AND user_id = :uid
    """), {"pid": product_id, "uid": user_id})
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True, "id": product_id}