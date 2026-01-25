# Architecture - AiCopilot Social OS

## Overview

AiCopilot Social OS is designed with a modular, extensible architecture that supports future enhancements including wallet integration, marketplace features, and builder functionality.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Timeline   │  │   Profile    │  │  Marketplace │      │
│  │  Component   │  │  Component   │  │  (Future)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         CopilotKit Runtime Integration                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/GraphQL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │    Posts     │  │   Agents     │      │
│  │     API      │  │     API      │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  PostgreSQL  │  │   AI Agent   │  │   External   │
    │   Database   │  │  (LangGraph) │  │   Services   │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## Core Components

### 1. Frontend Layer (Next.js + React)

**Technology Stack:**
- Next.js 16.1.4 with App Router
- React 19
- TypeScript
- Tailwind CSS
- CopilotKit React Components

**Responsibilities:**
- User interface rendering
- Client-side state management
- Real-time AI interactions
- Responsive design

**Key Features:**
- Server-side rendering for performance
- Client components for interactivity
- API route handlers for backend logic
- Optimized for Vercel deployment

### 2. API Layer

**Routes Structure:**
```
/api
├── /copilotkit     # CopilotKit runtime endpoint
├── /users          # User management
│   ├── GET         # List users
│   ├── POST        # Create user
│   └── /[id]
│       └── GET     # Get user by ID
├── /posts          # Post management
│   ├── GET         # List posts
│   └── POST        # Create post
└── /agents         # (Future) Agent configuration
```

**Design Patterns:**
- RESTful API design
- Type-safe request/response with TypeScript
- Error handling and validation
- Database connection pooling

### 3. Database Layer (PostgreSQL)

**Schema Design:**

```sql
users
├── id (UUID, PK)
├── username (unique)
├── display_name
├── email (unique)
├── bio
├── avatar_url
├── created_at
└── updated_at

user_agents
├── id (UUID, PK)
├── user_id (FK -> users)
├── agent_name
├── personality_traits (JSONB)
├── writing_style (JSONB)
├── preferred_topics (TEXT[])
├── learned_patterns (JSONB)
├── generation_settings (JSONB)
├── created_at
└── updated_at

posts
├── id (UUID, PK)
├── user_id (FK -> users)
├── content
├── is_public (BOOLEAN)
├── image_url
├── metadata (JSONB)
├── ai_generated (BOOLEAN)
├── created_at
└── updated_at

agent_interactions
├── id (UUID, PK)
├── user_id (FK -> users)
├── interaction_type
├── input_data (JSONB)
├── output_data (JSONB)
├── feedback_rating
└── created_at

user_follows
├── follower_id (FK -> users)
├── following_id (FK -> users)
└── created_at
```

**Extensibility:**
- JSONB columns for flexible schema evolution
- Array types for multi-value fields
- Prepared for horizontal scaling

### 4. AI Agent Layer (LangGraph)

**Architecture:**

```
LangGraph Workflow
├── Input Processing
│   └── User message + context
├── Tool Selection
│   ├── generatePostContent
│   ├── suggestPostIdeas
│   └── generateImagePrompt
├── LLM Processing (GPT-4)
│   └── Context-aware response
└── Output Formatting
    └── Structured response
```

**Key Features:**
- Stateful conversations with memory
- Dynamic tool binding
- CopilotKit action integration
- User-specific context and style

**Agent Capabilities:**
- Text generation in user's style
- Post topic suggestions
- Image prompt optimization
- Content recommendations

## Data Flow

### 1. User Creates a Post

```
User Input (Frontend)
    ↓
CreatePost Component
    ↓
POST /api/posts
    ↓
Database Insert
    ↓
Response with Post Data
    ↓
Update UI (Timeline)
```

### 2. AI-Assisted Content Generation

```
User Chat (CopilotKit)
    ↓
CopilotKit Runtime
    ↓
Agent Backend (LangGraph)
    ↓
Tool Execution (generatePostContent)
    ↓
LLM Processing (GPT-4)
    ↓
Formatted Response
    ↓
Rendered in Chat UI
```

## Extensibility Points

### Phase 2: Wallet Integration

**Planned Architecture:**

```typescript
// New API route: /api/wallet
interface WalletConnection {
  userId: string;
  walletAddress: string;
  provider: 'metamask' | 'walletconnect' | 'coinbase';
  balance: number;
}

// New database table
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(42) UNIQUE,
  provider VARCHAR(50),
  created_at TIMESTAMP
);
```

**Integration Points:**
- `/lib/wallet/` - Wallet provider adapters
- `/components/wallet/` - Wallet UI components
- `/app/wallet/` - Wallet management pages

### Phase 3: Marketplace Features

**Planned Architecture:**

```typescript
// Marketplace data models
interface MarketplaceListing {
  id: string;
  seller_id: string;
  item_type: 'agent' | 'content' | 'service';
  price: number;
  currency: 'USD' | 'ETH' | 'custom';
}

// New database tables
CREATE TABLE marketplace_listings (...);
CREATE TABLE marketplace_transactions (...);
CREATE TABLE user_purchases (...);
```

**Integration Points:**
- `/app/marketplace/` - Marketplace pages
- `/components/marketplace/` - Listing components
- `/api/marketplace/` - Marketplace API routes
- Smart contracts for on-chain transactions

### Phase 4: Builder Functionality

**Planned Architecture:**

```typescript
// Agent builder interface
interface CustomAgentConfig {
  name: string;
  personality: Record<string, any>;
  capabilities: string[];
  customTools: AgentTool[];
  trainingData: TrainingDataset[];
}

// Low-code agent builder
const AgentBuilder = () => {
  // Visual workflow editor
  // Tool configuration UI
  // Training data management
};
```

**Integration Points:**
- `/app/builder/` - Visual agent builder
- `/components/builder/` - Builder UI components
- `/api/agents/custom/` - Custom agent management
- Agent template marketplace

## Security Architecture

### Authentication & Authorization (Future)

```typescript
// Planned authentication flow
interface AuthConfig {
  providers: ['email', 'oauth', 'wallet'];
  sessionManagement: 'jwt' | 'session';
  mfa: boolean;
}
```

**Security Layers:**
- JWT-based authentication
- Row-level security in PostgreSQL
- API rate limiting
- CORS configuration
- Input validation and sanitization

### Data Privacy

- Private posts visible only to owner
- Agent interactions logged for learning
- User data encryption at rest
- GDPR compliance considerations

## Performance Optimization

### Current Optimizations

1. **Database:**
   - Indexed queries on frequently accessed columns
   - Connection pooling
   - Query result caching

2. **Frontend:**
   - Server-side rendering
   - Image optimization
   - Code splitting
   - Static asset caching

3. **API:**
   - Response pagination
   - Efficient database queries
   - Edge function deployment

### Future Optimizations

1. **Caching Layer:**
   - Redis for session management
   - CDN for static assets
   - Query result caching

2. **Scaling:**
   - Database read replicas
   - Load balancing
   - Microservices architecture

## Technology Choices

### Why Next.js?

- Full-stack framework with API routes
- Excellent performance with SSR
- Great developer experience
- Optimized for Vercel deployment
- Strong TypeScript support

### Why PostgreSQL?

- Robust relational model
- JSONB for flexible schemas
- Excellent performance
- Strong ACID guarantees
- Rich ecosystem

### Why LangGraph?

- Purpose-built for AI agents
- Stateful workflows
- Great CopilotKit integration
- Flexible tool system
- Production-ready

### Why CopilotKit?

- Seamless AI integration
- Pre-built UI components
- Agent-frontend bridge
- Great developer experience
- Active community

## Development Workflow

```
Development
    ↓
Local Testing (Docker Compose)
    ↓
Code Review
    ↓
CI/CD Pipeline
    ↓
Staging Deployment
    ↓
Production Deployment
```

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.info('post_created', {
  userId: user.id,
  postId: post.id,
  isPublic: post.is_public,
  aiGenerated: post.ai_generated,
});
```

### Metrics to Track

- User engagement (posts, interactions)
- AI agent usage
- API response times
- Database query performance
- Error rates

## Future Considerations

1. **Multi-tenancy**: Support for organizations
2. **Real-time Features**: WebSocket integration
3. **Mobile Apps**: React Native application
4. **Analytics Dashboard**: User insights and metrics
5. **Content Moderation**: AI-powered moderation
6. **Internationalization**: Multi-language support

## Contributing

When extending the platform:

1. Follow the established patterns
2. Add types to `/lib/types.ts`
3. Create API routes in `/app/api/`
4. Build components in `/components/`
5. Update database schema with migrations
6. Document new features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
