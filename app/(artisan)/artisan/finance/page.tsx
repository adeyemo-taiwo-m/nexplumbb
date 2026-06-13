'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { formatNaira } from '@/lib/format'
import { 
  Wallet, 
  TrendingUp, 
  Tool, 
  CheckCircle2, 
  ArrowUpRight, 
  HelpCircle,
  Clock,
  ShieldCheck,
  FileCheck,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface FinancingOffer {
  id: string
  title: string
  description: string
  cost: number
  repaymentMonthly: number
  tenureMonths: number
  tag: string
}

export default function ArtisanFinancePortal() {
  const { user } = useAuthStore()
  const { artisans, updateArtisan } = useMockDb()

  const dbArtisan = useMemo(() => {
    return artisans.find(a => a.id === user?.id)
  }, [artisans, user])

  // Financing offers catalog
  const offers: FinancingOffer[] = [
    { id: 'F1', title: 'Rothenberger Pipe Leak Detector Kit', description: 'Acoustic leak finder device for advanced plumbing operations. Boosts pipe diagnosis price rates.', cost: 120000, repaymentMonthly: 12500, tenureMonths: 10, tag: 'Plumbing' },
    { id: 'F2', title: 'Fluke Electrical Troubleshooter Probe', description: 'Advanced voltage test multimeters and insulation tools kit. Critical for enterprise site jobs.', cost: 85000, repaymentMonthly: 8800, tenureMonths: 10, tag: 'Electrical' },
    { id: 'F3', title: 'Dewalt 20V Cordless Hammer Drill Set', description: 'Heavy-duty drill, bits catalog, and impact driver cases. Speeds up masonry tiling mounts.', cost: 95000, repaymentMonthly: 9900, tenureMonths: 10, tag: 'All Trades' }
  ]

  // Loan states
  const [selectedOffer, setSelectedOffer] = useState<FinancingOffer | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [guarantorConfirmed, setGuarantorConfirmed] = useState(false)

  // Eligible calculation
  const isEligible = useMemo(() => {
    if (!dbArtisan) return false
    // Artisan must be verified and have completed at least some jobs (or we mock eligibility based on verification status)
    return dbArtisan.verificationStatus === 'verified' && dbArtisan.earningsAllTime >= 50000
  }, [dbArtisan])

  const handleApplyFinance = (offer: FinancingOffer) => {
    if (!isEligible) {
      toast.error('Financing Denied.', {
        description: 'You must have verified credentials and a minimum of ₦50,000 all-time platform earnings to qualify for tool financing.'
      })
      return
    }
    setSelectedOffer(offer)
    setGuarantorConfirmed(false)
  }

  const handleSubmitApplication = () => {
    if (!guarantorConfirmed) {
      toast.error('Please confirm your registered character guarantors authorization.')
      return
    }

    setIsApplying(true)
    setTimeout(() => {
      setIsApplying(false)
      setSelectedOffer(null)
      toast.success('Equipment financing request approved ✓', {
        description: 'Asset will be dispatched to yourSurulere LGA dispatch depot. Weekly lease repayments will deduct from platform jobs payouts.',
        duration: 5000
      })
    }, 2000)
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-h1 text-navy font-display font-semibold">Artisan Credit & Tool Financing</h1>
        <p className="font-body text-[14px] text-slate mt-0.5">
          Upgrade your tool inventory with microfinance loans and equipment leasing programs settled directly from platform job payouts.
        </p>
      </div>

      {/* Credit status banner */}
      <div className="bg-white rounded-card border border-border p-5 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Eligibility card */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            isEligible ? 'bg-teal/15 text-teal border border-teal/20' : 'bg-amber/15 text-amber-dark border border-amber/20'
          }`}>
            <ShieldCheck size={28} />
          </div>
          <div className="font-mono text-[12px] leading-tight">
            <span className="font-bold text-slate block uppercase text-[10px]">Eligibility Status</span>
            {isEligible ? (
              <span className="font-bold text-teal text-[13px] block mt-0.5">Qualified (Grade-A Credit)</span>
            ) : (
              <span className="font-bold text-amber-dark text-[13px] block mt-0.5">Boost Earnings to Qualify</span>
            )}
          </div>
        </div>

        {/* Credit score */}
        <div className="font-mono text-[12px] leading-tight md:border-x md:border-border md:px-6">
          <span className="font-bold text-slate block uppercase text-[10px]">Platform Credit Rating</span>
          <span className="font-bold text-navy text-[18px] block mt-1">
            {dbArtisan ? `${Math.round(dbArtisan.rating * 160)} Points` : '0 Points'}
          </span>
          <span className="text-slate text-[10px] mt-0.5 block">Based on review ratings and job completions</span>
        </div>

        {/* Repayments */}
        <div className="font-mono text-[12px] leading-tight">
          <span className="font-bold text-slate block uppercase text-[10px]">Active Repayment Balance</span>
          <span className="font-bold text-navy text-[18px] block mt-1">₦0.00</span>
          <span className="text-slate text-[10px] mt-0.5 block">No active tool leases listed</span>
        </div>

      </div>

      {/* Tool financing list */}
      <section className="flex flex-col gap-4">
        <h3 className="font-display font-bold text-[16px] text-navy border-b border-border pb-2.5">
          Available Equipment Upgrades & Leases
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className="bg-white rounded-card border border-border shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between gap-4 text-left"
            >
              <div>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <span className="font-mono text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded uppercase">
                    {offer.tag}
                  </span>
                  <span className="font-mono text-[11px] text-slate font-bold">Code: {offer.id}</span>
                </div>
                
                <h4 className="font-display font-bold text-[15px] text-navy mt-3">{offer.title}</h4>
                <p className="font-body text-[13px] text-slate mt-1.5 leading-relaxed">{offer.description}</p>
              </div>

              <div className="border-t border-border/60 pt-3 flex flex-col gap-2 font-mono text-[12px] text-navy">
                <div className="flex justify-between">
                  <span className="text-slate">Asset Value:</span>
                  <span className="font-bold">₦{offer.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Repayment:</span>
                  <span className="font-bold text-teal">₦{offer.repaymentMonthly.toLocaleString()}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Tenure Duration:</span>
                  <span>{offer.tenureMonths} Months lease-to-own</span>
                </div>

                <Button 
                  variant={isEligible ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => handleApplyFinance(offer)}
                  className="mt-2"
                >
                  {isEligible ? 'Apply for Lease' : 'Check Eligibility Lock'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Repayments log */}
      <section className="bg-white rounded-card border border-border p-5 shadow-card text-left flex flex-col gap-4">
        <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2.5 flex items-center gap-1.5">
          <Clock size={18} className="text-teal" />
          Weekly Repayments History
        </h3>
        
        <p className="font-body text-[13px] text-slate py-4 text-center">
          No tool leases have been finalized. Approved lease contracts will list payment deduct logs here.
        </p>
      </section>

      {/* Apply Loan Modal */}
      {selectedOffer && (
        <Modal
          isOpen={!!selectedOffer}
          onClose={() => setSelectedOffer(null)}
          title="Sign Tool Lease Finance Agreement"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setSelectedOffer(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitApplication} disabled={isApplying || !guarantorConfirmed}>
                {isApplying ? 'Processing lease...' : 'Sign Lease Agreement'}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[12px] text-navy text-left leading-normal">
            
            <div className="bg-lgray p-3.5 border rounded-card">
              <span className="font-bold block uppercase text-[10px] text-slate mb-1">Equipment Detail</span>
              <p className="font-display font-bold text-navy text-[14px]">{selectedOffer.title}</p>
              <p className="mt-1">Cost of Equipment: ₦{selectedOffer.cost.toLocaleString()}</p>
            </div>

            <div className="bg-teal/5 border border-teal/15 p-3.5 rounded-card flex flex-col gap-1.5">
              <span className="font-bold text-teal block uppercase text-[9px]">Platform Lease Repayment Terms</span>
              <p>✓ Monthly Deduction: **₦{selectedOffer.repaymentMonthly.toLocaleString()}** (automatically split into ₦{Math.round(selectedOffer.repaymentMonthly / 4).toLocaleString()} weekly cuts)</p>
              <p>✓ Loan Tenure: **{selectedOffer.tenureMonths} months lease-to-own**</p>
              <p>✓ Deduct Method: Automated split locks on completed job escrows</p>
            </div>

            <div className="border border-border rounded-card p-3 flex flex-col gap-2">
              <span className="font-bold block uppercase text-[9px] text-slate mb-1">Guarantor Authorizations Check</span>
              <p className="text-[11px] text-slate leading-relaxed">
                By ticking below, you authorize NexPlumb to utilize your registered guarantors details (Chief Alao) for loan guarantee check updates.
              </p>
              
              <label className="flex items-start gap-2.5 mt-2 cursor-pointer font-semibold text-[11px] select-none text-navy">
                <input 
                  type="checkbox" 
                  checked={guarantorConfirmed} 
                  onChange={(e) => setGuarantorConfirmed(e.target.checked)} 
                  className="mt-0.5 rounded border-border text-teal focus:ring-teal" 
                />
                <span>Confirm Guarantor Authorization Consent</span>
              </label>
            </div>

          </div>
        </Modal>
      )}

    </div>
  )
}
