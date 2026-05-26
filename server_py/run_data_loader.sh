#!/bin/bash

cd /home/root-insydz/ai_dashboard/server_py || exit

source /home/root-insydz/ai_dashboard/venv/bin/activate

python3 /home/root-insydz/ai_dashboard/server_py/scripts/rapidapi_amazon_collector.py >> /home/root-insydz/ai_dashboard/server_py/data_loader.log 2>&1