'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useMockDb } from '@/lib/store/mockDb'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { formatNaira } from '@/lib/format'
import { 
  Briefcase, 
  AlertTriangle, 
  UserCheck, 
  Wallet, 
  Clock, 
  ChevronRight,
  TrendingUp,
  MapPin,
  FileDown
} from 'lucide-react'

export default function AdminDashboardOverview() {
  const { bookings, disputes, artisans, transactions } = useMockDb()

  // Calculate metrics
  const totalEscrowHeld = useMemo(() => {
    // Escrow held is paid bookings that are NOT completed or cancelled
    const activeEscrows = bookings.filter(
      b => b.paymentStatus === 'paid' && 
      b.status !== 'completed' && 
      b.status !== 'cancelled'
    )
    return activeEscrows.reduce((sum, b) => sum + b.amount, 0)
  }, [bookings])

  const activeDisputes = useMemo(() => {
    return disputes.filter(d => d.status !== 'resolved')
  }, [disputes])

  const pendingVerificationsCount = useMemo(() => {
    return artisans.filter(
      a => a.verificationStatus === 'under_review' || a.verificationStatus === 'pending'
    ).length
  }, [artisans])

  const activeJobs = useMemo(() => {
    return bookings.filter(
      b => b.status === 'confirmed' || 
           b.status === 'en_route' || 
           b.status === 'on_site' || 
           b.status === 'in_progress' || 
           b.status === 'job_complete'
    )
  }, [bookings])

  // SLA Warnings Check:
  // - Urgent job that is 'confirmed' (unassigned/not en route) for over 10 minutes
  // - Dispute that has less than 24 hours left on SLA deadline
  const slaWarnings = useMemo(() => {
    const warnings: { type: 'job' | 'dispute'; title: string; message: string; severity: 'high' | 'medium'; id: string }[] = []
    
    // Check bookings
    bookings.forEach(b => {
      if (b.isUrgent && b.status === 'confirmed') {
        warnings.push({
          id: b.id,
          type: 'job',
          title: `Urgent Dispatch SLA Warning`,
          message: `Booking ${b.reference} (${b.jobType}) needs immediate artisan departure in ${b.customerAddressDetails || b.customerAddress}.`,
          severity: 'high'
        })
      }
    })

    // Check disputes
    disputes.forEach(d => {
      if (d.status !== 'resolved') {
        const deadline = new Date(d.slaDeadline).getTime()
        const now = new Date().getTime()
        const diffHours = (deadline - now) / (1000 * 60 * 60)
        
        if (diffHours < 24) {
          warnings.push({
            id: d.id,
            type: 'dispute',
            title: `Critical Dispute Resolution SLA`,
            message: `Dispute ${d.bookingReference} has less than ${Math.max(0, Math.round(diffHours))} hours remaining to meet 48h resolution SLA limit.`,
            severity: 'high'
          })
        } else if (diffHours < 40) {
          warnings.push({
            id: d.id,
            type: 'dispute',
            title: `Dispute Resolution SLA Warning`,
            message: `Dispute ${d.bookingReference} has ${Math.round(diffHours)} hours left.`,
            severity: 'medium'
          })
        }
      }
    })

    return warnings
  }, [bookings, disputes])

  // Metrics configurations
  const cards = [
    { 
      label: 'Total Escrow Held', 
      value: formatNaira(totalEscrowHeld), 
      sub: 'Held securely in NexPlumb vaults', 
      icon: Wallet, 
      color: 'text-teal bg-teal/10',
      href: '/admin/jobs' 
    },
    { 
      label: 'Active Disputes', 
      value: activeDisputes.length, 
      sub: `${disputes.filter(d => d.status === 'resolved').length} resolved disputes`, 
      icon: AlertTriangle, 
      color: activeDisputes.length > 0 ? 'text-red-600 bg-red-50' : 'text-slate bg-lgray',
      href: '/admin/disputes' 
    },
    { 
      label: 'Pending Vettings', 
      value: pendingVerificationsCount, 
      sub: 'Requires credentials review', 
      icon: UserCheck, 
      color: pendingVerificationsCount > 0 ? 'text-amber bg-amber/15' : 'text-slate bg-lgray',
      href: '/admin/verification' 
    },
    { 
      label: 'Active Dispatches', 
      value: activeJobs.length, 
      sub: 'Live artisan tasks on ground', 
      icon: Briefcase, 
      color: 'text-nxblue bg-nxblue/10',
      href: '/admin/jobs' 
    }
  ]

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Greeting row */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-h1 text-navy font-display font-semibold">Admin Command Center</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">
            Lagos Central Operations Desk: Monitor escrows, moderate disputes, audit credentials.
          </p>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[12px] text-slate">
          <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Link 
              key={idx} 
              href={card.href} 
              className="bg-white rounded-card p-5 border border-border shadow-card hover:shadow-card-hover hover:border-teal/30 transition-all flex flex-col gap-3 group text-left"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded ${card.color}`}>
                  <Icon size={20} />
                </div>
                <ChevronRight size={16} className="text-slate group-hover:text-teal transition-colors" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{card.label}</p>
                <p className="font-mono text-[24px] font-bold text-navy mt-1 group-hover:text-teal transition-colors">
                  {card.value}
                </p>
                <p className="font-mono text-[10px] text-slate mt-1.5 font-medium">{card.sub}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SECTION (SLA WARNINGS & LIVE DISPATCH) */}
        <div className="desktop:col-span-8 flex flex-col gap-6">
          
          {/* SLA Alerts Banner Stack */}
          {slaWarnings.length > 0 && (
            <section className="bg-white rounded-card border border-border p-5 shadow-card">
              <h3 className="font-display font-bold text-[15px] text-navy mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600 animate-pulse" />
                Urgent Operations Alerts ({slaWarnings.length})
              </h3>
              
              <div className="flex flex-col gap-3">
                {slaWarnings.map((warning, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-card p-4 flex justify-between items-center gap-4 ${
                      warning.severity === 'high' 
                        ? 'bg-red-50 border-red-200 text-red-950' 
                        : 'bg-amber/5 border-amber/20 text-amber-dark'
                    }`}
                  >
                    <div className="font-mono text-[12px] leading-tight text-left">
                      <h4 className="font-bold flex items-center gap-1.5 text-[13px]">
                        <span className={`w-2 h-2 rounded-full ${warning.severity === 'high' ? 'bg-red-600' : 'bg-amber'}`} />
                        {warning.title}
                      </h4>
                      <p className="mt-1.5 font-normal">{warning.message}</p>
                    </div>

                    <Link href={warning.type === 'job' ? '/admin/jobs' : '/admin/disputes'}>
                      <Button 
                        size="sm" 
                        variant={warning.severity === 'high' ? 'danger' : 'secondary'}
                        className="shrink-0"
                      >
                        Investigate
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Live Dispatch Tracker */}
          <section className="bg-white rounded-card border border-border p-5 shadow-card">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4 flex-wrap gap-2">
              <h3 className="font-display font-bold text-[15px] text-navy flex items-center gap-1.5">
                <Briefcase size={18} className="text-teal" />
                Live Job Dispatch Desk
              </h3>
              
              <Link href="/admin/jobs" className="font-mono text-[11px] font-bold text-teal hover:underline flex items-center gap-0.5">
                Go to full jobs table <ChevronRight size={12} />
              </Link>
            </div>

            {activeJobs.length === 0 ? (
              <p className="font-body text-[13px] text-slate text-center py-8">
                No active jobs currently in dispatch.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[12px] text-navy">
                  <thead>
                    <tr className="bg-lgray border-b border-border text-[11px] text-slate uppercase font-bold text-left">
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Artisan</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Escrow Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobs.slice(0, 5).map((job) => (
                      <tr 
                        key={job.id} 
                        className="border-b border-border/40 hover:bg-nxblue/5 transition-colors"
                      >
                        <td className="py-3 px-3 font-bold">{job.reference}</td>
                        <td className="py-3 px-3">{job.artisanName} ({job.artisanTrade})</td>
                        <td className="py-3 px-3">{job.customerName}</td>
                        <td className="py-3 px-3">{job.customerAddress.split(',')[1]?.trim() || 'Lagos'}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={job.status} showDot />
                        </td>
                        <td className="py-3 px-3 text-right font-bold">₦{job.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT SECTION (VERIFICATION PIPELINE & DISPUTES PIPELINE SUMMARY) */}
        <aside className="desktop:col-span-4 flex flex-col gap-6">
          
          {/* Dispute Arbitration Shortlist */}
          <section className="bg-white rounded-card border border-border p-5 shadow-card flex flex-col gap-4">
            <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2.5">
              Pending Disputes Queue
            </h3>
            
            {activeDisputes.length === 0 ? (
              <p className="font-body text-[13px] text-slate text-center py-4">
                All dispute claims resolved ✓
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {activeDisputes.slice(0, 3).map((dispute) => (
                  <div key={dispute.id} className="border border-border/80 rounded-btn p-3 bg-red-50/20 text-left font-mono text-[11px] text-navy">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-red-700">{dispute.bookingReference}</span>
                      <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                        Escrow Dispute
                      </span>
                    </div>
                    <p className="mt-1.5 text-slate">Artisan: <span className="font-bold text-navy">{dispute.artisanName}</span></p>
                    <p className="mt-0.5 text-slate">Customer: <span className="font-bold text-navy">{dispute.customerName}</span></p>
                    <p className="mt-1 font-bold">Escrow Claim: ₦{dispute.amount.toLocaleString()}</p>
                    
                    <div className="mt-3 flex justify-end">
                      <Link href="/admin/disputes">
                        <Button size="sm" variant="danger" className="h-8 text-[11px] px-3">
                          Arbitrate Dispute
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Verification Audit Shortlist */}
          <section className="bg-white rounded-card border border-border p-5 shadow-card flex flex-col gap-4">
            <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2.5">
              NIMC Identity Audits Queue
            </h3>

            {artisans.filter(a => a.verificationStatus === 'under_review' || a.verificationStatus === 'pending').length === 0 ? (
              <p className="font-body text-[13px] text-slate text-center py-4">
                Verification queue clear.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {artisans.filter(a => a.verificationStatus === 'under_review' || a.verificationStatus === 'pending').slice(0, 3).map((artisan) => (
                  <div key={artisan.id} className="border border-border/80 rounded-btn p-3 bg-amber/5 text-left font-mono text-[11px] text-navy">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-navy">{artisan.name}</span>
                      <span className="bg-amber/15 text-amber-dark px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                        NIMC Audit
                      </span>
                    </div>
                    <p className="mt-1.5 text-slate">Trade: <span className="font-bold text-navy">{artisan.trade}</span> · {artisan.area}</p>
                    <p className="mt-0.5 text-slate">NIN Registered: {artisan.nin || 'Not provided'}</p>
                    
                    <div className="mt-3 flex justify-end">
                      <Link href="/admin/verification">
                        <Button size="sm" variant="secondary" className="h-8 text-[11px] px-3">
                          Audit Credentials
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </aside>

      </div>

    </div>
  )
}
