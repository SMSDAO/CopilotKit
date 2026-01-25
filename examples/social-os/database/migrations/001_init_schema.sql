-- AiCopilot Social OS - Initial Database Schema
-- Migration 001: Create core tables for users, posts, and agent configurations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Agent Configurations
-- Stores AI agent preferences and learned patterns for each user
CREATE TABLE IF NOT EXISTS user_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    personality_traits JSONB DEFAULT '{}',
    writing_style JSONB DEFAULT '{}',
    preferred_topics TEXT[] DEFAULT '{}',
    learned_patterns JSONB DEFAULT '{}',
    generation_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Interactions Log
-- Track interactions between users and their agents for learning
CREATE TABLE IF NOT EXISTS agent_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'text_generation', 'image_generation', 'chat', etc.
    input_data JSONB NOT NULL,
    output_data JSONB,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Follows/Connections (for future social graph features)
CREATE TABLE IF NOT EXISTS user_follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_public ON posts(is_public);
CREATE INDEX idx_posts_user_public ON posts(user_id, is_public);

CREATE INDEX idx_agent_interactions_user_id ON agent_interactions(user_id);
CREATE INDEX idx_agent_interactions_created_at ON agent_interactions(created_at DESC);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_agents_updated_at BEFORE UPDATE ON user_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
-- Sample users
INSERT INTO users (username, display_name, email, bio, avatar_url) VALUES
    ('alice_wonder', 'Alice Wonderland', 'alice@example.com', 'Exploring AI and creativity', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
    ('bob_builder', 'Bob The Builder', 'bob@example.com', 'Building the future with AI', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
    ('charlie_tech', 'Charlie Tech', 'charlie@example.com', 'Technology enthusiast and AI advocate', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie')
ON CONFLICT (username) DO NOTHING;

-- Create agents for sample users
INSERT INTO user_agents (user_id, agent_name, personality_traits, writing_style, preferred_topics, generation_settings)
SELECT 
    u.id,
    CONCAT(u.display_name, '''s Agent'),
    '{"traits": ["helpful", "creative", "friendly"]}'::jsonb,
    '{"tone": "casual", "length": "medium"}'::jsonb,
    ARRAY['AI', 'Technology', 'Social Media'],
    '{"model": "gpt-4", "temperature": 0.7}'::jsonb
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_agents ua WHERE ua.user_id = u.id
);

-- Sample posts
INSERT INTO posts (user_id, content, is_public, ai_generated) 
SELECT 
    (SELECT id FROM users WHERE username = 'alice_wonder'),
    'Just discovered this amazing AI platform! The agent feature is mind-blowing 🤖',
    true,
    false
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE content LIKE 'Just discovered this amazing AI platform%');

INSERT INTO posts (user_id, content, is_public, ai_generated)
SELECT 
    (SELECT id FROM users WHERE username = 'bob_builder'),
    'Working on some exciting AI projects. Stay tuned for updates! 🚀',
    true,
    false
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE content LIKE 'Working on some exciting AI projects%');

INSERT INTO posts (user_id, content, is_public, ai_generated)
SELECT 
    (SELECT id FROM users WHERE username = 'charlie_tech'),
    'My AI agent just helped me write this post. How meta is that? 😄',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE content LIKE 'My AI agent just helped me write this post%');

-- Sample private post
INSERT INTO posts (user_id, content, is_public, ai_generated)
SELECT 
    (SELECT id FROM users WHERE username = 'alice_wonder'),
    'Private thoughts and notes for myself...',
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE content = 'Private thoughts and notes for myself...');

-- Create some sample follows
INSERT INTO user_follows (follower_id, following_id)
SELECT 
    (SELECT id FROM users WHERE username = 'alice_wonder'),
    (SELECT id FROM users WHERE username = 'bob_builder')
WHERE NOT EXISTS (
    SELECT 1 FROM user_follows 
    WHERE follower_id = (SELECT id FROM users WHERE username = 'alice_wonder')
    AND following_id = (SELECT id FROM users WHERE username = 'bob_builder')
);

INSERT INTO user_follows (follower_id, following_id)
SELECT 
    (SELECT id FROM users WHERE username = 'bob_builder'),
    (SELECT id FROM users WHERE username = 'alice_wonder')
WHERE NOT EXISTS (
    SELECT 1 FROM user_follows 
    WHERE follower_id = (SELECT id FROM users WHERE username = 'bob_builder')
    AND following_id = (SELECT id FROM users WHERE username = 'alice_wonder')
);

-- Grant appropriate permissions (adjust based on your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
