import { Navigate, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'

interface PublicOnlyRouteProps {
  children: ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const token = localStorage.getItem('prepfora_access_token')
  const [searchParams] = useSearchParams()
  const hasInviteCode = Boolean(searchParams.get('code') || searchParams.get('invite_code'))

  if (token && !hasInviteCode) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
