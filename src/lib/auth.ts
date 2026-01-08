import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Passwords stored as JSON in env: {"client-name": "password123", "other-client": "pass456"}
function getClientPasswords(): Record<string, string> {
  try {
    const passwords = process.env.CLIENT_PASSWORDS;
    if (!passwords) return {};
    return JSON.parse(passwords);
  } catch {
    console.error('Failed to parse CLIENT_PASSWORDS env variable');
    return {};
  }
}

export function getClientPassword(clientName: string): string | null {
  const passwords = getClientPasswords();
  // Try exact match first, then lowercase
  return passwords[clientName] || passwords[clientName.toLowerCase()] || null;
}

export async function verifyClientAccess(clientName: string): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(`client_auth_${clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);

  if (!authCookie) return false;

  const expectedPassword = getClientPassword(clientName);
  if (!expectedPassword) return false;

  // Simple hash check - in production you'd want proper encryption
  return authCookie.value === hashPassword(clientName, expectedPassword);
}

export function hashPassword(clientName: string, password: string): string {
  // Simple hash for cookie value - combines client name and password
  const combined = `${clientName.toLowerCase()}:${password}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function createAuthCookie(clientName: string, password: string): { name: string; value: string } {
  const cookieName = `client_auth_${clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const cookieValue = hashPassword(clientName, password);
  return { name: cookieName, value: cookieValue };
}

export async function setAuthCookie(clientName: string, password: string): Promise<NextResponse> {
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
}
