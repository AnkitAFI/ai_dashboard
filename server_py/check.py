
import sys
sys.path.append('C:/Users/AFI-01-Yatharth/Desktop/dash_2/ai_dashboard/server_py')
from app.db.session import engine
from sqlalchemy import text
conn = engine.connect()
res = conn.execute(text('SELECT column_name FROM information_schema.columns WHERE table_name=''users''')).fetchall()
print([r[0] for r in res])
conn.close()

