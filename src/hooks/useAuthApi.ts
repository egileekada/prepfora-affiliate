import { useState, useCallback } from 'react'
import { unsecureHttpService, tokenStorage } from '@/config/httpService'
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
        URLS.LOGIN,
        { email: cleanEmail }
      )
      const data = response.data

      if (data?.success !== false) {
        setSuccessMessage(data?.message || 'Verification code sent to your email.')
        return { success: true, message: data?.message, isNewUser: false }
      }

      const errMsg = data?.message || 'Failed to send login code.'
      const isNewUser = errMsg.toLowerCase().includes('does not exist') || errMsg.toLowerCase().includes('not found')
      setError(
        isNewUser
          ? 'No account found with this email. Click "Create Account" below to register and receive your verification code.'
          : errMsg
      )
      return { success: false, message: errMsg, isNewUser }
    } catch (err) {
      const axiosErr = err as AxiosError<AuthApiResponse>
      const responseData = axiosErr.response?.data
      const rawMsg =
        (typeof responseData === 'string' ? responseData : responseData?.message) ||
        axiosErr.message ||
        'Failed to connect to the server. Please try again.'

      const isNewUser =
        rawMsg.toLowerCase().includes('does not exist') ||
        rawMsg.toLowerCase().includes('not found')

      const formattedMsg = isNewUser
        ? 'No account found with this email. Click "Create Account" below to register and receive your verification code.'
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
        AuthApiResponse<ValidateOtpResultData>
      >(URLS.VALIDATE_OTP, {
        email: cleanEmail,
        otp: cleanOtp,
      })

      const data = response.data

      if (data?.success !== false) {
        const payload: any = data?.data

        console.log(payload);


        const accessToken =
          payload?.tokens?.access_token ||
          payload?.access_token ||
          (data as any)?.tokens?.access_token ||
          (data as any)?.access_token ||
          payload?.tokens?.token ||
          payload?.token

        const refreshToken =
          payload?.tokens?.refresh_token ||
          payload?.refresh_token ||
          (data as any)?.tokens?.refresh_token ||
          (data as any)?.refresh_token

        const user = payload?.user || (data as any)?.user || { email: cleanEmail }

        const tokenToStore = accessToken || `token_${Date.now()}`
        tokenStorage.setAccess(tokenToStore)
        if (typeof window !== 'undefined') {
          localStorage.setItem('prepfora_access_token', tokenToStore)
          if (refreshToken) {
            tokenStorage.setRefresh(refreshToken)
            localStorage.setItem('prepfora_refresh_token', refreshToken)
          }
          localStorage.setItem('prepfora_user', JSON.stringify(user))
        }

        return { success: true, hasTokens: true, token: tokenToStore, user }
      }

      const errMsg = data?.message || 'Invalid or expired code. Please try again.'
      setError(errMsg)
      return { success: false, hasTokens: false, message: errMsg }
    } catch (err) {
      const axiosErr = err as AxiosError<AuthApiResponse>
      const errMsg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Verification failed. Please check your connection and try again.'
      setError(errMsg)
      return { success: false, hasTokens: false, message: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resendOtp = useCallback(async (email: string) => {
    return login(email)
  }, [login])

  return {
    login,
    register,
    validateOtp,
    resendOtp,
    isLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
  }
}

export default useAuthApi
