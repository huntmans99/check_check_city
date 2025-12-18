// Shared OTP store for API routes
export const otpStore: Map<string, { code: string; expiresAt: number }> = new Map();
export const verifiedOtps: Map<string, { expiresAt: number }> = new Map();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOtpExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
