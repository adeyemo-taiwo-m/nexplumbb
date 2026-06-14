'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb, Booking } from '@/lib/store/mockDb'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { formatNaira } from '@/lib/format'
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Eye, 
  Star, 
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function ArtisanDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { bookings, updateBookingStatus, artisans, updateArtisan } = useMockDb()

  // Find DB record
  const dbArtisan = useMemo(() => {
    return artisans.find(a => a.id === user?.id)
  }, [artisans, user])

  const isOnline = dbArtisan?.isOnline ?? false

  // Counter proposal state
  const [activeCounterBooking, setActiveCounterBooking] = useState<Booking | null>(null)
  const [counterPrice, setCounterPrice] = useState(12000)

  // Filter artisan jobs
  const artisanBookings = useMemo(() => {
    if (!user) return []
    return bookings.filter(b => b.artisanId === user.id)
  }, [bookings, user])

  // New available jobs near me (Alert cards)
  const newJobsAvailable = useMemo(() => {
    // If offline, no alerts
    if (!isOnline) return []
    // Match jobs with status 'confirmed' (waiting for dispatch) where artisan hasn't departed yet
    return artisanBookings.filter(b => b.status === 'confirmed')
  }, [artisanBookings, isOnline])

  // Active in-progress jobs
  const activeJobs = useMemo(() => {
    return artisanBookings.filter(
      b => b.status === 'en_route' || b.status === 'on_site' || b.status === 'in_progress' || b.status === 'job_complete'
    )
  }, [artisanBookings])

  const handleDepartJob = (bookingId: string) => {
    updateBookingStatus(bookingId, 'en_route')
    toast.success('Status updated to: En Route. Customer tracking map active!')
  }

  const handleOpenCounter = (booking: Booking) => {
    setActiveCounterBooking(booking)
    setCounterPrice(booking.amount)
  }

  const handleSendCounter = () => {
    if (activeCounterBooking) {
      toast.success(`Counter offer of ₦${counterPrice.toLocaleString()} sent to customer!`)
      setActiveCounterBooking(null)
    }
  }

  const metrics = useMemo(() => {
    if (!dbArtisan) return []
    return [
      { label: "Today's Earnings", value: formatNaira(dbArtisan.earningsAvailable), trend: '+12% vs yesterday', up: true },
      { label: 'Active Jobs', value: activeJobs.length, sub: 'Needs dispatch attention' },
      { label: 'Profile Views', value: '47 visits', trend: '+8 vs last week', up: true },
      { label: 'Satisfaction Rating', value: `${dbArtisan.rating.toFixed(1)} ★`, sub: `${dbArtisan.reviewCount} reviews` }
    ]
  }, [dbArtisan, activeJobs])

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Dashboard Greeting Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 select-none">
        <div>
          <h1 className="text-h1 text-navy">Artisan Control Board</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">
            Accept jobs, verify payouts, and manage your local Lagos coverage.
          </p>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-navy select-none">
          <span>Availability Status:</span>
          {isOnline ? (
            <span className="bg-teal/15 text-teal border border-teal/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Active Online
            </span>
          ) : (
            <span className="bg-slate/15 text-slate border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate" />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-card p-5 border border-border shadow-card text-center">
            <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{stat.label}</p>
            <p className="font-mono text-[22px] font-bold text-navy mt-1.5 leading-none">{stat.value}</p>
            {stat.trend && (
              <span className={`inline-block font-mono text-[9px] mt-1.5 font-bold px-1.5 py-0.5 rounded
                ${stat.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {stat.trend}
              </span>
            )}
            {stat.sub && (
              <span className="block font-mono text-[10px] text-slate mt-1.5 font-semibold">
                {stat.sub}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* NEW JOB DISPATCH ALERTS (Only shown when online and new jobs exist) */}
      <section className="bg-white rounded-card border border-border p-5 shadow-card select-none">
        <h3 className="font-display font-bold text-[15px] text-navy mb-4 border-b border-border pb-2.5">
          New Job alerts near you (LGA queue)
        </h3>

        {!isOnline ? (
          <div className="p-6 bg-amber/5 border border-amber/15 rounded text-center font-body text-[13px] text-amber-dark">
            ⚠️ You are currently **Offline**. Toggle online in the left sidebar to start receiving new job requests in {dbArtisan?.area || 'Lagos'}.
          </div>
        ) : newJobsAvailable.length === 0 ? (
          <p className="font-body text-[13px] text-slate text-center py-6">
            No pending dispatch requests. We will notify you when new jobs are booked in your area.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {newJobsAvailable.map((job) => (
              <div key={job.id} className="border border-border rounded-card p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-teal/5">
                <div className="flex gap-4">
                  <div className="w-11 h-11 bg-teal/10 rounded-full flex items-center justify-center text-teal shrink-0">
                    <Briefcase size={22} />
                  </div>
                  <div className="font-mono text-[12px] text-slate leading-tight text-left">
                    <h4 className="font-display font-bold text-[14px] text-navy flex items-center gap-2 leading-none">
                      {job.jobType}
                      {job.isUrgent && (
                        <span className="bg-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                          Urgent
                        </span>
                      )}
                    </h4>
                    <p className="mt-1.5">Customer: <span className="font-bold text-navy">{job.customerName}</span> · {job.customerAddress}</p>
                    <p className="mt-1">Details: "{job.description.slice(0, 75)}..."</p>
                    <p className="mt-1.5 font-bold text-teal text-[13px]">Escrow Value: ₦{job.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleDepartJob(job.id)}
                    className="flex-1 sm:flex-initial"
                  >
                    Accept & Depart
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenCounter(job)}
                    className="flex-1 sm:flex-initial"
                  >
                    Counter Quote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTIVE IN-PROGRESS JOBS SUMMARY */}
      <section className="bg-white rounded-card border border-border p-5 shadow-card select-none">
        <h3 className="font-display font-bold text-[15px] text-navy mb-4 border-b border-border pb-2.5">
          Active Job Tasks
        </h3>

        {activeJobs.length === 0 ? (
          <p className="font-body text-[13px] text-slate text-center py-6">
            No active jobs in progress. Check alerts tab to find jobs.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeJobs.map((b) => (
              <div key={b.id} className="border border-border rounded-btn p-4 flex justify-between items-center flex-wrap gap-3 font-mono text-[12px] text-slate">
                <div className="text-left leading-tight">
                  <h4 className="font-display font-bold text-navy text-[13px]">{b.jobType}</h4>
                  <p className="mt-1">Address: {b.customerAddress}</p>
                  <p className="mt-1">Escrow held: <span className="font-bold text-navy">₦{b.amount.toLocaleString()}</span></p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={b.status} showDot />
                  <Link href="/artisan/jobs">
                    <Button variant="secondary" size="sm">Manage Task</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COUNTER PROPOSAL MODAL */}
      {activeCounterBooking && (
        <Modal
          isOpen={!!activeCounterBooking}
          onClose={() => setActiveCounterBooking(null)}
          title="Send Counter Proposal Price"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setActiveCounterBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSendCounter}>
                Submit Proposal
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[13px] text-navy leading-normal">
            <p className="text-slate">
              If the scope of the **{activeCounterBooking.jobType}** is more complex, propose a counter quote. The customer will be notified to approve the new rate.
            </p>
            <div className="p-3 bg-lgray rounded">
              <p>Customer original fee: ₦{activeCounterBooking.amount.toLocaleString()}</p>
            </div>
            
            <div>
              <Input
                label="Your Counter Quote Rate"
                type="number"
                prefixText="₦"
                value={counterPrice}
                onChange={(e) => setCounterPrice(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
