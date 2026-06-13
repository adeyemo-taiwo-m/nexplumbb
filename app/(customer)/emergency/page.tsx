'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb, Artisan } from '@/lib/store/mockDb'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import StarRating from '@/components/ui/StarRating'
import { 
  AlertTriangle, 
  PhoneCall, 
  MapPin, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { LAGOS_LGAS } from '@/lib/validation'
import { formatNaira } from '@/lib/format'

export default function EmergencyBooking() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { artisans, addBooking } = useMockDb()

  const [issueType, setIssueType] = useState('')
  const [selectedLga, setSelectedLga] = useState('Surulere')
  const [searchState, setSearchState] = useState<'form' | 'searching' | 'results' | 'no-results'>('form')
  
  // Results
  const [availableArtisans, setAvailableArtisans] = useState<Artisan[]>([])
  const [searchDistance, setSearchDistance] = useState(5) // starting 5km
  const [isBookingEmergency, setIsBookingEmergency] = useState<string | null>(null)

  const emergencies = [
    'Burst pipe / flooding',
    'No electricity / power fault',
    'Gas leak',
    'Electrical sparks / fire risk',
    'Blocked drain (urgent)',
    'Bathroom/toilet completely unusable',
    'Other urgent issue'
  ]

  const handleStartSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!issueType) {
      toast.error('Please select an emergency issue type')
      return
    }

    setSearchState('searching')
    setSearchDistance(5)

    // Simulate geographical search
    setTimeout(() => {
      // Filter artisans of corresponding trade: plumbing for burst pipes/drains, electrical for spark/power
      const matchedTrade = issueType.includes('pipe') || issueType.includes('drain') || issueType.includes('toilet') 
        ? 'Plumbing' 
        : 'Electrical'

      // Match available online artisans in the LGA
      const matches = artisans.filter(
        (a) => a.trade === matchedTrade && a.isAvailable && a.isOnline && a.area.toLowerCase() === selectedLga.toLowerCase()
      )

      if (matches.length > 0) {
        setAvailableArtisans(matches)
        setSearchState('results')
        toast.success(`Found ${matches.length} emergency artisans within 5km!`)
      } else {
        // Expand search to 10km (simulate by matching any online available artisan of that trade across Lagos)
        setSearchDistance(10)
        setTimeout(() => {
          const generalMatches = artisans.filter(
            (a) => a.trade === matchedTrade && a.isAvailable && a.isOnline
          )

          if (generalMatches.length > 0) {
            setAvailableArtisans(generalMatches)
            setSearchState('results')
            toast.warning(`Expanded search: Found ${generalMatches.length} artisans within 10km.`)
          } else {
            setSearchState('no-results')
          }
        }, 1500)
      }
    }, 2000)
  }

  const handleBookEmergency = (artisan: Artisan) => {
    if (!user) {
      toast.info('Please sign in or create an account to authorize emergency escrow.')
      router.push('/login')
      return
    }

    setIsBookingEmergency(artisan.id)

    // Calculate emergency price (+30% surcharge)
    const baseVal = artisan.priceMin
    const fee = 500
    const premium = Math.round(baseVal * 0.3)
    const total = baseVal + fee + premium

    setTimeout(() => {
      // Add booking to mockDb
      const bookingId = addBooking({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        customerAddress: `${selectedLga}, Lagos`,
        customerAddressDetails: 'Emergency Dispatch Location',
        artisanId: artisan.id,
        artisanName: artisan.name,
        artisanTrade: artisan.trade,
        artisanPhoto: artisan.portfolio[0]?.url || '',
        jobType: issueType,
        description: `⚠️ EMERGENCY DISPATCH: ${issueType}. Immediate response requested.`,
        photos: [],
        isUrgent: true,
        date: new Date().toISOString().split('T')[0],
        timeSlot: 'Immediate Dispatch',
        amount: total,
        paymentMethod: 'wallet', // mock auto-authorized deduction
        paymentStatus: 'paid'
      })

      toast.success('Emergency booking created! Artisan is on route.')
      setIsBookingEmergency(null)
      router.push(`/jobs/${bookingId}/track`)
    }, 1800)
  }

  return (
    <div className="w-full flex-grow flex flex-col bg-lgray select-none">
      
      {/* RED/ORANGE BANNER */}
      <div className="w-full bg-gradient-to-r from-orange to-red-600 text-white py-3 font-display font-bold text-center text-[12px] tablet:text-[14px] uppercase tracking-wider shadow-card select-none">
        ⚠️ Emergency Dispatch booking — active 24/7 in Lagos
      </div>

      {/* Simplified Header */}
      <header className="h-14 bg-white border-b border-border px-6 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-[18px] text-navy">
          Nex<span className="text-orange">Plumb</span> <span className="font-mono text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200 ml-1">EMERGENCY</span>
        </Link>
        <a 
          href="tel:08008090890" 
          className="flex items-center gap-1 font-mono text-[12px] font-bold text-red-600 hover:underline"
        >
          <PhoneCall size={14} /> 0800-NEXPLUMB
        </a>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-[500px] bg-white rounded-card shadow-modal border border-border p-6 tablet:p-8 flex flex-col gap-6">
          
          {searchState === 'form' && (
            <>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-200">
                  <ShieldAlert size={28} />
                </div>
                <h1 className="font-display font-bold text-[22px] text-navy leading-none">Find Emergency Artisan</h1>
                <p className="font-body text-[13px] text-slate mt-2">
                  Artisans respond in under 15 minutes. +30% emergency premium applies.
                </p>
              </div>

              <form onSubmit={handleStartSearch} className="flex flex-col gap-4">
                {/* Emergency drop */}
                <div>
                  <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">1. What is the Emergency?</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="">-- Select emergency --</option>
                    {emergencies.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                {/* LGA Area */}
                <div>
                  <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">2. Your Location in Lagos</label>
                  <select
                    value={selectedLga}
                    onChange={(e) => setSelectedLga(e.target.value)}
                    className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-red-500"
                  >
                    {LAGOS_LGAS.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" variant="danger" size="lg" className="w-full mt-4 font-display">
                  Find emergency artisans NOW
                </Button>
              </form>
            </>
          )}

          {searchState === 'searching' && (
            <div className="text-center py-10 flex flex-col items-center animate-pulse">
              <div className="w-14 h-14 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4" />
              <h3 className="font-display font-bold text-[16px] text-navy">Locating emergency responders...</h3>
              <p className="font-mono text-[11px] text-slate mt-1.5 uppercase">
                Scanning within {searchDistance}km radius in {selectedLga}
              </p>
            </div>
          )}

          {searchState === 'results' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <button 
                  onClick={() => setSearchState('form')}
                  className="p-1 hover:bg-lgray rounded-btn text-slate focus:outline-none"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="font-display font-bold text-[16px] text-navy leading-none">Emergency Responders</h3>
                  <p className="font-mono text-[10px] text-slate mt-1 uppercase">Matches in {selectedLga} ({searchDistance}km)</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {availableArtisans.map((artisan) => (
                  <div key={artisan.id} className="border border-border p-4 rounded-card bg-white hover:border-red-500/50 shadow-card flex gap-3 items-center justify-between">
                    <div className="flex gap-3">
                      <img 
                        src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                        alt={artisan.name} 
                        className="w-11 h-11 rounded-full object-cover border"
                      />
                      <div className="font-mono text-[11px] text-slate leading-tight">
                        <h4 className="font-display font-bold text-navy text-[13px]">{artisan.name}</h4>
                        <p className="mt-1">{artisan.trade} · {artisan.area}</p>
                        <div className="mt-1 text-teal font-semibold flex items-center gap-0.5">
                          <Clock size={10} /> ETA: ~12 min away
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      loading={isBookingEmergency === artisan.id}
                      onClick={() => handleBookEmergency(artisan)}
                      className="shrink-0 text-[12px] h-9"
                    >
                      Book ⚡
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchState === 'no-results' && (
            <div className="text-center py-6 flex flex-col items-center animate-fade-in">
              <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="font-display font-bold text-[18px] text-navy">No responders available</h3>
              <p className="font-body text-[14px] text-slate mt-2 leading-relaxed">
                There are currently no active, online available artisans within 10km of {selectedLga}.
              </p>
              
              {/* Fallback Call CTA */}
              <div className="w-full bg-red-50 border border-red-200 p-4 rounded-card mt-6 select-text">
                <p className="font-mono text-[11px] font-bold text-red-600 uppercase">Emergency Hotline fallback</p>
                <p className="font-body text-[13px] text-red-800 mt-1 leading-normal">
                  Our operations room can dispatch backup physical teams manually:
                </p>
                <a 
                  href="tel:08008090890" 
                  className="font-mono text-[20px] font-bold text-red-700 mt-2 block hover:underline"
                >
                  📞 0800-NEXPLUMB
                </a>
              </div>

              <Button variant="secondary" onClick={() => setSearchState('form')} className="w-full mt-6">
                Back and modify search
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
