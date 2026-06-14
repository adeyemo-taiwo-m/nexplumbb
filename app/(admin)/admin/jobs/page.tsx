'use client'

import React, { useState, useMemo } from 'react'
import { useMockDb, Booking } from '@/lib/store/mockDb'
import { useAuthStore } from '@/lib/store/auth'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { formatNaira } from '@/lib/format'
import { 
  Search, 
  Filter, 
  FileDown, 
  Info,
  Calendar,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminJobsTable() {
  const { bookings } = useMockDb()
  const { user } = useAuthStore()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tradeFilter, setTradeFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = 
        b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.artisanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.jobType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const matchesTrade = tradeFilter === 'all' || b.artisanTrade === tradeFilter

      return matchesSearch && matchesStatus && matchesTrade
    })
  }, [bookings, searchTerm, statusFilter, tradeFilter])

  // Get distinct trades for filter dropdown
  const distinctTrades = useMemo(() => {
    const trades = new Set(bookings.map(b => b.artisanTrade))
    return Array.from(trades)
  }, [bookings])

  // NDPA Export Audit
  const handleNdpaExport = () => {
    if (!user) return

    // Create CSV content representation
    const headers = 'Reference,Date,JobType,Artisan,Customer,Amount,Status,PaymentStatus\n'
    const rows = filteredBookings.map(b => 
      `"${b.reference}","${b.date}","${b.jobType}","${b.artisanName}","${b.customerName}",${b.amount},"${b.status}","${b.paymentStatus}"`
    ).join('\n')
    
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows)
    
    // Download link simulation
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', `Nexplumb_Jobs_Export_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Audited compliance log notification
    toast.success('NDPA Audit Compliant: Data download recorded. Access logs updated.', {
      description: `User ${user.name} logged for downloading ${filteredBookings.length} records.`,
      duration: 5000
    })
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-h1 text-navy font-display font-semibold">Jobs Audit Desk</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">
            Audit escrow bookings, monitor dispatch updates, and export transaction audit trails.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleNdpaExport}
            className="flex items-center gap-1.5 font-mono text-[12px] font-bold border-navy"
          >
            <FileDown size={14} /> Export Table (NDPA Audited)
          </Button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white rounded-card border border-border p-4 shadow-card flex flex-col md:flex-row justify-between gap-4">
        
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search reference, customer, artisan, or trade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefixIcon={<Search size={18} />}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[12px]">
            <Filter size={14} className="text-slate" />
            <span className="font-bold text-navy uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 border border-border bg-white rounded-btn px-3 text-body focus:outline-none focus:border-teal"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed (Dispatching)</option>
              <option value="en_route">En Route</option>
              <option value="on_site">On Site</option>
              <option value="in_progress">In Progress</option>
              <option value="job_complete">Job Complete (Pending Approval)</option>
              <option value="completed">Completed (Paid Out)</option>
              <option value="disputed">Escrow Disputed</option>
              <option value="cancelled">Cancelled/Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 font-mono text-[12px]">
            <span className="font-bold text-navy uppercase">Category:</span>
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="h-10 border border-border bg-white rounded-btn px-3 text-body focus:outline-none focus:border-teal"
            >
              <option value="all">All Trades</option>
              {distinctTrades.map(trade => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 font-body text-[14px] text-slate">
            No bookings found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-[13px] text-left">
              <thead>
                <tr className="bg-lgray border-b border-border text-[11px] text-slate font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 font-display">Reference</th>
                  <th className="py-3 px-4 font-display">Date</th>
                  <th className="py-3 px-4 font-display">Artisan</th>
                  <th className="py-3 px-4 font-display">Customer</th>
                  <th className="py-3 px-4 font-display">Job Type</th>
                  <th className="py-3 px-4 font-display">Status</th>
                  <th className="py-3 px-4 font-display text-right">Amount</th>
                  <th className="py-3 px-4 text-center font-display">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr 
                    key={b.id} 
                    className="border-b border-border/50 hover:bg-nxblue/5 odd:bg-white even:bg-lgray/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold">{b.reference}</td>
                    <td className="py-3 px-4">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{b.artisanName}</td>
                    <td className="py-3 px-4 font-medium">{b.customerName}</td>
                    <td className="py-3 px-4">{b.jobType}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status} showDot />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-navy">
                      ₦{b.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="font-bold text-teal hover:text-teal/80 transition-colors"
                        title="View details drawer"
                      >
                        <Info size={16} className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal Drawer */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Job File Reference: ${selectedBooking.reference}`}
          footerActions={
            <Button variant="secondary" onClick={() => setSelectedBooking(null)}>
              Close Audit File
            </Button>
          }
        >
          <div className="flex flex-col gap-5 text-left font-mono text-[12px] text-navy leading-normal">
            
            {/* Escrow Details */}
            <div className="bg-teal/5 border border-teal/10 rounded-card p-4 flex items-center gap-3">
              <ShieldCheck className="text-teal shrink-0" size={32} />
              <div className="font-mono">
                <span className="font-bold block text-navy text-[13px]">Escrow Vault Guard</span>
                <span className="text-slate">
                  Payment of ₦{selectedBooking.amount.toLocaleString()} holds status: **{selectedBooking.paymentStatus.toUpperCase()}** (via {selectedBooking.paymentMethod.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Core Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-lgray p-3.5 rounded border border-border">
                <span className="font-bold block border-b border-border pb-1 mb-2 uppercase text-[10px] text-slate">Artisan Details</span>
                <p className="font-display font-semibold text-navy text-[13px]">{selectedBooking.artisanName}</p>
                <p className="mt-1">Trade: {selectedBooking.artisanTrade}</p>
                <p className="mt-1">Phone: {selectedBooking.customerPhone} (Vetted)</p>
              </div>

              <div className="bg-lgray p-3.5 rounded border border-border">
                <span className="font-bold block border-b border-border pb-1 mb-2 uppercase text-[10px] text-slate">Customer Details</span>
                <p className="font-display font-semibold text-navy text-[13px]">{selectedBooking.customerName}</p>
                <p className="mt-1">Address: {selectedBooking.customerAddress}</p>
                <p className="mt-0.5 text-slate">Apt/Unit: {selectedBooking.customerAddressDetails || 'None'}</p>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-lgray p-3.5 rounded border border-border">
              <span className="font-bold block border-b border-border pb-1 mb-2 uppercase text-[10px] text-slate">Job Specifications</span>
              <p className="font-body italic font-normal text-[13px] text-body">"{selectedBooking.description}"</p>
              
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate">
                <p className="flex items-center gap-1"><Calendar size={12} /> Scheduled: {selectedBooking.date}</p>
                <p className="flex items-center gap-1"><Clock size={12} /> Slots: {selectedBooking.timeSlot}</p>
              </div>
            </div>

            {/* Completion Proofs if any */}
            {(selectedBooking.beforePhoto || selectedBooking.afterPhoto) && (
              <div className="border border-border rounded-card p-4">
                <span className="font-bold block border-b border-border pb-1 mb-3 uppercase text-[10px] text-slate">Vetted Completion Proofs</span>
                <div className="grid grid-cols-2 gap-4">
                  {selectedBooking.beforePhoto && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate font-bold text-center">Before Image</span>
                      <img src={selectedBooking.beforePhoto} alt="Before" className="h-28 object-cover rounded border" />
                    </div>
                  )}
                  {selectedBooking.afterPhoto && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate font-bold text-center">After Image</span>
                      <img src={selectedBooking.afterPhoto} alt="After" className="h-28 object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Log */}
            <div className="border border-border rounded-card p-4">
              <span className="font-bold block border-b border-border pb-1 mb-2 uppercase text-[10px] text-slate">Compliance Audit Logs</span>
              <div className="flex flex-col gap-1.5 text-[11px] text-slate font-mono">
                <p>✓ {new Date(selectedBooking.createdAt).toLocaleString()}: Booking initialized, escrow lock registered.</p>
                <p>✓ {new Date(selectedBooking.updatedAt).toLocaleString()}: Status transition recorded as: **{selectedBooking.status.replace('_', ' ')}**.</p>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  )
}
