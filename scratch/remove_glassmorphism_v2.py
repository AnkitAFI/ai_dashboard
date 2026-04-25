import os
import re

# More aggressive patterns to catch custom tailwind blurs like backdrop-blur-[3px]
patterns = [
    (r'backdrop-blur-[^\s"\'}]+', 'backdrop-blur-none'),
    (r'bg-white/\d+', 'bg-background opacity-100'),
    (r'bg-black/50', 'bg-slate-900/80'), # Keep some overlay for modals but make it darker/solid-ish
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
