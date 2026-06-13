'use client'

import React, { useState, useMemo } from 'react'
import { useMockDb, Artisan } from '@/lib/store/mockDb'
import { useAuthStore } from '@/lib/store/auth'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatNaira } from '@/lib/format'
import { 
  Search, 
  User, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  FileDown, 
  Eye, 
  AlertTriangle,
  Wallet,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminUsersDesk() {
  const { artisans, customers, updateArtisan } = useMockDb()
  const { user } = useAuthStore()

  // State
  const [activeTab, setActiveTab] = useState<'artisan' | 'customer'>('artisan')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; phone: string; email?: string; walletBalance: number; joinedAt: string } | null>(null)

  // Filter lists
  const filteredArtisans = useMemo(() => {
    if (activeTab !== 'artisan') return []
    return artisans.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm)
    )
  }, [artisans, activeTab, searchTerm])

  const filteredCustomers = useMemo(() => {
    if (activeTab !== 'customer') return []
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [customers, activeTab, searchTerm])

  // NDPA Auditor Export
  const handleNdpaExport = () => {
    if (!user) return

    let csvContent = 'data:text/csv;charset=utf-8,'
    let filename = ''

    if (activeTab === 'artisan') {
      const headers = 'ID,Name,Phone,Email,Trade,LGA,Rating,VerifiedStatus,EarningsAllTime\n'
      const rows = filteredArtisans.map(a => 
        `"${a.id}","${a.name}","${a.phone}","${a.email}","${a.trade}","${a.area}",${a.rating},"${a.verificationStatus}",${a.earningsAllTime}`
      ).join('\n')
      csvContent += encodeURIComponent(headers + rows)
      filename = `Nexplumb_Artisans_Directory_${new Date().toISOString().slice(0,10)}.csv`
    } else {
      const headers = 'ID,Name,Phone,Email,WalletBalance,JoinedAt\n'
      const rows = filteredCustomers.map(c => 
        `"${c.id}","${c.name}","${c.phone}","${c.email || 'N/A'}",${c.walletBalance},"${c.joinedAt}"`
      ).join('\n')
      csvContent += encodeURIComponent(headers + rows)
      filename = `Nexplumb_Customers_Directory_${new Date().toISOString().slice(0,10)}.csv`
    }

    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('NDPA Audit Compliant: User directory download recorded.', {
      description: `User ${user.name} logged for downloading ${activeTab} directory records.`,
      duration: 5000
    })
  }

  // Toggle Artisan Account suspension simulation
  const handleToggleSuspendArtisan = (artisanId: string, isCurrentlyVerified: boolean) => {
    const nextStatus = isCurrentlyVerified ? 'rejected' : 'verified'
    updateArtisan(artisanId, { 
      verificationStatus: nextStatus as any,
      isVerified: !isCurrentlyVerified
    })
    
    // Close modal & notify
    if (selectedArtisan) {
      setSelectedArtisan(prev => prev ? { ...prev, verificationStatus: nextStatus as any, isVerified: !isCurrentlyVerified } : null)
    }

    toast.warning(`Security Status Alert: Artisan compliance status changed.`, {
      description: `Artisan ID ${artisanId} set to ${nextStatus.toUpperCase()}`
    })
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-h1 text-navy font-display font-semibold">Users Directory</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">
            Audit customer records, manage artisan compliance statuses, and manage regulatory directory details.
          </p>
        </div>
        
        <div>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleNdpaExport}
            className="flex items-center gap-1.5 font-mono text-[12px] font-bold border-navy"
          >
            <FileDown size={14} /> Export Directory (NDPA Audited)
          </Button>
        </div>
      </div>

      {/* Navigation Tab selection and Search Row */}
      <div className="bg-white rounded-card border border-border p-4 shadow-card flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Toggle tabs */}
        <div className="flex gap-2 p-1 bg-lgray rounded-btn w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('artisan'); setSearchTerm('') }}
            className={`flex-1 md:flex-initial h-9 px-6 rounded-btn font-mono text-[12px] font-bold transition-all ${
              activeTab === 'artisan'
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate hover:text-navy'
            }`}
          >
            Artisans Directory ({artisans.length})
          </button>
          <button
            onClick={() => { setActiveTab('customer'); setSearchTerm('') }}
            className={`flex-1 md:flex-initial h-9 px-6 rounded-btn font-mono text-[12px] font-bold transition-all ${
              activeTab === 'customer'
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate hover:text-navy'
            }`}
          >
            Customers Directory ({customers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder={activeTab === 'artisan' ? "Search name, trade, LGA..." : "Search name, phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-btn border border-border bg-white pl-9 pr-4 font-mono text-[12px] text-body placeholder:text-slate focus:outline-none focus:border-teal"
          />
        </div>

      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        {activeTab === 'artisan' ? (
          <div>
            {filteredArtisans.length === 0 ? (
              <p className="text-center py-12 font-body text-[14px] text-slate">No artisans found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[13px] text-left">
                  <thead>
                    <tr className="bg-lgray border-b border-border text-[11px] text-slate font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 font-display">Artisan</th>
                      <th className="py-3 px-4 font-display">Trade</th>
                      <th className="py-3 px-4 font-display">LGA Coverage</th>
                      <th className="py-3 px-4 font-display">Compliance Status</th>
                      <th className="py-3 px-4 font-display text-right">Escrow Earnings</th>
                      <th className="py-3 px-4 text-center font-display">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArtisans.map((art) => (
                      <tr 
                        key={art.id} 
                        className="border-b border-border/50 hover:bg-nxblue/5 odd:bg-white even:bg-lgray/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-display font-semibold text-navy text-[14px] leading-tight">{art.name}</div>
                          <div className="text-[11px] text-slate mt-0.5">{art.phone}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">{art.trade}</td>
                        <td className="py-3 px-4">{art.area}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            art.verificationStatus === 'verified' 
                              ? 'bg-teal/15 text-teal border border-teal/20' 
                              : art.verificationStatus === 'under_review' || art.verificationStatus === 'pending'
                              ? 'bg-amber/15 text-amber-dark border border-amber/20'
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}>
                            {art.verificationStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-navy">
                          {formatNaira(art.earningsAllTime)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedArtisan(art)}
                            className="font-bold text-teal hover:underline focus:outline-none"
                          >
                            <Eye size={16} className="inline mr-1" /> Audit File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredCustomers.length === 0 ? (
              <p className="text-center py-12 font-body text-[14px] text-slate">No customers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[13px] text-left">
                  <thead>
                    <tr className="bg-lgray border-b border-border text-[11px] text-slate font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 font-display">Customer</th>
                      <th className="py-3 px-4 font-display">Contact Info</th>
                      <th className="py-3 px-4 font-display">Joined Date</th>
                      <th className="py-3 px-4 font-display text-right">Wallet Balance</th>
                      <th className="py-3 px-4 text-center font-display">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((cust) => (
                      <tr 
                        key={cust.id} 
                        className="border-b border-border/50 hover:bg-nxblue/5 odd:bg-white even:bg-lgray/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-display font-semibold text-navy text-[14px]">{cust.name}</td>
                        <td className="py-3 px-4">
                          <div>Phone: {cust.phone}</div>
                          <div className="text-[11px] text-slate mt-0.5">Email: {cust.email || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4">{new Date(cust.joinedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-teal">
                          {formatNaira(cust.walletBalance)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="font-bold text-teal hover:underline focus:outline-none"
                          >
                            <Eye size={16} className="inline mr-1" /> View File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Artisan Audit File Modal */}
      {selectedArtisan && (
        <Modal
          isOpen={!!selectedArtisan}
          onClose={() => setSelectedArtisan(null)}
          title={`Artisan Compliance File: ${selectedArtisan.name}`}
          footerActions={
            <div className="flex gap-2">
              <Button 
                variant={selectedArtisan.verificationStatus === 'verified' ? 'danger' : 'success'} 
                onClick={() => handleToggleSuspendArtisan(selectedArtisan.id, selectedArtisan.verificationStatus === 'verified')}
              >
                {selectedArtisan.verificationStatus === 'verified' ? 'Suspend Compliance Access' : 'Restore Verified Access'}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedArtisan(null)}>
                Close Compliance File
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-left font-mono text-[12px] text-navy">
            <div className="flex gap-4 items-center bg-lgray p-3.5 border border-border rounded-card">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border text-slate overflow-hidden">
                <User size={28} />
              </div>
              <div className="leading-tight">
                <p className="font-display font-bold text-[15px] text-navy">{selectedArtisan.name}</p>
                <p className="text-slate mt-1">{selectedArtisan.trade} Expert · {selectedArtisan.area} LGA</p>
                <p className="mt-1 flex items-center gap-1"><Phone size={12} /> {selectedArtisan.phone}</p>
              </div>
            </div>

            <div className="bg-red-50/25 border border-red-100 p-3.5 rounded-card">
              <span className="font-bold block uppercase text-[10px] text-red-800 mb-2">Government Credentials Compliance</span>
              <div className="grid grid-cols-2 gap-2">
                <p>NIN Identity: **{selectedArtisan.nin || 'Pending Verification'}**</p>
                <p>NIN API Match: **{selectedArtisan.ninStatus.toUpperCase()}**</p>
                <p>BVN Reference: **{selectedArtisan.bvn || 'Pending Verification'}**</p>
                <p>BVN API Match: **{selectedArtisan.bvnStatus.toUpperCase()}**</p>
              </div>
            </div>

            <div className="bg-lgray p-3.5 border border-border rounded-card">
              <span className="font-bold block uppercase text-[10px] text-slate mb-2">Escrow Ledgers</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 border rounded">
                  <p className="text-[10px] text-slate font-bold">ALL-TIME</p>
                  <p className="font-bold text-[13px] mt-1 text-navy">{formatNaira(selectedArtisan.earningsAllTime)}</p>
                </div>
                <div className="bg-white p-2 border rounded">
                  <p className="text-[10px] text-slate font-bold">AVAILABLE</p>
                  <p className="font-bold text-[13px] mt-1 text-teal">{formatNaira(selectedArtisan.earningsAvailable)}</p>
                </div>
                <div className="bg-white p-2 border rounded">
                  <p className="text-[10px] text-slate font-bold">PENDING ESCROW</p>
                  <p className="font-bold text-[13px] mt-1 text-amber-dark">{formatNaira(selectedArtisan.earningsPending)}</p>
                </div>
              </div>
            </div>

            <div className="bg-lgray p-3.5 border border-border rounded-card text-slate">
              <span className="font-bold block uppercase text-[10px] text-navy mb-1">Public Bio</span>
              <p className="font-body italic text-[12px] text-body">"{selectedArtisan.bio}"</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Audit File Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer File: ${selectedCustomer.name}`}
          footerActions={
            <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>
              Close File
            </Button>
          }
        >
          <div className="flex flex-col gap-4 text-left font-mono text-[12px] text-navy">
            <div className="bg-lgray p-4 border border-border rounded-card flex items-center gap-3">
              <User size={32} className="text-slate" />
              <div>
                <p className="font-display font-bold text-[15px] text-navy">{selectedCustomer.name}</p>
                <p className="text-slate mt-1">Joined Date: {new Date(selectedCustomer.joinedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-lgray p-4 border border-border rounded-card">
              <span className="font-bold block uppercase text-[10px] text-slate mb-2">Directory Contact Information</span>
              <p className="flex items-center gap-1.5"><Phone size={14} /> Registered Phone: **{selectedCustomer.phone}**</p>
              <p className="flex items-center gap-1.5 mt-2"><Mail size={14} /> Registered Email: **{selectedCustomer.email || 'N/A'}**</p>
            </div>

            <div className="bg-teal/5 border border-teal/10 p-4 rounded-card flex justify-between items-center">
              <div>
                <span className="font-bold block uppercase text-[10px] text-teal">Wallet Balance (Naira)</span>
                <span className="text-slate text-[11px]">Held as prepaid escrow balance</span>
              </div>
              <span className="font-mono font-bold text-[20px] text-navy">{formatNaira(selectedCustomer.walletBalance)}</span>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
