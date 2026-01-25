import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User, ApiResponse } from '@/lib/types';

// GET /api/users/[id] - Get a single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT id, username, display_name, email, bio, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
