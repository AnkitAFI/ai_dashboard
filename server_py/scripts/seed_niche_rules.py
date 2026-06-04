import os
import sys

# Set python path to server_py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.legacy_models import NicheResearchRule

INITIAL_RULES = [
    {
        "query_keyword": "phone",
        "synonyms": ["smartphone", "mobile"],
        "price_floor": 5000.00,
        "accessory_exclusions": [
            "phone", "mobile", "smartphone", "battery", "batteries", "cover", "covers", "screen", "screens",
            "speaker", "speakers", "plug", "plugs", "pack", "packs"
        ]
    },
    {
        "query_keyword": "mobile",
        "synonyms": ["smartphone", "phone"],
        "price_floor": 5000.00,
        "accessory_exclusions": [
            "phone", "mobile", "smartphone", "battery", "batteries", "cover", "covers", "screen", "screens",
            "speaker", "speakers", "plug", "plugs", "pack", "packs"
        ]
    },
    {
        "query_keyword": "smartphone",
        "synonyms": ["phone", "mobile"],
        "price_floor": 5000.00,
        "accessory_exclusions": [
            "phone", "mobile", "smartphone", "battery", "batteries", "cover", "covers", "screen", "screens",
            "speaker", "speakers", "plug", "plugs", "pack", "packs"
        ]
    },
    {
        "query_keyword": "laptop",
        "synonyms": ["notebook"],
        "price_floor": 15000.00,
        "accessory_exclusions": [
            "laptop", "notebook", "computer", "ssd", "ssds", "hdd", "hdds", "ram", "rams", "memory", "memories",
            "screen", "screens", "webcam", "webcams", "speaker", "speakers", "microphone", "microphones", "battery", "batteries"
        ]
    },
    {
        "query_keyword": "notebook",
        "synonyms": ["laptop"],
        "price_floor": 12000.00,
        "accessory_exclusions": [
            "laptop", "notebook", "computer", "ssd", "ssds", "hdd", "hdds", "ram", "rams", "memory", "memories",
            "screen", "screens", "webcam", "webcams", "speaker", "speakers", "microphone", "microphones", "battery", "batteries"
        ]
    },
    {
        "query_keyword": "camera",
        "synonyms": ["dslr", "mirrorless"],
        "price_floor": 8000.00,
        "accessory_exclusions": [
            "camera", "lens", "lenses", "strap", "straps", "filter", "filters", "tripod", "tripods"
        ]
    },
    {
        "query_keyword": "smartwatch",
        "synonyms": ["watch"],
        "price_floor": 3000.00,
        "accessory_exclusions": [
            "watch", "strap", "straps", "band", "bands", "cover", "covers", "screen", "screens"
        ]
    },
    {
        "query_keyword": "tablet",
        "synonyms": ["ipad"],
        "price_floor": 5000.00,
        "accessory_exclusions": [
            "tablet", "ipad", "screen", "screens", "cover", "covers", "case", "cases"
        ]
    },
    {
        "query_keyword": "speaker",
        "synonyms": ["bluetooth speaker", "portable speaker"],
        "price_floor": 500.00,
        "accessory_exclusions": [
            "speaker", "speakers"
        ]
    },
    {
        "query_keyword": "headphones",
        "synonyms": ["earphones", "earbuds", "headset"],
        "price_floor": 500.00,
        "accessory_exclusions": [
            "headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "case", "cases"
        ]
    }
]

def seed_rules():
    db: Session = SessionLocal()
    try:
        print("Seeding initial rules into niche_research_rules...")
        for rule_data in INITIAL_RULES:
            # Check if keyword already exists
            existing = db.query(NicheResearchRule).filter(
                NicheResearchRule.query_keyword == rule_data["query_keyword"]
            ).first()
            
            if existing:
                print(f"  Keyword '{rule_data['query_keyword']}' already exists, updating values...")
                existing.synonyms = rule_data["synonyms"]
                existing.price_floor = rule_data["price_floor"]
                existing.accessory_exclusions = rule_data["accessory_exclusions"]
            else:
                print(f"  Inserting new keyword '{rule_data['query_keyword']}'...")
                db.add(NicheResearchRule(**rule_data))
                
        db.commit()
        print("Seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding rules: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_rules()
