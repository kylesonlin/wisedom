export interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
  expires: string;
  requiresTwoFactor?: boolean;
  twoFactorVerified?: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  code: string;
  isBackupCode?: boolean;
} 