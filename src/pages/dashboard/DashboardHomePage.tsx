import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CustomButton, CustomText, CustomTable } from '@/components/ui'
import type { Column } from '@/components/ui'
import { AppModal } from '@/components/layouts/modalLayout'
import {
  ChevronDown,
  Check,
  Copy,
  ArrowRight,
  Loader2,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import {
  useAnalyticsApi,
  useReferralsApi,
  getReferralStatus,
  getReferralSubscription,
  getReferralJoined,
  getReferralName,
  type ReferredUser,
} from '@/hooks'

export function DashboardHomePage() {
  const [filter, setFilter] = useState<'All' | 'Converted' | 'Pending'>('All')
  const [copied, setCopied] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  // Local storage user fallback
  const [user] = useState<{ name?: string; code?: string } | null>(() => {
    try {
      const stored = localStorage.getItem('prepfora_user')
      if (stored) return JSON.parse(stored)
    } catch {
      // fallback
    }
    return null
  })

  // Analytics API
  const {
    analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    fetchAnalytics,
  } = useAnalyticsApi()

  // Referrals API (limited to 5 for recent referrals on dashboard)
  const {
    referredUsers,
    isLoading: isLoadingReferrals,
    error: referralsError,
    fetchReferredUsers,
  } = useReferralsApi()

  useEffect(() => {
    fetchAnalytics()
    fetchReferredUsers({ page: 1, limit: 5 })
  }, [fetchAnalytics, fetchReferredUsers])

  const firstName = analytics?.affiliate_name
    ? analytics.affiliate_name.split(' ')[0]
    : user?.name
      ? user.name.split(' ')[0]
      : 'Partner'

  const referralCode = analytics?.affiliate_code || user?.code || 'partner'
  const referralLink = `prepfora.com/auth/signup?referral_code=${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${referralLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredReferrals = referredUsers.filter((item) => {
    if (filter === 'All') return true
    return getReferralStatus(item) === filter
  })

  const columns: Column<ReferredUser>[] = [
    {
      id: 'name',
      name: 'NAME',
      render: (_, row) => {
        const { displayName, subEmail } = getReferralName(row)
        return (
          <div className="py-2">
            <CustomText
              type="body-md-bold"
              className="text-gray-900 block leading-tight"
            >
              {displayName}
            </CustomText>
            {subEmail && (
              <span className="text-xs text-gray-500 font-normal block mt-0.5">
                {subEmail}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'status',
      name: 'STATUS',
      render: (_, row) => {
        const status = getReferralStatus(row)
        return (
          <span
            className={`font-semibold text-sm ${
              status === 'Converted' ? 'text-[#10b981]' : 'text-[#b45309]'
            }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      id: 'subscription',
      name: 'SUBSCRIPTION',
      render: (_, row) => {
        const subscription = getReferralSubscription(row)
        return (
          <CustomText type="body-md" className="text-gray-700 font-medium">
            {subscription}
          </CustomText>
        )
      },
    },
    {
      id: 'joined',
      name: 'JOINED',
      render: (_, row) => {
        const joined = getReferralJoined(row)
        return (
          <CustomText
            type="body-md"
            className="text-gray-700 font-medium text-right sm:text-left"
          >
            {joined}
          </CustomText>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <CustomText
          type="headline-lg"
          className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
        >
          Hello {firstName}!
        </CustomText>
      </div>

      {/* Analytics Error Alert (if any) */}
      {analyticsError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <CustomText type="body-sm" className="text-red-700 font-medium">
              {analyticsError}
            </CustomText>
          </div>
          <button
            onClick={() => fetchAnalytics()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Top Stat Cards Grid (Dynamic from /affiliate/analytics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Referrals */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block"
          >
            Total Referrals
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            {isLoadingAnalytics ? (
              <span className="inline-block w-12 h-9 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              analytics?.total_referrals ?? 0
            )}
          </CustomText>
        </div>

        {/* Referrals This Month */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block"
          >
            This Month
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            {isLoadingAnalytics ? (
              <span className="inline-block w-12 h-9 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              analytics?.referrals_this_month ?? 0
            )}
          </CustomText>
        </div>

        {/* Referrals This Week */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block"
          >
            This Week
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            {isLoadingAnalytics ? (
              <span className="inline-block w-12 h-9 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              analytics?.referrals_this_week ?? 0
            )}
          </CustomText>
        </div>

        {/* Referrals Today */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block"
          >
            Today
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            {isLoadingAnalytics ? (
              <span className="inline-block w-12 h-9 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              analytics?.referrals_today ?? 0
            )}
          </CustomText>
        </div>
      </div>

      {/* Two Middle Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* How to earn Card */}
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-400/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <CustomText
              type="title-lg"
              className="text-lg sm:text-xl font-bold text-gray-900 block"
            >
              How to earn
            </CustomText>
            <CustomText
              type="body-md"
              className="text-sm text-gray-700 leading-relaxed block"
            >
              You earn <span className="font-bold text-gray-900">#500</span> for
              every student that subscribes to Prepfora using your referral
              link.
            </CustomText>
          </div>

          <div>
            <CustomButton
              variant="primary"
              size="md"
              onPress={() => setIsTermsOpen(true)}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-none"
            >
              View Full Terms
            </CustomButton>
          </div>
        </div>

        {/* My Referral Link Card (Mint / Light Green) */}
        <div className="bg-[#e8faf3] rounded-2xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <CustomText
              type="title-lg"
              className="text-lg sm:text-xl font-bold text-gray-900 block"
            >
              My Referral Link
            </CustomText>
            <CustomText
              type="body-sm"
              className="text-xs sm:text-sm text-gray-600 block"
            >
              Share this link with students to earn commissions
            </CustomText>
          </div>

          {/* Copy link input row */}
          <div className="flex items-center justify-between gap-3 bg-transparent">
            <CustomText
              type="body-md-bold"
              className="text-sm sm:text-base text-gray-900 truncate"
            >
              {referralLink}
            </CustomText>
            <CustomButton
              onPress={handleCopy}
              className="bg-[#10b981] hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-sm shrink-0 border-none"
              startContent={
                copied ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1 hidden sm:inline" />
                )
              }
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </CustomButton>
          </div>

          {/* Social share icons */}
          <div className="space-y-2 pt-1 border-t border-emerald-100">
            <CustomText type="label-sm" className="text-xs text-gray-600 block">
              Share on:
            </CustomText>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=https://${referralLink}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  f
                </div>
                <span>Facebook</span>
              </a>

              <a
                href={`https://wa.me/?text=Join%20Prepfora%20via%20my%20link:%20https://${referralLink}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  W
                </div>
                <span>WhatsApp</span>
              </a>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-pink-600 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  IG
                </div>
                <span>Instagram</span>
              </a>

              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-black transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  TT
                </div>
                <span>Tiktok</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals Section (Live data, limited to 5 recent) */}
      <div className="space-y-4">
        {/* Header with Title, View All Link, and Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CustomText
              type="headline-sm"
              className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
            >
              Recent Referrals
            </CustomText>
            <Link
              to="/dashboard/referrals"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <CustomText type="label-md" className="text-xs sm:text-sm text-gray-600">
              Filter by:
            </CustomText>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as 'All' | 'Converted' | 'Pending')
                }
                className="appearance-none bg-[#eaeffa] border border-blue-400/80 rounded-xl px-4 py-1.5 pr-8 text-xs sm:text-sm font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Converted">Converted</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Referrals Error Alert */}
        {referralsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <CustomText type="body-sm" className="text-red-700 font-medium">
                {referralsError}
              </CustomText>
            </div>
            <button
              onClick={() => fetchReferredUsers({ page: 1, limit: 5 })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingReferrals ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <CustomText type="body-sm" className="text-gray-500 font-medium">
              Loading recent referrals...
            </CustomText>
          </div>
        ) : filteredReferrals.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <CustomText type="body-md-bold" className="text-gray-900 text-lg">
              No recent referrals
            </CustomText>
            <CustomText type="body-sm" className="text-gray-500 max-w-sm mx-auto">
              {filter !== 'All'
                ? 'No referrals match your current filter. Try selecting "All".'
                : 'Share your referral link with students to start earning commissions!'}
            </CustomText>
          </div>
        ) : (
          <>
            {/* Desktop Table View using CustomTable */}
            <div className="hidden md:block">
              <CustomTable<ReferredUser>
                columns={columns}
                rows={filteredReferrals}
                rowKey="id"
                className="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
                headerRowClassName="bg-[#c3d4fa] border-none"
                headerCellClassName="py-4 px-6 text-gray-800 font-bold uppercase text-xs tracking-wider"
                rowClassName="hover:bg-gray-50/70 border-b border-gray-100"
                emptyText="No referrals found"
              />
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {filteredReferrals.map((item) => {
                const { displayName, subEmail } = getReferralName(item)
                const status = getReferralStatus(item)
                const subscription = getReferralSubscription(item)
                const joined = getReferralJoined(item)

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CustomText
                          type="body-md-bold"
                          className="text-gray-900 text-base"
                        >
                          {displayName}
                        </CustomText>
                        {subEmail && (
                          <span className="text-xs text-gray-500 font-normal block">
                            {subEmail}
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-semibold text-xs ${
                          status === 'Converted'
                            ? 'text-[#10b981]'
                            : 'text-[#b45309]'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <CustomText
                      type="body-sm"
                      className="text-xs text-gray-600 block"
                    >
                      {subscription === '-'
                        ? '-'
                        : `${subscription} Plan`}
                    </CustomText>
                    <CustomText
                      type="body-sm"
                      className="text-xs text-gray-600 block"
                    >
                      {joined === '-' ? '-' : `Joined ${joined}`}
                    </CustomText>
                  </div>
                )
              })}
            </div>

            {/* View All Footer Link */}
            <div className="flex justify-end pt-1">
              <Link
                to="/dashboard/referrals"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all referrals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Full Terms Modal */}
      <AppModal
        open={isTermsOpen}
        onOpenChange={setIsTermsOpen}
        title="Prepfora Affiliate Terms & Conditions"
        size="md"
        footer={
          <div className="flex justify-end w-full">
            <CustomButton
              variant="primary"
              size="sm"
              onPress={() => setIsTermsOpen(false)}
            >
              Close
            </CustomButton>
          </div>
        }
      >
        <div className="text-sm text-gray-600 space-y-3 py-2">
          <CustomText type="body-md" className="block">
            1. <strong>Commission:</strong> Affiliates earn #500 for every
            qualified student who registers and activates a paid subscription
            through their unique link.
          </CustomText>
          <CustomText type="body-md" className="block">
            2. <strong>Payouts:</strong> Minimum withdrawal threshold is $50.
            Payouts are processed into your registered local bank account
            within 24–48 hours.
          </CustomText>
          <CustomText type="body-md" className="block">
            3. <strong>Tracking:</strong> Referral cookies remain valid for 30
            days from the student's initial visit.
          </CustomText>
          <CustomText type="body-md" className="block">
            4. <strong>Prohibited Conduct:</strong> Self-referrals and
            misleading advertising will lead to immediate forfeiture of
            earnings and account suspension.
          </CustomText>
        </div>
      </AppModal>
    </div>
  )
}
