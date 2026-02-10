#!/bin/bash
# Stop script for Social OS - Stops all running services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Social OS Platform${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Stop UI
if [ -f "logs/ui.pid" ]; then
  UI_PID=$(cat logs/ui.pid)
  echo -e "${BLUE}Stopping UI (PID: $UI_PID)...${NC}"
  kill $UI_PID 2>/dev/null || echo "UI process not found"
  rm logs/ui.pid
  echo -e "${GREEN}✓ UI stopped${NC}"
else
  echo "No UI PID file found"
fi
echo ""

# Stop Agent
if [ -f "logs/agent.pid" ]; then
  AGENT_PID=$(cat logs/agent.pid)
  echo -e "${BLUE}Stopping Agent (PID: $AGENT_PID)...${NC}"
  kill $AGENT_PID 2>/dev/null || echo "Agent process not found"
  rm logs/agent.pid
  echo -e "${GREEN}✓ Agent stopped${NC}"
else
  echo "No Agent PID file found"
fi
echo ""

# Stop database
echo -e "${BLUE}Stopping database...${NC}"
docker-compose down
echo -e "${GREEN}✓ Database stopped${NC}"
echo ""

echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
echo "To start services again, run:"
echo "  ./start.sh"
echo ""
