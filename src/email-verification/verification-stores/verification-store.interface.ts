// src/auth/email-verification/stores/verification-store.interface.ts
export interface VerificationStore {
  saveCode(email: string, code: string, ttlSeconds: number): Promise<void>;
  getCode(email: string): Promise<string | null>;
  deleteCode(email: string): Promise<void>;
}
