'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, ShieldCheck, Lock, Star, ArrowRight } from 'lucide-react'
import { useMockDb } from '@/lib/store/mockDb'
import ArtisanCard from '@/components/ui/ArtisanCard'
import Button from '@/components/ui/Button'
import { formatNaira } from '@/lib/format'

export default function CustomerHomepage() {
  const router = useRouter()
  const artisans = useMockDb((state) => state.artisans)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [detectedLocation, setDetectedLocation] = useState('Detecting location...')
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([])
  const [loadingArtisans, setLoadingArtisans] = useState(true)

  // Seed / fetch featured artisans
  useEffect(() => {
    const timer = setTimeout(() => {
      // Pick 4 featured artisans from the store
      setFeaturedArtisans(artisans.slice(0, 4))
      setLoadingArtisans(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [artisans])

  // Mock location detection
  useEffect(() => {
    const locationTimer = setTimeout(() => {
      setDetectedLocation('Surulere, Lagos')
    }, 1500)
    return () => clearTimeout(locationTimer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    router.push(`/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(detectedLocation)}`)
  }

  const handleCategoryClick = (category: string) => {
    router.push(`/search?category=${encodeURIComponent(category.toLowerCase())}&location=${encodeURIComponent(detectedLocation)}`)
  }

  const trustMetrics = [
    { icon: ShieldCheck, value: '1,200+', label: 'Verified Artisans' },
    { icon: Lock, value: 'Escrow', label: 'Protected Payments' },
    { icon: Star, value: '4.8 / 5', label: 'Average Rating' }
  ]

  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Search',
      description: "Type what you need or pick a category. We\'ll show you verified artisans near your location in seconds."
    },
    {
      number: 2,
      icon: ShieldCheck,
      title: 'Book & pay safely',
      description: 'Choose your artisan, pick a time, and pay through secure escrow. Your money is protected until the job is done.'
    },
    {
      number: 3,
      icon: MapPin,
      title: 'Track & confirm',
      description: 'Watch your artisan travel to you on a live map. Confirm when the job is complete and release payment.'
    }
  ]

  const socialProofReviews = [
    {
      name: 'Chisom A.',
      area: 'Surulere',
      stars: 5,
      text: 'Nexplumb completely saved my day! A kitchen pipe burst at 9:00 AM. I booked Emeka, tracked him, and by 11:30 AM the pipe was replaced. The escrow system felt super secure!'
    },
    {
      name: 'Kunle O.',
      area: 'Yaba',
      stars: 4,
      text: 'Very smooth experience. Tunde was professional, did neat wiring, and cleared up afterwards. Love that I can pay by bank transfer directly on the app.'
    },
    {
      name: 'Nkechi E.',
      area: 'Lekki',
      stars: 5,
      text: 'Having a verified artisan come into my home makes me feel safe. Knowing their NIN has been checked by Nexplumb is a game changer for safety in Lagos.'
    }
  ]

  const seoSections = [
    {
      id: 'plumbers-in-lagos',
      title: 'Vetted Plumbers in Lagos',
      desc: 'Get access to certified plumbing experts for pipe repairs, toilet unblocking, water heater maintenance, and new piping layouts. Insured, secure payment, and verified credentials.',
      trade: 'Plumbing'
    },
    {
      id: 'electricians-in-lagos',
      title: 'Burnt Panel & Wiring Electricians in Lagos',
      desc: 'Electrical faults resolved quickly. Standard domestic wiring, generator transfer switches, panel installation, and light fixtures. Verified with NIMC NIN identity checks.',
      trade: 'Electrical'
    }
  ]

  return (
    <div className="w-full flex-grow">
      
      {/* SECTION 1: HERO */}
      <section className="w-full bg-navy text-white min-h-[580px] flex items-center py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 grid grid-cols-1 desktop:grid-cols-12 gap-8 items-center">
          
          {/* Left Column Text (55% or 7 cols) */}
          <div className="desktop:col-span-7 flex flex-col items-start">
            <h1 className="font-display font-semibold text-[36px] tablet:text-[44px] text-white leading-tight">
              Your trusted artisan, <br />
              <span className="text-orange">one tap away</span>
            </h1>
            <p className="font-body text-[16px] tablet:text-[18px] text-white/85 mt-4 max-w-[540px]">
              Find verified plumbers, electricians, and tradespeople near you in Lagos — instantly. Your funds are protected in escrow until the work is complete.
            </p>

            {/* Search Card */}
            <form onSubmit={handleSearch} className="w-full max-w-[600px] bg-white rounded-card shadow-modal mt-8 p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={20} className="text-slate flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What do you need? e.g. leaking pipe, electrical fault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-body font-mono text-[14px] focus:outline-none placeholder:text-slate py-3"
                  required
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-32">
                Search
              </Button>
            </form>

            {/* Location indicator */}
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-white/70">
              <MapPin size={12} className="text-orange" />
              <span>Location: {detectedLocation}</span>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2.5 mt-6 w-full">
              {['🔧 Plumbing', '⚡ Electrical', '🪚 Carpentry', '🎨 Painting', '🔲 Tiling'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat.split(' ')[1])}
                  className="bg-white/10 text-white font-display text-[13px] font-semibold border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 hover:border-white/40 transition-all active:scale-95"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column Illustration (45% or 5 cols) */}
          <div className="hidden desktop:block desktop:col-span-5 relative">
            <div className="w-full h-80 border-2 border-dashed border-white/20 rounded-modal flex flex-col items-center justify-center bg-white/5 p-6 text-center">
              <div className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center text-orange mb-4">
                <ShieldCheck size={48} className="animate-pulse" />
              </div>
              <h3 className="text-white text-[18px] font-display font-bold">Nigeria\'s Trust-First Platform</h3>
              <p className="text-white/70 font-body text-[14px] mt-1.5 max-w-[280px]">
                NIM-verified, guarantor-checked local professionals at your service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST BAR */}
      <section className="w-full bg-navy/95 border-t border-white/10 py-6">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-center gap-10 sm:gap-20 items-center">
          {trustMetrics.map((metric, idx) => {
            const Icon = metric.icon
            return (
              <div key={idx} className="flex items-center gap-3 text-white">
                <div className="p-2 bg-teal/15 rounded-full text-teal">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-[20px] font-display font-bold leading-none">{metric.value}</p>
                  <p className="text-[12px] font-mono text-white/70 mt-1 uppercase tracking-wide">{metric.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="w-full bg-white py-20 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
          <h2 className="text-h2 text-navy mb-3">
            Book a trusted artisan in 3 steps
          </h2>
          <p className="font-body text-[16px] text-slate max-w-[500px] mx-auto mb-16">
            Our secure process protects your time, your money, and your home from start to finish.
          </p>

          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-10 mt-6 text-left">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="flex flex-col items-start p-6 rounded-card border border-border bg-lgray/10 hover:border-teal/30 hover:shadow-card transition-all duration-200">
                  <div className="flex justify-between items-center w-full">
                    <span className="w-10 h-10 bg-orange text-white rounded-full font-display font-bold text-[16px] flex items-center justify-center select-none">
                      {step.number}
                    </span>
                    <Icon size={28} className="text-teal" />
                  </div>
                  <h3 className="font-display font-bold text-[18px] text-navy mt-6">
                    {step.title}
                  </h3>
                  <p className="font-body text-[14px] text-slate mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-16">
            <Link href="/search">
              <Button variant="primary" size="lg">
                Find an artisan now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED ARTISANS */}
      <section className="w-full bg-lgray py-20 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 tablet:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-h2 text-navy">
                Top-rated artisans near you
              </h2>
              <p className="font-mono text-[12px] text-teal mt-1 font-semibold">
                ● Vetted & Active in Surulere
              </p>
            </div>
            <Link href="/search" className="font-mono text-[12px] text-nxblue font-bold hover:underline flex items-center gap-1 leading-none select-none">
              See all artisans <ArrowRight size={14} />
            </Link>
          </div>

          {loadingArtisans ? (
            // Skeleton display
            <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-card border border-border p-5 flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mt-4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
                  <div className="h-10 bg-gray-200 rounded w-full mt-6" />
                </div>
              ))}
            </div>
          ) : featuredArtisans.length === 0 ? (
            <div className="bg-white border border-border rounded-card p-12 text-center">
              <p className="text-slate font-body">Coming soon — artisans signing up now in your area</p>
              <Link href="/join-as-artisan">
                <Button variant="secondary" size="sm" className="mt-4">Join waitlist</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-6">
              {featuredArtisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  variant="vertical"
                  {...artisan}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: CATEGORY SEO SECTIONS */}
      {seoSections.map((sec, index) => (
        <section
          key={sec.id}
          id={sec.id}
          className={`w-full py-16 border-b border-border ${index % 2 === 0 ? 'bg-white' : 'bg-lgray/30'}`}
        >
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 grid grid-cols-1 desktop:grid-cols-12 gap-8 items-center">
            
            {/* Details */}
            <div className="desktop:col-span-6">
              <h2 className="text-h2 text-navy mb-3">
                {sec.title}
              </h2>
              <p className="font-body text-[15px] text-body leading-relaxed">
                {sec.desc}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 select-none">
                <span className="font-mono text-[11px] font-bold bg-teal/15 text-teal border border-teal/20 px-2.5 py-1 rounded-full">Escrow Protected</span>
                <span className="font-mono text-[11px] font-bold bg-nxblue/15 text-nxblue border border-nxblue/20 px-2.5 py-1 rounded-full">NIN Identity Vetted</span>
                <span className="font-mono text-[11px] font-bold bg-amber/15 text-amber-dark border border-amber/20 px-2.5 py-1 rounded-full">Surulere & Yaba Coverage</span>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => handleCategoryClick(sec.trade)}
                  className="font-mono text-[13px] font-bold text-orange hover:text-orange-dark hover:underline flex items-center gap-1 leading-none focus:outline-none"
                >
                  Find {sec.trade.toLowerCase()}s near you <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Artisan Cards Grid excerpt */}
            <div className="desktop:col-span-6 flex flex-col gap-4">
              {artisans
                .filter((a) => a.trade === sec.trade)
                .slice(0, 2)
                .map((art) => (
                  <ArtisanCard key={art.id} variant="horizontal" {...art} />
                ))}
            </div>
          </div>
        </section>
      ))}

      {/* SECTION 6: SOCIAL PROOF */}
      <section className="w-full bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
          <h2 className="text-h2 text-navy mb-12">
            What residents say about NexPlumb
          </h2>
          
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8 text-left mt-6">
            {socialProofReviews.map((rev, idx) => (
              <div key={idx} className="bg-lgray rounded-card p-6 shadow-card border border-border/55 hover:translate-y-[-2px] transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-0.5 text-amber mb-3 select-none">
                    {Array.from({ length: rev.stars }).map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                  <p className="font-body text-[14px] text-body italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
                
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="w-9 h-9 bg-navy text-white rounded-full font-display font-bold text-[14px] flex items-center justify-center select-none uppercase">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-[13px] text-navy leading-none">
                      {rev.name}
                    </h4>
                    <p className="font-mono text-[10px] text-slate mt-1">
                      {rev.area}, Lagos
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
