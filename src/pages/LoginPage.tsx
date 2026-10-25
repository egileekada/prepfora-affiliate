import { useNavigate, Link } from 'react-router-dom'

import { Formik, Form } from 'formik'
import { AuthLayout } from '../components/auth/AuthLayout'
import { CustomButton, CustomText, FormikField } from '@/components/ui'
import { useAuthApi } from '@/hooks'
import { showSuccess, showError } from '@/config/toast'

interface LoginFormValues {
  email: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthApi()

  const initialValues: LoginFormValues = {
    email: '',
  }

  const validate = (values: LoginFormValues) => {
    const errors: Partial<Record<keyof LoginFormValues, string>> = {}
    const trimmed = values.email.trim()

    if (!trimmed) {
      errors.email = 'Email address is required.'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)) {
      errors.email = 'Please enter a valid email address.'
    }

    return errors
  }

  const handleSubmit = async (values: LoginFormValues) => {
    const cleanEmail = values.email.trim().toLowerCase()
    const result = await login(cleanEmail)

    if (result.success) {
      showSuccess(result.message || 'Verification code sent to your email.')
      navigate(`/verify?email=${encodeURIComponent(cleanEmail)}`)
    } else {
      showError(result.message || 'Failed to send login code.')
    }
  }

  const handleRegisterClick = (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    navigate(cleanEmail ? `/register?email=${encodeURIComponent(cleanEmail)}` : '/register')
  }

  return (
    <AuthLayout>
      <div className="w-full flex flex-col gap-8">
        {/* Title */}
        <div className="text-left">
          <CustomText
            type="headline-lg"
            className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
          >
            Log In
          </CustomText>
        </div>

        {/* Form Card */}
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ values, isValid, dirty }) => (
            <Form className="w-full p-6 sm:p-7 flex flex-col gap-5 rounded-2xl bg-white shadow-sm border border-neutral-100/90">
              <div>
                <FormikField
                  name="email"
                  label="Email *"
                  type="email"
                  placeholder="janedoe@mail.com"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
                  <CustomText type="body-sm">{error}</CustomText>
                  {(error.toLowerCase().includes('register') ||
                    error.toLowerCase().includes('invite') ||
                    error.toLowerCase().includes('create account') ||
                    error.toLowerCase().includes('not found') ||
                    error.toLowerCase().includes('does not exist')) && (
                    <button
                      type="button"
                      onClick={() => handleRegisterClick(values.email)}
                      disabled={isLoading}
                      className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline block cursor-pointer"
                    >
                      Register with Invite Code
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <CustomButton
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                loading={isLoading}
                disabled={isLoading || !values.email || (!isValid && dirty)}
                className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl mt-1"
              >
                Log In
              </CustomButton>

              {/* Register Link */}
              <div className="pt-2 border-t border-neutral-100 text-center">
                <p className="text-xs text-neutral-600">
                  Have an affiliate invite code?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Register here
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

export default LoginPage
