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

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(amazon_review_router, prefix="/amazon-reviews", tags=["Amazon Reviews"])
api_router.include_router(flipkart_product_router, prefix="/flipkart-products", tags=["Flipkart Products"])
api_router.include_router(rapidapi_amazon_product_router, tags=["RapidAPI Amazon"])
api_router.include_router(rapidapi_flipkart_product_router, tags=["RapidAPI Flipkart"])
api_router.include_router(analytics_router, tags=["Analytics"])
api_router.include_router(payment_order_router, prefix="/payments", tags=["Payment Order"])
api_router.include_router(seller_router, prefix="/seller", tags=["Seller Dashboard"])
