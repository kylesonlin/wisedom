import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    return NextResponse.json({
      data: {
        id,
        title: `Widget ${id}`,
        content: 'Sample widget data',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load widget data' },
      { status: 500 }
    );
  }
} 