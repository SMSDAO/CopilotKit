# Deployment Guide - AiCopilot Social OS

This guide covers deploying the Social OS platform to production environments.

## Architecture Overview

The application consists of three main components:

1. **Frontend (Next.js)** - Deployed on Vercel
2. **Agent Backend (LangGraph)** - Deployed on serverless or container platforms
3. **Database (PostgreSQL)** - Managed database service

## Prerequisites

- Vercel account (for frontend)
- PostgreSQL database (Supabase, Neon, or AWS RDS recommended)
- OpenAI API key
- (Optional) LangSmith account for agent monitoring

## Database Deployment

### Option 1: Supabase (Recommended for MVP)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your database connection string from Project Settings > Database
3. Run the migration:
   ```bash
   psql "postgresql://[YOUR_CONNECTION_STRING]" -f database/migrations/001_init_schema.sql
   ```

### Option 2: Neon

1. Create a new project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Run migrations as above

### Option 3: AWS RDS

1. Create a PostgreSQL RDS instance
2. Configure security groups for access
3. Run migrations using psql or your preferred tool

## Frontend Deployment (Vercel)

### Step 1: Prepare the Repository

Ensure your code is pushed to GitHub/GitLab/Bitbucket.

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import your repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `examples/social-os/ui`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`

### Step 3: Environment Variables

Add these environment variables in Vercel:

```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
REMOTE_ACTION_URL=https://your-agent-backend.com/copilotkit
```

### Step 4: Deploy

Click "Deploy" and Vercel will build and deploy your application.

## Agent Backend Deployment

### Option 1: LangGraph Cloud (Recommended)

1. Install LangSmith CLI:
   ```bash
   pip install langsmith
   ```

2. Deploy the agent:
   ```bash
   cd agent
   langchain cloud deploy
   ```

3. Update `REMOTE_ACTION_URL` in Vercel with your agent URL

### Option 2: Cloud Run (Google Cloud)

1. Create a Dockerfile in the agent directory:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 8123
   CMD ["npm", "start"]
   ```

2. Build and deploy:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/social-os-agent
   gcloud run deploy social-os-agent --image gcr.io/PROJECT_ID/social-os-agent --platform managed
   ```

### Option 3: AWS Lambda

Use the AWS SAM or Serverless Framework to deploy the agent as a Lambda function.

### Option 4: Railway

1. Create a new project on [railway.app](https://railway.app)
2. Connect your repository
3. Set root directory to `examples/social-os/agent`
4. Add environment variables
5. Deploy

## Environment Configuration

### Frontend (Vercel)

```env
# Required
OPENAI_API_KEY=your_openai_key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REMOTE_ACTION_URL=https://agent-backend.com/copilotkit

# Optional
LANGSMITH_API_KEY=your_langsmith_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=social-os
```

### Agent Backend

```env
# Required
OPENAI_API_KEY=your_openai_key

# Optional
LANGSMITH_API_KEY=your_langsmith_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=social-os-agent
```

## Post-Deployment

### 1. Verify Database

Check that all tables were created correctly:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 2. Test the Application

1. Visit your Vercel URL
2. Check that sample users appear
3. Try creating a post
4. Test the AI agent chat

### 3. Monitor

- Use Vercel Analytics for frontend monitoring
- Use LangSmith for agent tracing (if configured)
- Monitor database performance in your provider's dashboard

## Scaling Considerations

### Database

- Enable connection pooling for high traffic
- Consider read replicas for read-heavy workloads
- Set up automated backups

### Frontend

- Vercel handles scaling automatically
- Consider adding caching for API routes
- Use Edge Functions for better performance

### Agent Backend

- Use horizontal scaling for high load
- Consider request queuing for rate limiting
- Monitor token usage and costs

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **Database**: Use connection pooling and prepared statements
3. **API Rate Limiting**: Implement rate limiting on API routes
4. **CORS**: Configure appropriate CORS headers
5. **Authentication**: Add authentication before production use
6. **SSL/TLS**: Ensure all connections use HTTPS

## Monitoring and Logging

### Application Monitoring

- Vercel: Built-in analytics and logs
- Sentry: Error tracking
- LogRocket: Session replay

### Database Monitoring

- Enable slow query logs
- Set up alerts for high connection counts
- Monitor disk space usage

### Agent Monitoring

- LangSmith: Trace agent executions
- CloudWatch/Stackdriver: Infrastructure metrics
- Custom logging for business metrics

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string format
   - Verify network access and firewall rules
   - Ensure database is running

2. **Agent Not Responding**
   - Check `REMOTE_ACTION_URL` is correct
   - Verify agent backend is deployed and running
   - Check agent logs for errors

3. **Build Failures**
   - Clear Next.js cache: `rm -rf .next`
   - Verify all dependencies are installed
   - Check TypeScript errors

## Cost Estimation

Typical monthly costs for moderate usage (1000 MAU):

- **Vercel**: $0 (Free tier) - $20 (Pro)
- **Database (Supabase)**: $0 (Free tier) - $25 (Pro)
- **Agent Backend (Railway)**: $5 - $20
- **OpenAI API**: $20 - $100 (depends on usage)

**Total**: $25 - $165/month

## Support

For deployment issues:
- GitHub Issues: [Report problems](https://github.com/SMSDAO/CopilotKit/issues)
- Discord: [Join community](https://discord.gg/6dffbvGU3D)
- Documentation: [docs.copilotkit.ai](https://docs.copilotkit.ai)
