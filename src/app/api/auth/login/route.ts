import { NextResponse } from 'next/server';
import { getClientPassword, createAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { clientName, password } = await request.json();

    if (!clientName || !password) {
      return NextResponse.json(
        { error: 'Client name and password are required', success: false },
        { status: 400 }
      );
    }

    const expectedPassword = getClientPassword(clientName);

    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'Client not found', success: false },
        { status: 404 }
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid password', success: false },
        { status: 401 }
      );
    }

    // Create response with auth cookie
    const { name, value } = createAuthCookie(clientName, password);
    const response = NextResponse.json({ success: true });

    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', success: false },
      { status: 500 }
    );
  }
}
