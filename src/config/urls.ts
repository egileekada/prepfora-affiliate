export const URLS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VALIDATE_OTP: "/auth/validate-otp",
  REFRESH_TOKEN: "/auth/refresh-token",
  USER_PROFILE: "/auth/me",
  REFERRALS: "/affiliate/referrals",
  EARNINGS: "/affiliate/earnings",
  WITHDRAW: "/affiliate/withdraw",
  PAYOUT_ACCOUNT: "/affiliate/payout-account",
} as const;

export default URLS;
