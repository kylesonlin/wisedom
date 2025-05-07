import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    user: {
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.png',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
} 