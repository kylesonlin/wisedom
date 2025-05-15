import { NextRequest, NextResponse } from 'next/server';
import { openApiConfig } from '@/lib/openapi';

export async function GET(request: NextRequest) {
  return NextResponse.json(openApiConfig);
} 