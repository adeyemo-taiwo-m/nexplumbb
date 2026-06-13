'use client'

import React, { useState, useMemo } from 'react'
import { useMockDb, Artisan } from '@/lib/store/mockDb'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  XOctagon, 
  User, 
  Phone, 
  Building,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminVerificationQueue() {
  const { artisans, updateArtisan } = useMockDb()

  // Find artisans requiring verification audit
  const pendingArtisans = useMemo(() => {
    return artisans.filter(a => a.verificationStatus === 'under_review' || a.verificationStatus === 'pending')
  }, [artisans])

  const verifiedArtisans = useMemo(() => {
    return artisans.filter(a => a.verificationStatus === 'verified')
  }, [artisans])

  // State
  const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(
    pendingArtisans.length > 0 ? pendingArtisans[0].id : null
  )

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Find active artisan
  const activeArtisan = useMemo(() => {
    return artisans.find(a => a.id === selectedArtisanId) || null
  }, [artisans, selectedArtisanId])

  // Handle Verify Action
  const handleVerify = (id: string) => {
    updateArtisan(id, { 
      verificationStatus: 'verified',
      isVerified: true,
      ninStatus: 'verified',
      bvnStatus: 'verified'
    })
    toast.success('Artisan credentials verified!', {
      description: 'Profile activated and SMS status notification sent to artisan.'
    })
  }

  // Handle Reject Action
  const handleReject = () => {
    if (!activeArtisan) return
    if (!rejectionReason.trim()) {
      toast.error('Rejection rationale is required.')
      return
    }

    updateArtisan(activeArtisan.id, { 
      verificationStatus: 'rejected',
      isVerified: false
    })

    toast.warning('Artisan credentials rejected.', {
      description: `SMS notification dispatched to artisan with corrective steps: "${rejectionReason}"`
    })

    setRejectModalOpen(false)
    setRejectionReason('')
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-h1 text-navy font-display font-semibold">Verification Audits Desk</h1>
        <p className="font-body text-[14px] text-slate mt-0.5">
          Audit government identity details (NIMC database matches), inspect uploaded credentials, and activate profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PENDING QUEUE (4 columns) */}
        <aside className="desktop:col-span-4 bg-white rounded-card border border-border p-4 shadow-card flex flex-col gap-4">
          <h3 className="font-display font-bold text-[14px] text-navy border-b border-border pb-2.5">
            Identity Audit Queue
          </h3>

          {/* Pending Reviews */}
          <div>
            <span className="font-mono text-[10px] font-bold text-amber-dark bg-amber/15 border border-amber/20 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
              Pending Audit ({pendingArtisans.length})
            </span>
            {pendingArtisans.length === 0 ? (
              <p className="font-body text-[12px] text-slate py-4 text-center">Identity audits queue is clear ✓</p>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {pendingArtisans.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedArtisanId(a.id); setRejectionReason('') }}
                    className={`w-full border p-3 rounded text-left font-mono text-[11px] transition-all flex flex-col gap-1.5 focus:outline-none ${
                      selectedArtisanId === a.id
                        ? 'border-amber bg-amber/5'
                        : 'border-border hover:border-slate'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-navy">{a.name}</span>
                      <span className="bg-amber/10 text-amber-dark px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                        Review
                      </span>
                    </div>
                    <div className="text-slate leading-tight">
                      <p>Trade: <span className="font-bold text-navy">{a.trade}</span> · {a.area}</p>
                      <p className="mt-0.5">NIN: {a.nin || 'Not provided'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verified Audit Archive */}
          <div className="border-t border-border pt-4">
            <span className="font-mono text-[10px] font-bold text-slate block uppercase tracking-wider mb-2">Verified Archives ({verifiedArtisans.length})</span>
            {verifiedArtisans.length === 0 ? (
              <p className="font-body text-[12px] text-slate py-2 text-center">No archived verifications.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {verifiedArtisans.slice(0, 5).map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedArtisanId(a.id); setRejectionReason('') }}
                    className={`w-full border p-3 rounded text-left font-mono text-[11px] transition-all flex flex-col gap-1.5 focus:outline-none ${
                      selectedArtisanId === a.id
                        ? 'border-teal bg-teal/5'
                        : 'border-border/60 hover:border-slate'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-navy">{a.name}</span>
                      <span className="text-teal font-bold uppercase text-[9px]">Verified ✓</span>
                    </div>
                    <p className="text-slate">{a.trade} · {a.area} LGA</p>
                  </button>
                ))}
              </div>
            )}
          </div>

        </aside>

        {/* RIGHT COLUMN: AUDIT DOSSIER FILE (8 columns) */}
        <main className="desktop:col-span-8 flex flex-col gap-6">
          {!activeArtisan ? (
            <div className="bg-white border rounded-card p-12 text-center shadow-card font-body text-slate">
              Select an artisan from the queue to start identity audit dossiers reviews.
            </div>
          ) : (
            <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-5">
              
              {/* Dossier Header */}
              <div className="border-b border-border pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-navy bg-lgray border border-border px-2 py-0.5 rounded uppercase">
                      ID: {activeArtisan.id}
                    </span>
                    <span className="font-mono text-[11px] text-slate font-bold">LGA Area: {activeArtisan.area}</span>
                  </div>
                  <h2 className="text-h3 text-navy font-display mt-2 font-semibold">
                    Identity Vetting Dossier
                  </h2>
                </div>

                <div className="flex flex-col items-end text-right shrink-0">
                  <span className="font-mono text-[11px] text-slate">Audit Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold mt-1.5 ${
                    activeArtisan.verificationStatus === 'verified' 
                      ? 'bg-teal/15 text-teal border border-teal/20' 
                      : activeArtisan.verificationStatus === 'under_review' || activeArtisan.verificationStatus === 'pending'
                      ? 'bg-amber/15 text-amber-dark border border-amber/20 animate-pulse'
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {activeArtisan.verificationStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Artisan Profile details */}
              <div className="bg-lgray p-4 border border-border rounded-card grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-mono text-[12px] text-navy">
                <div>
                  <span className="font-bold block uppercase text-[9px] text-slate mb-1">Legal Identity</span>
                  <p className="font-display font-bold text-[14px] text-navy leading-none mb-2">{activeArtisan.name}</p>
                  <p className="flex items-center gap-1.5 mt-1"><Phone size={12} /> {activeArtisan.phone}</p>
                  <p className="flex items-center gap-1.5 mt-1">Trade Category: **{activeArtisan.trade}**</p>
                  <p className="flex items-center gap-1.5 mt-1">Experience: **{activeArtisan.experience}**</p>
                </div>
                
                <div>
                  <span className="font-bold block uppercase text-[9px] text-slate mb-1">Payout Account Details</span>
                  <p className="mt-1">Bank: **{activeArtisan.bankName || 'Not Provided'}**</p>
                  <p className="mt-1">Account Num: **{activeArtisan.accountNumber || 'Not Provided'}**</p>
                </div>
              </div>

              {/* NIMC & CBN API Matches Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-mono text-[12px] text-navy">
                
                {/* NIN Block */}
                <div className="border border-border rounded-card p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="font-bold flex items-center gap-1">
                      <ShieldCheck size={14} className="text-teal" />
                      NIMC Database Match
                    </span>
                    <span className="bg-teal/10 text-teal px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                      {activeArtisan.ninStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <p>Submitted NIN: **{activeArtisan.nin || 'Pending Verification'}**</p>
                    <p>Name Match: **98.2% (Accepted)**</p>
                    <p>DOB Check: **Verified Match**</p>
                    <p>Biometrics Check: **Face Recognition Match ✓**</p>
                  </div>
                </div>

                {/* BVN Block */}
                <div className="border border-border rounded-card p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="font-bold flex items-center gap-1">
                      <ShieldCheck size={14} className="text-teal" />
                      CBN BVN Database Match
                    </span>
                    <span className="bg-teal/10 text-teal px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                      {activeArtisan.bvnStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p>Submitted BVN: **{activeArtisan.bvn ? '*** *** *** **' : 'Pending Verification'}**</p>
                    <p>CBN Name Match: **95.5% (Accepted)**</p>
                    <p>CBN Phone Match: **Verified Match**</p>
                    <p>Financial Status: **Active Vault Payout Profile**</p>
                  </div>
                </div>

              </div>

              {/* Photographic & Biometric Audits comparison */}
              <div className="border border-border rounded-card p-4 text-left">
                <span className="font-mono font-bold block uppercase text-[10px] text-slate mb-3">Photographic Biometrics Matching Audit</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Reg Photo */}
                  <div className="flex flex-col gap-2 items-center text-center">
                    <span className="font-mono text-[10px] text-slate font-bold">Uploaded Profile Selfie Image</span>
                    <div className="w-28 h-28 rounded-full overflow-hidden border bg-lgray relative flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150" 
                        alt="Profile photograph" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>

                  {/* NIMC Database Biometrics photo mock */}
                  <div className="flex flex-col gap-2 items-center text-center">
                    <span className="font-mono text-[10px] text-slate font-bold">NIMC Database Biometric Record Image</span>
                    <div className="w-28 h-28 rounded-full overflow-hidden border bg-lgray relative flex items-center justify-center border-dashed border-teal/40">
                      <img 
                        src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150" 
                        alt="NIMC photograph" 
                        className="w-full h-full object-cover opacity-80" 
                      />
                      <div className="absolute bottom-1 bg-teal text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded">
                        98.2% Match
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Guarantor References */}
              <div className="border border-border rounded-card p-4 text-left font-mono text-[11px] text-navy">
                <span className="font-bold block uppercase text-[10px] text-slate mb-2">Character Guarantor References Check</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-2 border rounded bg-lgray/30 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Chief Alao</p>
                      <p className="text-slate mt-0.5 font-normal">Phone: 08031234567</p>
                    </div>
                    <span className="bg-teal/15 text-teal text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Passed</span>
                  </div>
                  <div className="p-2 border rounded bg-lgray/30 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Barrister Nwosu</p>
                      <p className="text-slate mt-0.5 font-normal">Phone: 08023456789</p>
                    </div>
                    <span className="bg-teal/15 text-teal text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Passed</span>
                  </div>
                </div>
              </div>

              {/* Actions panel (Only if under review) */}
              {activeArtisan.verificationStatus !== 'verified' && (
                <div className="border-t border-border pt-4 flex gap-4 select-none">
                  <Button 
                    variant="success" 
                    onClick={() => handleVerify(activeArtisan.id)}
                    className="flex-1 font-display"
                  >
                    Approve & Activate Profile
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => setRejectModalOpen(true)}
                    className="flex-1 font-display"
                  >
                    Reject Credentials
                  </Button>
                </div>
              )}

            </div>
          )}
        </main>

      </div>

      {/* Reject Modal */}
      {activeArtisan && rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Artisan Dossier Credentials"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject}>
                Submit Rejection Reject
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[13px] text-navy text-left">
            <p className="text-slate">
              Please specify the precise reason for rejecting **{activeArtisan.name}** credentials. This reason will be transmitted automatically via SMS.
            </p>
            <div>
              <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Correction Instructions</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="e.g. Uploaded selfie is blurry. Re-upload a clear selfie snapshot under good lighting. NIN name mismatch with account bank details."
                className="w-full border border-border focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none rounded-btn px-4 py-3 font-mono text-[13px] resize-y"
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
