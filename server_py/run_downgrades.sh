#!/bin/bash

cd /home/root-insydz/ai_dashboard/server_py || exit

source /home/root-insydz/ai_dashboard/venv/bin/activate

python3 /home/root-insydz/ai_dashboard/server_py/scripts/downgrade_expired_subscriptions.py >> /home/root-insydz/ai_dashboard/server_py/downgrades.log 2>&1
