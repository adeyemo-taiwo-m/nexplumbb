'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb, Transaction } from '@/lib/store/mockDb'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatNaira, formatDate, calculateCommission } from '@/lib/format'
import { 
  Wallet, 
  ArrowUpRight, 
  Download, 
  Clock, 
  CheckCircle,
  Building,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ArtisanEarnings() {
  const { user } = useAuthStore()
  const { artisans, withdrawArtisanEarnings, transactions } = useMockDb()

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Find artisan
  const dbArtisan = useMemo(() => {
    return artisans.find(a => a.id === user?.id)
  }, [artisans, user])

  const earningsAvailable = dbArtisan?.earningsAvailable ?? 0
  const earningsPending = dbArtisan?.earningsPending ?? 0
  const earningsAllTime = dbArtisan?.earningsAllTime ?? 0

  // Filter transactions
  const artisanTransactions = useMemo(() => {
    if (!user) return []
    return transactions.filter(t => t.userId === user.id)
  }, [transactions, user])

  // Chart Data Mock: Daily earnings
  const chartData = useMemo(() => {
    return [
      { date: 'Jun 07', amount: 8000 },
      { date: 'Jun 08', amount: 15000 },
      { date: 'Jun 09', amount: 0 },
      { date: 'Jun 10', amount: 12000 },
      { date: 'Jun 11', amount: 25000 },
      { date: 'Jun 12', amount: 8800 },
      { date: 'Jun 13', amount: earningsAvailable > 0 ? earningsAvailable : 13000 }
    ]
  }, [earningsAvailable])

  const handleWithdrawalSubmit = () => {
    if (withdrawAmount <= 0) {
      toast.error('Enter a valid amount to withdraw')
      return
    }
    if (withdrawAmount > earningsAvailable) {
      toast.error('Insufficient available balance')
      return
    }

    setIsWithdrawing(true)
    setTimeout(() => {
      if (user?.id) {
        withdrawArtisanEarnings(user.id, withdrawAmount)
        toast.success(`Withdrawal of ₦${withdrawAmount.toLocaleString()} completed!`)
      }
      setIsWithdrawing(false)
      setIsWithdrawModalOpen(false)
      setWithdrawAmount(0)
    }, 2000)
  }

  return (
    <div className="w-full flex-grow flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 select-none">
        <div>
          <h1 className="text-h1 text-navy">Earnings & Payouts</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">Withdraw available funds to your registered bank account.</p>
        </div>
        
        <Button variant="secondary" size="sm" onClick={() => toast.success('CSV ledger file downloaded.')}>
          Download CSV Ledger
        </Button>
      </div>

      {/* Balance widgets */}
      <div className="bg-white rounded-card border border-border p-6 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Available */}
        <div className="text-left font-mono text-[13px] leading-tight">
          <span className="text-slate block mb-1">AVAILABLE BALANCE</span>
          <span className="text-[32px] font-bold text-teal leading-none">
            {formatNaira(earningsAvailable)}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={earningsAvailable <= 0}
            className="mt-4 flex items-center gap-1 leading-none text-[12px] h-9"
          >
            Withdraw to Bank <ArrowUpRight size={14} />
          </Button>
        </div>

        {/* Pending */}
        <div className="text-left font-mono text-[13px] leading-tight md:border-x md:border-border md:px-8 self-start h-full flex flex-col justify-start">
          <span className="text-slate flex items-center gap-1 mb-1">
            PENDING IN ESCROW 
            <span className="cursor-help" title="Released 24 hours after completion or upon customer release">
              <Info size={12} />
            </span>
          </span>
          <span className="text-[28px] font-bold text-navy leading-none mt-1">
            {formatNaira(earningsPending)}
          </span>
          <p className="text-[11px] text-slate mt-3 leading-normal font-body font-normal">
            Released after work is confirmed complete.
          </p>
        </div>

        {/* All-time earned */}
        <div className="text-left font-mono text-[13px] leading-tight self-start h-full flex flex-col justify-start">
          <span className="text-slate block mb-1">ALL-TIME EARNED</span>
          <span className="text-[28px] font-bold text-navy leading-none mt-1">
            {formatNaira(earningsAllTime)}
          </span>
          <p className="text-[11px] text-slate mt-3 leading-normal font-body font-normal">
            Total platform payout net of commission.
          </p>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="bg-white rounded-card border border-border p-6 shadow-card select-none">
        <h3 className="font-display font-bold text-[15px] text-navy mb-6">Daily earnings trend</h3>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis tickFormatter={(val) => `₦${val / 1000}k`} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                formatter={(val) => [`₦${val}`, 'Earnings']} 
                labelStyle={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                contentStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Bar dataKey="amount" fill="#E76F51" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gross Commission Net Ledger */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        <table className="w-full text-left font-mono text-[13px] leading-normal">
          <thead className="bg-lgray/50 text-[11px] font-bold text-slate uppercase border-b border-border select-none">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Transaction Ref</th>
              <th className="p-4">Type</th>
              <th className="p-4">Gross Amt</th>
              <th className="p-4">Commission (12%)</th>
              <th className="p-4">Net Payout</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {artisanTransactions.map((tx) => {
              const comm = tx.type === 'escrow_release' ? calculateCommission(tx.amount / 0.88) : 0
              const gross = tx.type === 'escrow_release' ? tx.amount + comm : tx.amount

              return (
                <tr key={tx.id} className="border-b border-border hover:bg-lgray/10">
                  <td className="p-4">{formatDate(tx.date)}</td>
                  <td className="p-4 font-bold text-navy">{tx.bookingReference || 'Withdrawal'}</td>
                  <td className="p-4 font-bold capitalize">{tx.type.replace('_', ' ')}</td>
                  <td className="p-4">₦{gross.toLocaleString()}</td>
                  <td className="p-4 text-red-600">{comm > 0 ? `-₦${comm.toLocaleString()}` : '—'}</td>
                  <td className="p-4 font-bold text-teal">₦{tx.amount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal">
                      <CheckCircle size={12} /> Success
                    </span>
                  </td>
                </tr>
              )
            })}
            
            {artisanTransactions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate font-body">
                  No payout transactions recorded. Completed jobs will show up in this ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <Modal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          title="Withdraw Payout to Bank"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setIsWithdrawModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleWithdrawalSubmit} 
                loading={isWithdrawing}
                disabled={withdrawAmount <= 0 || withdrawAmount > earningsAvailable}
              >
                Confirm withdrawal
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[13px] text-navy leading-normal">
            
            {/* Account display */}
            <div className="p-4 bg-lgray rounded border border-border flex items-center gap-3">
              <Building size={24} className="text-slate" />
              <div>
                <p className="font-bold text-navy">{dbArtisan?.bankName || 'Access Bank'}</p>
                <p className="text-slate">Account Number: ****{dbArtisan?.accountNumber?.slice(-4) || '6789'}</p>
              </div>
            </div>

            <p className="text-slate text-[12px] font-body font-normal">
              Available to withdraw: **₦{earningsAvailable.toLocaleString()}**
            </p>

            <div>
              <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Amount to withdraw (₦)</label>
              <input
                type="number"
                value={withdrawAmount === 0 ? '' : withdrawAmount}
                placeholder="e.g. 5000"
                onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                className="h-12 w-full rounded-btn border border-border px-4 font-mono text-[14px]"
              />
              {withdrawAmount > earningsAvailable && (
                <p className="text-red-600 text-[11px] mt-1 font-bold">Error: Exceeds available balance</p>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
