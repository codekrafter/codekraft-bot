#!/bin/bash

sleep 5  # Wait for App to Shutdown

echo "Updating..."

git pull

echo "Updated, starting bot"

touch updating_restarting

node ./bot.js