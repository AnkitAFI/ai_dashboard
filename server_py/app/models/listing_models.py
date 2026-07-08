from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.sql import func
from app.db.session import Base
from app.core.cryptography import EncryptedString

class ProductListing(Base):
    __tablename__ = "product_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    
    # Raw Input
    raw_image_url = Column(String(512), nullable=True)
    raw_description = Column(Text, nullable=False)
    extracted_attributes = Column(JSON, nullable=True) # Extracted brand, color, size, etc.
    
    # Generated Amazon Content
    amazon_title = Column(String(500), nullable=True)
    amazon_bullets = Column(JSON, nullable=True) # Array of strings
    amazon_description = Column(Text, nullable=True)
    amazon_search_terms = Column(String(1000), nullable=True)
    
    # Generated Flipkart Content
    flipkart_title = Column(String(500), nullable=True)
    flipkart_description = Column(Text, nullable=True)
    
    # Premium A+ / Rich Description
    a_plus_content = Column(JSON, nullable=True)
    
    # Status
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserApiCredential(Base):
    __tablename__ = "user_api_credentials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 'amazon', 'flipkart', etc.
    platform = Column(String(50), nullable=False)
    
    # Using military-grade AES encryption for the tokens
    client_id = Column(String(255), nullable=True) # Usually not sensitive, but good to store
    client_secret = Column(EncryptedString, nullable=True)
    refresh_token = Column(EncryptedString, nullable=True)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class PlatformSyncStatus(Base):
    __tablename__ = "platform_sync_status"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("product_listings.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False) # 'amazon' or 'flipkart'
    
    status = Column(String(50), default="pending") # 'pending', 'published', 'failed'
    platform_product_id = Column(String(255), nullable=True) # ASIN or FSN
    error_message = Column(Text, nullable=True)
    
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

class ABTestExperiment(Base):
    __tablename__ = "ab_test_experiments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("product_listings.id", ondelete="CASCADE"), nullable=False)
    
    variant_a_image_url = Column(String(512), nullable=True)
    variant_b_image_url = Column(String(512), nullable=True)
    
    active_variant = Column(String(10), default="A") # 'A' or 'B'
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Analytics
    variant_a_clicks = Column(Integer, default=0)
    variant_b_clicks = Column(Integer, default=0)
    winner = Column(String(10), nullable=True)
