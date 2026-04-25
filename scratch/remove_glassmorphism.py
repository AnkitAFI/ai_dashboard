import os
import re

patterns = [
    (r'bg-white/70\s+backdrop-blur-md', 'bg-background opacity-100 backdrop-blur-none'),
    (r'bg-white/80\s+backdrop-blur-md', 'bg-background opacity-100 backdrop-blur-none'),
    (r'bg-white/70\s+backdrop-blur-xl', 'bg-background opacity-100 backdrop-blur-none'),
    (r'bg-white/80\s+backdrop-blur-xl', 'bg-background opacity-100 backdrop-blur-none'),
    (r'bg-white/90\s+backdrop-blur-md', 'bg-background opacity-100 backdrop-blur-none'),
    (r'backdrop-blur-md\s+bg-white/70', 'bg-background opacity-100 backdrop-blur-none'),
    (r'backdrop-blur-md\s+bg-white/80', 'bg-background opacity-100 backdrop-blur-none'),
    (r'backdrop-blur-xl\s+bg-white/70', 'bg-background opacity-100 backdrop-blur-none'),
    (r'backdrop-blur-xl\s+bg-white/80', 'bg-background opacity-100 backdrop-blur-none'),
    (r'backdrop-blur-md', 'backdrop-blur-none'),
    (r'backdrop-blur-xl', 'backdrop-blur-none'),
    (r'backdrop-blur-sm', 'backdrop-blur-none'),
    (r'backdrop-blur-lg', 'backdrop-blur-none'),
    (r'bg-white/70', 'bg-background'),
    (r'bg-white/80', 'bg-background'),
    (r'bg-white/90', 'bg-background'),
    (r'bg-white/50', 'bg-background'),
    (r'bg-white/85', 'bg-background'),
    (r'bg-white/88', 'bg-background'),
    (r'bg-white/10\s+backdrop-blur-md', 'bg-slate-900 opacity-100 backdrop-blur-none'),
]

app_dir = r'c:\Users\AFI-01-Yatharth\Desktop\dash_2\ai_dashboard\app'

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, replacement in patterns:
                new_content = re.sub(pattern, replacement, new_content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")
