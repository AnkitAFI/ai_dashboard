# Makefile for FastAPI Dashboard

# Environment variables
PYTHON=python3
UVICORN=uvicorn
APP_MODULE=server_py.Fastapi_main:app
HOST=0.0.0.0
PORT=9002

.PHONY: run clean freeze

# Run the FastAPI app with reload enabled
run:
	$(UVICORN) $(APP_MODULE) --host $(HOST) --port $(PORT) --workers 4

# Remove __pycache__ and pyc files
clean:
	find . -type d -name '__pycache__' -exec rm -r {} +
	find . -type f -name '*.pyc' -delete

# Freeze current environment into requirements.txt
freeze:
	uv pip freeze > requirements.txt

start:
	pm2 start uvicorn --name "fastapi-app" -- server_py.Fastapi_main:app --host 0.0.0.0 --port 9002 --workers 4

pm2-stop:
	pm2 stop fastapi-app

pm2-restart:
	pm2 restart fastapi-app

pm2-logs:
	pm2 logs fastapi-app
