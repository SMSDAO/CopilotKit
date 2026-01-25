# Testing Checklist - AiCopilot Social OS

Use this checklist to verify that all features are working correctly.

## Prerequisites

- [ ] PostgreSQL is running
- [ ] Database migrations have been applied
- [ ] Environment variables are configured
- [ ] UI dependencies are installed (`pnpm install` in ui/)
- [ ] Agent dependencies are installed (`pnpm install` in agent/)

## Setup Verification

### Database Setup
```bash
# Check database connection
psql -d social_os_dev -c "\dt"

# Expected output: users, user_agents, posts, agent_interactions, user_follows tables
```

- [ ] Database exists
- [ ] All 5 tables are created
- [ ] Sample data is loaded (3 users, 3-4 posts)
- [ ] Indexes are created
- [ ] Triggers are working

### Application Startup

**Terminal 1 - Agent Backend:**
```bash
cd agent
pnpm dev
```
- [ ] Agent starts on port 8123
- [ ] No error messages in console
- [ ] Displays "ready" or similar message

**Terminal 2 - Frontend:**
```bash
cd ui
pnpm dev
```
- [ ] UI starts on port 3000
- [ ] Compilation succeeds
- [ ] No TypeScript errors
- [ ] Opens browser to http://localhost:3000

## Feature Testing

### 1. Homepage Load
- [ ] Page loads successfully
- [ ] Header displays "AiCopilot Social OS"
- [ ] Three sample users appear in left sidebar
  - [ ] Alice Wonderland
  - [ ] Bob The Builder
  - [ ] Charlie Tech
- [ ] Timeline shows existing posts
- [ ] No console errors

### 2. User Interface

**Header Section:**
- [ ] Logo and title are visible
- [ ] Current user info shows in top-right
- [ ] Avatar displays correctly

**Sidebar:**
- [ ] All users are listed
- [ ] Each user has avatar, name, and username
- [ ] Users are clickable

**Timeline:**
- [ ] Posts are displayed in reverse chronological order
- [ ] Each post shows:
  - [ ] Author avatar
  - [ ] Author name and username
  - [ ] Post content
  - [ ] Timestamp (relative time)
  - [ ] AI badge (if AI-generated)
  - [ ] Privacy badge (if private)

### 3. User Switching
- [ ] Click on "Alice Wonderland"
  - [ ] Current user indicator updates
  - [ ] Create Post form remains available
- [ ] Click on "Bob The Builder"
  - [ ] Current user changes to Bob
  - [ ] UI updates accordingly
- [ ] Click on "Charlie Tech"
  - [ ] Current user changes to Charlie

### 4. Create Post

**Basic Post Creation:**
- [ ] Type text in "Create Post" box
- [ ] "Post" button becomes enabled
- [ ] Click "Post" button
  - [ ] Post is created successfully
  - [ ] New post appears at top of timeline
  - [ ] Text box is cleared
  - [ ] Post shows correct author

**Visibility Toggle:**
- [ ] Default visibility is "Public" (globe icon)
- [ ] Click visibility toggle
  - [ ] Changes to "Private" (lock icon)
  - [ ] Button styling updates
- [ ] Create a private post
  - [ ] Post is created
  - [ ] Private badge appears on post
  - [ ] Post should not appear on other users' timelines
- [ ] Toggle back to "Public"
- [ ] Create a public post
  - [ ] Post appears for all users

**Edge Cases:**
- [ ] Empty post cannot be submitted
- [ ] Very long post is handled gracefully
- [ ] Special characters work correctly
- [ ] Emoji work correctly 🎉

### 5. AI Agent Integration

**Opening the Agent:**
- [ ] Click chat icon in bottom-right corner
- [ ] Agent sidebar slides open
- [ ] Shows personalized greeting
- [ ] Shows current user's agent name

**Basic Chat:**
- [ ] Type: "Hello"
  - [ ] Agent responds appropriately
  - [ ] Response is relevant
- [ ] Type: "What can you do?"
  - [ ] Agent explains capabilities

**Content Generation:**
- [ ] Type: "Help me write a post about technology"
  - [ ] Agent generates content suggestion
  - [ ] Content appears in chat
  - [ ] Can copy content to Create Post
- [ ] Type: "Suggest some post ideas"
  - [ ] Agent provides 2-3 ideas
  - [ ] Ideas are relevant to user's interests
- [ ] Type: "Generate an image prompt for a sunset"
  - [ ] Agent creates an optimized prompt
  - [ ] Prompt is suitable for DALL-E

**Agent Tools:**
- [ ] Agent successfully calls `generatePostContent` tool
- [ ] Agent successfully calls `suggestPostIdeas` tool
- [ ] Agent successfully calls `generateImagePrompt` tool
- [ ] Tool responses render correctly in UI

**Context Awareness:**
- [ ] Agent knows current user's name
- [ ] Agent references user's bio (if available)
- [ ] Agent maintains conversation context
- [ ] Agent's style matches user preferences

### 6. API Endpoints

**Users API:**
```bash
# Test GET /api/users
curl http://localhost:3000/api/users
```
- [ ] Returns list of users
- [ ] Response includes all user fields
- [ ] Success: true

```bash
# Test POST /api/users
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "display_name": "Test User",
    "email": "test@example.com",
    "bio": "Testing the platform"
  }'
```
- [ ] Creates new user
- [ ] Returns created user data
- [ ] Agent is auto-created
- [ ] Avatar is generated

```bash
# Test GET /api/users/[id]
curl http://localhost:3000/api/users/[USER_ID]
```
- [ ] Returns specific user
- [ ] 404 for non-existent user

**Posts API:**
```bash
# Test GET /api/posts
curl http://localhost:3000/api/posts
```
- [ ] Returns list of posts
- [ ] Only public posts by default
- [ ] Includes user data

```bash
# Test POST /api/posts
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "[USER_ID]",
    "content": "Test post from API",
    "is_public": true
  }'
```
- [ ] Creates new post
- [ ] Returns created post data
- [ ] Post appears in timeline

### 7. Database Operations

**Check data integrity:**
```sql
-- Count users
SELECT COUNT(*) FROM users;
-- Expected: At least 3

-- Count agents (should equal users)
SELECT COUNT(*) FROM user_agents;
-- Expected: Same as users count

-- Count posts
SELECT COUNT(*) FROM posts;
-- Expected: At least 3-4

-- Verify agent creation trigger
SELECT u.username, ua.agent_name 
FROM users u 
LEFT JOIN user_agents ua ON u.id = ua.user_id;
-- Expected: Each user has an agent
```

- [ ] User count is correct
- [ ] Each user has exactly one agent
- [ ] Posts are associated with users
- [ ] Timestamps are accurate

### 8. Error Handling

**Database Errors:**
- [ ] Stop PostgreSQL
- [ ] Try to load page
  - [ ] Appropriate error is shown
  - [ ] App doesn't crash
- [ ] Restart PostgreSQL
- [ ] Reload page
  - [ ] App recovers successfully

**Agent Errors:**
- [ ] Stop agent backend
- [ ] Try to chat with agent
  - [ ] Error is handled gracefully
  - [ ] Frontend doesn't crash
- [ ] Restart agent
- [ ] Try chatting again
  - [ ] Connection restored

**Invalid Input:**
- [ ] Try to create user with duplicate username
  - [ ] Error message is shown
- [ ] Try to create post with empty content
  - [ ] Submit button is disabled
- [ ] Try to access non-existent user
  - [ ] 404 error is returned

### 9. Responsive Design

**Desktop (1920x1080):**
- [ ] Layout uses full width
- [ ] Three-column layout works
- [ ] All content is readable

**Tablet (768x1024):**
- [ ] Layout adjusts appropriately
- [ ] Sidebar may collapse
- [ ] Content remains accessible

**Mobile (375x667):**
- [ ] Single column layout
- [ ] Touch targets are adequate
- [ ] Text is readable
- [ ] Chat button is accessible

### 10. Performance

**Load Time:**
- [ ] Initial page load < 3 seconds
- [ ] Subsequent navigations are instant
- [ ] Images load progressively

**Database Queries:**
- [ ] No N+1 query issues
- [ ] Queries use indexes
- [ ] Connection pool is efficient

**Agent Response:**
- [ ] Agent responds within 5 seconds
- [ ] Streaming works (if enabled)
- [ ] Multiple users can chat simultaneously

### 11. Security

**Environment Variables:**
- [ ] OpenAI API key is not exposed in frontend
- [ ] Database URL is not in client code
- [ ] .env files are in .gitignore

**SQL Injection:**
- [ ] Try SQL injection in post content
  - [ ] Properly escaped
- [ ] Try SQL injection in username
  - [ ] Properly escaped

**XSS Prevention:**
- [ ] Try `<script>alert('XSS')</script>` in post
  - [ ] Properly sanitized/escaped
- [ ] HTML tags in posts are escaped

### 12. Documentation

**README:**
- [ ] Exists and is complete
- [ ] Setup instructions are accurate
- [ ] All commands work as documented

**Other Docs:**
- [ ] QUICKSTART.md is helpful
- [ ] ARCHITECTURE.md is accurate
- [ ] DEPLOYMENT.md is comprehensive
- [ ] FEATURES.md lists all features

**Code Documentation:**
- [ ] Complex functions have comments
- [ ] Types are well-defined
- [ ] File structure is clear

### 13. Build & Deploy

**Development Build:**
```bash
cd ui
pnpm build
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build size is reasonable

**Production Build:**
```bash
pnpm start
```
- [ ] Production server starts
- [ ] App works in production mode
- [ ] Environment variables are loaded

**Agent Build:**
```bash
cd agent
npx tsc
```
- [ ] TypeScript compiles
- [ ] No type errors
- [ ] Output in dist/ directory

## Test Results

### Summary
- Total Tests: ~100
- Passed: ___
- Failed: ___
- Skipped: ___

### Issues Found
List any issues discovered during testing:

1. 
2. 
3. 

### Performance Metrics
- Initial Load Time: ___
- Time to Interactive: ___
- Largest Contentful Paint: ___
- Database Query Time: ___
- Agent Response Time: ___

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Notes

Add any additional observations or recommendations:

---

## Automated Testing (Future)

For future test automation, consider:

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint

# Integration tests
pnpm test:integration
```

## Continuous Testing

- Set up GitHub Actions for CI/CD
- Run tests on every PR
- Check build on multiple Node versions
- Verify database migrations
- Test agent deployments

---

**Testing Date:** ___________  
**Tester:** ___________  
**Environment:** [ ] Local [ ] Staging [ ] Production  
**Status:** [ ] All Passed [ ] Issues Found [ ] Blocked
