'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockDb } from '@/lib/store/mockDb'
import { useAuthStore } from '@/lib/store/auth'
import StarRating from '@/components/ui/StarRating'
import TrustBadge from '@/components/ui/TrustBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import EscrowBadge from '@/components/ui/EscrowBadge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatNairaRange, formatDate } from '@/lib/format'
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Maximize2,
  X,
  MessageCircle,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export default function ArtisanPublicProfile() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { artisans, updateArtisan } = useMockDb()
  const { user } = useAuthStore()

  // Find the artisan in our database
  const artisan = useMemo(() => {
    return artisans.find((a) => a.slug === slug)
  }, [artisans, slug])

  // Favourites state
  const [isSaved, setIsSaved] = useState(false)
  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null)
  
  // Rating breakdown chart mockup
  const ratingsDistribution = useMemo(() => {
    if (!artisan) return []
    const counts = [0, 0, 0, 0, 0] // 1★ to 5★
    artisan.reviews.forEach((r) => {
      const idx = Math.min(5, Math.max(1, r.rating)) - 1
      counts[idx]++
    })
    const total = artisan.reviews.length || 1
    return counts.map((count, index) => ({
      stars: index + 1,
      count,
      percentage: Math.round((count / total) * 100)
    })).reverse() // 5 to 1
  }, [artisan])

  if (!artisan) {
    return (
      <div className="w-full flex-grow flex items-center justify-center p-12 bg-lgray min-h-[50vh]">
        <div className="text-center max-w-sm bg-white rounded-card shadow-card p-8 border border-border">
          <AlertTriangle size={48} className="text-orange mx-auto mb-4" />
          <h2 className="font-display font-bold text-[18px] text-navy">Artisan not found</h2>
          <p className="font-body text-[14px] text-slate mt-2">
            The profile you are looking for does not exist or has been deactivated.
          </p>
          <Link href="/search">
            <Button variant="secondary" size="sm" className="mt-5 w-full">
              Back to search results
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleToggleSave = () => {
    if (!user) {
      toast.error('Please login to save to favourites.')
      router.push('/login')
      return
    }
    setIsSaved(!isSaved)
    toast.success(isSaved ? 'Removed from saved artisans' : 'Saved to favourites!')
  }

  const handleShare = () => {
    const shareText = `Check out ${artisan.name}, vetted ${artisan.trade} on NexPlumb! ${artisan.rating}★ rating, escrow protection.`
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    
    // Copy link
    navigator.clipboard.writeText(shareUrl)
    toast.success('Profile link copied to clipboard!')
    
    // Open whatsapp share
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
  }

  return (
    <div className="w-full bg-lgray flex-grow py-8 select-none">
      <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 grid grid-cols-1 desktop:grid-cols-12 gap-8 items-start">
        
        {/* === LEFT COLUMN: PROFILE DATA DETAILS (60% or 8 cols) === */}
        <main className="desktop:col-span-8 flex flex-col gap-6">
          
          {/* Banner & Photo absolute offset header */}
          <div className="bg-white rounded-card border border-border overflow-hidden shadow-card relative">
            <div className="h-[200px] w-full bg-navy relative">
              {/* Banner image mockup */}
              <div className="absolute inset-0 bg-gradient-to-r from-navy to-nxblue opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
            </div>

            {/* Profile photo offset */}
            <div className="px-6 pb-6 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:mt-0">
              <img
                src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={artisan.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-card bg-lgray"
              />
              
              <div className="flex-1 text-center sm:text-left pt-2 pb-1 leading-tight">
                <h1 className="font-display font-semibold text-[24px] tablet:text-[28px] text-navy">
                  {artisan.name}
                </h1>
                <p className="font-mono text-[13px] text-slate mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-bold text-navy">{artisan.trade}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin size={12} /> {artisan.area}, Lagos
                  </span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="sm:mb-2.5 shrink-0">
                <StatusBadge status={artisan.isAvailable ? 'available' : 'cancelled'} showDot />
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[16px] text-navy mb-4 border-b border-border pb-2.5">
              Verified Trust Accreditations
            </h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              {artisan.badges.map((badge) => (
                <TrustBadge key={badge} type={badge} showLabel size="md" />
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-mono text-[11px] text-slate uppercase tracking-wider">Rating</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-amber select-none">
                <StarRating rating={artisan.rating} />
              </div>
            </div>
            <div className="border-x border-border">
              <p className="font-mono text-[11px] text-slate uppercase tracking-wider">Jobs Completed</p>
              <p className="font-mono text-[20px] font-bold text-navy mt-1 leading-none">{artisan.jobCount}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] text-slate uppercase tracking-wider">Member Since</p>
              <p className="font-mono text-[14px] font-semibold text-navy mt-1 leading-none">Jan 2026</p>
            </div>
          </div>

          {/* About Bio */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[16px] text-navy mb-3">
              About
            </h3>
            <p className="font-body text-[15px] text-body leading-relaxed">
              {artisan.bio}
            </p>
          </div>

          {/* Skills tags */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[16px] text-navy mb-3">
              Skills & Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {artisan.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-lgray text-body border border-border font-mono text-[12px] px-3.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[16px] text-navy mb-4">
              Portfolio & Before/After Proofs
            </h3>
            {artisan.portfolio.length === 0 ? (
              <div className="w-full h-32 border-2 border-dashed border-border rounded-card flex flex-col items-center justify-center text-slate font-mono text-[12px]">
                📷 No portfolio photos uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {artisan.portfolio.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveLightboxIdx(idx)}
                    className="group relative h-28 sm:h-36 rounded-card border border-border overflow-hidden cursor-pointer hover:border-teal transition-all"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || artisan.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {img.tag && (
                      <span className="absolute top-2 left-2 bg-navy/85 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {img.tag}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 size={20} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Area */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[16px] text-navy mb-3">
              Service Area coverage
            </h3>
            <p className="font-body text-[14px] text-slate mb-4">
              Providing swift response services to the following locations in Lagos:
            </p>
            <div className="flex flex-wrap gap-1.5 select-none mb-4">
              {['Surulere', 'Yaba', 'Ebute Metta', 'Mainland Lagos'].map((area) => (
                <span key={area} className="bg-teal/5 text-teal border border-teal/15 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded">
                  {area}
                </span>
              ))}
            </div>

            {/* Simulated mini Mapbox coverage */}
            <div className="w-full h-44 bg-slate-50 border border-border rounded-card relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full stroke-gray-200 stroke-1" fill="none">
                <circle cx="50%" cy="50%" r="60" className="fill-teal/10 stroke-teal/40 stroke-dashed" />
                <circle cx="50%" cy="50%" r="5" className="fill-teal" />
              </svg>
              <div className="absolute top-4 left-4 bg-white/95 border border-border font-mono text-[10px] px-2 py-0.5 rounded shadow">
                coverage Area: 10km radius
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card">
            <h3 className="font-display font-bold text-[16px] text-navy mb-4">
              Reviews ({artisan.reviews.length})
            </h3>
            
            {/* Rating breakdown details */}
            {artisan.reviews.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-lgray/30 rounded-card border border-border mb-6">
                <div className="text-center sm:border-r sm:border-border sm:pr-8 shrink-0">
                  <p className="font-mono text-[48px] font-bold text-navy leading-none">
                    {artisan.rating.toFixed(1)}
                  </p>
                  <p className="font-mono text-[11px] text-slate mt-1.5 uppercase tracking-wide">
                    Out of 5 stars
                  </p>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1.5 font-mono text-[11px]">
                  {ratingsDistribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2">
                      <span className="w-3 text-right">{row.stars}</span>
                      <span>★</span>
                      <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal" 
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right opacity-80">{row.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {artisan.reviews.length === 0 ? (
              <p className="text-slate font-body text-center py-6">No reviews yet. Be the first to book and rate Emeka!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {artisan.reviews.map((rev) => (
                  <div key={rev.id} className="border border-border bg-lgray/10 p-5 rounded-card flex flex-col gap-2">
                    <div className="flex justify-between items-center flex-wrap gap-1 select-none">
                      <div>
                        <span className="font-display font-bold text-[13px] text-navy">{rev.customerName}</span>
                        <span className="font-mono text-[10px] text-slate ml-2">({rev.customerArea})</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate">{formatDate(rev.date)}</span>
                    </div>
                    
                    <div className="text-amber">
                      <StarRating rating={rev.rating} />
                    </div>

                    <p className="font-body text-[14px] text-body mt-1">
                      "{rev.text}"
                    </p>

                    {rev.reply && (
                      <div className="ml-4 p-3 bg-white border-l-4 border-teal rounded mt-2">
                        <p className="font-mono text-[10px] font-bold text-teal">NexPlumb response:</p>
                        <p className="font-body text-[13px] text-body mt-0.5">"{rev.reply}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* === RIGHT COLUMN: STICKY BOOKING WIDGET (40% or 4 cols) === */}
        <aside className="desktop:col-span-4 sticky top-[80px] self-start w-full">
          <div className="bg-white rounded-card shadow-card p-6 border border-border flex flex-col gap-5">
            <div>
              <p className="font-mono text-[11px] text-slate uppercase tracking-wider">Estimated Price</p>
              <p className="font-mono text-[24px] font-bold text-navy leading-none mt-1">
                {formatNairaRange(artisan.priceMin, artisan.priceMax)}
              </p>
              <p className="text-caption text-slate mt-1.5">
                per job (material cost excluded)
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${artisan.isAvailable ? 'bg-teal animate-pulse' : 'bg-slate'}`} />
                <span className="font-mono text-[12px] font-bold text-navy">
                  {artisan.isAvailable ? 'Available Now for dispatch' : 'Fully Booked today'}
                </span>
              </div>
              <p className="font-body text-[12px] text-slate mt-1 leading-normal">
                {artisan.isAvailable 
                  ? 'Typically responds and arrives within 15–30 minutes.'
                  : 'You can book for scheduled dates in the calendar.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <Link href={`/book/${artisan.slug}`} className="w-full">
                <Button variant="primary" size="lg" className="w-full text-[15px]" disabled={!artisan.isAvailable}>
                  Book Emeka Now
                </Button>
              </Link>
              <button 
                onClick={() => toast.info('Quote requests will require booking details.')}
                className="w-full border-[1.5px] border-navy text-navy font-display font-bold text-[14px] h-12 rounded-btn hover:bg-navy hover:text-white transition-all focus:outline-none"
              >
                Request Custom Quote
              </button>
            </div>

            {/* Save + Share controls */}
            <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
              <button
                onClick={handleToggleSave}
                className={`flex items-center gap-1.5 font-mono text-[12px] font-bold px-3 py-1.5 rounded-btn border transition-colors focus:outline-none
                  ${isSaved 
                    ? 'border-red-200 bg-red-50 text-red-600' 
                    : 'border-border hover:border-slate text-slate hover:text-navy'
                  }`}
              >
                <Heart size={14} className={isSaved ? 'fill-current text-red-600' : ''} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 font-mono text-[12px] font-bold px-3 py-1.5 rounded-btn border border-border hover:border-slate text-slate hover:text-navy focus:outline-none"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>

            {/* Escrow trust inline badge */}
            <div className="border-t border-border pt-4">
              <EscrowBadge variant="inline" />
            </div>
          </div>
        </aside>
      </div>

      {/* PORTFOLIO LIGHTBOX MODAL */}
      {activeLightboxIdx !== null && (
        <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 bg-navy/95 select-none animate-fade-in">
          <button 
            onClick={() => setActiveLightboxIdx(null)}
            className="absolute top-6 right-6 text-white hover:text-orange transition-colors p-2 focus:outline-none bg-white/5 rounded-full"
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
            <img
              src={artisan.portfolio[activeLightboxIdx].url}
              alt={artisan.portfolio[activeLightboxIdx].caption || artisan.name}
              className="max-w-full max-h-[70vh] object-contain rounded-card border border-white/10"
            />
            {artisan.portfolio[activeLightboxIdx].caption && (
              <p className="text-white font-body text-[15px] mt-4 text-center max-w-md px-4 leading-relaxed bg-black/40 py-2 rounded-btn">
                {artisan.portfolio[activeLightboxIdx].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
