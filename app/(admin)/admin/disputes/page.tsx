'use client'

import React, { useState, useMemo } from 'react'
import { useMockDb, Dispute } from '@/lib/store/mockDb'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { formatNaira } from '@/lib/format'
import { 
  AlertTriangle, 
  Clock, 
  ArrowRightLeft, 
  ShieldCheck, 
  FileText, 
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Sliders,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminDisputesArbitration() {
  const { disputes, resolveDispute } = useMockDb()

  // State
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    disputes.length > 0 ? disputes[0].id : null
  )

  // Arbitration panel states
  const [decision, setDecision] = useState<'refund_customer' | 'release_artisan' | 'partial'>('refund_customer')
  const [reason, setReason] = useState('')
  const [refundPct, setRefundPct] = useState(50) // slider percentage if partial

  // Find active dispute record
  const activeDispute = useMemo(() => {
    return disputes.find(d => d.id === selectedDisputeId) || null
  }, [disputes, selectedDisputeId])

  // Split calculations
  const totalAmount = activeDispute?.amount || 0
  const refundCustomerAmount = useMemo(() => {
    if (decision === 'refund_customer') return totalAmount
    if (decision === 'release_artisan') return 0
    return Math.round((totalAmount * refundPct) / 100)
  }, [decision, totalAmount, refundPct])

  const releaseArtisanAmount = useMemo(() => {
    if (decision === 'refund_customer') return 0
    if (decision === 'release_artisan') return totalAmount
    return totalAmount - refundCustomerAmount
  }, [decision, totalAmount, refundCustomerAmount])

  // Group open/resolved disputes
  const unresolvedDisputes = useMemo(() => {
    return disputes.filter(d => d.status !== 'resolved')
  }, [disputes])

  const resolvedDisputes = useMemo(() => {
    return disputes.filter(d => d.status === 'resolved')
  }, [disputes])

  // Submit decision
  const handleSubmitResolution = () => {
    if (!activeDispute) return
    if (!reason.trim()) {
      toast.error('Resolution rationale reason is required for compliance audit.')
      return
    }

    resolveDispute(
      activeDispute.id,
      decision,
      reason.trim(),
      refundCustomerAmount,
      releaseArtisanAmount
    )

    toast.success('Dispute resolved & closed.', {
      description: `Escrow funds divided: Customer receives ₦${refundCustomerAmount.toLocaleString()}, Artisan receives ₦${releaseArtisanAmount.toLocaleString()}`
    })
    
    // Reset inputs
    setReason('')
  }

  // Calculate SLA time remaining text
  const getSlaTimeLeft = (isoString: string) => {
    const deadline = new Date(isoString).getTime()
    const now = new Date().getTime()
    const diff = deadline - now
    if (diff < 0) return 'SLA BREACHED (Overdue)'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins}m remaining`
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-h1 text-navy font-display font-semibold">Dispute Arbitration Desk</h1>
        <p className="font-body text-[14px] text-slate mt-0.5">
          Moderate claims, audit photo evidence from before/after jobs, and split escrow balances under CBN regulatory rules.
        </p>
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: DISPUTE QUEUE (4 columns) */}
        <aside className="desktop:col-span-4 bg-white rounded-card border border-border p-4 shadow-card flex flex-col gap-4">
          <h3 className="font-display font-bold text-[14px] text-navy border-b border-border pb-2.5">
            Active Disputes Queue
          </h3>
          
          {/* Unresolved section */}
          <div>
            <span className="font-mono text-[10px] font-bold text-red-600 block uppercase tracking-wider mb-2">Unresolved ({unresolvedDisputes.length})</span>
            {unresolvedDisputes.length === 0 ? (
              <p className="font-body text-[12px] text-slate py-2">Queue is clear ✓</p>
            ) : (
              <div className="flex flex-col gap-2">
                {unresolvedDisputes.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDisputeId(d.id); setReason('') }}
                    className={`w-full border p-3 rounded text-left font-mono text-[11px] transition-all flex flex-col gap-1.5 focus:outline-none ${
                      selectedDisputeId === d.id
                        ? 'border-red-600 bg-red-50/15'
                        : 'border-border hover:border-slate'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-red-700">{d.bookingReference}</span>
                      <span className="text-[10px] text-slate font-bold">{getSlaTimeLeft(d.slaDeadline).split(' ')[0]} left</span>
                    </div>
                    <div className="leading-tight text-slate">
                      <p>Claim amount: <span className="font-bold text-navy">₦{d.amount.toLocaleString()}</span></p>
                      <p className="mt-0.5">Customer: {d.customerName} vs {d.artisanName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Section */}
          <div className="border-t border-border pt-4">
            <span className="font-mono text-[10px] font-bold text-slate block uppercase tracking-wider mb-2">Resolved Archive ({resolvedDisputes.length})</span>
            {resolvedDisputes.length === 0 ? (
              <p className="font-body text-[12px] text-slate py-2">No archived resolutions.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {resolvedDisputes.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDisputeId(d.id); setReason('') }}
                    className={`w-full border p-3 rounded text-left font-mono text-[11px] transition-all flex flex-col gap-1.5 focus:outline-none ${
                      selectedDisputeId === d.id
                        ? 'border-navy bg-lgray'
                        : 'border-border/60 hover:border-slate'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-navy">{d.bookingReference}</span>
                      <span className="text-teal font-bold uppercase text-[9px]">Resolved ✓</span>
                    </div>
                    <p className="text-slate">Total funds: ₦{d.amount.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

        </aside>

        {/* RIGHT COLUMN: ARBITRATION FILE (8 columns) */}
        <main className="desktop:col-span-8 flex flex-col gap-6">
          {!activeDispute ? (
            <div className="bg-white border rounded-card p-12 text-center shadow-card font-body text-slate">
              Select a dispute from the queue to start resolution audits.
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-6">
              
              {/* Dispute Header Info */}
              <div className="border-b border-border pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase">
                      Claim Code: {activeDispute.id.toUpperCase()}
                    </span>
                    <span className="font-mono text-[11px] text-slate font-bold">Booking: {activeDispute.bookingReference}</span>
                  </div>
                  <h2 className="text-h3 text-navy font-display mt-2 font-semibold">
                    Arbitrating Dispute Case
                  </h2>
                </div>

                <div className="flex flex-col items-end text-right shrink-0">
                  <span className="font-mono text-[11px] text-slate">Escrow Lock Amount:</span>
                  <span className="font-mono text-[22px] font-bold text-navy leading-none mt-1">₦{activeDispute.amount.toLocaleString()}</span>
                  
                  {activeDispute.status !== 'resolved' ? (
                    <div className="flex items-center gap-1.5 text-red-700 font-mono text-[11px] font-bold mt-2">
                      <Clock size={14} className="animate-pulse" />
                      {getSlaTimeLeft(activeDispute.slaDeadline)}
                    </div>
                  ) : (
                    <span className="bg-teal/15 text-teal text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase mt-2">
                      Arbitrated & Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Statements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                
                {/* Customer Claim Side */}
                <div className="border border-border rounded-card p-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate border-b border-border pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                    <span>Customer: <strong className="text-navy">{activeDispute.customerName}</strong></span>
                  </div>
                  
                  <p className="font-body italic text-[13px] text-body leading-relaxed flex-1">
                    "{activeDispute.customerStatement}"
                  </p>

                  {/* Customer Uploads */}
                  {activeDispute.customerPhotos && activeDispute.customerPhotos.length > 0 ? (
                    <div>
                      <span className="font-mono text-[9px] font-bold text-slate uppercase block mb-1.5">Submitted Proof Photos:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {activeDispute.customerPhotos.map((url, i) => (
                          <img key={i} src={url} alt="Customer proof" className="h-16 w-full object-cover rounded border" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="font-mono text-[10px] text-slate italic">No customer photos submitted.</span>
                  )}
                </div>

                {/* Artisan Defense Side */}
                <div className="border border-border rounded-card p-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate border-b border-border pb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal shrink-0" />
                    <span>Artisan: <strong className="text-navy">{activeDispute.artisanName}</strong></span>
                  </div>

                  <p className="font-body italic text-[13px] text-body leading-relaxed flex-1">
                    {activeDispute.artisanStatement 
                      ? `"${activeDispute.artisanStatement}"` 
                      : "Artisan failed to submit a defense statement. Job completion logs and after-job photos will be evaluated as default defense proofs."
                    }
                  </p>

                  {/* Artisan Uploads */}
                  {activeDispute.artisanPhotos && activeDispute.artisanPhotos.length > 0 ? (
                    <div>
                      <span className="font-mono text-[9px] font-bold text-slate uppercase block mb-1.5">Job After-Images:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {activeDispute.artisanPhotos.map((url, i) => (
                          <img key={i} src={url} alt="Artisan proof" className="h-16 w-full object-cover rounded border" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="font-mono text-[10px] text-slate italic">No job after-images submitted.</span>
                  )}
                </div>

              </div>

              {/* RESOLUTION PANEL (If unresolved) */}
              {activeDispute.status !== 'resolved' ? (
                <div className="border-t border-border pt-6 flex flex-col gap-5 text-left">
                  <h4 className="font-display font-bold text-[14px] text-navy flex items-center gap-1.5">
                    <Sliders size={16} className="text-teal" />
                    Arbitration Actions & Escrow Split
                  </h4>

                  {/* Options selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setDecision('refund_customer')}
                      className={`border rounded-btn p-3 text-center transition-all focus:outline-none flex flex-col items-center justify-center gap-1 ${
                        decision === 'refund_customer'
                          ? 'border-red-600 bg-red-50/15'
                          : 'border-border hover:border-slate'
                      }`}
                    >
                      <span className="font-mono text-[12px] font-bold text-red-700">100% Refund</span>
                      <span className="font-mono text-[10px] text-slate">Pay ₦{totalAmount.toLocaleString()} to customer</span>
                    </button>

                    <button
                      onClick={() => setDecision('release_artisan')}
                      className={`border rounded-btn p-3 text-center transition-all focus:outline-none flex flex-col items-center justify-center gap-1 ${
                        decision === 'release_artisan'
                          ? 'border-teal bg-teal/5'
                          : 'border-border hover:border-slate'
                      }`}
                    >
                      <span className="font-mono text-[12px] font-bold text-teal">100% Payout</span>
                      <span className="font-mono text-[10px] text-slate">Pay ₦{totalAmount.toLocaleString()} to artisan</span>
                    </button>

                    <button
                      onClick={() => setDecision('partial')}
                      className={`border rounded-btn p-3 text-center transition-all focus:outline-none flex flex-col items-center justify-center gap-1 ${
                        decision === 'partial'
                          ? 'border-navy bg-lgray'
                          : 'border-border hover:border-slate'
                      }`}
                    >
                      <span className="font-mono text-[12px] font-bold text-navy">Custom Split</span>
                      <span className="font-mono text-[10px] text-slate">Split amount between parties</span>
                    </button>
                  </div>

                  {/* Partial Split Sliders */}
                  {decision === 'partial' && (
                    <div className="bg-lgray/60 border border-border/80 rounded-card p-4 font-mono text-[12px] text-navy">
                      <label className="font-bold flex justify-between items-center uppercase text-[10px] text-slate">
                        <span>Refund Customer: {refundPct}%</span>
                        <span>Release Artisan: {100 - refundPct}%</span>
                      </label>
                      
                      <input 
                        type="range" 
                        min="5" 
                        max="95" 
                        step="5"
                        value={refundPct}
                        onChange={(e) => setRefundPct(parseInt(e.target.value))}
                        className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-teal mt-2" 
                      />

                      <div className="mt-4 grid grid-cols-2 gap-4 text-center font-bold">
                        <div className="bg-white border p-2 rounded">
                          <p className="text-[9px] text-slate font-bold uppercase">Customer Refund</p>
                          <p className="text-[14px] text-red-600 mt-0.5">₦{refundCustomerAmount.toLocaleString()}</p>
                        </div>
                        <div className="bg-white border p-2 rounded">
                          <p className="text-[9px] text-slate font-bold uppercase">Artisan Payout</p>
                          <p className="text-[14px] text-teal mt-0.5">₦{releaseArtisanAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Split summary verification */}
                  <div className="bg-teal/5 border border-teal/10 p-3 rounded flex justify-between items-center text-[12px] font-mono font-bold text-navy">
                    <span>Final Split Summary:</span>
                    <span className="flex items-center gap-1">
                      Customer: <span className="text-red-600">₦{refundCustomerAmount.toLocaleString()}</span> 
                      <ArrowRightLeft size={12} className="text-slate" /> 
                      Artisan: <span className="text-teal">₦{releaseArtisanAmount.toLocaleString()}</span>
                    </span>
                  </div>

                  {/* Reason text area */}
                  <div>
                    <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Arbitration Rationale (Compliance logs requirements)</label>
                    <textarea
                      placeholder="Specify reasoning based on uploaded photo proofs, timeline tracking, or contact logs..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-btn border border-border bg-white px-4 py-3 font-mono text-[13px] focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                    />
                  </div>

                  {/* Action submit button */}
                  <div className="flex justify-end select-none mt-2">
                    <Button 
                      variant={decision === 'refund_customer' ? 'danger' : decision === 'release_artisan' ? 'success' : 'primary'}
                      onClick={handleSubmitResolution}
                      className="w-full sm:w-auto"
                    >
                      Confirm Escrow Arbitration Resolution
                    </Button>
                  </div>
                </div>
              ) : (
                /* RESOLUTION DETAILS SUMMARY (If resolved) */
                <div className="border-t border-border pt-6 flex flex-col gap-4 text-left font-mono text-[12px] text-navy">
                  <div className="bg-teal/5 border border-teal/15 rounded-card p-4 flex gap-3">
                    <CheckCircle className="text-teal shrink-0" size={24} />
                    <div className="leading-normal">
                      <span className="font-bold text-[13px] text-teal block uppercase">Case Arbitrated & Closed</span>
                      <p className="mt-1">Resolution Decision: **{activeDispute.resolutionDecision?.toUpperCase().replace('_', ' ')}**</p>
                      <p className="mt-0.5">Resolved By: **{activeDispute.resolvedBy}** on {new Date(activeDispute.resolvedAt || '').toLocaleString()}</p>
                      <p className="mt-3 text-slate">Arbitration rationale justification:</p>
                      <p className="italic font-body text-[13px] text-body mt-1">"{activeDispute.resolutionReason}"</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>

    </div>
  )
}
