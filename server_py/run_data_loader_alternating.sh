#!/bin/bash

# Calculate the exact number of days since the UNIX epoch (UTC)
DAYS_SINCE_EPOCH=$(( $(date +%s) / 86400 ))

# Check if the day is an even or odd number (modulo 2)
if [ $(( DAYS_SINCE_EPOCH % 2 )) -eq 0 ]; then
    echo "$(date): Alternating day - Skipping the 2nd run today."
    exit 0
fi

# If we reached here, it's the run day. Execute the main script!
echo "$(date): Alternating day - Executing the 2nd run today."

# Determine absolute path to the main script dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/run_data_loader.sh"
