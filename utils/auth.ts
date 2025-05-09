import { supabase } from '@/utils/supabase';
import { jwtDecode } from 'jwt-decode';

// Types
export interface JWTPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
    };
  };
}

// 2FA Implementation
export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
}

interface TOTPFactor {
  id: string;
  type: 'totp';
  totp: {
    secret: string;
    uri: string;
  };
  friendly_name?: string;
}

// Session management
export const getSession = async (): Promise<Session | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session as Session;
};

export const refreshSession = async (): Promise<Session | null> => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error || !session) return null;
  return session as Session;
};

// JWT validation
export const validateToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    return false;
  }
};

// Authentication middleware
export const requireAuth = async (req: Request): Promise<boolean> => {
  const session = await getSession();
  if (!session) return false;
  
  const isValid = validateToken(session.access_token);
  if (!isValid) {
    const refreshed = await refreshSession();
    if (!refreshed) return false;
  }
  
  return true;
};

// Error handling
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Rate limiting
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

const requestCounts = new Map<string, number[]>();

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW;
  
  // Get existing requests for this IP
  const requests = requestCounts.get(ip) || [];
  
  // Remove old requests
  const recentRequests = requests.filter(time => time > windowStart);
  
  // Check if rate limit exceeded
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  // Add new request
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  
  return true;
};

// 2FA Implementation
export const setupTwoFactor = async (userId: string): Promise<{ secret: string; qrCode: string }> => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: '2FA Device'
    });

    if (error || !data) throw new AuthError(error?.message || '2FA setup failed', '2FA_SETUP_FAILED');
    
    // Get the TOTP factor
    const totpFactor = data as TOTPFactor;
    if (!totpFactor || totpFactor.type !== 'totp') {
      throw new AuthError('TOTP factor not found', '2FA_SETUP_FAILED');
    }

    return { 
      secret: totpFactor.totp.secret,
      qrCode: totpFactor.totp.uri
    };
  } catch (error) {
    throw new AuthError('Failed to setup 2FA', '2FA_SETUP_FAILED');
  }
};

export const verifyTwoFactor = async (challengeId: string, code: string): Promise<boolean> => {
  try {
    // First get the challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: challengeId
    });

    if (challengeError || !challengeData) {
      throw new AuthError(challengeError?.message || 'Failed to get challenge', '2FA_CHALLENGE_FAILED');
    }

    // Then verify with the challenge
    const { data, error } = await supabase.auth.mfa.verify({
      challengeId: challengeData.id,
      code
    });

    if (error) throw new AuthError(error.message, '2FA_VERIFICATION_FAILED');
    return true;
  } catch (error) {
    throw new AuthError('Failed to verify 2FA', '2FA_VERIFICATION_FAILED');
  }
};

export const generateBackupCodes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw new AuthError(error.message, 'BACKUP_CODES_GENERATION_FAILED');
    
    // Generate 8 random backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 15)
    );
    
    return codes;
  } catch (error) {
    throw new AuthError('Failed to generate backup codes', 'BACKUP_CODES_GENERATION_FAILED');
  }
};

// Enhanced session management
export const refreshSessionWithRotation = async (): Promise<Session | null> => {
  try {
    const session = await getSession();
    if (!session) return null;

    // Check if refresh is needed
    const tokenExpiry = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (tokenExpiry - now > 300) { // 5 minutes buffer
      return session;
    }

    // Perform refresh
    const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
    if (error) throw new AuthError(error.message, 'SESSION_REFRESH_FAILED');

    // Sign out from current session
    await supabase.auth.signOut();

    return newSession as Session;
  } catch (error) {
    throw new AuthError('Failed to refresh session', 'SESSION_REFRESH_FAILED');
  }
};

// Session invalidation
export const invalidateSession = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AuthError(error.message, 'SESSION_INVALIDATION_FAILED');
  } catch (error) {
    throw new AuthError('Failed to invalidate session', 'SESSION_INVALIDATION_FAILED');
  }
}; 