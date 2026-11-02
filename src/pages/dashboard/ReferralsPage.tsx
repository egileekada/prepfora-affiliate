import { useState, useEffect } from 'react'
import { CustomText, CustomTable } from '@/components/ui'
import type { Column } from '@/components/ui'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import {
  useReferralsApi,
  getReferralStatus,
  getReferralSubscription,
  getReferralJoined,
  getReferralName,
  type ReferredUser,
} from '@/hooks'

export function ReferralsPage() {
  const [filter, setFilter] = useState<'All' | 'Converted' | 'Pending'>('All')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { referredUsers, pagination, isLoading, error, fetchReferredUsers } =
    useReferralsApi()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch referrals on page or search change
  useEffect(() => {
    fetchReferredUsers({
      page: currentPage,
      limit: 10,
      search: debouncedSearch.trim() || undefined,
    })
  }, [currentPage, debouncedSearch, fetchReferredUsers])

  const filteredReferrals = referredUsers.filter((item) => {
    if (filter === 'All') return true
    return getReferralStatus(item) === filter
  })

  const totalItems = pagination?.total ?? referredUsers.length
  const limit = pagination?.per_page ?? 10
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages]
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ]
  }

  const columns: Column<ReferredUser>[] = [
    {
      id: 'name',
      name: 'NAME',
      render: (_, row) => {
        const { displayName, subEmail } = getReferralName(row)
        return (
          <div className="py-1">
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
          <CustomText type="body-md" className="text-gray-700 font-medium">
            {joined}
          </CustomText>
        )
      },
    },
  ]

  const handleRetry = () => {
    fetchReferredUsers({
      page: currentPage,
      limit: 10,
      search: debouncedSearch.trim() || undefined,
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header, Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CustomText
          type="headline-lg"
          className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
        >
          My Referrals
        </CustomText>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <CustomText
              type="label-md"
              className="text-xs sm:text-sm text-gray-600 whitespace-nowrap"
            >
              Filter by:
            </CustomText>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as 'All' | 'Converted' | 'Pending')
                  setCurrentPage(1)
                }}
                className="appearance-none bg-[#eaeffa] border border-blue-400/80 rounded-xl px-4 py-1.5 pr-8 text-xs sm:text-sm font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                <option value="All">All</option>
                <option value="Converted">Converted</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <CustomText type="body-sm" className="text-red-700 font-medium">
              {error}
            </CustomText>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <CustomText type="body-sm" className="text-gray-500 font-medium">
            Loading referrals...
          </CustomText>
        </div>
      ) : filteredReferrals.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <CustomText type="body-md-bold" className="text-gray-900 text-lg">
            No referrals found
          </CustomText>
          <CustomText type="body-sm" className="text-gray-500 max-w-sm mx-auto">
            {searchTerm || filter !== 'All'
              ? 'No referrals match your current search or filter criteria. Try adjusting them.'
              : 'You do not have any referred users yet. Share your referral link to get started!'}
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
              className="border-none shadow-xs rounded-2xl overflow-hidden bg-white"
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
                  className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-2"
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
        </>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs sm:text-sm font-medium text-gray-600 select-none">
          <p className="text-xs text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-800">
              {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * limit, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-gray-800">{totalItems}</span>{' '}
            referrals
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                    ...
                  </span>
                )
              }
              const pageNum = Number(p)
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-7 h-7 px-2 flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next Page"
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
