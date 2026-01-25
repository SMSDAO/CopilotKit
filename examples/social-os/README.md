# AiCopilot Social OS

A modern social platform powered by AI, where every user has their own intelligent Agent that learns their preferences, style, and domains. Built with CopilotKit, Next.js, TypeScript, and PostgreSQL.

## Overview

AiCopilot Social OS is an innovative social platform that combines traditional social networking with AI-powered assistance. Each user is represented by a personal AI Agent that:

- Learns from user interactions and preferences
- Generates text content in the user's style
- Creates images based on user specifications
- Acts as a digital assistant for the user's profile

## Features

### Phase 1 (Current)
- ✅ **User Profiles**: Personalized user profiles with customizable information
- ✅ **Social Timeline**: Real-time feed of posts from all users
- ✅ **Public & Private Posts**: Share publicly or keep posts private
- ✅ **AI Agent per User**: Each user has a dedicated AI agent for:
  - Text generation in user's style
  - Image generation capabilities
  - Profile representation and assistance
- ✅ **PostgreSQL Database**: Robust data storage for users, posts, and agent data
- ✅ **Responsive UI**: Cross-device interface optimized for desktop and mobile

### Future Phases (Extensible Architecture)
- 🔄 **Wallet Integration**: Crypto wallet support for transactions
- 🔄 **Marketplace**: Buy/sell digital assets and services
- 🔄 **Builder Tools**: Create and customize AI agents and content

## Architecture

```
social-os/
├── ui/                 # Next.js frontend application
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   └── lib/           # Utility functions and types
├── agent/             # LangGraph AI agent backend
│   └── src/           # Agent logic and tools
└── database/          # Database schema and migrations
    └── migrations/    # SQL migration files
```

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **CopilotKit**: AI integration framework
- **Radix UI**: Accessible component primitives

### Backend
- **Node.js**: JavaScript runtime
- **LangGraph**: Agent orchestration
- **TypeScript**: Type-safe backend code
- **CopilotKit Runtime**: Agent-frontend bridge

### Database
- **PostgreSQL**: Primary database
- **node-postgres (pg)**: Database driver

### AI/ML
- **OpenAI GPT-4**: Text generation
- **DALL-E 3**: Image generation
- **LangChain**: LLM framework

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL 14+
- OpenAI API key

## Getting Started

### 1. Clone and Install

```bash
# Navigate to the social-os directory
cd examples/social-os

# Install UI dependencies
cd ui
pnpm install

# Install agent dependencies
cd ../agent
pnpm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb social_os_dev

# Run migrations
cd database
psql -d social_os_dev -f migrations/001_init_schema.sql
```

### 3. Environment Configuration

Create `.env.local` in the `ui` directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Database Connection
DATABASE_URL=postgresql://localhost:5432/social_os_dev

# Agent Endpoint
REMOTE_ACTION_URL=http://localhost:8123/copilotkit
```

Create `.env` in the `agent` directory:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Application

Start the agent backend (in `agent/` directory):
```bash
pnpm dev
```

Start the UI frontend (in `ui/` directory):
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Usage

### Creating a Profile
1. Navigate to the home page
2. Create your user profile with name and bio
3. Your AI Agent is automatically initialized

### Posting Content
1. Click "New Post" in the timeline
2. Choose between public or private visibility
3. Let your AI Agent help generate content
4. Share with the community

### AI Agent Features
1. **Text Generation**: Ask your agent to write posts in your style
2. **Image Creation**: Request custom images for your posts
3. **Profile Management**: Your agent represents you in the platform

## Development

### Project Structure

```
ui/
├── app/
│   ├── page.tsx              # Home/Timeline page
│   ├── layout.tsx            # Root layout with CopilotKit
│   ├── profile/[id]/         # User profile pages
│   └── api/
│       ├── copilotkit/       # CopilotKit runtime endpoint
│       ├── users/            # User CRUD APIs
│       └── posts/            # Post CRUD APIs
├── components/
│   ├── timeline/             # Timeline and feed components
│   ├── post/                 # Post creation and display
│   ├── profile/              # Profile components
│   └── agent/                # Agent interaction components
└── lib/
    ├── db.ts                 # Database client
    └── types.ts              # TypeScript types

agent/
└── src/
    ├── agent.ts              # Main agent logic
    ├── tools/                # Agent tools (text, image gen)
    └── index.ts              # Entry point
```

### Database Schema

See `database/migrations/001_init_schema.sql` for the complete schema including:
- Users table
- Posts table (with public/private flag)
- User Agent configurations
- Relationships and indexes

### Extending the Platform

The platform is designed to be extensible:

1. **Add New Agent Capabilities**: Extend agent tools in `agent/src/tools/`
2. **New Social Features**: Add components in `ui/components/`
3. **Wallet Integration**: Add wallet provider in `ui/lib/wallet/`
4. **Marketplace**: Create marketplace module in `ui/app/marketplace/`

## Deployment

### Vercel Deployment (Recommended)

The UI is optimized for Vercel deployment:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy the `ui` directory

### Agent Deployment

Deploy the agent using:
- **LangGraph Cloud**: Managed LangGraph hosting
- **Cloud Run/Lambda**: Serverless deployment
- **Docker**: Containerized deployment

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: Report bugs and request features
- Discord: Join the CopilotKit community
- Documentation: Visit docs.copilotkit.ai
