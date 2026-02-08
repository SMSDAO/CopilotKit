#!/bin/bash
# Start script for Social OS - Runs all services in the background

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Social OS Platform${NC}"
echo ""

# Check if required commands exist
command -v docker-compose >/dev/null 2>&1 || { echo "❌ docker-compose is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Run: npm install -g pnpm" >&2; exit 1; }

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Start database
echo -e "${BLUE}📦 Starting PostgreSQL database...${NC}"
docker-compose up -d postgres
echo -e "${GREEN}✓ Database started${NC}"
echo ""

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 5
until docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
  echo "Waiting for database..."
  sleep 2
done
echo -e "${GREEN}✓ Database is ready${NC}"
echo ""

# Step 2: Check if migrations need to be run
echo -e "${BLUE}📊 Checking database migrations...${NC}"
# The migrations are automatically run by docker-compose via docker-entrypoint-initdb.d
echo -e "${GREEN}✓ Database migrations applied${NC}"
echo ""

# Step 3: Start agent in background
echo -e "${BLUE}🤖 Starting AI Agent backend...${NC}"
cd agent
if [ ! -d "node_modules" ]; then
  echo "Installing agent dependencies..."
  pnpm install >/dev/null 2>&1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  Warning: agent/.env file not found. Copying from .env.example${NC}"
  cp .env.example .env
  echo -e "${YELLOW}   Please edit agent/.env and add your OPENAI_API_KEY${NC}"
fi

# Start agent in background
nohup pnpm dev > ../logs/agent.log 2>&1 &
AGENT_PID=$!
echo $AGENT_PID > ../logs/agent.pid
echo -e "${GREEN}✓ Agent started (PID: $AGENT_PID)${NC}"
cd ..
echo ""

# Step 4: Start UI in background
echo -e "${BLUE}🎨 Starting UI frontend...${NC}"
cd ui
if [ ! -d "node_modules" ]; then
  echo "Installing UI dependencies..."
  pnpm install >/dev/null 2>&1
fi

# Check if .env.local file exists
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠️  Warning: ui/.env.local file not found. Copying from .env.example${NC}"
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
  fi
  echo -e "${YELLOW}   Please edit ui/.env.local and add your OPENAI_API_KEY${NC}"
fi

# Start UI in background
nohup pnpm dev > ../logs/ui.log 2>&1 &
UI_PID=$!
echo $UI_PID > ../logs/ui.pid
echo -e "${GREEN}✓ UI started (PID: $UI_PID)${NC}"
cd ..
echo ""

# Wait a moment for services to initialize
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"
sleep 5
echo ""

# Display status
echo -e "${GREEN}🎉 Social OS is now running!${NC}"
echo ""
echo "Services:"
echo -e "  ${BLUE}•${NC} Database:  http://localhost:5432"
echo -e "  ${BLUE}•${NC} Agent:     http://localhost:8123"
echo -e "  ${BLUE}•${NC} UI:        http://localhost:3000"
echo -e "  ${BLUE}•${NC} Admin:     http://localhost:3000/admin"
echo ""
echo "Log files:"
echo "  • Agent: logs/agent.log"
echo "  • UI:    logs/ui.log"
echo ""
echo "To stop all services, run:"
echo "  ./stop.sh"
echo ""
echo "To view logs, run:"
echo "  tail -f logs/agent.log  # Agent logs"
echo "  tail -f logs/ui.log     # UI logs"
echo ""
echo -e "${YELLOW}⚠️  Important: Make sure to configure your environment files:${NC}"
echo "  • agent/.env - Add your OPENAI_API_KEY"
echo "  • ui/.env.local - Add your OPENAI_API_KEY and DATABASE_URL"
echo ""
