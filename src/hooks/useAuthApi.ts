import { useState, useCallback } from 'react'
import { httpService, unsecureHttpService, tokenStorage } from '@/config/httpService'
import URLS from '@/config/urls'
import type { AxiosError } from 'axios'

export interface AuthApiResponse<T = unknown> {
  success?: boolean
  message?: string
  data?: T
  access_token?: string
  refresh_token?: string
  user?: unknown
}

export interface ValidateOtpResultData {
  access_token?: string
  refresh_token?: string
  user?: {
    id?: string
    email?: string
    first_name?: string
    last_name?: string
    role?: string
    [key: string]: unknown
  }
}

export interface AffiliateRegisterPayload {
  name: string
  email: string
  invite_code: string
}

export interface AffiliateProfile {
  id: string
  name: string
  email: string
  code: string
  isSuspended?: boolean
  created_at?: string | null
  updated_at?: string | null
  role?: string
}

export interface AffiliateTokenData {
  access_token: string
  refresh_token: string
  token_type?: string
}

export interface AffiliateRegisterResponseData {
  tokens?: {
    access_token?: string
    refresh_token?: string
    token_type?: string
  }
  affiliate?: {
    id?: string
    name?: string
    email?: string
    code?: string
    isSuspended?: boolean
    created_at?: string | null
    updated_at?: string | null
  }
}

export function useAuthApi() {

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const login = useCallback(async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await unsecureHttpService.post<AuthApiResponse>(
        URLS.AFFILIATE_LOGIN,
        { email: cleanEmail }
      )
      const data = response.data

      if (data?.success !== false) {
        setSuccessMessage(data?.message || 'Verification code sent to your email.')
        return { success: true, message: data?.message, isNewUser: false }
      }

      const errMsg = data?.message || 'Failed to send login code.'
      const isNewUser =
        errMsg.toLowerCase().includes('does not exist') ||
        errMsg.toLowerCase().includes('not found')
      setError(
        isNewUser
          ? 'No affiliate account found with this email. Please register with your invite code.'
          : errMsg
      )
      return { success: false, message: errMsg, isNewUser }
    } catch (err) {
      const axiosErr = err as AxiosError<{
        detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
        message?: string
      }>
      const resData = axiosErr.response?.data
      let rawMsg = ''

      if (typeof resData === 'string') {
        rawMsg = resData
      } else if (resData) {
        if (typeof resData.detail === 'string') {
          rawMsg = resData.detail
        } else if (Array.isArray(resData.detail) && resData.detail[0]?.msg) {
          rawMsg = resData.detail[0].msg
        } else if (resData.message) {
          rawMsg = resData.message
        }
      }

      if (!rawMsg) {
        rawMsg = axiosErr.message || 'Failed to connect to the server. Please try again.'
      }

      const isNewUser =
        rawMsg.toLowerCase().includes('does not exist') ||
        rawMsg.toLowerCase().includes('not found')

      const formattedMsg = isNewUser
        ? 'No affiliate account found with this email. Please register with your invite code.'
        : rawMsg

      setError(formattedMsg)
      return { success: false, message: formattedMsg, isNewUser }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await unsecureHttpService.post<AuthApiResponse>(
        URLS.REGISTER,
        { email: cleanEmail }
      )
      const data = response.data

      if (data?.success !== false) {
        setSuccessMessage(data?.message || 'Verification code sent to your email.')
        return { success: true, message: data?.message }
      }

      const errMsg = data?.message || 'Registration failed.'
      setError(errMsg)
      return { success: false, message: errMsg }
    } catch (err) {
      const axiosErr = err as AxiosError<AuthApiResponse>
      const errMsg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Registration failed. Please try again.'
      setError(errMsg)
      return { success: false, message: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const validateOtp = useCallback(async (email: string, otp: string) => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await unsecureHttpService.post<
        AuthApiResponse<AffiliateRegisterResponseData | ValidateOtpResultData>
      >(URLS.AFFILIATE_VERIFY_OTP, {
        email: cleanEmail,
        otp: cleanOtp,
      })

      const data = response.data

      if (data?.success !== false) {
        const payload: any = data?.data

        const tokens =
          payload?.tokens ||
          (data as any)?.tokens

        const accessToken =
          tokens?.access_token ||
          payload?.access_token ||
          (data as any)?.access_token ||
          payload?.token

        const refreshToken =
          tokens?.refresh_token ||
          payload?.refresh_token ||
          (data as any)?.refresh_token

        const affiliate =
          payload?.affiliate ||
          payload?.user ||
          (data as any)?.affiliate ||
          (data as any)?.user

        if (accessToken) {
          tokenStorage.setAccess(accessToken)
          if (typeof window !== 'undefined') {
            localStorage.setItem('prepfora_access_token', accessToken)
            if (refreshToken) {
              tokenStorage.setRefresh(refreshToken)
              localStorage.setItem('prepfora_refresh_token', refreshToken)
            }
            const userObj = {
              id: affiliate?.id,
              name: affiliate?.name || affiliate?.first_name || cleanEmail,
              email: affiliate?.email || cleanEmail,
              code: affiliate?.code,
              role: 'Affiliate',
            }
            localStorage.setItem('prepfora_user', JSON.stringify(userObj))
          }
        }

        const msg = data?.message || 'Verification successful!'
        setSuccessMessage(msg)
        return { success: true, hasTokens: Boolean(accessToken), token: accessToken, user: affiliate }
      }

      const errMsg = data?.message || 'Invalid or expired code. Please try again.'
      setError(errMsg)
      return { success: false, hasTokens: false, message: errMsg }
    } catch (err) {
      const axiosErr = err as AxiosError<{
        detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
        message?: string
      }>
      const resData = axiosErr.response?.data
      let errMsg = 'Verification failed. Please check your connection and try again.'

      if (typeof resData === 'string') {
        errMsg = resData
      } else if (resData) {
        if (typeof resData.detail === 'string') {
          errMsg = resData.detail
        } else if (Array.isArray(resData.detail) && resData.detail[0]?.msg) {
          errMsg = resData.detail[0].msg
        } else if (resData.message) {
          errMsg = resData.message
        }
      } else if (axiosErr.message) {
        errMsg = axiosErr.message
      }

      setError(errMsg)
      return { success: false, hasTokens: false, message: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const registerAffiliate = useCallback(
    async ({ name, email, invite_code }: AffiliateRegisterPayload) => {
      const cleanEmail = email.trim().toLowerCase()
      const cleanName = name.trim()
      const cleanCode = invite_code.trim()

      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const response = await unsecureHttpService.post<
          AuthApiResponse<AffiliateRegisterResponseData>
        >(URLS.AFFILIATE_REGISTER, {
          name: cleanName,
          email: cleanEmail,
          invite_code: cleanCode,
        })
        const data = response.data

        if (data?.success !== false) {
          const payload = data?.data
          const tokens = payload?.tokens || (data as unknown as { tokens?: { access_token?: string; refresh_token?: string } })?.tokens
          const affiliate = payload?.affiliate || (data as unknown as { affiliate?: { id?: string; name?: string; email?: string; code?: string } })?.affiliate

          const accessToken = tokens?.access_token || (data as unknown as { access_token?: string })?.access_token
          const refreshToken = tokens?.refresh_token || (data as unknown as { refresh_token?: string })?.refresh_token

          if (accessToken) {
            tokenStorage.setAccess(accessToken)
            if (typeof window !== 'undefined') {
              localStorage.setItem('prepfora_access_token', accessToken)
              if (refreshToken) {
                tokenStorage.setRefresh(refreshToken)
                localStorage.setItem('prepfora_refresh_token', refreshToken)
              }
              const userObj = {
                id: affiliate?.id,
                name: affiliate?.name || cleanName,
                first_name: affiliate?.name || cleanName,
                email: affiliate?.email || cleanEmail,
                code: affiliate?.code,
                role: 'Affiliate',
              }
              localStorage.setItem('prepfora_user', JSON.stringify(userObj))
            }
          }

          setSuccessMessage(data?.message || 'Registration successful!')
          return {
            success: true,
            message: data?.message || 'Registration successful!',
            data: payload,
          }
        }

        const errMsg = data?.message || 'Registration failed.'
        setError(errMsg)
        return { success: false, message: errMsg }
      } catch (err) {
        const axiosErr = err as AxiosError<{
          detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
          message?: string
        }>
        const resData = axiosErr.response?.data
        let errMsg = 'Registration failed. Please check your invite code and try again.'

        if (resData) {
          if (typeof resData.detail === 'string') {
            errMsg = resData.detail
          } else if (Array.isArray(resData.detail) && resData.detail[0]?.msg) {
            errMsg = resData.detail[0].msg
          } else if (resData.message) {
            errMsg = resData.message
          }
        } else if (axiosErr.message) {
          errMsg = axiosErr.message
        }

        setError(errMsg)
        return { success: false, message: errMsg }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getCurrentAffiliate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await httpService.get<AuthApiResponse<AffiliateProfile>>(
        URLS.AFFILIATE_ME
      )
      const data = response.data

      if (data?.success !== false && data?.data) {
        const affiliate = data.data
        const userObj: AffiliateProfile = {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          code: affiliate.code,
          isSuspended: affiliate.isSuspended,
          created_at: affiliate.created_at,
          updated_at: affiliate.updated_at,
          role: 'Affiliate',
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('prepfora_user', JSON.stringify(userObj))
        }

        return { success: true, affiliate: userObj }
      }

      const errMsg = data?.message || 'Failed to fetch affiliate profile.'
      setError(errMsg)
      return { success: false, message: errMsg }
    } catch (err) {
      const axiosErr = err as AxiosError<{
        detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
        message?: string
      }>
      const resData = axiosErr.response?.data
      let errMsg = 'Failed to fetch affiliate profile.'

      if (typeof resData === 'string') {
        errMsg = resData
      } else if (resData) {
        if (typeof resData.detail === 'string') {
          errMsg = resData.detail
        } else if (Array.isArray(resData.detail) && resData.detail[0]?.msg) {
          errMsg = resData.detail[0].msg
        } else if (resData.message) {
          errMsg = resData.message
        }
      } else if (axiosErr.message) {
        errMsg = axiosErr.message
      }

      setError(errMsg)
      return { success: false, message: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshAffiliateToken = useCallback(async () => {
    try {
      const currentRefresh = tokenStorage.getRefresh()
      if (!currentRefresh) {
        return { success: false, message: 'No refresh token available.' }
      }

      const response = await unsecureHttpService.post<
        AuthApiResponse<AffiliateTokenData>
      >(URLS.AFFILIATE_REFRESH_TOKEN, {
        refresh_token: currentRefresh,
      })

      const data = response.data

      if (data?.success !== false && data?.data) {
        const payload = data.data
        const accessToken = payload.access_token
        const refreshToken = payload.refresh_token

        if (accessToken) {
          tokenStorage.setAccess(accessToken)
          if (typeof window !== 'undefined') {
            localStorage.setItem('prepfora_access_token', accessToken)
            if (refreshToken) {
              tokenStorage.setRefresh(refreshToken)
              localStorage.setItem('prepfora_refresh_token', refreshToken)
            }
          }
          return { success: true, data: payload }
        }
      }

      const errMsg = data?.message || 'Failed to refresh token.'
      return { success: false, message: errMsg }
    } catch (err) {
      const axiosErr = err as AxiosError<{
        detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
        message?: string
      }>
      const resData = axiosErr.response?.data
      let errMsg = 'Failed to refresh affiliate token.'

      if (typeof resData === 'string') {
        errMsg = resData
      } else if (resData) {
        if (typeof resData.detail === 'string') {
          errMsg = resData.detail
        } else if (Array.isArray(resData.detail) && resData.detail[0]?.msg) {
          errMsg = resData.detail[0].msg
        } else if (resData.message) {
          errMsg = resData.message
        }
      } else if (axiosErr.message) {
        errMsg = axiosErr.message
      }

      return { success: false, message: errMsg }
    }
  }, [])

  const resendOtp = useCallback(async (email: string) => {
    return login(email)
  }, [login])

  return {
    login,
    register,
    registerAffiliate,
    validateOtp,
    resendOtp,
    getCurrentAffiliate,
    refreshAffiliateToken,
    isLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
  }
}

export default useAuthApi

