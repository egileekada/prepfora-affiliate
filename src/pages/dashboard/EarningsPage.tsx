import { useState } from 'react'
import { CustomButton, CustomText, CustomField } from '@/components/ui'
import { AppModal } from '@/components/layouts/modalLayout'
import { Landmark, CheckCircle, ArrowRight } from 'lucide-react'

export function EarningsPage() {
  const [availableBalance, setAvailableBalance] = useState<number>(50)
  const [allTimeEarnings] = useState<number>(530)
  const [bankInfo, setBankInfo] = useState({
    bankName: 'GTBank',
    accountNumber: '0169286456',
    accountName: 'Jane Doe',
  })

  // Modal states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('50')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [editBank, setEditBank] = useState(bankInfo)

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt <= 0 || amt > availableBalance) return

    setIsWithdrawing(true)
    setTimeout(() => {
      setAvailableBalance((prev) => prev - amt)
      setIsWithdrawing(false)
      setWithdrawSuccess(true)
      setTimeout(() => {
        setWithdrawSuccess(false)
        setIsWithdrawOpen(false)
      }, 1500)
    }, 1000)
  }

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    setBankInfo(editBank)
    setIsBankModalOpen(false)
  }

  const bankOptions = [
    { label: 'Guaranty Trust Bank (GTBank)', value: 'GTBank' },
    { label: 'Access Bank', value: 'Access Bank' },
    { label: 'Zenith Bank', value: 'Zenith Bank' },
    { label: 'First Bank of Nigeria', value: 'First Bank' },
    { label: 'United Bank for Africa (UBA)', value: 'UBA' },
    { label: 'Kuda Bank', value: 'Kuda Bank' },
  ]

  return (
    <div className="space-y-6 mx-auto lg:mx-0 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <CustomText
          type="headline-lg"
          className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
        >
          My Earnings
        </CustomText>
      </div>

      <div className=' w-full flex lg:flex-row flex-col  gap-6 ' >

        {/* Available to Withdraw Card */}
        <div className="bg-white w-full rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <CustomText
              type="label-md"
              className="text-xs sm:text-sm font-medium text-gray-600 block"
            >
              Available to Withdraw
            </CustomText>
            <CustomText
              type="display-sm"
              className="text-3xl sm:text-4xl font-bold text-gray-900 block"
            >
              ${availableBalance}
            </CustomText>
          </div>

          <CustomButton
            variant="primary"
            size="md"
            onPress={() => {
              setWithdrawAmount(availableBalance.toString())
              setIsWithdrawOpen(true)
            }}
            disabled={availableBalance <= 0}
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm"
          >
            Withdraw Now
          </CustomButton>
        </div>

        {/* All Time Earnings Card */}
        <div className="bg-white w-full rounded-2xl p-6 shadow-sm border border-gray-100 space-y-2">
          <CustomText
            type="label-md"
            className="text-xs sm:text-sm font-medium text-gray-600 block"
          >
            All Time Earnings
          </CustomText>
          <CustomText
            type="display-sm"
            className="text-3xl sm:text-4xl font-bold text-gray-900 block"
          >
            ${allTimeEarnings}
          </CustomText>
        </div>
      </div>

      {/* Payout Account Card */}
      <div className="bg-white rounded-2xl p-6 border-2 border-blue-400/80 shadow-sm space-y-6">
        <CustomText
          type="title-lg"
          className="text-base sm:text-lg font-bold text-gray-900 block"
        >
          Payout Account
        </CustomText>
        <div className=' w-full flex flex-col lg:flex-row lg:justify-between items-center gap-y-4 ' >
          {/* Bank details row */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e3ecfa] text-[#2563eb] flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2.5 font-bold text-gray-900 text-base sm:text-lg">
              <CustomText type="body-lg-bold">{bankInfo.bankName}</CustomText>
              <span className="w-2 h-2 rounded-full bg-[#2563eb] inline-block" />
              <CustomText type="body-lg-bold" className="tracking-wide">
                {bankInfo.accountNumber}
              </CustomText>
            </div>
          </div>

          {/* Change Payment Method button */}
          <div className=' lg:w-50 w-full ' >
            <CustomButton
              variant="primary-outline"
              fullWidth
              size="md"
              onPress={() => {
                setEditBank(bankInfo)
                setIsBankModalOpen(true)
              }}
              className="border-2 border-[#2563eb] text-[#2563eb] hover:bg-blue-50 font-semibold text-sm rounded-xl"
            >
              Change Payment Method
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <AppModal
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        title="Withdraw Funds"
        size="sm"
      >
        {withdrawSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <CustomText type="title-md" className="font-bold text-gray-900 block">
              Withdrawal Requested!
            </CustomText>
            <CustomText type="body-sm" className="text-gray-500 block">
              ${withdrawAmount} will be deposited to {bankInfo.bankName} within 24 hours.
            </CustomText>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4 py-2">
            <div>
              <CustomField
                label="Amount (USD)"
                type="number"
                value={withdrawAmount}
                onChange={(val) => setWithdrawAmount(String(val))}
                prefix={<span className="text-gray-500 font-bold">$</span>}
                placeholder="50"
              />
              <CustomText type="label-sm" className="text-gray-500 mt-1 block">
                Available balance: ${availableBalance}
              </CustomText>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <CustomText type="label-sm" className="text-gray-500 font-medium block">
                Recipient Account:
              </CustomText>
              <CustomText type="body-sm-bold" className="text-gray-800 block">
                {bankInfo.bankName} • {bankInfo.accountNumber} ({bankInfo.accountName})
              </CustomText>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <CustomButton
                variant="outline"
                size="md"
                className="flex-1"
                onPress={() => setIsWithdrawOpen(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                variant="primary"
                size="md"
                loading={isWithdrawing}
                disabled={
                  parseFloat(withdrawAmount) <= 0 ||
                  parseFloat(withdrawAmount) > availableBalance
                }
                className="flex-1 bg-[#2563eb] text-white"
                endContent={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Confirm Payout
              </CustomButton>
            </div>
          </form>
        )}
      </AppModal>

      {/* Change Payment Method Modal */}
      <AppModal
        open={isBankModalOpen}
        onOpenChange={setIsBankModalOpen}
        title="Update Payout Account"
        size="sm"
      >
        <form onSubmit={handleSaveBank} className="space-y-4 py-2">
          <CustomField
            label="Bank Name"
            as="select"
            options={bankOptions}
            value={editBank.bankName}
            onChange={(val) =>
              setEditBank((prev) => ({ ...prev, bankName: String(val) }))
            }
          />

          <CustomField
            label="Account Number"
            type="text"
            value={editBank.accountNumber}
            onChange={(val) =>
              setEditBank((prev) => ({
                ...prev,
                accountNumber: String(val).replace(/\D/g, '').slice(0, 10),
              }))
            }
            placeholder="0123456789"
          />

          <CustomField
            label="Account Name"
            type="text"
            value={editBank.accountName}
            onChange={(val) =>
              setEditBank((prev) => ({ ...prev, accountName: String(val) }))
            }
            placeholder="Jane Doe"
          />

          <div className="flex items-center gap-3 pt-3">
            <CustomButton
              variant="outline"
              size="md"
              className="flex-1"
              onPress={() => setIsBankModalOpen(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="primary"
              size="md"
              className="flex-1 bg-[#2563eb] text-white"
            >
              Save Account
            </CustomButton>
          </div>
        </form>
      </AppModal>
    </div>
  )
}
