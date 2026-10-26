import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { ToastProvider } from '@heroui/react'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyPage } from './pages/VerifyPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage'
import { ReferralsPage } from './pages/dashboard/ReferralsPage'
import { EarningsPage } from './pages/dashboard/EarningsPage'

function RootRedirect() {
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('prepfora_access_token')

  const code = searchParams.get('code') || searchParams.get('invite_code')
  const email = searchParams.get('email')

  if (code) {
    const params = new URLSearchParams()
    params.set('code', code)
    if (email) {
      params.set('email', email)
    }
    // Retain any additional query parameters passed in the link
    searchParams.forEach((val, key) => {
      if (key !== 'code' && key !== 'invite_code' && key !== 'email') {
        params.set(key, val)
      }
    })
    return <Navigate to={`/register?${params.toString()}`} replace />
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* Public-only routes: Login, Register & OTP Verification */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/affiliate/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PublicOnlyRoute>
              <VerifyPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="earnings" element={<EarningsPage />} />
        </Route>

        {/* Default / fallback redirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
