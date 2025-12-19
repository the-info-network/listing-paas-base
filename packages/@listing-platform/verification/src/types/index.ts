/**
 * Types for Verification SDK
 */
export type VerificationType = 'identity' | 'business' | 'phone' | 'email' | 'social' | 'background' | 'license';

export interface Verification {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  verifiedAt?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export type VerificationStatus = 'pending' | 'processing' | 'verified' | 'rejected' | 'expired';

export interface VerificationRequest {
  type: VerificationType;
  documents?: File[];
  data?: Record<string, string>;
}

export interface VerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
  requiresReview?: boolean;
}

export interface Badge {
  type: VerificationType;
  label: string;
  icon: string;
  color: string;
}

export interface VerificationConfig {
  enabledTypes: VerificationType[];
  requiredForListing?: boolean;
  provider?: 'stripe' | 'jumio' | 'onfido' | 'custom';
}
