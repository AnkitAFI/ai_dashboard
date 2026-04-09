import os

def migrate_monolith():
    input_file = "c:\\Users\\afidi\\Desktop\\dash_1\\ai_dashboard\\server_py\\Fastapi_main.py"
    output_file = "c:\\Users\\afidi\\Desktop\\dash_1\\ai_dashboard\\server_py\\app\\api\\routes\\legacy_router.py"
    
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()

    # We patch `FastAPI` instance creations if they exist.
    # The file has: `app = FastAPI(...)`
    # We'll prepend imports for APIRouter
    new_content = "from fastapi import APIRouter\nrouter = APIRouter()\n# Legacy endpoints preserved below\n"
    
    # We'll go line by line for precise replacements to avoid breaking strings
    lines = content.split('\n')
    patched_lines = []
    import re

    for line in lines:
        if line.startswith("app = FastAPI"):
            patched_lines.append("# app = FastAPI()  # Migrated to main.py")
        elif line.startswith("app.add_middleware(CORSMiddleware"):
            patched_lines.append("# app.add_middleware(CORSMiddleware...  # Migrated to main.py")
        elif line.startswith("@app."):
            patched_lines.append(line.replace("@app.", "@router.", 1))
        elif line.startswith("app.include_router("):
            patched_lines.append("# " + line + " # Migrated to main.py")
        elif "uvicorn.run(" in line:
            patched_lines.append("# " + line + " # Handled in main.py")
        else:
            patched_lines.append(line)
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(new_content)
        f.write('\n'.join(patched_lines))
        
    print("Successfully converted monolith to legacy_router.py!")

migrate_monolith()
