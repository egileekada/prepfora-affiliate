import { useState } from 'react'
import { CustomText, CustomTable } from '@/components/ui'
import type { Column } from '@/components/ui'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Referral {
  id: string
  name: string
  status: 'Converted' | 'Pending'
  subscription: string
  joined: string
}

const mockAllReferrals: Referral[] = [
  {
    id: '1',
    name: 'Jane Doe',
    status: 'Converted',
    subscription: 'Paid',
    joined: '5 days ago',
  },
  {
    id: '2',
    name: 'John Doe',
    status: 'Converted',
    subscription: '-',
    joined: '-',
  },
  {
    id: '3',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Free',
    joined: '7 days ago',
  },
  {
    id: '4',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Free',
    joined: '7 days ago',
  },
  {
    id: '5',
    name: 'John Doe',
    status: 'Pending',
    subscription: '-',
    joined: '-',
  },
  {
    id: '6',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Free',
    joined: '7 days ago',
  },
  {
    id: '7',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Paid',
    joined: '7 days ago',
  },
  {
    id: '8',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Free',
    joined: '7 days ago',
  },
  {
    id: '9',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Paid',
    joined: '12 days ago',
  },
  {
    id: '10',
    name: 'James Doe',
    status: 'Pending',
    subscription: '-',
    joined: '-',
  },
]

export function ReferralsPage() {
  const [filter, setFilter] = useState<'All' | 'Converted' | 'Pending'>('All')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const filteredReferrals = mockAllReferrals.filter((item) => {
    if (filter === 'All') return true
    return item.status === filter
  })

  const columns: Column<Referral>[] = [
    {
      id: 'name',
      name: 'NAME',
      render: (_, row) => (
        <CustomText type="body-md-bold" className="text-gray-900 py-1.5 block">
          {row.name}
        </CustomText>
      ),
    },
    {
      id: 'status',
      name: 'STATUS',
      render: (_, row) => (
        <span
          className={`font-semibold text-sm ${row.status === 'Converted' ? 'text-[#10b981]' : 'text-[#b45309]'
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: 'subscription',
      name: 'SUBSCRIPTION',
      render: (_, row) => (
        <CustomText type="body-md" className="text-gray-700 font-medium">
          {row.subscription}
        </CustomText>
      ),
    },
    {
      id: 'joined',
      name: 'JOINED',
      render: (_, row) => (
        <CustomText type="body-md" className="text-gray-700 font-medium">
          {row.joined}
        </CustomText>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <CustomText
          type="headline-lg"
          className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
        >
          My Referrals
        </CustomText>

        <div className="flex items-center gap-2">
          <CustomText type="label-md" className="text-xs sm:text-sm text-gray-600">
            Filter by:
          </CustomText>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as 'All' | 'Converted' | 'Pending')
                setCurrentPage(1)
              }}
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

      {/* Desktop Table View using CustomTable (Screenshot 5) */}
      <div className="hidden md:block">
        <CustomTable<Referral>
          columns={columns}
          rows={filteredReferrals}
          rowKey="id"
          className="border-none shadow-sm rounded-2xl overflow-hidden"
          headerRowClassName="bg-[#c3d4fa] border-none"
          headerCellClassName="py-4 px-6 text-gray-800 font-bold uppercase text-xs tracking-wider"
          rowClassName="hover:bg-gray-50/70 border-b border-gray-100"
        />
      </div>

      {/* Mobile Cards View (Screenshot 4) */}
      <div className="md:hidden space-y-3">
        {filteredReferrals.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2"
          >
            <div className="flex items-center justify-between">
              <CustomText type="body-md-bold" className="text-gray-900 text-base">
                {item.name}
              </CustomText>
              <span
                className={`font-semibold text-xs ${item.status === 'Converted'
                  ? 'text-[#10b981]'
                  : 'text-[#b45309]'
                  }`}
              >
                {item.status}
              </span>
            </div>
            <CustomText type="body-sm" className="text-xs text-gray-600 block">
              {item.subscription === '-' ? '-' : `${item.subscription} Plan`}
            </CustomText>
            <CustomText type="body-sm" className="text-xs text-gray-600 block">
              {item.joined === '-' ? '-' : `Joined ${item.joined}`}
            </CustomText>
          </div>
        ))}
      </div>

      {/* Pagination (Screenshots 4 & 5) */}
      <div className="flex items-center justify-end gap-1.5 pt-2 text-xs sm:text-sm font-medium text-gray-600 select-none">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setCurrentPage(1)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer ${currentPage === 1
            ? 'bg-[#2563eb] text-white shadow-xs'
            : 'hover:bg-gray-200 text-gray-700'
            }`}
        >
          1
        </button>

        <button
          onClick={() => setCurrentPage(2)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer ${currentPage === 2
            ? 'bg-[#2563eb] text-white shadow-xs'
            : 'hover:bg-gray-200 text-gray-700'
            }`}
        >
          2
        </button>

        <button
          onClick={() => setCurrentPage(3)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer ${currentPage === 3
            ? 'bg-[#2563eb] text-white shadow-xs'
            : 'hover:bg-gray-200 text-gray-700'
            }`}
        >
          3
        </button>

        <span className="px-1 text-gray-400">...</span>

        <button
          onClick={() => setCurrentPage(112)}
          className={`px-2 h-7 flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer ${currentPage === 112
            ? 'bg-[#2563eb] text-white shadow-xs'
            : 'hover:bg-gray-200 text-gray-700'
            }`}
        >
          112
        </button>

        <button
          onClick={() => setCurrentPage((p) => Math.min(112, p + 1))}
          disabled={currentPage === 112}
          aria-label="Next Page"
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
