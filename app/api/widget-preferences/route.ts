import { NextResponse } from 'next/server';
import { mockWidgetPreferences } from '../../../cypress/support/mocks/user';

export async function GET() {
  return NextResponse.json(mockWidgetPreferences);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
} 