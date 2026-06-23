import os

filepath = r'c:\Users\AFI-01-Yatharth\Desktop\dash_2\ai_dashboard\server_py\app\api\v1\routes\payment_order_router.py'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "def get_ist_now():" not in content:
    content = content.replace('datetime.now()', 'get_ist_now()')
    
    import_str = "from datetime import datetime, timedelta\n"
    replacement = import_str + "\ndef get_ist_now():\n    return datetime.utcnow() + timedelta(hours=5, minutes=30)\n"
    
    content = content.replace(import_str, replacement, 1)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated payment_order_router.py to use IST globally.")
else:
    print("Already updated.")
