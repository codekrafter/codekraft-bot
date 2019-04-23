#!/bin/bash

sleep 5  # Wait for App to Shutdown

echo ""
echo "Updating..."

git pull

echo "Updated, starting bot"

/bin/bash ./startup.sh