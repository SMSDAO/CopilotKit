#!/bin/bash
# Status script for Social OS - Shows status of all services

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📊 Social OS Status${NC}"
echo ""

# Check database
echo "Database:"
if docker-compose ps postgres | grep -q "Up"; then
  echo -e "  ${GREEN}✓ Running${NC} (http://localhost:5432)"
else
  echo -e "  ${RED}✗ Stopped${NC}"
fi
echo ""

# Check agent
echo "Agent:"
if [ -f "logs/agent.pid" ]; then
  AGENT_PID=$(cat logs/agent.pid)
  if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Running${NC} (PID: $AGENT_PID, http://localhost:8123)"
  else
    echo -e "  ${RED}✗ Stopped${NC} (stale PID file)"
    rm logs/agent.pid
  fi
else
  echo -e "  ${RED}✗ Stopped${NC}"
fi
echo ""

# Check UI
echo "UI:"
if [ -f "logs/ui.pid" ]; then
  UI_PID=$(cat logs/ui.pid)
  if ps -p $UI_PID > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Running${NC} (PID: $UI_PID, http://localhost:3000)"
  else
    echo -e "  ${RED}✗ Stopped${NC} (stale PID file)"
    rm logs/ui.pid
  fi
else
  echo -e "  ${RED}✗ Stopped${NC}"
fi
echo ""

# Show recent logs
echo "Recent logs (last 5 lines):"
echo ""
if [ -f "logs/agent.log" ]; then
  echo "Agent:"
  tail -5 logs/agent.log | sed 's/^/  /'
  echo ""
fi

if [ -f "logs/ui.log" ]; then
  echo "UI:"
  tail -5 logs/ui.log | sed 's/^/  /'
  echo ""
fi

echo "For full logs, run:"
echo "  tail -f logs/agent.log  # Agent logs"
echo "  tail -f logs/ui.log     # UI logs"
echo ""
