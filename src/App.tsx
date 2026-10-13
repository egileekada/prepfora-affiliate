import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@heroui/react'
import { LoginPage } from './pages/LoginPage'
import { VerifyPage } from './pages/VerifyPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage'
import { ReferralsPage } from './pages/dashboard/ReferralsPage'
import { EarningsPage } from './pages/dashboard/EarningsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        {/* Public-only routes: Login & OTP Verification */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
