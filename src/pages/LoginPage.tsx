import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { CustomButton, CustomText, CustomField } from '@/components/ui'

const API_BASE_URL = 'https://prepforabackend-production.up.railway.app'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success !== false) {
        navigate(`/verify?email=${encodeURIComponent(cleanEmail)}`)
      } else {
        if (data?.message?.toLowerCase().includes('does not exist')) {
          setError(
            'No account found with this email. Click "Create Account" below to register and receive your verification code.'
          )
        } else {
          setError(data?.message || 'Failed to send login code. Please try again.')
        }
      }
    } catch {
      setError('Network connection error. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success !== false) {
        navigate(`/verify?email=${encodeURIComponent(cleanEmail)}`)
      } else {
        setError(data?.message || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Network error during registration.')
    } finally {
      setIsLoading(false)
    }
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
        <form
          onSubmit={handleLoginSubmit}
          className="w-full p-6 sm:p-7 flex flex-col gap-5 rounded-2xl bg-white shadow-sm border border-neutral-100/90"
        >
          <div>
            <CustomField
              label="Email *"
              type="email"
              value={email}
              onChange={(val) => {
                setEmail(String(val))
                setError(null)
              }}
              placeholder="janedoe@mail.com"
              disabled={isLoading}
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
              <CustomText type="body-sm">{error}</CustomText>
              {error.includes('Create Account') && (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline block cursor-pointer"
                >
                  Create Account Now
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
            disabled={!email.trim()}
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl mt-1"
          >
            Log In
          </CustomButton>
        </form>
      </div>
    </AuthLayout>
  )
}
