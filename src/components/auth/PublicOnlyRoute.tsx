import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface PublicOnlyRouteProps {
  children: ReactNode
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const token = localStorage.getItem('prepfora_access_token')

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
