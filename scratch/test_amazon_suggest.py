import httpx
import urllib.parse

keywords = ["face serum", "water bottle", "wireless headphones"]
mids = {
    "US": "ATVPDKIKX0DER",
    "IN": "A21TJRUUN4KGV"
}

for kw in keywords:
    encoded_prefix = urllib.parse.quote(kw)
    print(f"\nKeyword: {kw}")
    for region, mid in mids.items():
        url = f"https://completion.amazon.com/api/2017/suggestions?limit=10&prefix={encoded_prefix}&mid={mid}&alias=aps"
        try:
            resp = httpx.get(url, headers={"User-Agent": "Mozilla/5.0"})
            data = resp.json()
            suggestions = [s["value"] for s in data.get("suggestions", [])]
            print(f"  {region} mid: found {len(suggestions)} suggestions: {suggestions[:3]}...")
        except Exception as e:
            print(f"  {region} error: {e}")
