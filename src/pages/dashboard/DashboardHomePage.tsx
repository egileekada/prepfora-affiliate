import { useState } from 'react'
import { CustomButton, CustomText, CustomTable } from '@/components/ui'
import type { Column } from '@/components/ui'
import { AppModal } from '@/components/layouts/modalLayout'
import { ChevronDown, Check, Copy } from 'lucide-react'

interface Referral {
  id: string
  name: string
  status: 'Converted' | 'Pending'
  subscription: string
  joined: string
}

const mockRecentReferrals: Referral[] = [
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
    subscription: 'Free',
    joined: '7 days ago',
  },
  {
    id: '3',
    name: 'John Doe',
    status: 'Converted',
    subscription: 'Paid',
    joined: '12 days ago',
  },
  {
    id: '4',
    name: 'James Doe',
    status: 'Pending',
    subscription: '-',
    joined: '-',
  },
]

export function DashboardHomePage() {
  const [filter, setFilter] = useState<'All' | 'Converted' | 'Pending'>('All')
  const [copied, setCopied] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  const referralLink = 'prepfora.com/ref/jane'

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${referralLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredReferrals = mockRecentReferrals.filter((item) => {
    if (filter === 'All') return true
    return item.status === filter
  })

  const columns: Column<Referral>[] = [
    {
      id: 'name',
      name: 'NAME',
      render: (_, row) => (
        <CustomText type="body-md-bold" className="text-gray-900 py-2 block">
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
        <CustomText type="body-md" className="text-gray-700 font-medium text-right sm:text-left">
          {row.joined}
        </CustomText>
      ),
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
          Hello Jane!
        </CustomText>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
            38
          </CustomText>
        </div>

        {/* Pending Conversions */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block"
          >
            Pending Conversions
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            15
          </CustomText>
        </div>

        {/* Total Earnings */}
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-500 mb-2 block"
          >
            Total Earnings
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            $530
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

      {/* Recent Referrals Section */}
      <div className="space-y-4">
        {/* Header with Title and Filter Dropdown */}
        <div className="flex items-center justify-between">
          <CustomText
            type="headline-sm"
            className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
          >
            Recent Referrals
          </CustomText>

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

        {/* Desktop Table View using CustomTable (Screenshots 2 & 5) */}
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

        {/* Mobile Cards View (Screenshot 3) */}
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
            1. <strong>Commission:</strong> Affiliates earn #500 for every qualified
            student who registers and activates a paid subscription through their unique link.
          </CustomText>
          <CustomText type="body-md" className="block">
            2. <strong>Payouts:</strong> Minimum withdrawal threshold is $50. Payouts are
            processed into your registered local bank account within 24–48 hours.
          </CustomText>
          <CustomText type="body-md" className="block">
            3. <strong>Tracking:</strong> Referral cookies remain valid for 30 days
            from the student's initial visit.
          </CustomText>
          <CustomText type="body-md" className="block">
            4. <strong>Prohibited Conduct:</strong> Self-referrals and misleading advertising
            will lead to immediate forfeiture of earnings and account suspension.
          </CustomText>
        </div>
      </AppModal>
    </div>
  )
}
