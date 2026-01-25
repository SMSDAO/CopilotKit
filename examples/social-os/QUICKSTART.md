# Quick Start Guide - AiCopilot Social OS

Get up and running with Social OS in under 10 minutes!

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **pnpm** package manager (`npm install -g pnpm`)
- **PostgreSQL 14+** installed ([Download](https://www.postgresql.org/download/))
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## 5-Minute Setup (Using Docker)

The fastest way to get started:

### Step 1: Start Database

```bash
cd examples/social-os
docker-compose up -d
```

This starts PostgreSQL with sample data.

### Step 2: Configure Environment

```bash
# In ui/ directory
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/social_os_dev
REMOTE_ACTION_URL=http://localhost:8123/copilotkit
```

```bash
# In agent/ directory
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Install Dependencies

```bash
# Install UI dependencies
cd ui
pnpm install

# Install agent dependencies
cd ../agent
pnpm install
```

### Step 4: Run the Application

Open two terminal windows:

**Terminal 1 - Start the Agent:**
```bash
cd agent
pnpm dev
```

**Terminal 2 - Start the Frontend:**
```bash
cd ui
pnpm dev
```

### Step 5: Open in Browser

Visit `http://localhost:3000` 🎉

## Manual Setup (Without Docker)

If you prefer to set up PostgreSQL manually:

### Step 1: Create Database

```bash
# Using PostgreSQL command line
createdb social_os_dev

# Or using psql
psql -U postgres
CREATE DATABASE social_os_dev;
\q
```

### Step 2: Run Migrations

```bash
cd examples/social-os
psql -d social_os_dev -f database/migrations/001_init_schema.sql
```

### Step 3: Follow Steps 2-5 from Docker Setup

## First Steps in the App

### 1. Explore Sample Users

The app comes with three pre-configured users:
- Alice Wonderland (@alice_wonder)
- Bob The Builder (@bob_builder)
- Charlie Tech (@charlie_tech)

Click on any user in the left sidebar to switch accounts.

### 2. Create Your First Post

1. Type in the "Create Post" box
2. Toggle between Public/Private
3. Click "Post"

### 3. Chat with Your AI Agent

1. Click the chat icon in the bottom-right
2. Try: "Help me write a post about AI"
3. Your personal agent will assist!

### 4. Explore AI Features

Try these commands with your agent:
- "Generate a post about technology"
- "Suggest some post ideas"
- "Help me create an image for my post"

## Development Workflow

### Project Structure

```
social-os/
├── ui/                      # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   └── lib/                # Utilities
├── agent/                  # LangGraph AI agent
│   └── src/               # Agent logic
└── database/              # Database schema
    └── migrations/        # SQL migrations
```

### Common Commands

```bash
# Frontend Development
cd ui
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run linter

# Agent Development
cd agent
pnpm dev          # Start agent server

# Database
docker-compose up -d              # Start database
docker-compose down               # Stop database
docker-compose logs -f postgres   # View database logs
```

### Making Changes

1. **Add a new component:**
   ```bash
   # Create in ui/components/
   ui/components/your-feature/YourComponent.tsx
   ```

2. **Add a new API route:**
   ```bash
   # Create in ui/app/api/
   ui/app/api/your-route/route.ts
   ```

3. **Extend the agent:**
   ```typescript
   // Edit agent/src/agent.ts
   // Add new tools or capabilities
   ```

4. **Update database:**
   ```bash
   # Create new migration
   database/migrations/002_your_changes.sql
   ```

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Or if running manually:
pg_isready -h localhost -p 5432
```

### Agent Not Responding

```bash
# Check if agent is running
curl http://localhost:8123/health

# Check logs
# In the agent terminal, you should see startup messages
```

### Build Errors

```bash
# Clear Next.js cache
cd ui
rm -rf .next
pnpm install

# Rebuild
pnpm build
```

### Port Already in Use

```bash
# If port 3000 is busy, use a different port:
cd ui
pnpm dev -- -p 3001

# If port 8123 is busy, edit agent/langgraph.json
```

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REMOTE_ACTION_URL` | Agent backend URL | Yes | http://localhost:8123/copilotkit |

### Agent (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |

## Next Steps

### Customize Your Experience

1. **Modify User Agent Personality:**
   - Edit `agent/src/agent.ts`
   - Adjust system prompts and personality traits

2. **Change UI Theme:**
   - Edit `ui/app/globals.css`
   - Customize Tailwind colors in `ui/tailwind.config.ts`

3. **Add New Features:**
   - See `ARCHITECTURE.md` for extensibility points
   - Follow the existing patterns

### Learn More

- 📚 [Full Documentation](./README.md)
- 🏗️ [Architecture Guide](./ARCHITECTURE.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 💬 [Join Discord](https://discord.gg/6dffbvGU3D)

### Deploy to Production

When ready to deploy:

1. Follow the [Deployment Guide](./DEPLOYMENT.md)
2. Set up production database
3. Deploy frontend to Vercel
4. Deploy agent backend
5. Configure environment variables

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/SMSDAO/CopilotKit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SMSDAO/CopilotKit/discussions)
- **Discord**: [CopilotKit Community](https://discord.gg/6dffbvGU3D)
- **Docs**: [CopilotKit Documentation](https://docs.copilotkit.ai)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

**Ready to build?** Start exploring the code and make it your own! 🚀
