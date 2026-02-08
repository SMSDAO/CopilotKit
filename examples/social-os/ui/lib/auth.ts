import bcrypt from 'bcryptjs';
import { db } from './db';

export interface Admin {
  id: string;
  email: string;
  first_login: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random session token
 */
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Authenticate an admin user
 */
export async function authenticateAdmin(email: string, password: string): Promise<Admin | null> {
  const client = await db.connect();
  try {
    const result = await client.query(
      'SELECT id, email, password_hash, first_login, last_login, created_at, updated_at FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const admin = result.rows[0];
    const isValid = await verifyPassword(password, admin.password_hash);

    if (!isValid) {
      return null;
    }

    // Update last login
    await client.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    return {
      id: admin.id,
      email: admin.email,
      first_login: admin.first_login,
      last_login: admin.last_login,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    };
  } finally {
    client.release();
  }
}

/**
 * Create a new session for an admin
 */
export async function createAdminSession(adminId: string): Promise<string> {
  const client = await db.connect();
  try {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await client.query(
      'INSERT INTO admin_sessions (admin_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [adminId, sessionToken, expiresAt]
    );

    return sessionToken;
  } finally {
    client.release();
  }
}

/**
 * Get admin by session token
 */
export async function getAdminBySession(sessionToken: string): Promise<Admin | null> {
  const client = await db.connect();
  try {
    const result = await client.query(
      `SELECT a.id, a.email, a.first_login, a.last_login, a.created_at, a.updated_at 
       FROM admins a
       JOIN admin_sessions s ON a.id = s.admin_id
       WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteAdminSession(sessionToken: string): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('DELETE FROM admin_sessions WHERE session_token = $1', [sessionToken]);
  } finally {
    client.release();
  }
}

/**
 * Update admin password
 */
export async function updateAdminPassword(adminId: string, newPassword: string): Promise<void> {
  const client = await db.connect();
  try {
    const passwordHash = await hashPassword(newPassword);
    await client.query(
      'UPDATE admins SET password_hash = $1, first_login = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, adminId]
    );
  } finally {
    client.release();
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP');
  } finally {
    client.release();
  }
}
