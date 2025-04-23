#!/bin/bash

# Set the project root directory
PROJECT_ROOT="/Users/nirmalsudhir/Documents/real-estate-agenticai"

# Change to project root
cd "$PROJECT_ROOT"

# Set PYTHONPATH
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

# Run the server
uvicorn backend.app:app --reload 