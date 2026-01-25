import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Post, CreatePostInput, ApiResponse } from '@/lib/types';

// GET /api/posts - List posts (public timeline)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('user_id');
    const includePrivate = searchParams.get('include_private') === 'true';

    let queryText = `
      SELECT p.*, 
             u.username, u.display_name, u.avatar_url,
             json_build_object(
               'username', u.username,
               'display_name', u.display_name,
               'avatar_url', u.avatar_url
             ) as user
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      queryText += ` AND p.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
      
      if (!includePrivate) {
        queryText += ' AND p.is_public = true';
      }
    } else {
      // Only show public posts on main timeline
      queryText += ' AND p.is_public = true';
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    return NextResponse.json<ApiResponse<Post[]>>({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body: CreatePostInput = await request.json();
    const { user_id, content, is_public, image_url, ai_generated } = body;

    if (!user_id || !content) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO posts (user_id, content, is_public, image_url, ai_generated, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user_id,
        content,
        is_public !== false, // Default to true
        image_url || null,
        ai_generated || false,
        JSON.stringify({}),
      ]
    );

    const post = result.rows[0];

    // Fetch user data
    const userResult = await query(
      'SELECT username, display_name, avatar_url FROM users WHERE id = $1',
      [user_id]
    );

    if (userResult.rows.length > 0) {
      post.user = userResult.rows[0];
    }

    return NextResponse.json<ApiResponse<Post>>(
      { success: true, data: post },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
