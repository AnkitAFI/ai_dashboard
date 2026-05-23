import hashlib

def get_trend(keyword, search_volume=100000):
    kw_lower = keyword.lower().strip()
    h = int(hashlib.md5(kw_lower.encode()).hexdigest(), 16)
    kw_words_set = set(kw_lower.split())
    
    # Seasonality triggers
    summer_triggers = {"sunscreen", "sunscream", "ac", "cooler", "coolers", "refrigerator", "fridge", "ice", "lemonade", "sunglasses", "swimwear", "cotton"}
    monsoon_triggers = {"umbrella", "umbrellas", "raincoat", "raincoats", "tea", "coffee"}
    winter_triggers = {"heater", "heaters", "geyser", "geysers", "woolen", "sweater", "sweaters", "jacket", "jackets", "socks", "blanket", "blankets"}
    bottle_triggers = {"bottle", "bottles"}
    cosmetics_triggers = {"serum", "cream", "shampoo", "wash", "oil", "hair", "lipstick", "moisturizer", "conditioner", "skincare", "beauty", "lotion", "gel", "face"}
    electronics_triggers = {"speaker", "speakers", "headphone", "headphones", "earbud", "earbuds", "earphone", "earphones", "charger", "charging", "watch", "smartwatch", "mouse", "keyboard", "mobile", "phone", "laptop", "soundbar", "powerbank", "cable", "adapter", "dryer", "hairdryer", "trimmer", "iron"}
    backpack_triggers = {"bag", "bags", "backpack", "backpacks"}

    # Month names in order: Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May
    month_names = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"]

    if kw_words_set & summer_triggers:
        cat_name = "Summer Peak"
        base_seasonal = [1.2, 0.9, 0.6, 0.5, 0.4, 0.3, 0.3, 0.4, 0.8, 1.5, 1.8, 1.6]
    elif kw_words_set & monsoon_triggers:
        cat_name = "Monsoon Peak"
        base_seasonal = [1.8, 2.0, 1.5, 0.9, 0.5, 0.4, 0.3, 0.3, 0.4, 0.5, 0.7, 1.0]
    elif kw_words_set & winter_triggers:
        cat_name = "Winter Peak"
        base_seasonal = [0.3, 0.2, 0.2, 0.3, 0.5, 1.2, 1.8, 2.0, 1.5, 0.8, 0.5, 0.4]
    elif kw_words_set & bottle_triggers:
        cat_name = "Bottle Summer Peak"
        base_seasonal = [1.3, 1.1, 0.9, 0.8, 0.7, 0.7, 0.7, 0.8, 0.9, 1.1, 1.4, 1.3]
    elif kw_words_set & electronics_triggers:
        cat_name = "Electronics Festival Peak"
        base_seasonal = [0.9, 0.85, 1.0, 0.95, 1.3, 1.25, 0.9, 1.05, 0.95, 1.0, 1.1, 1.0]
    elif kw_words_set & backpack_triggers:
        cat_name = "Backpack Reopening Peak"
        base_seasonal = [1.4, 1.3, 1.0, 0.9, 0.9, 0.8, 0.8, 0.85, 0.9, 1.0, 1.1, 1.0]
    elif kw_words_set & cosmetics_triggers:
        cat_name = "Stable Cosmetics"
        base_seasonal = [0.95, 0.95, 0.98, 1.0, 1.0, 0.98, 0.97, 0.98, 1.0, 1.05, 1.05, 1.0]
    else:
        cat_name = "General E-commerce"
        base_seasonal = [0.9, 0.9, 1.0, 0.95, 1.25, 1.2, 1.05, 1.0, 1.0, 1.05, 1.1, 0.95]

    trend = []
    for month_idx in range(12):
        jitter = 0.95 + ((h + month_idx) % 11) * 0.01
        monthly_vol = int(search_volume * base_seasonal[month_idx] * jitter)
        monthly_vol = max(100, (monthly_vol // 50) * 50)
        trend.append((month_names[month_idx], monthly_vol))
        
    print(f"\n'{keyword}' matched '{cat_name}' trend:")
    # Print the values for critical months
    for month, vol in trend:
        print(f"  {month}: {vol}")

for kw in ["sunscreen", "room heater", "umbrella", "wireless headphones", "water bottle", "face serum"]:
    get_trend(kw)
