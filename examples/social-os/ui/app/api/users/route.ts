import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { User, CreateUserInput, ApiResponse } from '@/lib/types';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate and clamp limit parameter
    const rawLimit = searchParams.get('limit');
    let limit = 50; // default
    if (rawLimit !== null) {
      const parsedLimit = parseInt(rawLimit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Invalid "limit" parameter' },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100); // max 100
    }
    
    // Validate and clamp offset parameter
    const rawOffset = searchParams.get('offset');
    let offset = 0; // default
    if (rawOffset !== null) {
      const parsedOffset = parseInt(rawOffset, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, error: 'Invalid "offset" parameter' },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

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

    // Generate avatar URL with properly encoded username
    const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    // Use transaction to ensure user and agent are created atomically
    const user = await transaction(async (client) => {
      // Insert user
      const userResult = await client.query(
        'INSERT INTO users (username, display_name, email, bio, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [username, display_name, email, bio || null, avatar_url]
      );

      const newUser = userResult.rows[0];

      // Create agent for the user
      const agentName = `${display_name}'s Agent`;
      await client.query(
        `INSERT INTO user_agents (user_id, agent_name, personality_traits, writing_style, preferred_topics, generation_settings)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newUser.id,
          agentName,
          JSON.stringify({ traits: ['helpful', 'creative', 'friendly'] }),
          JSON.stringify({ tone: 'casual', length: 'medium' }),
          ['AI', 'Technology', 'Social Media'],
          JSON.stringify({ model: 'gpt-4', temperature: 0.7 }),
        ]
      );

      return newUser;
    });

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
