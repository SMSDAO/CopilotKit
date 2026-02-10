# Vercel Deployment Guide - Social OS with Admin Authentication

This guide provides step-by-step instructions for deploying the Social OS platform to Vercel with admin authentication enabled.

## Prerequisites

Before deploying, ensure you have:

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A PostgreSQL database (Supabase, Neon, or AWS RDS)
- OpenAI API key
- GitHub repository access

## Step 1: Database Setup

### Option A: Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **Project Settings** → **Database**
3. Copy your connection string (it should look like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)
4. Run the migration scripts:

```bash
# Run initial schema
psql "your-connection-string-here" -f database/migrations/001_init_schema.sql

# Run admin authentication migration
psql "your-connection-string-here" -f database/migrations/002_add_admin_auth.sql
```

### Option B: Using Neon

1. Create a new project at [neon.tech](https://neon.tech)
2. Copy your connection string
3. Run the migrations as shown above

### Option C: Using Railway, Render, or other providers

1. Create a PostgreSQL database instance
2. Get your connection string
3. Run the migrations

## Step 2: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Verify the `vercel.json` file exists in the `examples/social-os/ui/` directory

**Note:** The `vercel.json` configuration file is located in the `ui/` directory and is configured for when `examples/social-os/ui` is set as the Vercel root directory.

## Step 3: Import Project to Vercel

### Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your repository (SMSDAO/CopilotKit)
4. Configure the project:
   - **Project Name**: `social-os` (or your preferred name)
   - **Framework Preset**: Next.js
   - **Root Directory**: `examples/social-os/ui`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to the UI directory
cd examples/social-os/ui

# Deploy
vercel

# Follow the prompts to configure your project
```

## Step 4: Configure Environment Variables

In the Vercel dashboard, go to **Settings** → **Environment Variables** and add:

### Required Variables

```env
# OpenAI API Key (for AI agent functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database Connection String
DATABASE_URL=postgresql://user:password@host:5432/database

# Agent Backend URL (if using separate agent deployment)
REMOTE_ACTION_URL=http://localhost:8123/copilotkit
```

### Variable Sources

- **OPENAI_API_KEY**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **DATABASE_URL**: Your PostgreSQL connection string from Step 1
- **REMOTE_ACTION_URL**: 
  - For local testing: `http://localhost:8123/copilotkit`
  - For production: Your deployed agent URL (see Step 6)

### Security Notes

- Keep all environment variables secret
- Never commit API keys to Git
- Use different values for development and production
- Enable "Encrypt" option for sensitive variables in Vercel

## Step 5: Deploy the UI

1. Click **Deploy** in Vercel
2. Wait for the build to complete (typically 2-5 minutes)
3. Once deployed, you'll receive a URL like: `https://your-project.vercel.app`

## Step 6: Deploy the Agent Backend (Optional)

The agent provides AI functionality. You can deploy it separately or keep it local for development.

### Option A: LangGraph Cloud (Recommended for Production)

```bash
# Navigate to agent directory
cd examples/social-os/agent

# Install dependencies
pnpm install

# Deploy to LangGraph Cloud
# (Requires LangSmith account)
langchain cloud deploy
```

### Option B: Cloud Run (Google Cloud)

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

2. Deploy:
```bash
gcloud run deploy social-os-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### Option C: Railway

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub**
3. Select the agent directory
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy

### Update REMOTE_ACTION_URL

After deploying the agent, update the `REMOTE_ACTION_URL` in Vercel:

1. Go to Vercel dashboard → **Settings** → **Environment Variables**
2. Update `REMOTE_ACTION_URL` to your agent's URL
3. Redeploy the frontend

## Step 7: Verify Deployment

### Test the Main Application

1. Visit your Vercel URL
2. You should see the Social OS timeline
3. Try creating a user and posting

### Test Admin Authentication

1. Visit `https://your-project.vercel.app/admin`
2. Login with:
   - Email: `crypto98@icloud.com`
   - Password: `admin123`
3. You should be prompted to change your password
4. Set a new password (minimum 8 characters)
5. You should be redirected to the admin dashboard

### Verify Database Connection

1. In the admin dashboard, check the stats
2. User and post counts should be visible
3. Database status should show "✅ Connected"

## Step 8: Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `social.yourdomain.com`)
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take up to 24 hours)

### Configure SSL

Vercel automatically provisions SSL certificates for all domains. No additional configuration needed.

## Step 9: Automated Deployments

Vercel automatically deploys when you push to your main branch.

### Configure Automatic Deployments

1. Go to **Settings** → **Git**
2. Configure:
   - **Production Branch**: `main` or your preferred branch
   - **Deploy Hooks**: Create webhooks for external triggers
   - **Ignored Build Step**: Configure to skip builds for non-code changes

### Preview Deployments

Every pull request automatically gets a preview deployment with a unique URL.

## Troubleshooting

### Build Fails

**Issue**: Build fails with dependency errors

**Solution**: 
```bash
# Clear node_modules and reinstall
cd examples/social-os/ui
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database Connection Fails

**Issue**: App can't connect to database

**Solution**:
1. Verify DATABASE_URL is correct in Vercel environment variables
2. Check database firewall allows Vercel IPs
3. For Supabase, ensure "Direct connection" string is used, not "Connection pooling"
4. Test connection locally first

### Admin Login Not Working

**Issue**: Can't login to admin panel

**Solution**:
1. Ensure migration `002_add_admin_auth.sql` was run
2. Check database has `admins` and `admin_sessions` tables
3. Verify bcryptjs package is installed
4. Check browser console for errors

### AI Agent Not Responding

**Issue**: AI features don't work

**Solution**:
1. Verify OPENAI_API_KEY is set correctly
2. Check REMOTE_ACTION_URL points to running agent
3. If using local agent, ensure it's running: `cd agent && pnpm dev`
4. Check agent logs for errors

### Environment Variables Not Working

**Issue**: Environment variables not accessible in app

**Solution**:
1. Redeploy after adding environment variables
2. Ensure variables are set for the correct environment (Production/Preview/Development)
3. Check variable names match exactly (case-sensitive)

## Performance Optimization

### Enable Caching

Add to `next.config.mjs`:
```javascript
const nextConfig = {
  // ... existing config
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
}
```

### Database Connection Pooling

Use a connection pooler like PgBouncer for better performance:
```env
DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true
```

### Image Optimization

Vercel automatically optimizes images. Ensure you're using Next.js Image component:
```tsx
import Image from 'next/image'
```

## Monitoring and Analytics

### Enable Vercel Analytics

1. Go to **Analytics** tab in Vercel dashboard
2. Click **Enable Analytics**
3. Add the analytics snippet to your app (if not auto-added)

### View Logs

1. Go to **Deployments** tab
2. Click on any deployment
3. Click **View Function Logs** to see real-time logs

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Configure alerts for:
   - Deployment failures
   - High error rates
   - Performance issues

## Security Checklist

Before going live, ensure:

- [ ] Changed default admin password
- [ ] Set all environment variables in Vercel
- [ ] Enabled HTTPS (automatic with Vercel)
- [ ] Configured security headers (in vercel.json)
- [ ] Database has proper firewall rules
- [ ] API keys are not exposed in client-side code
- [ ] CORS is properly configured
- [ ] Rate limiting is considered (add if needed)
- [ ] Backup strategy is in place for database

## Scaling Considerations

### Horizontal Scaling

Vercel automatically scales your frontend. No configuration needed.

### Database Scaling

For high traffic:
1. Use connection pooling
2. Add read replicas
3. Implement caching (Redis)
4. Consider database-specific scaling features

### Cost Estimation

**Vercel (Frontend)**:
- Hobby: Free (personal projects)
- Pro: $20/month (production apps)
- Enterprise: Custom pricing

**Database (Supabase example)**:
- Free tier: Up to 500MB
- Pro: $25/month (8GB, includes backups)
- Scale as needed

**OpenAI API**:
- Pay per use
- GPT-4: ~$0.03 per 1K tokens
- Budget accordingly based on usage

## Maintenance

### Regular Updates

```bash
# Update dependencies
cd examples/social-os/ui
pnpm update

# Check for security vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

### Database Backups

- **Supabase**: Automatic daily backups on Pro plan
- **Neon**: Point-in-time restore available
- **Custom**: Set up your own backup strategy

### Monitoring

- Check Vercel analytics weekly
- Review error logs regularly
- Monitor database performance
- Track API usage and costs

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Visit [Next.js Documentation](https://nextjs.org/docs)
- Review project README and TROUBLESHOOTING guide
- Open an issue on GitHub

## Conclusion

You now have a fully deployed Social OS platform with:
- ✅ Modern social media UI
- ✅ Admin authentication system
- ✅ Secure password management
- ✅ Automatic deployments
- ✅ Production-ready infrastructure

Your deployment is live at your Vercel URL and ready for users!
