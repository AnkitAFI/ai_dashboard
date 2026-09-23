import os
import time
import re
import requests
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import require_enterprise_tier

router = APIRouter()

class AsinMopInput(BaseModel):
    asin: str
    standard_mop: float

class MapCheckRequest(BaseModel):
    asins: List[AsinMopInput]

def extract_numeric(val) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    num_str = re.sub(r'[^\d.]', '', str(val))
    try:
        return float(num_str) if num_str else 0.0
    except (ValueError, TypeError):
        return 0.0

@router.post("/check")
def check_map_violations(
    payload: MapCheckRequest,
    current_user = Depends(require_enterprise_tier)
):
    if len(payload.asins) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 ASINs allowed per check to conserve API limits."
        )

    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    if not rapidapi_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="RapidAPI key not configured."
        )

    rapidapi_host = os.environ.get("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
    url = f"https://{rapidapi_host}/product-offers"
    
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": rapidapi_host,
    }

    results = []

    for item in payload.asins:
        try:
            resp = requests.get(
                url,
                headers=headers,
                params={
                    "asin": item.asin,
                    "country": "IN",
                    "limit": 100,
                    "product_condition": "NEW"
                },
                timeout=20
            )
            resp.raise_for_status()
            data = resp.json()

            if data.get("status") != "OK":
                results.append({
                    "asin": item.asin,
                    "standard_mop": item.standard_mop,
                    "product_title": "Error fetching data",
                    "sellers_found": 0,
                    "sellers": []
                })
                continue

            response_data = data.get("data", {})
            product_title = response_data.get("product_title", "Unknown Product")
            offers = response_data.get("product_offers", [])
            
            seller_list = []
            for offer in offers:
                seller_name = offer.get("seller", "Unknown Seller")
                seller_id = offer.get("seller_id", "")
                raw_price = offer.get("product_price", "0")
                
                parsed_price = extract_numeric(raw_price)
                
                status_str = "OK"
                if parsed_price < item.standard_mop:
                    status_str = "VIOLATION"
                elif parsed_price > item.standard_mop:
                    status_str = "ABOVE_MOP"

                seller_list.append({
                    "seller_name": seller_name,
                    "seller_id": seller_id,
                    "price": parsed_price,
                    "status": status_str
                })

            results.append({
                "asin": item.asin,
                "standard_mop": item.standard_mop,
                "product_title": product_title,
                "sellers_found": len(seller_list),
                "sellers": seller_list
            })
            
            # Sleep briefly to avoid hitting rate limits
            time.sleep(1)

        except Exception as e:
            results.append({
                "asin": item.asin,
                "standard_mop": item.standard_mop,
                "product_title": f"API Error: {str(e)}",
                "sellers_found": 0,
                "sellers": []
            })
            time.sleep(1)

    return {"results": results}
