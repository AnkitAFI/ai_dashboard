#!/bin/bash
cd /home/tuxedo/Desktop/Dashboard/server_py
source /home/tuxedo/Desktop/Dashboard/server_py/venv/bin/activate
python /home/tuxedo/Desktop/Dashboard/server_py/rapidapi_amazon_collector.py >> /home/tuxedo/Desktop/Dashboard/server_py/data_loader.log 2>&1

