import { useState, useCallback } from 'react'
import { httpService } from '@/config/httpService'
import URLS from '@/config/urls'
import type { AxiosError } from 'axios'
import moment from 'moment'

export function getReferralStatus(user: ReferredUser): 'Converted' | 'Pending' {
  if (user.status) {
    return user.status.toLowerCase() === 'pending' ? 'Pending' : 'Converted'
  }
  const hasProfile = Boolean(
    (user.first_name && user.first_name.trim()) ||
      (user.last_name && user.last_name.trim()) ||
      (user.examinations && user.examinations.length > 0) ||
      (user.prep_points != null && user.prep_points > 0)
  )
  return hasProfile ? 'Converted' : 'Pending'
}

export function getReferralSubscription(user: ReferredUser): string {
  if (user.subscription) return user.subscription
  const status = getReferralStatus(user)
  if (status === 'Converted') {
    return 'Free'
  }
  return '-'
}

export function getReferralJoined(user: ReferredUser): string {
  if (!user.created_at) return '-'
  const m = moment(user.created_at)
  return m.isValid() ? m.fromNow() : '-'
}

export function getReferralName(user: ReferredUser): {
  displayName: string
  subEmail?: string
} {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  if (fullName) {
    return { displayName: fullName, subEmail: user.email }
  }
  return { displayName: user.email || 'Anonymous' }
}

export interface ReferredUser {
  id: string
  first_name?: string | null
  last_name?: string | null
  email: string
  phone?: string | null
  state?: string | null
  university?: string | null
  examinations?: string[] | null
  prep_points?: number | null
  best_score?: number | null
  profile_picture?: string | null
  referral_code?: string | null
  created_at?: string | null
  status?: string
  subscription?: string
}

export interface PaginationMeta {
  total: number
  page: number
  per_page: number
}

export interface ReferredUsersApiResponse {
  success?: boolean
  message?: string
  data?: ReferredUser[] | null
  pagination?: PaginationMeta | null
}

export interface FetchReferredUsersParams {
  page?: number
  limit?: number
  search?: string
  affiliate_id?: string
}

export function useReferralsApi() {
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferredUsers = useCallback(
    async (params?: FetchReferredUsersParams) => {
      setIsLoading(true)
      setError(null)

      try {
        const queryParams: Record<string, unknown> = {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        }
        if (params?.search && params.search.trim()) {
          queryParams.search = params.search.trim()
        }
        if (params?.affiliate_id) {
          queryParams.affiliate_id = params.affiliate_id
        }

        const response = await httpService.get<ReferredUsersApiResponse>(
          URLS.AFFILIATE_REFERRED_USERS,
          { params: queryParams }
        )

        const resData = response.data

        if (resData && resData.success !== false) {
          const list = Array.isArray(resData.data) ? resData.data : []
          setReferredUsers(list)
          if (resData.pagination) {
            setPagination(resData.pagination)
          } else {
            setPagination({
              total: list.length,
              page: params?.page ?? 1,
              per_page: params?.limit ?? 10,
            })
          }
          return {
            success: true,
            data: list,
            pagination: resData.pagination ?? null,
            message: resData.message,
          }
        }

        const errMsg = resData?.message || 'Failed to fetch referred users.'
        setError(errMsg)
        return { success: false, message: errMsg, data: [] }
      } catch (err) {
        const axiosErr = err as AxiosError<{
          detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
          message?: string
        }>
        const errResponse = axiosErr.response?.data
        let errMsg = 'Failed to fetch referred users.'

        if (typeof errResponse === 'string') {
          errMsg = errResponse
        } else if (errResponse) {
          if (typeof errResponse.detail === 'string') {
            errMsg = errResponse.detail
          } else if (Array.isArray(errResponse.detail) && errResponse.detail[0]?.msg) {
            errMsg = errResponse.detail[0].msg
          } else if (errResponse.message) {
            errMsg = errResponse.message
          }
        } else if (axiosErr.message) {
          errMsg = axiosErr.message
        }

        setError(errMsg)
        return { success: false, message: errMsg, data: [] }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    referredUsers,
    pagination,
    isLoading,
    error,
    fetchReferredUsers,
  }
}

