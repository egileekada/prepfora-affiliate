export const URLS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  AFFILIATE_REGISTER: "/affiliate/auth/register",
  AFFILIATE_LOGIN: "/affiliate/auth/login",
  AFFILIATE_VERIFY_OTP: "/affiliate/auth/verify-otp",
  AFFILIATE_REFRESH_TOKEN: "/affiliate/auth/refresh-token",
  AFFILIATE_ME: "/affiliate/auth/me",
  VALIDATE_OTP: "/auth/validate-otp",
  REFRESH_TOKEN: "/affiliate/auth/refresh-token",
  USER_PROFILE: "/affiliate/auth/me",
  REFERRALS: "/affiliate/referrals",
  EARNINGS: "/affiliate/earnings",
  WITHDRAW: "/affiliate/withdraw",
  PAYOUT_ACCOUNT: "/affiliate/payout-account",
} as const;

export default URLS;

