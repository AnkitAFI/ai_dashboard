
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from . import models
from sqlalchemy import text
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Dropout
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta
import torch
import torch.nn as nn

def get_reviews(db: Session, limit: int = 50, offset: int = 0):
    return db.query(models.AmazonReview).offset(offset).limit(limit).all()

def get_review_by_id(db: Session, review_id: str):
    return db.query(models.AmazonReview).filter(models.AmazonReview.review_id == review_id).first()

def get_product_reviews(db: Session, product_id: str, limit: int = 20):
    return db.query(models.AmazonReview).filter(models.AmazonReview.product_id == product_id).limit(limit).all()

def search_reviews(db: Session, query: str, limit: int = 50):
    return db.query(models.AmazonReview).filter(
        or_(
            models.AmazonReview.product_title.ilike(f"%{query}%"),
            models.AmazonReview.review_headline.ilike(f"%{query}%"),
            models.AmazonReview.review_body.ilike(f"%{query}%")
        )
    ).limit(limit).all()

def get_review_statistics(db: Session):
    query = text("""
        SELECT 
            COUNT(*) as total_reviews,
            ROUND(AVG(star_rating), 2) as average_rating,
            COUNT(DISTINCT product_title) as total_products
        FROM "Amazon_Reviews"
    """)
    
    row = db.execute(query).fetchone()
    
    return {
        "total_reviews": int(row.total_reviews) if row.total_reviews else 0,
        "average_rating": float(row.average_rating) if row.average_rating else 0.0,
        "total_products": int(row.total_products) if row.total_products else 0
    }

def get_sentiment_distribution(db: Session):
    return (
        db.query(models.AmazonReview.Sentiment_pc, func.count(models.AmazonReview.review_id))
          .group_by(models.AmazonReview.Sentiment_pc)
          .all()
    )

def get_ratings_distribution(db: Session):
    return (
        db.query(models.AmazonReview.star_rating, func.count(models.AmazonReview.review_id))
          .group_by(models.AmazonReview.star_rating)
          .all()
    )

def get_category_statistics(db: Session):
    results = (
        db.query(models.AmazonReview.product_category, func.count(models.AmazonReview.review_id))
          .group_by(models.AmazonReview.product_category)
          .all()
    )
    return [{"category": category, "count": count} for category, count in results]

def get_trending_products(db: Session, limit: int = 10):
    results = (
        db.query(
            models.AmazonReview.product_id,
            models.AmazonReview.product_title,
            models.AmazonReview.product_category,
            func.count(models.AmazonReview.review_id).label("review_count"),
            func.avg(models.AmazonReview.star_rating).label("avg_rating")
        )
        .group_by(
            models.AmazonReview.product_id,
            models.AmazonReview.product_title,
            models.AmazonReview.product_category
        )
        .order_by(func.count(models.AmazonReview.review_id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "product_id": pid,
            "product_title": title,
            "category": cat,
            "review_count": rc,
            "avg_rating": avg
        }
        for pid, title, cat, rc, avg in results
    ]

def get_monthly_trends(db: Session, year: int):
    results = (
        db.query(
            models.AmazonReview.review_month,
            func.count(models.AmazonReview.review_id).label("review_count"),
            func.avg(models.AmazonReview.star_rating).label("avg_rating")
        )
        .filter(models.AmazonReview.review_year == year)
        .group_by(models.AmazonReview.review_month)
        .order_by(models.AmazonReview.review_month)
        .all()
    )

    return [
        {"month": month, "review_count": count, "avg_rating": avg}
        for month, count, avg in results
    ]

def get_helpful_reviews(db: Session, limit: int = 10):
    return db.query(models.AmazonReview).order_by(models.AmazonReview.helpful_votes.desc()).limit(limit).all()

def get_product_sentiment_breakdown(db: Session, product_id: str):
    results = (
        db.query(
            models.AmazonReview.Sentiment_pc,
            func.count(models.AmazonReview.review_id).label("count")
        )
        .filter(models.AmazonReview.product_id == product_id)
        .group_by(models.AmazonReview.Sentiment_pc)
        .all()
    )
    
    return [{"sentiment": sentiment, "count": count} for sentiment, count in results]

def get_products(db: Session, limit: int, offset: int, category: str = None,
                 min_price: float = None, max_price: float = None) -> List[Dict[str, Any]]:
    query = "SELECT * FROM flipkart WHERE 1=1"
    if category:
        query += " AND category = :category"
    if min_price is not None:
        query += " AND price >= :min_price"
    if max_price is not None:
        query += " AND price <= :max_price"
    query += " ORDER BY last_updated DESC LIMIT :limit OFFSET :offset"

    params = {
        "category": category,
        "min_price": min_price,
        "max_price": max_price,
        "limit": limit,
        "offset": offset
    }
    result = db.execute(text(query), params)
    return [dict(row._mapping) for row in result]


# def get_summary(db: Session, source: str) -> Dict[str, Any]:
#     if source == "flipkart":
#         query = """
#         SELECT
#             COUNT(*) AS total_products,
#             AVG(price) AS avg_price,
#             AVG(rating) AS avg_rating,
#             SUM(reviews) AS total_reviews
#         FROM flipkart
#         """
#     elif source == "amazon":
#         query = """
#         SELECT
#             COUNT(*) AS total_products,
#             AVG(product_price_numeric) AS avg_price,
#             AVG(product_star_rating_numeric) AS avg_rating,
#             SUM(product_num_ratings) AS total_reviews
#         FROM rapidapi_amazon_products
#         """
#     elif source == "all":
#         query = """
#         SELECT
#             SUM(total_products) AS total_products,
#             AVG(avg_price) AS avg_price,
#             AVG(avg_rating) AS avg_rating,
#             SUM(total_reviews) AS total_reviews
#         FROM (
#             SELECT
#                 COUNT(*) AS total_products,
#                 AVG(price) AS avg_price,
#                 AVG(rating) AS avg_rating,
#                 SUM(reviews) AS total_reviews
#             FROM flipkart
#             UNION ALL
#             SELECT
#                 COUNT(*) AS total_products,
#                 AVG(product_price_numeric) AS avg_price,
#                 AVG(product_star_rating_numeric) AS avg_rating,
#                 SUM(product_num_ratings) AS total_reviews
#             FROM rapidapi_amazon_products
#         ) combined
#         """
#     else:
#         raise ValueError("Invalid source. Must be 'flipkart', 'amazon', or 'all'.")

#     result = db.execute(text(query))
#     return dict(result.mappings().first())

def get_summary(db: Session, source: str) -> Dict[str, Any]:
    if source == "flipkart":
        query = """
        SELECT
            COUNT(*) AS total_products,
            AVG(product_price) AS avg_price,
            AVG(product_star_rating) AS avg_rating,
            SUM(product_review_count) AS total_reviews
        FROM rapidapi_flipkart_products
        """
    elif source == "amazon":
        query = """
        SELECT
            COUNT(*) AS total_products,
            AVG(product_price_numeric) AS avg_price,
            AVG(product_star_rating_numeric) AS avg_rating,
            SUM(product_num_ratings) AS total_reviews
        FROM rapidapi_amazon_products
        """
    elif source == "all":
        query = """
        SELECT
            SUM(total_products) AS total_products,
            AVG(avg_price) AS avg_price,
            AVG(avg_rating) AS avg_rating,
            SUM(total_reviews) AS total_reviews
        FROM (
            SELECT
                COUNT(*) AS total_products,
                AVG(product_price) AS avg_price,
                AVG(product_star_rating) AS avg_rating,
                SUM(product_review_count) AS total_reviews
            FROM rapidapi_flipkart_products
            UNION ALL
            SELECT
                COUNT(*) AS total_products,
                AVG(product_price_numeric) AS avg_price,
                AVG(product_star_rating_numeric) AS avg_rating,
                SUM(product_num_ratings) AS total_reviews
            FROM rapidapi_amazon_products
        ) combined
        """
    else:
        raise ValueError("Invalid source. Must be 'flipkart', 'amazon', or 'all'.")
    
    result = db.execute(text(query)).fetchone()
    return dict(result._mapping) if result else {} 

def get_top_products(db: Session, n: int):
    return db.query(models.Product).order_by(models.Product.rating.desc()).limit(n).all()

def get_top_products_amazon(db: Session, n: int):
    result = (
        db.query(
            models.AmazonReview.product_title,
            func.avg(models.AmazonReview.star_rating).label("avg_rating"),
            func.count(models.AmazonReview.review_id).label("review_count")
        )
        .group_by(models.AmazonReview.product_title)
        .order_by(func.count(models.AmazonReview.review_id).desc())
        .limit(n)
        .all()
    )
    return [dict(product_title=r.product_title, avg_rating=r.avg_rating, review_count=r.review_count) for r in result]

# def get_category_analytics(db):
#     query = """
#     SELECT 
#         category,
#         COUNT(*) AS total_products,
#         AVG(price) AS avg_price,
#         AVG(rating) AS avg_rating,
#         SUM(reviews) AS total_reviews,
#         source
#     FROM (
#         -- Flipkart data
#         SELECT 
#             category, 
#             price, 
#             rating, 
#             reviews, 
#             'flipkart' AS source
#         FROM flipkart
#         WHERE price IS NOT NULL AND rating IS NOT NULL

#         UNION ALL

#         -- Amazon data
#         SELECT 
#             category_name AS category, 
#             product_price_numeric AS price, 
#             product_star_rating_numeric AS rating, 
#             product_num_ratings AS reviews, 
#             'amazon' AS source
#         FROM rapidapi_amazon_products
#         WHERE product_price_numeric IS NOT NULL 
#           AND product_star_rating_numeric IS NOT NULL
#     ) combined
#     GROUP BY category, source
#     ORDER BY total_reviews DESC
#     """
#     result = db.execute(text(query))
#     return [dict(row._mapping) for row in result]

def get_category_analytics(db):
    query = """
    SELECT 
        category,
        COUNT(*) AS total_products,
        AVG(price) AS avg_price,
        AVG(rating) AS avg_rating,
        SUM(reviews) AS total_reviews,
        source
    FROM (
        -- Flipkart data
        SELECT 
            category_name AS category, 
            product_price AS price, 
            product_star_rating AS rating, 
            product_review_count AS reviews, 
            'flipkart' AS source
        FROM rapidapi_flipkart_products
        WHERE product_price IS NOT NULL AND product_star_rating IS NOT NULL

        UNION ALL

        -- Amazon data
        SELECT 
            category_name AS category, 
            product_price_numeric AS price, 
            product_star_rating_numeric AS rating, 
            product_num_ratings AS reviews, 
            'amazon' AS source
        FROM rapidapi_amazon_products
        WHERE product_price_numeric IS NOT NULL 
          AND product_star_rating_numeric IS NOT NULL
    ) combined
    GROUP BY category, source
    ORDER BY total_reviews DESC
    """
    result = db.execute(text(query))
    return [dict(row._mapping) for row in result]

# def get_flipkart_categories(db: Session):
#     rows = db.execute(text("SELECT DISTINCT category FROM flipkart")).fetchall()
#     return [{"category": row.category} for row in rows]

def get_flipkart_categories(db: Session):
    rows = db.execute(text("SELECT DISTINCT category_name as category FROM rapidapi_flipkart_products")).fetchall()
    return [{"category": row.category} for row in rows]

def get_amazon_categories(db: Session):
    rows = db.execute(text("SELECT DISTINCT category_name AS category FROM rapidapi_amazon_products")).fetchall()
    return [{"category": row.category} for row in rows]


def get_forecast_all_products(db: Session, n_forecast_days: int = 365):
    # 1️⃣ Get Flipkart products with price history
    flipkart_query = """
        SELECT title AS product_name, price, last_updated as date
        FROM flipkart
        WHERE price IS NOT NULL AND last_updated IS NOT NULL
        ORDER BY last_updated ASC
    """
    flipkart_df = pd.read_sql(text(flipkart_query), db.bind)

    # 2️⃣ Get Amazon reviews (approximate price from ratings)
    amazon_query = """
        SELECT product_title AS product_name, 
               COALESCE(AVG(star_rating), 3) * 500 AS price_estimate,
               CURRENT_DATE AS date
        FROM "Amazon_Reviews"
        GROUP BY product_title
    """
    amazon_df = pd.read_sql(text(amazon_query), db.bind)
    amazon_df.rename(columns={"price_estimate": "price"}, inplace=True)

    # Combine data
    all_products = pd.concat([flipkart_df, amazon_df], ignore_index=True)

    # 3️⃣ Prepare result container
    forecast_data = []
    start_date = datetime.now()

    # 4️⃣ LSTM Forecast for each product
    for product in all_products["product_name"].unique():
        product_data = all_products[all_products["product_name"] == product].copy()

        # Ensure enough data points
        if len(product_data) < 10:
            # Not enough data → generate synthetic variation
            base_price = float(product_data["price"].mean()) if not product_data["price"].isnull().all() else np.random.uniform(500, 5000)
            future_dates = [start_date + timedelta(days=i+1) for i in range(n_forecast_days)]
            forecast_list = [
                {
                    "date": d.strftime("%Y-%m-%d"),
                    "forecast_price": round(base_price * np.random.uniform(0.95, 1.10), 2),
                    "forecast_demand": int(np.random.uniform(100, 500))
                } for d in future_dates
            ]
            forecast_data.append({"product_name": product, "forecast": forecast_list})
            continue

        # Sort by date and scale
        product_data = product_data.sort_values("date")
        prices = product_data["price"].values.reshape(-1, 1)
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_prices = scaler.fit_transform(prices)

        # Create LSTM sequences
        X, y = [], []
        window = 5  # last 5 days to predict next
        for i in range(window, len(scaled_prices)):
            X.append(scaled_prices[i-window:i, 0])
            y.append(scaled_prices[i, 0])
        X, y = np.array(X), np.array(y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))

        # Build LSTM model
        model = Sequential([
            LSTM(64, return_sequences=False, input_shape=(X.shape[1], 1)),
            Dropout(0.2),
            Dense(1)
        ])
        model.compile(optimizer="adam", loss="mse")

        # Train briefly (for demo, keep epochs low)
        model.fit(X, y, epochs=10, batch_size=8, verbose=0)

        # Predict future n days
        last_sequence = scaled_prices[-window:]
        predictions = []
        for _ in range(n_forecast_days):
            input_seq = np.reshape(last_sequence, (1, window, 1))
            pred = model.predict(input_seq, verbose=0)
            predictions.append(pred[0, 0])
            last_sequence = np.vstack((last_sequence[1:], pred))

        forecast_prices = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()

        # Combine into forecast list
        forecast_list = []
        for i, price in enumerate(forecast_prices):
            forecast_list.append({
                "date": (start_date + timedelta(days=i+1)).strftime("%Y-%m-%d"),
                "forecast_price": round(float(price), 2),
                "forecast_demand": int(np.random.uniform(100, 500))
            })

        forecast_data.append({
            "product_name": product,
            "forecast": forecast_list
        })

    return {
        "total_products": len(forecast_data),
        "data": forecast_data
    }


class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2, output_size=1):
        super(LSTMModel, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out


# -------------------------------
# Forecast Function
# -------------------------------
def lstm_forecast(data_series, last_date=None, n_future=365):
    """
    data_series: Pandas Series (numeric values like price or rating)
    last_date: datetime of the most recent record (optional)
    n_future: number of days to forecast
    """
    data_series = data_series.dropna()

    # Handle small data series
    if len(data_series) < 15:
        avg_value = data_series.mean()
        if last_date is None:
            last_date = datetime.today()
        future_dates = [(last_date + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(n_future)]
        return {
            "forecast": [float(avg_value)] * n_future,
            "dates": future_dates,
            "note": "Insufficient data for LSTM, used average value"
        }

    # Normalize data
    data = data_series.values.reshape(-1, 1)
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)

    X, y = [], []
    time_steps = 10
    for i in range(len(data_scaled) - time_steps):
        X.append(data_scaled[i:i + time_steps])
        y.append(data_scaled[i + time_steps])
    X, y = np.array(X), np.array(y)

    X_t = torch.tensor(X, dtype=torch.float32)
    y_t = torch.tensor(y, dtype=torch.float32)

    model = LSTMModel()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    # Train model
    for _ in range(50):
        optimizer.zero_grad()
        output = model(X_t)
        loss = criterion(output, y_t)
        loss.backward()
        optimizer.step()

    # Predict future
    last_seq = X[-1:]
    future_preds = []
    model.eval()
    for _ in range(n_future):
        pred = model(torch.tensor(last_seq, dtype=torch.float32))
        future_preds.append(pred.item())
        new_seq = np.append(last_seq[:, 1:, :], [[pred.item()]], axis=1)
        last_seq = new_seq

    # Reverse normalization
    future_preds = scaler.inverse_transform(np.array(future_preds).reshape(-1, 1)).flatten()

    # Generate future dates
    if last_date is None:
        last_date = datetime.today()
    future_dates = [(last_date + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(n_future)]

    return {"forecast": future_preds.tolist(), "dates": future_dates, "note": "LSTM forecast successful"}


def create_tracker_analysis(db: Session, user_email: Optional[str], analysis_data: dict):
    """
    Create a new product tracker analysis record
    
    Args:
        db: Database session
        user_email: User's email (can be None for anonymous)
        analysis_data: Analysis data dict
    
    Returns:
        ProductTrackerAnalysis object
    """
    try:
        # Parse sales range
        sales_range = analysis_data.get('sales', {}).get('estimated_monthly_sales', '0 - 0')
        sales_parts = sales_range.replace(',', '').split(' - ')
        sales_min = int(sales_parts[0]) if len(sales_parts) > 0 else 0
        sales_max = int(sales_parts[1]) if len(sales_parts) > 1 else 0
        
        # Extract competition data
        competition = analysis_data.get('competition', {})
        top_comp = competition.get('top_competitor', {})
        
        # ✅ Create the analysis record
        new_analysis = models.ProductTrackerAnalysis(
            user_email=user_email,  # ✅ CRITICAL: This can be None
            product_name=analysis_data.get('product_name'),
            category=analysis_data.get('category'),
            source=analysis_data.get('source'),
            base_cost=analysis_data.get('base_cost'),
            
            # Pricing data
            recommended_price=analysis_data.get('pricing', {}).get('recommended_price'),
            min_price=analysis_data.get('pricing', {}).get('min_price'),
            max_price=analysis_data.get('pricing', {}).get('max_price'),
            profit_margin=analysis_data.get('pricing', {}).get('profit_margin'),
            pricing_confidence=analysis_data.get('pricing', {}).get('confidence'),
            
            # Sales data
            estimated_monthly_sales_min=sales_min,
            estimated_monthly_sales_max=sales_max,
            estimated_daily_sales=analysis_data.get('sales', {}).get('estimated_daily_sales'),
            market_demand=analysis_data.get('sales', {}).get('market_demand'),
            
            # Competition data
            total_competitors=competition.get('total_competitors'),
            avg_competitor_price=competition.get('avg_competitor_price'),
            avg_competitor_rating=competition.get('avg_competitor_rating'),
            top_competitor_name=top_comp.get('name') if top_comp else None,
            top_competitor_price=top_comp.get('price') if top_comp else None,
            
            # Location insights (JSON)
            location_insights=analysis_data.get('location_insights'),
            
            # Strategy and warnings
            ai_strategy=analysis_data.get('ai_strategy'),
            warnings=analysis_data.get('warnings'),
            
            # Metadata
            similar_products_count=len(analysis_data.get('similar_products', [])),
            analysis_success=analysis_data.get('success', True)
        )
        
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        
        print(f"✅ Saved analysis ID {new_analysis.id} for user: {user_email if user_email else 'Anonymous'}")
        return new_analysis
        
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to save analysis: {str(e)}")
        raise e


def get_user_tracker_history(db: Session, user_email: str, limit: int = 20, offset: int = 0):
    """
    Get analysis history for a specific user
    
    Args:
        db: Database session
        user_email: User's email
        limit: Number of results to return
        offset: Pagination offset
    
    Returns:
        List of ProductTrackerAnalysis objects
    """
    return db.query(models.ProductTrackerAnalysis)\
        .filter(models.ProductTrackerAnalysis.user_email == user_email)\
        .order_by(models.ProductTrackerAnalysis.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()


def get_tracker_analysis_by_id(db: Session, analysis_id: int):
    """
    Get a single analysis by ID
    
    Args:
        db: Database session
        analysis_id: Analysis ID
    
    Returns:
        ProductTrackerAnalysis object or None
    """
    return db.query(models.ProductTrackerAnalysis)\
        .filter(models.ProductTrackerAnalysis.id == analysis_id)\
        .first()


def delete_tracker_analysis(db: Session, analysis_id: int, user_email: str) -> bool:
    """
    Delete an analysis (only if it belongs to the user)
    
    Args:
        db: Database session
        analysis_id: Analysis ID
        user_email: User's email for verification
    
    Returns:
        True if deleted, False otherwise
    """
    try:
        analysis = db.query(models.ProductTrackerAnalysis)\
            .filter(
                models.ProductTrackerAnalysis.id == analysis_id,
                models.ProductTrackerAnalysis.user_email == user_email
            )\
            .first()
        
        if analysis:
            db.delete(analysis)
            db.commit()
            return True
        return False
        
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to delete analysis: {str(e)}")
        return False


def get_popular_categories(db: Session, limit: int = 10):
    """
    Get most analyzed categories
    
    Args:
        db: Database session
        limit: Number of categories to return
    
    Returns:
        List of (category, count) tuples
    """
    from sqlalchemy import func
    
    results = db.query(
        models.ProductTrackerAnalysis.category,
        func.count(models.ProductTrackerAnalysis.id).label('count')
    )\
    .group_by(models.ProductTrackerAnalysis.category)\
    .order_by(func.count(models.ProductTrackerAnalysis.id).desc())\
    .limit(limit)\
    .all()
    
    return [{"category": r.category, "count": r.count} for r in results]


def get_user_analysis_count(db: Session, user_email: str) -> int:
    """
    Get total number of analyses for a user
    
    Args:
        db: Database session
        user_email: User's email
    
    Returns:
        Count of analyses
    """
    return db.query(models.ProductTrackerAnalysis)\
        .filter(models.ProductTrackerAnalysis.user_email == user_email)\
        .count()