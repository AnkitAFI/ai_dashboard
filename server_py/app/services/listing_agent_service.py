import json
import logging
import re
from sqlalchemy.orm import Session
from app.models.listing_models import ProductListing
from app.services.ollama_service import (
    complete_ollama,
    build_amazon_listing_prompt,
    build_flipkart_listing_prompt,
    analyze_product_image_with_minicpm,
    build_attribute_extraction_prompt,
    build_aplus_content_prompt
)

logger = logging.getLogger(__name__)

def extract_json_from_llm(response_str: str) -> dict:
    """Safely extracts JSON from LLM output, handling markdown blocks, unescaped HTML, invalid escapes, or truncated outputs."""
    # Pre-process 1: Fix invalid JSON escapes like \' (e.g. L\'Oreal -> L'Oreal)
    processed_str = response_str.replace(r"\'", "'")
    
    # Pre-process 2: Fix unescaped HTML strings (e.g. "amazon_description": <p>... </p>,)
    processed_str = re.sub(r'(:\s*)(<[^>]+>.*?<\/[^>]+>)(,?\n)', r'\1"\2"\3', processed_str, flags=re.DOTALL)
    
    try:
        # First attempt: parse directly
        return json.loads(processed_str, strict=False)
    except json.JSONDecodeError:
        pass
        
    try:
        # Second attempt: try to find a complete JSON block
        match = re.search(r'\{.*\}', processed_str, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0), strict=False)
            except json.JSONDecodeError:
                pass
                
        # Third attempt: try to find a JSON block in markdown
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', processed_str, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1), strict=False)
            except json.JSONDecodeError:
                pass
                
        # Fourth attempt: Truncated output (starts with { but missing })
        match = re.search(r'\{.*', processed_str, re.DOTALL)
        if match:
            s = match.group(0).strip()
            if not s.endswith('}'):
                # Try appending just }
                try:
                    return json.loads(s + '}', strict=False)
                except json.JSONDecodeError:
                    pass
                # Try appending "}
                try:
                    return json.loads(s + '"}', strict=False)
                except json.JSONDecodeError:
                    pass
            
        raise ValueError("No valid JSON structure found.")
    except Exception as e:
        logger.error(f"Failed to parse LLM JSON. Error: {e}. Raw String: {response_str}")
        return {}

async def generate_listings_for_product(
    db: Session, 
    user_id: int, 
    raw_description: str,
    category: str = "General",
    image_url: str = None,
    image_base64_list: list[str] = None,
    use_hinglish: bool = False,
    verified_image_details: dict = None
) -> ProductListing:
    """
    Takes a raw product description (and optionally an image) and uses AI to generate 
    both Amazon and Flipkart listings, saving them to the database.
    """
    import json
    
    # 0. Vision AI Analysis (if image provided and not already verified)
    if verified_image_details:
        logger.info("Using human-verified image details, skipping MiniCPM-V analysis...")
        visual_desc = verified_image_details.get('visual_description', '')
        detected = verified_image_details.get('detected_attributes', {})
        human = verified_image_details.get('human_verified_attributes', {})
        
        formatted_verified = f"Visual Description: {visual_desc}\nDetected Attributes: {json.dumps(detected)}\nHuman-Verified Missing Attributes: {json.dumps(human)}"
        
        raw_description = f"=== ABSOLUTE SOURCE OF TRUTH (Human-Verified Image Analysis) ===\n{formatted_verified}\n\n=== UNVERIFIED USER INPUT (Merge ONLY if it does NOT contradict the image) ===\n{raw_description}"
    elif image_base64_list and len(image_base64_list) > 0:
        logger.info(f"Images provided ({len(image_base64_list)}), running Vision AI analysis with MiniCPM-V...")
        image_details = await analyze_product_image_with_minicpm(image_base64_list)
        if image_details:
            # Augment the user's raw description, strictly labeling the Image as the absolute truth
            # and the user's text as unverified input to prevent the LLM from merging contradictory terms.
            raw_description = f"=== ABSOLUTE SOURCE OF TRUTH (Visual AI Analysis) ===\n{image_details}\n\n=== UNVERIFIED USER INPUT (Merge ONLY if it does NOT contradict the image) ===\n{raw_description}"
            logger.info(f"Extracted image details: {image_details}")
            
    # 1. Generate Amazon Listing
    amazon_prompt = build_amazon_listing_prompt(raw_description, category, use_hinglish)
    amazon_response_str = await complete_ollama(amazon_prompt, temperature=0.0, top_p=0.1)
    
    amazon_data = extract_json_from_llm(amazon_response_str)
        
    # 2. Generate Flipkart Listing
    flipkart_prompt = build_flipkart_listing_prompt(raw_description, category, use_hinglish)
    flipkart_response_str = await complete_ollama(flipkart_prompt, temperature=0.0, top_p=0.1)
    
    flipkart_data = extract_json_from_llm(flipkart_response_str)
    
    # 3. Generate A+ Content (Premium)
    aplus_prompt = build_aplus_content_prompt(raw_description, category)
    aplus_response_str = await complete_ollama(aplus_prompt, temperature=0.0, top_p=0.1)
    
    aplus_data = extract_json_from_llm(aplus_response_str)

    # 4. Extract Attributes
    attr_prompt = build_attribute_extraction_prompt(raw_description)
    attr_response_str = await complete_ollama(attr_prompt, temperature=0.0, top_p=0.1)
    
    extracted_attributes = extract_json_from_llm(attr_response_str)

    logger.info(f"FINAL AMAZON DATA: {amazon_data}")
    logger.info(f"FINAL FLIPKART DATA: {flipkart_data}")
    logger.info(f"FINAL APLUS DATA: {aplus_data}")

    # 5. Save to Database
    new_listing = ProductListing(
        user_id=user_id,
        raw_description=raw_description,
        raw_image_url=image_url,
        extracted_attributes=extracted_attributes,
        
        amazon_title=amazon_data.get("amazon_title", ""),
        amazon_bullets=amazon_data.get("amazon_bullets", []),
        amazon_description=amazon_data.get("amazon_description", ""),
        amazon_search_terms=amazon_data.get("amazon_search_terms", ""),
        
        flipkart_title=flipkart_data.get("flipkart_title", ""),
        flipkart_description=flipkart_data.get("flipkart_description", ""),
        
        a_plus_content=aplus_data
    )
    
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    
    return new_listing
