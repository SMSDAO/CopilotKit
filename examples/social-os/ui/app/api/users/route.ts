import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User, CreateUserInput, ApiResponse } from '@/lib/types';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(
      'SELECT id, username, display_name, email, bio, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return NextResponse.json<ApiResponse<User[]>>({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserInput = await request.json();
    const { username, display_name, email, bio } = body;

    if (!username || !display_name || !email) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate avatar URL
    const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // Insert user
    const userResult = await query(
      'INSERT INTO users (username, display_name, email, bio, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, display_name, email, bio || null, avatar_url]
    );

    const user = userResult.rows[0];

    // Create agent for the user
    const agentName = `${display_name}'s Agent`;
    await query(
      `INSERT INTO user_agents (user_id, agent_name, personality_traits, writing_style, preferred_topics, generation_settings)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        agentName,
        JSON.stringify({ traits: ['helpful', 'creative', 'friendly'] }),
        JSON.stringify({ tone: 'casual', length: 'medium' }),
        ['AI', 'Technology', 'Social Media'],
        JSON.stringify({ model: 'gpt-4', temperature: 0.7 }),
      ]
    );

    return NextResponse.json<ApiResponse<User>>(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      // Unique violation
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Username or email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
