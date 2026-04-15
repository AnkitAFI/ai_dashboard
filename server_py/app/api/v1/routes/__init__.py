# app/api/v1/routes/__init__.py
from .auth_router import router as auth_router
from .amazon_review_router import router as amazon_review_router
from .flipkart_product_router import router as flipkart_product_router
from .rapidapi_amazon_product_router import router as rapidapi_amazon_product_router
from .rapidapi_flipkart_product_router import router as rapidapi_flipkart_product_router
from .analytics_router import router as analytics_router
from .payment_order_router import router as payment_order_router
from .legacy_router import router as legacy_router
