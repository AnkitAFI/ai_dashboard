from app.db.session import engine
from sqlalchemy import text
from app.db_setup import _USERS_VIEW_SQL, _INSERT_TRIGGER_FN_SQL, _INSERT_TRIGGER_SQL, _UPDATE_TRIGGER_FN_SQL, _UPDATE_TRIGGER_SQL, _DELETE_TRIGGER_FN_SQL, _DELETE_TRIGGER_SQL

with engine.begin() as conn:
    print("Dropping ghost table...")
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
    
    print("Creating view...")
    conn.execute(text(_USERS_VIEW_SQL))
    
    print("Creating triggers...")
    conn.execute(text(_INSERT_TRIGGER_FN_SQL))
    conn.execute(text(_INSERT_TRIGGER_SQL))
    conn.execute(text(_UPDATE_TRIGGER_FN_SQL))
    conn.execute(text(_UPDATE_TRIGGER_SQL))
    conn.execute(text(_DELETE_TRIGGER_FN_SQL))
    conn.execute(text(_DELETE_TRIGGER_SQL))

print("✅ EMERGENCY FIX COMPLETE! View and triggers are fully installed.")
