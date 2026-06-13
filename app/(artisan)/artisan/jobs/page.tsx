'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb, Booking } from '@/lib/store/mockDb'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { formatNaira, formatDate } from '@/lib/format'
import { 
  X, 
  MapPin, 
  Clock, 
  Download, 
  CheckCircle, 
  Camera, 
  User, 
  Eye,
  Briefcase
} from 'lucide-react'
import { toast } from 'sonner'

export default function ArtisanJobs() {
  const { user } = useAuthStore()
  const { bookings, updateBookingStatus, submitJobComplete } = useMockDb()

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  
  // Simulated Photo Upload for completion
  const [beforePhoto, setBeforePhoto] = useState<string>('')
  const [afterPhoto, setAfterPhoto] = useState<string>('')

  // Filter list
  const artisanJobsList = useMemo(() => {
    if (!user) return []
    return bookings.filter((b) => b.artisanId === user.id)
  }, [bookings, user])

  // Selected Booking object
  const activeBooking = useMemo(() => {
    return artisanJobsList.find((b) => b.id === selectedBookingId)
  }, [artisanJobsList, selectedBookingId])

  const handleUpdateStatus = (bookingId: string, status: Booking['status']) => {
    updateBookingStatus(bookingId, status)
    toast.success(`Job status updated to: ${status.replace('_', ' ')}`)
  }

  const handleUploadPhoto = (type: 'before' | 'after') => {
    const samples = {
      before: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300',
      after: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300'
    }
    if (type === 'before') {
      setBeforePhoto(samples.before)
      toast.success('Before photo uploaded ✓')
    } else {
      setAfterPhoto(samples.after)
      toast.success('After photo uploaded ✓')
    }
  }

  const handleCompleteWork = (bookingId: string) => {
    if (!beforePhoto || !afterPhoto) {
      toast.error('Both Before and After photos are required to verify completion.')
      return
    }
    submitJobComplete(bookingId, beforePhoto, afterPhoto)
    toast.success('Work completion submitted! Waiting for customer confirmation.')
    setBeforePhoto('')
    setAfterPhoto('')
  }

  const handleDownloadInvoice = () => {
    toast.success('Invoice PDF download initiated.')
  }

  return (
    <div className="w-full flex-grow flex flex-col min-h-[calc(100vh-140px)] relative select-none">
      
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 select-none">
        <div>
          <h1 className="text-h1 text-navy">My Jobs Ledger</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">Track and complete dispatch bookings.</p>
        </div>
        
        <Button variant="secondary" size="sm" onClick={() => toast.success('CSV export file generated')}>
          Export Jobs List (CSV)
        </Button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden flex-grow flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[13px] leading-normal">
            <thead className="bg-lgray/50 text-[11px] font-bold text-slate uppercase border-b border-border select-none">
              <tr>
                <th className="p-4">Job ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date</th>
                <th className="p-4">Escrow Value</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artisanJobsList.map((job) => (
                <tr 
                  key={job.id} 
                  className="border-b border-border hover:bg-nxblue/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedBookingId(job.id)}
                >
                  <td className="p-4 text-navy font-bold">{job.reference}</td>
                  <td className="p-4 font-display font-semibold text-navy">{job.customerName}</td>
                  <td className="p-4">{job.jobType}</td>
                  <td className="p-4 flex items-center gap-0.5 mt-0.5">
                    <MapPin size={12} className="text-slate" /> {job.customerAddress.split(';')[0]}
                  </td>
                  <td className="p-4">{formatDate(job.date)}</td>
                  <td className="p-4 font-bold text-navy">₦{job.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <StatusBadge status={job.status} showDot />
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedBookingId(job.id)}
                      className="p-1 hover:bg-lgray text-nxblue rounded transition-colors focus:outline-none"
                      title="View Details Drawer"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {artisanJobsList.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate font-body">
                    No jobs recorded on your account yet. Mark yourself online to receive alerts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JOB DETAIL DRAWER (Slides from Right overlay) */}
      {activeBooking && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-40 transition-opacity" 
            onClick={() => setSelectedBookingId(null)}
          />
          
          <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white border-l border-border shadow-modal z-50 p-6 flex flex-col justify-between overflow-y-auto select-none animate-slide-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4 select-none">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate uppercase">Job Details</span>
                <h3 className="font-display font-bold text-[18px] text-navy mt-1">Ref: {activeBooking.reference}</h3>
              </div>
              <button
                onClick={() => setSelectedBookingId(null)}
                className="p-1.5 hover:bg-lgray text-slate hover:text-navy rounded-btn focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details */}
            <div className="flex-1 flex flex-col gap-5">
              
              {/* Status Banner */}
              <div className="bg-lgray/30 border border-border p-4 rounded-card">
                <p className="font-mono text-[11px] text-slate uppercase">Current Dispatch Status</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <StatusBadge status={activeBooking.status} showDot />
                  <span className="font-mono text-[14px] font-bold text-navy">
                    ₦{activeBooking.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Customer summary */}
              <div className="font-mono text-[12px] text-slate leading-relaxed">
                <h4 className="font-display font-bold text-[13px] text-navy mb-2 flex items-center gap-1">
                  <User size={14} className="text-slate" /> Customer Contact details
                </h4>
                <p>• **Name:** {activeBooking.customerName}</p>
                <p>• **Phone:** {activeBooking.customerPhone}</p>
                <p>• **Address:** {activeBooking.customerAddress} ({activeBooking.customerAddressDetails || 'Main'})</p>
              </div>

              {/* Job description */}
              <div className="font-mono text-[12px] text-slate leading-relaxed">
                <h4 className="font-display font-bold text-[13px] text-navy mb-2 flex items-center gap-1">
                  <Briefcase size={14} className="text-slate" /> Job Specifications
                </h4>
                <p>• **Service:** {activeBooking.jobType}</p>
                <p>• **Description:** "{activeBooking.description}"</p>
              </div>

              {/* Interactive Status flow dispatch modifiers */}
              <div className="border-t border-border pt-4 select-none">
                <h4 className="font-display font-bold text-[13px] text-navy mb-2.5">Update Dispatch state</h4>
                
                {activeBooking.status === 'confirmed' && (
                  <Button variant="primary" onClick={() => handleUpdateStatus(activeBooking.id, 'en_route')} className="w-full">
                    Mark Departed (En Route)
                  </Button>
                )}

                {activeBooking.status === 'en_route' && (
                  <Button variant="success" onClick={() => handleUpdateStatus(activeBooking.id, 'on_site')} className="w-full">
                    Mark Arrived (On Site)
                  </Button>
                )}

                {(activeBooking.status === 'on_site' || activeBooking.status === 'in_progress') && (
                  <div className="flex flex-col gap-3 p-4 bg-teal/5 border border-teal/15 rounded-card">
                    <p className="text-[12px] font-body text-slate leading-normal">
                      Upload Before and After photos to document the repair work for the customer.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        {beforePhoto ? (
                          <img src={beforePhoto} alt="before work preview" className="h-16 w-full object-cover rounded border" />
                        ) : (
                          <button
                            onClick={() => handleUploadPhoto('before')}
                            className="w-full h-16 border-2 border-dashed border-border rounded flex flex-col items-center justify-center text-slate hover:border-teal hover:text-navy focus:outline-none"
                          >
                            <Camera size={16} /> Before Photo
                          </button>
                        )}
                      </div>
                      <div>
                        {afterPhoto ? (
                          <img src={afterPhoto} alt="after work preview" className="h-16 w-full object-cover rounded border" />
                        ) : (
                          <button
                            onClick={() => handleUploadPhoto('after')}
                            className="w-full h-16 border-2 border-dashed border-border rounded flex flex-col items-center justify-center text-slate hover:border-teal hover:text-navy focus:outline-none"
                          >
                            <Camera size={16} /> After Photo
                          </button>
                        )}
                      </div>
                    </div>

                    <Button 
                      variant="primary" 
                      onClick={() => handleCompleteWork(activeBooking.id)}
                      disabled={!beforePhoto || !afterPhoto}
                      className="w-full mt-1.5"
                    >
                      Submit completion proof
                    </Button>
                  </div>
                )}

                {activeBooking.status === 'job_complete' && (
                  <p className="text-[12px] font-body text-slate leading-normal text-center p-3 bg-lgray border rounded">
                    ⏳ Verification sent. Waiting for customer confirmation to release escrow funds.
                  </p>
                )}

                {activeBooking.status === 'completed' && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[12px] font-body text-teal font-semibold text-center p-2.5 bg-teal/10 rounded">
                      ✓ Job completed successfully. Funds released.
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleDownloadInvoice} className="w-full">
                      <Download size={14} className="mr-1" /> Download invoice PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom timestamp */}
            <div className="border-t border-border pt-4 text-center font-mono text-[10px] text-slate mt-4">
              Booked on: {formatDate(activeBooking.createdAt)}
            </div>
          </aside>
        </>
      )}

    </div>
  )
}
