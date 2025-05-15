import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
  twoFactorSetupSchema,
  twoFactorVerifySchema,
} from '@/utils/two-factor';
import { getSession } from '@/utils/auth';
import { ApiError } from '@/utils/errors';

// POST /api/auth/2fa/setup
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const body = await req.json();
    const { code } = twoFactorSetupSchema.parse({
      userId: session.user.id,
      code: body.code,
    });

    const isValid = await verifyTwoFactorSetup(session.user.id, code);
    if (!isValid) {
      throw new ApiError('Invalid 2FA code', 400, 'INVALID_2FA_CODE');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET /api/auth/2fa/setup
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const setup = await setupTwoFactor(session.user.id, session.user.email);
    return NextResponse.json(setup);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/auth/2fa/verify
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const body = await req.json();
    const { code, isBackupCode } = twoFactorVerifySchema.parse({
      userId: session.user.id,
      code: body.code,
      isBackupCode: body.isBackupCode,
    });

    const result = await verifyTwoFactor(session.user.id, code, isBackupCode);
    if (!result.isValid) {
      throw new ApiError('Invalid 2FA code', 400, 'INVALID_2FA_CODE');
    }

    return NextResponse.json({ success: true, backupCodeUsed: result.backupCodeUsed });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', code: 'VALIDATION_ERROR', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/2fa
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    await disableTwoFactor(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/auth/2fa/backup-codes
export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const backupCodes = await regenerateBackupCodes(session.user.id);
    return NextResponse.json({ backupCodes });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
} 