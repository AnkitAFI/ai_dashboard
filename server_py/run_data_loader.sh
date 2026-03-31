#!/bin/bash
cd /root/Dashboard/server_py
source /root/Dashboard/server_py/venv/bin/activate
python /root/Dashboard/server_py/rapidapi_amazon_collector.py >> /root/Dashboard/server_py/data_loader.log 2>&1
