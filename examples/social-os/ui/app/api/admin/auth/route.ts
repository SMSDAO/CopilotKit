import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createAdminSession, deleteAdminSession, getAdminBySession, updateAdminPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/auth
 * Login admin user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, newPassword } = body;

    // Login action
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }

      const admin = await authenticateAdmin(email, password);

      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Create session
      const session = await createAdminSession(admin.id);

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return NextResponse.json({
        success: true,
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            first_login: admin.first_login,
          },
        },
      });
    }

    // Logout action
    if (action === 'logout') {
      const cookieStore = await cookies();
      const session = cookieStore.get('admin_session')?.value;

      if (session) {
        await deleteAdminSession(session);
        cookieStore.delete('admin_session');
      }

      return NextResponse.json({ success: true });
    }

    // Check session action
    if (action === 'check') {
      const cookieStore = await cookies();
      const session = cookieStore.get('admin_session')?.value;

      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
      }

      const admin = await getAdminBySession(session);

      if (!admin) {
        cookieStore.delete('admin_session');
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            first_login: admin.first_login,
          },
        },
      });
    }

    // Change password action
    if (action === 'change-password') {
      const cookieStore = await cookies();
      const session = cookieStore.get('admin_session')?.value;

      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
      }

      const admin = await getAdminBySession(session);

      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        );
      }

      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      await updateAdminPassword(admin.id, newPassword);

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
