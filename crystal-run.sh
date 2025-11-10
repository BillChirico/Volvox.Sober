#!/bin/bash

# crystal-run.sh - Launch Volvox.Sober project with safe cleanup of existing instances
# Usage: ./crystal-run.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project name for process identification
PROJECT_NAME="volvox-sober"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Crystal Run - Volvox.Sober Launcher  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to kill processes safely
kill_processes() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name" 2>/dev/null || true)

    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Found running processes for: ${process_name}${NC}"
        echo "$pids" | while read pid; do
            if [ -n "$pid" ]; then
                echo -e "${YELLOW}  Killing PID: ${pid}${NC}"
                kill "$pid" 2>/dev/null || true
            fi
        done

        # Wait a moment for graceful shutdown
        sleep 1

        # Force kill if still running
        pids=$(pgrep -f "$process_name" 2>/dev/null || true)
        if [ -n "$pids" ]; then
            echo -e "${RED}  Force killing remaining processes...${NC}"
            echo "$pids" | while read pid; do
                if [ -n "$pid" ]; then
                    kill -9 "$pid" 2>/dev/null || true
                fi
            done
        fi

        echo -e "${GREEN}  ✓ Cleaned up processes${NC}"
    else
        echo -e "${GREEN}✓ No running processes found for: ${process_name}${NC}"
    fi
}

# Step 1: Kill Expo processes
echo -e "${BLUE}[1/5] Checking for running Expo processes...${NC}"
kill_processes "expo start"
kill_processes "expo-cli"

# Step 2: Kill Metro bundler
echo -e "${BLUE}[2/5] Checking for running Metro bundler...${NC}"
kill_processes "metro"
kill_processes "react-native start"

# Step 3: Kill any node processes in this directory
echo -e "${BLUE}[3/5] Checking for node processes in project directory...${NC}"
PROJECT_DIR=$(pwd)
node_pids=$(ps aux | grep node | grep "$PROJECT_DIR" | grep -v grep | awk '{print $2}' || true)

if [ -n "$node_pids" ]; then
    echo -e "${YELLOW}Found node processes in project directory${NC}"
    echo "$node_pids" | while read pid; do
        if [ -n "$pid" ]; then
            echo -e "${YELLOW}  Killing PID: ${pid}${NC}"
            kill "$pid" 2>/dev/null || true
        fi
    done
    sleep 1
    echo -e "${GREEN}  ✓ Cleaned up node processes${NC}"
else
    echo -e "${GREEN}✓ No node processes found in project directory${NC}"
fi

# Step 4: Clear watchman watches (if watchman is installed)
echo -e "${BLUE}[4/5] Clearing watchman watches...${NC}"
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || true
    echo -e "${GREEN}✓ Watchman watches cleared${NC}"
else
    echo -e "${YELLOW}⚠ Watchman not installed (optional)${NC}"
fi

# Step 5: Clear Metro bundler cache
echo -e "${BLUE}[5/5] Clearing Metro bundler cache...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm expo start --clear 2>/dev/null &
    EXPO_PID=$!
    sleep 2
    kill $EXPO_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Metro cache cleared${NC}"
else
    echo -e "${RED}✗ pnpm not found${NC}"
    exit 1
fi

# Final cleanup wait
sleep 1

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  All cleanup complete! Starting app...  ${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""

# Launch the app
echo -e "${BLUE}Launching Expo development server...${NC}"
echo ""

# Use pnpm to start the project
pnpm start

# Note: The script will continue running until the user stops it with Ctrl+C
