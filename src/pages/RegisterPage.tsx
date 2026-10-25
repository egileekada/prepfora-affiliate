import { useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { AuthLayout } from '../components/auth/AuthLayout'
import { CustomButton, CustomText, FormikField } from '@/components/ui'
import { useAuthApi } from '@/hooks'
import { showSuccess, showError } from '@/config/toast'
import { Sparkles, Ticket, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

interface RegisterFormValues {
  name: string
  email: string
  invite_code: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const queryCode = searchParams.get('code') || searchParams.get('invite_code') || ''
  const queryEmail = searchParams.get('email') || ''

  const hasInviteContext = Boolean(queryCode || queryEmail)

  const { registerAffiliate, isLoading, error } = useAuthApi()

  const initialValues: RegisterFormValues = useMemo(
    () => ({
      name: '',
      email: queryEmail.trim(),
      invite_code: queryCode.trim(),
    }),
    [queryEmail, queryCode]
  )

  const validate = (values: RegisterFormValues) => {
    const errors: Partial<Record<keyof RegisterFormValues, string>> = {}

    const trimmedName = values.name.trim()
    const trimmedEmail = values.email.trim()
    const trimmedCode = values.invite_code.trim()

    if (!trimmedName) {
      errors.name = 'Full name is required.'
    } else if (trimmedName.length < 2) {
      errors.name = 'Full name must be at least 2 characters.'
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!trimmedCode) {
      errors.invite_code = '6-digit invite code is required.'
    } else if (trimmedCode.length !== 6) {
      errors.invite_code = 'Invite code must be exactly 6 characters.'
    }

    return errors
  }

  const handleSubmit = async (values: RegisterFormValues) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      invite_code: values.invite_code.trim(),
    }

    const result = await registerAffiliate(payload)

    if (result.success) {
      showSuccess(result.message || 'Welcome to Prepfora Affiliate Program!')
      navigate('/dashboard', { replace: true })
    } else {
      showError(result.message || 'Registration failed.')
    }
  }

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-6 sm:gap-7">
        {/* Header Section */}
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Affiliate Partner Program</span>
          </div>

          <CustomText
            type="headline-lg"
            className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
          >
            Create Your Account
          </CustomText>

          <CustomText
            type="body-md"
            className="text-neutral-600 text-sm sm:text-base mt-2 leading-relaxed"
          >
            {hasInviteContext
              ? 'Complete your profile details below to activate your affiliate partner portal.'
              : 'Join the Prepfora Affiliate Program using your exclusive 6-digit invite code.'}
          </CustomText>
        </div>

        {/* Exclusive Invite Verified Banner (if query params present) */}
        {hasInviteContext && (
          <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/80 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Verified Invitation Link</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              </p>
              <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                Invite code <span className="font-mono font-bold">{queryCode || 'Applied'}</span> is preloaded. Enter your full name to start earning commissions.
              </p>
            </div>
          </div>
        )}

        {/* Registration Card */}
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ values, isValid, dirty }) => (
            <Form className="w-full p-6 sm:p-7 flex flex-col gap-5 rounded-2xl bg-white shadow-sm border border-neutral-100/90">
              {/* Full Name */}
              <div>
                <FormikField
                  name="name"
                  label="Full Name *"
                  type="text"
                  placeholder="e.g. Jane Doe"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Email Address */}
              <div>
                <FormikField
                  name="email"
                  label="Email Address *"
                  type="email"
                  placeholder="name@company.com"
                  disabled={isLoading}
                  className="w-full"
                />
                {queryEmail && (
                  <p className="text-[11px] text-neutral-500 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Prefilled from your invitation link</span>
                  </p>
                )}
              </div>

              {/* Invite Code */}
              <div>
                <div className="relative">
                  <FormikField
                    name="invite_code"
                    label="6-Digit Invite Code *"
                    type="text"
                    placeholder="369362"
                    disabled={isLoading}
                    className="w-full tracking-wider font-mono font-semibold"
                  />
                  <div className="absolute right-3.5 top-9.5 text-neutral-400 pointer-events-none">
                    <Ticket className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Required 6-digit code received via your invite email
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-in fade-in">
                  <p className="font-semibold text-red-800">Registration Error</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              )}

              {/* Terms note */}
              <div className="text-[11px] text-neutral-500 leading-relaxed bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                By clicking Complete Registration, you agree to the{' '}
                <span className="font-semibold text-neutral-700">Prepfora Partner Terms</span> and acknowledge that commission payouts require a valid payout method.
              </div>

              {/* Submit Button */}
              <CustomButton
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                loading={isLoading}
                disabled={isLoading || (!isValid && dirty) || !values.name || !values.email || !values.invite_code}
                className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl mt-1 py-3"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </CustomButton>

              {/* Login link */}
              <div className="pt-2 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-600">
                  Already registered as an affiliate?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
