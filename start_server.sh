#!/bin/bash

# Define the port
PORT=3000

echo "Starting Philmont Guidebook Server..."
echo "Open your browser to: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server."

# Run Python HTTP server on the specified port
# This runs in the foreground, so Ctrl+C will terminate it immediately.
python3 -m http.server $PORT
