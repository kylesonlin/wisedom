import { createClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { z } from 'zod';

// Types
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
}

// Validation schemas
export const twoFactorSetupSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
});

export const twoFactorVerifySchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6),
  isBackupCode: z.boolean().optional(),
});

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Generate a new TOTP secret
export const generateTOTPSecret = (): string => {
  return authenticator.generateSecret();
};

// Generate QR code for TOTP setup
export const generateQRCode = async (secret: string, email: string): Promise<string> => {
  const otpauth = authenticator.keyuri(email, 'Your App Name', secret);
  return QRCode.toDataURL(otpauth);
};

// Generate backup codes
export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Math.random().toString(36).substring(2, 15).toUpperCase();
    codes.push(code);
  }
  return codes;
};

// Setup 2FA for a user
export const setupTwoFactor = async (userId: string, email: string): Promise<TwoFactorSetup> => {
  try {
    // Generate new TOTP secret
    const secret = generateTOTPSecret();
    
    // Generate QR code
    const qrCode = await generateQRCode(secret, email);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Store in database
    const { error } = await supabase
      .from('user_two_factor')
      .upsert({
        user_id: userId,
        secret,
        backup_codes: backupCodes,
        enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw new Error('Failed to store 2FA setup');

    return {
      secret,
      qrCode,
      backupCodes,
    };
  } catch (error) {
    throw new Error('Failed to setup 2FA');
  }
};

// Verify 2FA setup
export const verifyTwoFactorSetup = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    // Get user's 2FA secret
    const { data, error } = await supabase
      .from('user_two_factor')
      .select('secret')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new Error('2FA not setup');

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: data.secret,
    });

    if (isValid) {
      // Enable 2FA
      await supabase
        .from('user_two_factor')
        .update({ enabled: true })
        .eq('user_id', userId);
    }

    return isValid;
  } catch (error) {
    throw new Error('Failed to verify 2FA setup');
  }
};

// Verify 2FA code
export const verifyTwoFactor = async (
  userId: string,
  code: string,
  isBackupCode: boolean = false
): Promise<TwoFactorVerification> => {
  try {
    // Get user's 2FA data
    const { data, error } = await supabase
      .from('user_two_factor')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new Error('2FA not setup');
    if (!data.enabled) throw new Error('2FA not enabled');

    if (isBackupCode) {
      // Verify backup code
      const isValid = data.backup_codes.includes(code);
      if (isValid) {
        // Remove used backup code
        const newBackupCodes = data.backup_codes.filter((c: string) => c !== code);
        await supabase
          .from('user_two_factor')
          .update({ backup_codes: newBackupCodes })
          .eq('user_id', userId);
      }
      return { isValid, backupCodeUsed: true };
    } else {
      // Verify TOTP code
      const isValid = authenticator.verify({
        token: code,
        secret: data.secret,
      });
      return { isValid, backupCodeUsed: false };
    }
  } catch (error) {
    throw new Error('Failed to verify 2FA');
  }
};

// Disable 2FA
export const disableTwoFactor = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_two_factor')
      .update({
        enabled: false,
        secret: null,
        backup_codes: [],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw new Error('Failed to disable 2FA');
  } catch (error) {
    throw new Error('Failed to disable 2FA');
  }
};

// Regenerate backup codes
export const regenerateBackupCodes = async (userId: string): Promise<string[]> => {
  try {
    const backupCodes = generateBackupCodes();
    
    const { error } = await supabase
      .from('user_two_factor')
      .update({
        backup_codes: backupCodes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw new Error('Failed to regenerate backup codes');

    return backupCodes;
  } catch (error) {
    throw new Error('Failed to regenerate backup codes');
  }
}; 