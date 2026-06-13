'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMockDb, Booking } from '@/lib/store/mockDb'
import { useAuthStore } from '@/lib/store/auth'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import EscrowBadge from '@/components/ui/EscrowBadge'
import Modal from '@/components/ui/Modal'
import { formatNaira, maskPhone } from '@/lib/format'
import { 
  Phone, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  Navigation,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

export default function LiveJobTracking() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const { bookings, updateBookingStatus, fileDispute, disputes } = useMockDb()
  const { user } = useAuthStore()

  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false)
  const [disputeStatement, setDisputeStatement] = useState('')
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)

  // Find booking
  const booking = useMemo(() => {
    return bookings.find((b) => b.id === jobId)
  }, [bookings, jobId])

  // Mock movement: GPS coordinates change on interval
  const [artisanCoords, setArtisanCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mockEta, setMockEta] = useState(15)

  useEffect(() => {
    if (booking && booking.artisanPosition) {
      setArtisanCoords(booking.artisanPosition)
    }
  }, [booking])

  // Simulate GPS coordinates updating if en_route
  useEffect(() => {
    if (!booking || booking.status !== 'en_route' || !artisanCoords) return

    const interval = setInterval(() => {
      setArtisanCoords((prev) => {
        if (!prev) return null
        
        // Target coordinates (Surulere center)
        const targetLat = 6.5022
        const targetLng = 3.3582
        
        // Step size (move closer by 15%)
        const latStep = (targetLat - prev.lat) * 0.15
        const lngStep = (targetLng - prev.lng) * 0.15
        
        const nextLat = prev.lat + latStep
        const nextLng = prev.lng + lngStep
        
        // Decrease ETA
        setMockEta((e) => Math.max(1, e - 1))
        
        // If very close, trigger status update to on_site
        const diffLat = Math.abs(targetLat - nextLat)
        const diffLng = Math.abs(targetLng - nextLng)
        if (diffLat < 0.002 && diffLng < 0.002) {
          updateBookingStatus(booking.id, 'on_site')
          toast.info('Artisan has arrived at your location!')
        }

        return { lat: nextLat, lng: nextLng }
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [booking, artisanCoords, updateBookingStatus])

  if (!booking) {
    return (
      <div className="p-10 text-center font-mono select-none">
        <AlertTriangle size={32} className="text-orange mx-auto mb-2" />
        Booking record #{jobId} not found.
      </div>
    )
  }

  const handleReleaseEscrow = () => {
    updateBookingStatus(booking.id, 'completed')
    toast.success('escrow funds released successfully! Artisan paid.')
    router.push('/dashboard')
  }

  const handleFileDisputeSubmit = () => {
    if (disputeStatement.length < 20) {
      toast.error('Please describe the issue in at least 20 characters.')
      return
    }

    setIsSubmittingDispute(true)
    setTimeout(() => {
      fileDispute(booking.id, disputeStatement, [])
      toast.success('Dispute filed successfully. Nexplumb support will review it.')
      setIsSubmittingDispute(false)
      setIsDisputeModalOpen(false)
    }, 1200)
  }

  const statusMessages = {
    confirmed: 'Your booking is confirmed. Waiting for artisan to depart.',
    en_route: 'Emeka is on his way to your location.',
    on_site: 'Emeka has arrived at your address.',
    in_progress: 'Repair is in progress...',
    job_complete: 'Job marked as complete. Please confirm work satisfaction.',
    completed: 'Job successfully completed. Escrow released.',
    disputed: 'This job is currently in dispute arbitration.',
    cancelled: 'This job was cancelled.'
  }

  const trackingSteps = ['confirmed', 'en_route', 'on_site', 'job_complete']
  const currentStepIdx = trackingSteps.indexOf(booking.status)

  return (
    <div className="w-full flex-grow flex flex-col tablet:flex-row h-[calc(100vh-64px)] select-none">
      
      {/* === LEFT COLUMN: TRACKING PANEL (420px) === */}
      <aside className="w-full tablet:w-[420px] bg-white border-r border-border p-6 overflow-y-auto flex flex-col gap-6 justify-between flex-shrink-0 z-10 shadow-card">
        
        <div className="flex flex-col gap-5">
          {/* Status progress bar */}
          <div className="flex items-center justify-between font-mono text-[10px] text-slate border-b border-border pb-3">
            <span>Ref: {booking.reference}</span>
            <StatusBadge status={booking.status} showDot />
          </div>

          {/* Stepper Progress */}
          <div className="flex justify-between items-center px-2 relative my-2 select-none">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-border z-0" />
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-teal z-0 transition-all duration-300"
              style={{ width: `${(Math.max(0, currentStepIdx) / 3) * 88}%` }}
            />
            {trackingSteps.map((s, idx) => {
              const active = booking.status === s
              const done = currentStepIdx > idx
              return (
                <div key={s} className="z-10 flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[10px] font-bold bg-white
                    ${active ? 'border-teal text-teal ring-4 ring-teal/15 font-bold' : ''}
                    ${done ? 'border-navy bg-navy text-white' : ''}
                    ${!active && !done ? 'border-border text-slate' : ''}`}>
                    {done ? '✓' : idx + 1}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Large Status Display */}
          <div className="text-center bg-lgray/30 p-4 rounded-card border border-border">
            <h3 className="font-display font-bold text-[18px] text-navy">
              {statusMessages[booking.status] || booking.status}
            </h3>
            
            {/* ETA Counter */}
            {booking.status === 'en_route' && (
              <div className="mt-4 flex flex-col items-center animate-fade-in">
                <span className="font-mono text-[42px] font-bold text-teal leading-none">
                  ~{mockEta} min
                </span>
                <span className="font-mono text-[11px] text-slate mt-1.5 uppercase tracking-wide">
                  Estimated Arrival Time
                </span>
              </div>
            )}
            
            {booking.status === 'on_site' && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-teal font-semibold font-mono text-[13px] animate-fade-in">
                <Navigation className="animate-pulse" size={16} />
                <span>Artisan is currently on site</span>
              </div>
            )}
          </div>

          {/* Artisan Profile details */}
          <div className="flex items-center gap-3.5 p-4 bg-lgray/40 border border-border rounded-card">
            <img
              src={booking.artisanPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={booking.artisanName}
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div className="flex-1 font-mono text-[12px] text-slate leading-tight">
              <h4 className="font-display font-bold text-navy text-[13px]">{booking.artisanName}</h4>
              <p className="mt-1">{booking.artisanTrade} Professional</p>
              <p className="mt-1 text-navy font-semibold">{maskPhone(booking.customerPhone)}</p>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toast.info(`Dialing masked line: +234 803 *** ${booking.customerPhone.slice(-4)}`)}
              className="h-10 border border-border rounded-btn font-display text-[13px] font-bold text-navy hover:bg-lgray flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <Phone size={14} /> Call Emeka
            </button>
            <button
              onClick={() => toast.info('Messages feature uses the customer inbox.')}
              className="h-10 border border-border rounded-btn font-display text-[13px] font-bold text-navy hover:bg-lgray flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <MessageSquare size={14} /> Message
            </button>
          </div>

          {/* Accordion Details */}
          <div className="border border-border rounded-card overflow-hidden">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full px-4 py-3 bg-lgray/20 flex items-center justify-between font-display font-bold text-navy text-[13px] focus:outline-none"
            >
              <span>Job Details</span>
              {isDetailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isDetailsOpen && (
              <div className="p-4 border-t border-border font-body text-[13px] text-slate leading-relaxed flex flex-col gap-2 bg-white animate-fade-in">
                <p>• **Job Category:** {booking.jobType}</p>
                <p>• **Description:** "{booking.description}"</p>
                <p>• **Address:** {booking.customerAddress}</p>
                <p>• **Escrow Protected:** ₦{booking.amount.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Completion Escrow Release Form */}
          {(booking.status === 'job_complete' || booking.status === 'completed' || booking.status === 'disputed') && (
            <div className="mt-4 p-5 bg-teal/5 border border-teal rounded-card flex flex-col gap-4 animate-fade-in">
              <div className="flex gap-3">
                <div className="p-1 bg-teal/20 rounded-full text-teal flex-shrink-0 self-start">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-navy text-[14px]">Confirm Work Completion</h4>
                  <p className="font-body text-[13px] text-slate mt-1 leading-normal">
                    Emeka has marked the job as done. Please review before releasing ₦{booking.amount.toLocaleString()}.
                  </p>
                </div>
              </div>

              {/* Before / After side by side preview */}
              {booking.beforePhoto && booking.afterPhoto && (
                <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                  <div>
                    <span className="font-mono text-[9px] text-slate block mb-1">BEFORE</span>
                    <img src={booking.beforePhoto} alt="before job" className="w-full h-24 object-cover rounded border" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-slate block mb-1">AFTER</span>
                    <img src={booking.afterPhoto} alt="after job" className="w-full h-24 object-cover rounded border" />
                  </div>
                </div>
              )}

              {booking.status === 'job_complete' && (
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="success" size="md" onClick={handleReleaseEscrow} className="w-full">
                    Yes, release payment
                  </Button>
                  <Button variant="danger" size="md" onClick={() => setIsDisputeModalOpen(true)} className="w-full">
                    There is an issue (Dispute)
                  </Button>
                  
                  <span className="font-mono text-[9px] text-slate text-center mt-1 animate-pulse leading-none">
                    ⏳ Auto-releases to artisan in 23 hours.
                  </span>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="p-3 bg-teal/10 text-teal font-mono text-[11px] font-bold text-center rounded">
                  ✓ Escrow Released. Payout completed.
                </div>
              )}

              {booking.status === 'disputed' && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 font-mono text-[11px] font-bold text-center rounded">
                  ⚠️ Job disputed. Dispute center is handling.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Support Alert */}
        <div className="border-t border-border pt-4 mt-6 flex flex-col gap-2">
          {booking.status !== 'completed' && booking.status !== 'disputed' && booking.status !== 'cancelled' && (
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="text-orange hover:text-orange-dark font-mono text-[12px] font-bold text-center hover:underline focus:outline-none"
            >
              Report an issue / file dispute
            </button>
          )}
          <p className="text-[10px] font-mono text-slate text-center select-none">
            Need phone support? Call 0800-NEXPLUMB.
          </p>
        </div>
      </aside>

      {/* === RIGHT COLUMN: MAP CANVAS SPLIT (remaining) === */}
      <main className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center">
        
        {/* SVG Road and Path tracker */}
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2E86AB_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <svg className="w-full h-full stroke-gray-200 stroke-1" fill="none">
            {/* Main roads */}
            <path d="M100 400 Q 300 100 600 250" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M200 50 L 500 500" stroke="#FFFFFF" strokeWidth="12" />
            
            {/* Route path connector from artisan to customer */}
            {booking.status === 'en_route' && artisanCoords && (
              <path 
                d={`M${(artisanCoords.lat - 6.45) * 5000} ${(artisanCoords.lng - 3.3) * 5000} L 400 300`} 
                stroke="#E76F51" 
                strokeWidth="3" 
                strokeDasharray="5, 5" 
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Customer Location marker */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <span className="w-6 h-6 rounded-full bg-nxblue text-white flex items-center justify-center border border-white shadow-card animate-pulse">
              🏠
            </span>
            <span className="font-mono text-[9px] font-bold text-navy bg-white/95 px-1.5 py-0.5 rounded shadow mt-1">
              You
            </span>
          </div>

          {/* Moving Artisan marker */}
          {artisanCoords && (booking.status === 'en_route' || booking.status === 'on_site') && (
            <div 
              className="absolute z-20 flex flex-col items-center transition-all duration-1000"
              style={{
                // Approximate relative coordinate mapping for mock GPS movement
                left: `${30 + ((artisanCoords.lat - 6.47) * 400)}%`,
                top: `${20 + ((artisanCoords.lng - 3.32) * 400)}%`
              }}
            >
              <div className="relative">
                <span className="absolute -inset-2.5 rounded-full bg-orange/20 border border-orange/40 animate-ping opacity-75" />
                <img
                  src={booking.artisanPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={booking.artisanName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange shadow-modal"
                />
              </div>
              <span className="font-mono text-[9px] font-bold text-white bg-orange px-1.5 py-0.5 rounded shadow mt-1">
                {booking.artisanName.split(' ')[0]} {booking.status === 'en_route' ? '🚗' : '📍'}
              </span>
            </div>
          )}
        </div>

        {/* GPS Active header box */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-4 py-2 border border-border shadow-card flex items-center gap-2 font-mono text-[10px] font-bold text-navy">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span>Real-time GPS dispatch coordinates active</span>
        </div>

        {/* Emergency rate banner if urgent */}
        {booking.isUrgent && (
          <div className="absolute bottom-4 right-4 bg-orange text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded shadow">
            🔥 Urgent dispatch prioritized
          </div>
        )}
      </main>

      {/* DISPUTE FILING MODAL */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="File a Dispute on Escrow"
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setIsDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleFileDisputeSubmit} 
              loading={isSubmittingDispute}
              disabled={disputeStatement.length < 20}
            >
              Submit dispute
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 font-mono text-[13px] text-navy">
          <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded leading-relaxed text-[12px] font-body flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              **Important:** Filing a dispute halts automatic escrow payments. Nexplumb administrators will investigate evidence from both customer and artisan (including photos) before deciding resolution.
            </p>
          </div>

          <div>
            <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Dispute Statement (Required)</label>
            <textarea
              placeholder="Describe the issue with the work or no-show details (minimum 20 characters)..."
              value={disputeStatement}
              onChange={(e) => setDisputeStatement(e.target.value)}
              rows={4}
              className="w-full rounded-btn border border-border bg-white px-4 py-3 focus:outline-none focus:border-teal font-mono text-[13px] resize-y"
            />
            <div className="text-right text-[10px] text-slate mt-1">
              {disputeStatement.length} / 20 minimum
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
