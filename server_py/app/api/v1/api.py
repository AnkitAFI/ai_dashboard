from fastapi import APIRouter
from app.api.v1.routes import (
    auth_router,
    amazon_review_router,
    flipkart_product_router,
    rapidapi_amazon_product_router,
    rapidapi_flipkart_product_router,
    analytics_router,
    payment_order_router,
    legacy_router,
    seller_router
)
from app.api.v1.routes.profitability_router import router as profitability_router
from app.api.v1.routes.profitability_ai_router import router as profitability_ai_router
from app.api.v1.routes.saved_products_router import router as saved_products_router
from app.api.v1.routes.comparison_router import router as comparison_router
from app.api.v1.routes.white_space import router as white_space_router
from app.api.v1.routes.keyword_tracker_router import router as keyword_tracker_router
from app.api.v1.routes.keyword_gap_router import router as keyword_gap_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(amazon_review_router, prefix="/amazon-reviews", tags=["Amazon Reviews"])
api_router.include_router(flipkart_product_router, prefix="/flipkart-products", tags=["Flipkart Products"])
api_router.include_router(rapidapi_amazon_product_router, tags=["RapidAPI Amazon"])
api_router.include_router(rapidapi_flipkart_product_router, tags=["RapidAPI Flipkart"])
api_router.include_router(analytics_router, tags=["Analytics"])
api_router.include_router(profitability_router, tags=["Profitability"])
api_router.include_router(profitability_ai_router, tags=["Profitability AI"])
api_router.include_router(saved_products_router)
api_router.include_router(white_space_router, prefix="/white-space", tags=["white-space"])
api_router.include_router(keyword_tracker_router)
api_router.include_router(comparison_router) 
api_router.include_router(keyword_gap_router)
api_router.include_router(payment_order_router, prefix="/payments", tags=["Payment Order"])
api_router.include_router(seller_router, prefix="/seller", tags=["Seller Dashboard"])
