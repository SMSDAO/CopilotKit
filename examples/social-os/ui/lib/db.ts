import { Pool } from 'pg';

// Database connection pool
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/social_os_dev',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Only log query text in development, not params to avoid exposing sensitive data
    if (process.env.NODE_ENV === 'development') {
      console.log('executed query', { duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('database query error:', error);
    throw error;
  }
}

// Helper function to execute multiple queries in a transaction
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Close the pool
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
