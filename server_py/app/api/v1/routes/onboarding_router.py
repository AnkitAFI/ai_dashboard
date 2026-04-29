# app/api/v1/routes/onboarding_router.py

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("/categories")
def get_onboarding_categories(
    marketplace: str = Query("amazon"),
    db: Session = Depends(get_db),
):
    """
    Returns distinct category names from the products tables.
    marketplace = "amazon"   → rapidapi_amazon_products
    marketplace = "flipkart" → rapidapi_flipkart_products
    marketplace = "both"     → union of both tables
    """

    amazon_query = """
        SELECT DISTINCT category_name
        FROM rapidapi_amazon_products
        WHERE category_name IS NOT NULL
          AND TRIM(category_name) != ''
    """

    flipkart_query = """
        SELECT DISTINCT category_name
        FROM rapidapi_flipkart_products
        WHERE category_name IS NOT NULL
          AND TRIM(category_name) != ''
    """

    both_query = f"""
        SELECT DISTINCT category_name FROM (
            {amazon_query}
            UNION
            {flipkart_query}
        ) AS combined
    """

    query_map = {
        "amazon":   amazon_query,
        "flipkart": flipkart_query,
        "both":     both_query,
    }

    sql = query_map.get(marketplace, amazon_query)

    rows = db.execute(text(sql + " ORDER BY category_name")).fetchall()
    categories = [row[0] for row in rows if row[0]]

    return {
        "marketplace": marketplace,
        "count":       len(categories),
        "categories":  categories,
    }