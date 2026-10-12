import { useState, useRef, useEffect, type FormEvent, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { CustomButton, CustomText } from '@/components/ui'

const API_BASE_URL = 'https://prepforabackend-production.up.railway.app'

export function VerifyPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const navigate = useNavigate()

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [isVerified, setIsVerified] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect to login if no email is provided
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  // Countdown for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError(null)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (digit && index === 5 && newOtp.every((d) => d !== '')) {
      setTimeout(() => {
        const fullCode = newOtp.join('')
        if (fullCode.length === 6) {
          submitOtp(fullCode)
        }
      }, 50)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)

    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()

    if (pasted.length === 6) {
      submitOtp(pasted)
    }
  }

  const submitOtp = async (code: string) => {
    if (!email || code.length < 6) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: code.trim(),
        }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success !== false) {
        if (data?.data?.access_token || data?.access_token) {
          const accessToken = data?.data?.access_token || data?.access_token
          const refreshToken = data?.data?.refresh_token || data?.refresh_token
          const user = data?.data?.user || data?.user || { email }

          localStorage.setItem('prepfora_access_token', accessToken)
          if (refreshToken) {
            localStorage.setItem('prepfora_refresh_token', refreshToken)
          }
          localStorage.setItem('prepfora_user', JSON.stringify(user))

          navigate('/dashboard', { replace: true })
          return
        }

        setIsVerified(true)
        setSuccessMessage('Email verified successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(data?.message || 'Invalid or expired code. Please try again.')
      }
    } catch {
      setError('Network connection error. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success !== false) {
        setSuccessMessage('A new verification code has been sent to your email.')
        setResendCooldown(60)
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setError(data?.message || 'Failed to resend code. Please try again.')
      }
    } catch {
      setError('Network connection error. Failed to resend code.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    const fullCode = otp.join('')
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits.')
      return
    }
    submitOtp(fullCode)
  }

  return (
    <AuthLayout>
      <div className="w-full flex flex-col">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-neutral-800 hover:text-neutral-900 transition-colors w-fit p-0 cursor-pointer mb-8 group"
        >
          <svg
            className="w-6 h-6 text-neutral-800 group-hover:scale-105 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 8l-4 4 4 4" />
          </svg>
          <CustomText type="label-md" className="text-sm font-medium text-neutral-800">
            Back
          </CustomText>
        </button>

        {/* Title & Subtitle */}
        <div className="text-left mb-8">
          <CustomText
            type="headline-lg"
            className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
          >
            Verify your email
          </CustomText>
          <CustomText
            type="body-md"
            className="text-neutral-700 text-sm sm:text-base mt-2.5 leading-relaxed block"
          >
            An email with a 6–digit code has been sent to{' '}
            <span className="font-semibold text-neutral-900">{email}</span>.
          </CustomText>
        </div>

        {/* Form Card or Success Confirmation */}
        {isVerified ? (
          <div className="w-full p-8 flex flex-col items-center gap-4 rounded-2xl bg-white shadow-sm border border-neutral-100/90 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <CustomText type="title-lg" className="text-xl font-bold text-neutral-900">
              Email Verified!
            </CustomText>
            <CustomText type="body-md" className="text-neutral-600 text-sm">
              Your email <strong className="text-neutral-800">{email}</strong> has been successfully verified.
            </CustomText>
            <CustomButton
              variant="primary"
              onPress={() => navigate('/login')}
              className="mt-2 bg-[#2563eb] text-white"
            >
              Back to Log In
            </CustomButton>
          </div>
        ) : (
          <form
            onSubmit={handleFormSubmit}
            className="w-full p-6 sm:p-7 flex flex-col gap-6 rounded-2xl bg-white shadow-sm border border-neutral-100/90"
          >
            {/* 6 Digit Inputs */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3 w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  placeholder={String(index + 1)}
                  className="w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-medium border border-neutral-300 rounded-xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              ))}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <CustomText type="body-sm">{error}</CustomText>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && !error && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <CustomText type="body-sm">{successMessage}</CustomText>
              </div>
            )}

            {/* Continue Button */}
            <CustomButton
              type="submit"
              variant="primary"
              fullWidth
              size="md"
              loading={isLoading}
              disabled={otp.some((d) => d === '')}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl"
            >
              Continue
            </CustomButton>

            {/* Resend Code Link */}
            <div className="text-center text-xs text-neutral-500 pt-1">
              <span>Didn't receive the code? </span>
              {resendCooldown > 0 ? (
                <span className="font-semibold text-neutral-700">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                >
                  Resend code
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
