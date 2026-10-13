import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { AuthLayout } from '../components/auth/AuthLayout'
import { CustomButton, CustomText, OTPInput } from '@/components/ui'
import { useAuthApi } from '@/hooks'
import { showSuccess, showError } from '@/config/toast'

interface VerifyFormValues {
  otp: string
}

export function VerifyPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const navigate = useNavigate()

  const { validateOtp, resendOtp, isLoading, error, successMessage } =
    useAuthApi()

  const [resendCooldown, setResendCooldown] = useState(60)

  // Redirect to login if no email is provided in search params
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  // Countdown for resend timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleOtpSubmit = async (values: VerifyFormValues) => {
    const code = values.otp.trim()
    if (!email || code.length !== 6) {
      showError('Please enter all 6 digits.')
      return
    }

    const result = await validateOtp(email, code)

    if (result.success) {
      showSuccess('Verification successful! Welcome to your dashboard.')
      navigate('/dashboard', { replace: true })
    } else {
      showError(result.message || 'Invalid or expired code. Please try again.')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading || !email) return
    const result = await resendOtp(email)
    if (result.success) {
      setResendCooldown(60)
      showSuccess('A new verification code has been sent to your email.')
    } else {
      showError(result.message || 'Failed to resend code.')
    }
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

        {/* Form Card */}
        <Formik
          initialValues={{ otp: '' }}
          onSubmit={handleOtpSubmit}
        >
            {({ values }) => (
              <Form className="w-full p-6 sm:p-7 flex flex-col gap-6 rounded-2xl bg-white shadow-sm border border-neutral-100/90">
                {/* 6 Digit HeroUI OTP Input */}
                <div className="flex justify-center w-full">
                  <OTPInput
                    name="otp"
                    length={6}
                    isLoading={isLoading}
                    error={Boolean(error)}
                  />
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
                  disabled={isLoading || values.otp.length !== 6}
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
              </Form>
            )}
          </Formik>
      </div>
    </AuthLayout>
  )
}

export default VerifyPage
