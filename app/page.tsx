'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, ShieldCheck, Lock, Star, ArrowRight } from 'lucide-react'
import { useMockDb } from '@/lib/store/mockDb'
import ArtisanCard from '@/components/ui/ArtisanCard'
import Button from '@/components/ui/Button'
import CustomerNavbar from '@/components/layout/CustomerNavbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'

export default function Homepage() {
  const router = useRouter()
  const artisans = useMockDb((state) => state.artisans)
  
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customLocation, setCustomLocation] = useState('Surulere')
  const [detectedLocation, setDetectedLocation] = useState('Detecting location...')
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([])
  const [loadingArtisans, setLoadingArtisans] = useState(true)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load featured artisans from store
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setFeaturedArtisans(artisans.slice(0, 4))
        setLoadingArtisans(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [mounted, artisans])

  // Mock location detection
  useEffect(() => {
    if (mounted) {
      const locationTimer = setTimeout(() => {
        setDetectedLocation('Surulere, Lagos')
        setCustomLocation('Surulere')
      }, 1200)
      return () => clearTimeout(locationTimer)
    }
  }, [mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.trim()
    router.push(`/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(customLocation)}`)
  }

  const handleCategoryClick = (category: string) => {
    router.push(`/search?category=${encodeURIComponent(category.toLowerCase())}&location=${encodeURIComponent(customLocation)}`)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
      description: "Type what you need or pick a category. We'll show you verified artisans near your location in seconds."
    },
    {
      number: 2,
      icon: Lock,
      title: 'Book & Pay Safely',
      description: 'Choose your artisan, pick a time, and pay through secure escrow. Your money is protected until the job is done.'
    },
    {
      number: 3,
      icon: MapPin,
      title: 'Track & Confirm',
      description: 'Watch your artisan travel to you on a live map. Confirm when the job is complete and release payment.'
    }
  ]

  const seoSections = [
    {
      id: 'plumbers-in-lagos',
      title: 'Plumbers in Lagos',
      desc: 'Access highly rated plumbing professionals for leak repairs, drain unblocking, faucet installations, and pipe installations. Secure escrow payments ensure full service satisfaction.',
      trade: 'Plumbing',
      label: 'plumbers'
    },
    {
      id: 'electricians-in-lagos',
      title: 'Electricians in Lagos',
      desc: 'Expert electricians for domestic re-wiring, generator changeover switches, socket replacements, and troubleshooting power outages. Fast response and fully verified profiles.',
      trade: 'Electrical',
      label: 'electricians'
    },
    {
      id: 'carpenters-in-lagos',
      title: 'Carpenters in Lagos',
      desc: 'Custom woodworking, cabinet makers, door installations, and roof repairs. Connecting you to verified local carpenters with guaranteed expertise in mainland and island Lagos.',
      trade: 'Carpentry',
      label: 'carpenters'
    },
    {
      id: 'painters-in-lagos',
      title: 'Painters in Lagos',
      desc: 'Professional screeding and painting services for residential and commercial layouts. Transform your spaces with vetted local artisans offering transparent pricing.',
      trade: 'Painting',
      label: 'painters'
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* SECTION 1: GLOBAL NAVBAR */}
      <CustomerNavbar />

      <main className="flex-grow flex flex-col">
        {/* SECTION 2: HERO BANNER */}
        <section className="w-full bg-navy text-white min-h-[580px] flex items-center py-16 md:py-24">
          <div className="max-w-[1200px] mx-auto w-full px-6 tablet:px-10 grid grid-cols-1 desktop:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="desktop:col-span-7 flex flex-col items-start">
              <h1 className="font-display font-bold text-[38px] tablet:text-[48px] text-white leading-tight">
                Your trusted artisan, <br />
                <span className="text-orange">one tap away in Lagos</span>
              </h1>
              <p className="font-body text-[16px] tablet:text-[18px] text-white/85 mt-4 max-w-[560px]">
                Find verified plumbers, electricians, carpenters and painters near you in Lagos, Nigeria — instantly. Your funds are protected in escrow until the work is complete.
              </p>

              {/* Search Card with Location Selector */}
              <form onSubmit={handleSearch} className="w-full max-w-[620px] bg-white rounded-card shadow-modal mt-8 p-2.5 flex flex-col sm:flex-row gap-3">
                {/* Search Term */}
                <div className="flex-1 flex items-center gap-2 px-3 border-b sm:border-b-0 sm:border-r border-border">
                  <Search size={20} className="text-slate flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="What do you need? (e.g. leaking pipe, electrical fault...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-body font-mono text-[14px] focus:outline-none placeholder:text-slate py-3"
                    required
                  />
                </div>
                
                {/* Location Input */}
                <div className="w-full sm:w-44 flex items-center gap-2 px-3">
                  <MapPin size={18} className="text-orange flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="LGA or Area (e.g. Yaba)"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full bg-transparent text-body font-mono text-[14px] focus:outline-none placeholder:text-slate py-3"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full sm:w-28 flex-shrink-0">
                  Search
                </Button>
              </form>

              {/* Geolocation indicator */}
              <div className="mt-3.5 flex items-center gap-1.5 font-mono text-[11px] text-white/70">
                <span className="inline-block w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span>Detected Location: {detectedLocation}</span>
              </div>

              {/* Service Category Chips */}
              <div className="flex flex-wrap gap-2 mt-6 w-full">
                {['🔧 Plumbing', '⚡ Electrical', '🪚 Carpentry', '🎨 Painting', '🔲 Tiling'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat.split(' ')[1])}
                    className="bg-white/10 text-white font-display text-[13px] font-semibold border border-white/20 rounded-full px-4.5 py-2 hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column Illustration */}
            <div className="hidden desktop:block desktop:col-span-5 relative">
              <div className="w-full border border-white/10 rounded-modal flex flex-col items-center justify-center bg-white/5 p-8 text-center shadow-lg relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal/10 rounded-bl-full pointer-events-none" />
                <div className="w-20 h-20 bg-orange/15 rounded-full flex items-center justify-center text-orange mb-5 border border-orange/20">
                  <ShieldCheck size={44} className="animate-pulse" />
                </div>
                <h3 className="text-white text-[19px] font-display font-bold">Nigeria's Trust-First Platform</h3>
                <p className="text-white/75 font-body text-[14px] mt-2 max-w-[290px] leading-relaxed">
                  Every artisan undergoes NIMC NIN checks, BVN verification, and physical guarantor audits.
                </p>
                <div className="mt-6 flex gap-2">
                  <span className="font-mono text-[10px] bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider text-white">Escrow Guard</span>
                  <span className="font-mono text-[10px] bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider text-white">SLA Payouts</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: TRUST BAR */}
        <section className="w-full bg-navy/95 border-t border-white/10 py-8 shadow-card">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row justify-between gap-8 sm:gap-4 items-center">
            {trustMetrics.map((metric, idx) => {
              const Icon = metric.icon
              return (
                <div key={idx} className="flex items-center gap-4 text-white w-full sm:w-auto sm:justify-center">
                  <div className="p-3 bg-teal/15 rounded-full text-teal border border-teal/20">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-[22px] font-display font-bold leading-none">{metric.value}</p>
                    <p className="text-[12px] font-mono text-white/70 mt-1.5 uppercase tracking-wider">{metric.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS */}
        <section id="how-it-works" className="w-full bg-white py-24 border-b border-border">
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
            <h2 className="text-h2 text-navy mb-4">
              Book a trusted artisan in 3 steps
            </h2>
            <p className="font-body text-[16px] text-slate max-w-[520px] mx-auto mb-16">
              Our secure process protects your time, your money, and your home from start to finish.
            </p>

            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8 mt-6 text-left">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="flex flex-col items-start p-6 rounded-card border border-border bg-lgray/10 hover:border-teal/40 hover:shadow-card transition-all duration-200">
                    <div className="flex justify-between items-center w-full">
                      <span className="w-10 h-10 bg-orange text-white rounded-full font-display font-bold text-[16px] flex items-center justify-center select-none shadow">
                        {step.number}
                      </span>
                      <Icon size={28} className="text-teal" />
                    </div>
                    <h3 className="font-display font-bold text-[18px] text-navy mt-6">
                      {step.title}
                    </h3>
                    <p className="font-body text-[14px] text-slate mt-2.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-16">
              <Link href="/search">
                <Button variant="primary" size="lg" className="px-8 py-4">
                  Find an artisan now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5: FEATURED ARTISANS */}
        <section className="w-full bg-lgray/40 py-24 border-b border-border">
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-h2 text-navy">
                  Top-rated artisans near you
                </h2>
                <p className="font-mono text-[12px] text-teal mt-2.5 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block animate-ping" />
                  Vetted & Active in Lagos
                </p>
              </div>
              <Link href="/search" className="font-mono text-[13px] text-nxblue font-bold hover:underline flex items-center gap-1 leading-none select-none">
                See all artisans <ArrowRight size={14} />
              </Link>
            </div>

            {loadingArtisans ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-card border border-border p-6 flex flex-col items-center animate-pulse shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mt-5" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
                    <div className="h-10 bg-gray-200 rounded w-full mt-6" />
                  </div>
                ))}
              </div>
            ) : featuredArtisans.length === 0 ? (
              <div className="bg-white border border-border rounded-card p-12 text-center shadow-sm">
                <p className="text-slate font-body">No featured artisans found. Join Nexplumb waitlist to sign up.</p>
                <Link href="/join-as-artisan">
                  <Button variant="secondary" size="sm" className="mt-4">Register Now</Button>
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

        {/* SECTION 6: CATEGORY SEO SECTIONS */}
        {seoSections.map((sec, index) => {
          const matchingArtisans = artisans.filter((a) => a.trade === sec.trade).slice(0, 3)

          return (
            <section
              key={sec.id}
              id={sec.id}
              className={`w-full py-20 border-b border-border ${index % 2 === 0 ? 'bg-white' : 'bg-lgray/20'}`}
            >
              <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 grid grid-cols-1 desktop:grid-cols-12 gap-10 items-center">
                
                {/* Details */}
                <div className="desktop:col-span-6">
                  <h2 className="text-h2 text-navy mb-4">
                    {sec.title}
                  </h2>
                  <p className="font-body text-[15px] text-body leading-relaxed max-w-[500px]">
                    {sec.desc}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5 select-none">
                    <span className="font-mono text-[11px] font-bold bg-teal/10 text-teal border border-teal/20 px-3 py-1.5 rounded-full">Escrow Guarded</span>
                    <span className="font-mono text-[11px] font-bold bg-nxblue/10 text-nxblue border border-nxblue/20 px-3 py-1.5 rounded-full">NIM Verified ID</span>
                    <span className="font-mono text-[11px] font-bold bg-amber/15 text-amber-dark border border-amber/20 px-3 py-1.5 rounded-full">Local LGA Presence</span>
                  </div>
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(sec.trade)}
                      className="font-mono text-[13px] font-bold text-orange hover:underline flex items-center gap-1 leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                    >
                      Find more {sec.label} near you <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Artisan Cards Grid */}
                <div className="desktop:col-span-6 flex flex-col gap-4.5">
                  {matchingArtisans.length === 0 ? (
                    <div className="p-6 bg-lgray/30 border border-border border-dashed rounded-card text-center text-slate text-[14px]">
                      Seeding local vetted {sec.label} currently...
                    </div>
                  ) : (
                    matchingArtisans.map((art) => (
                      <ArtisanCard key={art.id} variant="horizontal" {...art} />
                    ))
                  )}
                </div>
              </div>
            </section>
          )
        })}

        {/* SECTION 7: SOCIAL PROOF */}
        <section className="w-full bg-white py-24">
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
            <h2 className="text-h2 text-navy mb-14">
              What residents say about NexPlumb
            </h2>
            
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8 text-left">
              {socialProofReviews.map((rev, idx) => (
                <div key={idx} className="bg-lgray/50 rounded-card p-6 border border-border hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-0.5 text-amber mb-4 select-none">
                      {Array.from({ length: rev.stars }).map((_, i) => (
                        <Star key={i} size={14} className="fill-current" />
                      ))}
                    </div>
                    <p className="font-body text-[14.5px] text-body italic leading-relaxed">
                      "{rev.text}"
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-3.5 border-t border-border/80 pt-4.5">
                    <div className="w-9 h-9 bg-navy text-white rounded-full font-display font-bold text-[14px] flex items-center justify-center select-none uppercase shadow-sm">
                      {rev.name[0]}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-[13.5px] text-navy leading-none">
                        {rev.name}
                      </h4>
                      <p className="font-mono text-[10px] text-slate mt-1.5 font-medium">
                        {rev.area}, Lagos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 8: SITE FOOTER */}
      <Footer />

      {/* FLOATING WHATSAPP BUTTON */}
      <WhatsAppFloat />
    </div>
  )
}
