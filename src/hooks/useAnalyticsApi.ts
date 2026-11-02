import { useState, useCallback } from 'react'
import { httpService } from '@/config/httpService'
import URLS from '@/config/urls'
import type { AxiosError } from 'axios'

export interface AffiliateAnalytics {
  total_referrals: number
  total_referred: number
  referrals_today: number
  referrals_this_week: number
  referrals_this_month: number
  affiliate_id: string
  affiliate_name: string
  affiliate_code: string
}

export interface AnalyticsApiResponse {
  success?: boolean
  message?: string
  data?: AffiliateAnalytics | null
}

export function useAnalyticsApi() {
  const [analytics, setAnalytics] = useState<AffiliateAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (affiliateId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = affiliateId ? { affiliate_id: affiliateId } : undefined
      const response = await httpService.get<AnalyticsApiResponse>(
        URLS.AFFILIATE_ANALYTICS,
        { params }
      )

      const resData = response.data

      if (resData && resData.success !== false && resData.data) {
        setAnalytics(resData.data)
        return { success: true, data: resData.data, message: resData.message }
      }

      const errMsg = resData?.message || 'Failed to fetch analytics.'
      setError(errMsg)
      return { success: false, message: errMsg }
    } catch (err) {
      const axiosErr = err as AxiosError<{
        detail?: string | Array<{ loc?: string[]; msg?: string; type?: string }>
        message?: string
      }>
      const errResponse = axiosErr.response?.data
      let errMsg = 'Failed to fetch analytics.'

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
      return { success: false, message: errMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    analytics,
    isLoading,
    error,
    fetchAnalytics,
  }
}

