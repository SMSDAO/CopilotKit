-- Migration 002: Add Admin Authentication System
-- Creates admin table with secure password storage and first-login tracking

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_login BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- WARNING: Default admin account with hardcoded password
-- This is included for development/demo purposes only.
-- For production deployments:
-- 1. Remove this INSERT statement
-- 2. Create admin accounts via a secure setup script with strong passwords
-- 3. Or require admin creation through an authenticated initialization flow
-- Insert default admin account (crypto98@icloud.com with password: admin123)
-- Password hash for 'admin123' using bcrypt (10 rounds)
-- This will be changed on first login
INSERT INTO admins (email, password_hash, first_login) VALUES
    ('crypto98@icloud.com', '$2a$10$8K1p/a0dL3.I93OBIkjode.E0XOjqkXYrZSBjH3WTjLYY0w5rLMLW', true)
ON CONFLICT (email) DO NOTHING;

-- Admin Sessions Table (for session management)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Index for faster session lookups
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
