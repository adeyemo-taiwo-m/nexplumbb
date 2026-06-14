'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockDb, Artisan } from '@/lib/store/mockDb'
import ArtisanCard from '@/components/ui/ArtisanCard'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import StarRating from '@/components/ui/StarRating'
import { 
  Filter, 
  Map as MapIcon, 
  List, 
  Search as SearchIcon, 
  MapPin, 
  ChevronDown, 
  X, 
  Compass, 
  SlidersHorizontal 
} from 'lucide-react'
import { LAGOS_LGAS } from '@/lib/validation'

function SearchResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const artisans = useMockDb((state) => state.artisans)

  // URL parameters state
  const q = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialLocation = searchParams.get('location') || 'Surulere, Lagos'

  // Local filter states
  const [searchVal, setSearchVal] = useState(q)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [availability, setAvailability] = useState<'any' | 'now'>('any')
  const [priceMax, setPriceMax] = useState<number>(50000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortOption, setSortOption] = useState('best_match')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [hoveredArtisanId, setHoveredArtisanId] = useState<string | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)

  // Map panning simulation coordinates
  const [mapCenter, setMapCenter] = useState({ lat: 6.5022, lng: 3.3582 }) // Surulere coords

  // Categories
  const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling']

  // Update search input when query changes
  useEffect(() => {
    setSearchVal(q)
  }, [q])

  // Filter Logic
  const filteredArtisans = useMemo(() => {
    return artisans
      .filter((artisan) => {
        // Query match (name, bio, skills)
        if (q) {
          const term = q.toLowerCase()
          const nameMatch = artisan.name.toLowerCase().includes(term)
          const bioMatch = artisan.bio.toLowerCase().includes(term)
          const skillsMatch = artisan.skills.some(s => s.toLowerCase().includes(term))
          const tradeMatch = artisan.trade.toLowerCase().includes(term)
          if (!nameMatch && !bioMatch && !skillsMatch && !tradeMatch) return false
        }

        // Category match
        if (selectedCategory) {
          if (artisan.trade.toLowerCase() !== selectedCategory.toLowerCase()) return false
        }

        // Location match (in-LGA or area match)
        if (selectedLocation) {
          const lga = selectedLocation.split(',')[0].trim().toLowerCase()
          if (!artisan.area.toLowerCase().includes(lga) && !lga.includes(artisan.area.toLowerCase())) {
            // Check if we are searching general Lagos
            if (lga !== 'lagos') return false
          }
        }

        // Min rating
        if (minRating) {
          if (artisan.rating < minRating) return false
        }

        // Availability
        if (availability === 'now' && !artisan.isAvailable) return false

        // Price range
        if (artisan.priceMin > priceMax) return false

        // Verified
        if (verifiedOnly && !artisan.isVerified) return false

        return true
      })
      .sort((a, b) => {
        if (sortOption === 'highest_rated') return b.rating - a.rating
        if (sortOption === 'most_jobs') return b.jobCount - a.jobCount
        if (sortOption === 'lowest_price') return a.priceMin - b.priceMin
        return 0 // default best match
      })
  }, [artisans, q, selectedCategory, selectedLocation, minRating, availability, priceMax, verifiedOnly, sortOption])

  // Handle URL updates
  const handleApplySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (searchVal) params.set('q', searchVal)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedLocation) params.set('location', selectedLocation)
    router.push(`/search?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearchVal('')
    setSelectedCategory('')
    setSelectedLocation('Lagos')
    setMinRating(null)
    setAvailability('any')
    setPriceMax(50000)
    setVerifiedOnly(false)
    router.push('/search')
  }

  // Selected artisan based on map click
  const selectedPinArtisan = useMemo(() => {
    return artisans.find(a => a.id === selectedPinId)
  }, [artisans, selectedPinId])

  return (
    <div className="w-full flex-grow flex flex-col min-h-[calc(100vh-64px)] select-none">
      
      {/* Sub Header Search Controls bar */}
      <section className="bg-white border-b border-border py-4 px-6 tablet:px-10 z-40 sticky top-16">
        <form onSubmit={handleApplySearch} className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center border border-border rounded-btn bg-lgray/30 px-3 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20 transition-all">
            <SearchIcon size={18} className="text-slate flex-shrink-0" />
            <input
              type="text"
              placeholder="What trade do you need? e.g. leak, socket, cabinet..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-transparent border-0 py-2.5 px-2 text-body font-mono text-[14px] focus:outline-none focus-visible:!outline-none"
            />
          </div>

          <div className="w-full md:w-56 flex items-center border border-border rounded-btn bg-lgray/30 px-3 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20 transition-all">
            <MapPin size={18} className="text-orange flex-shrink-0" />
            <select
              value={selectedLocation.split(',')[0]}
              onChange={(e) => {
                const val = e.target.value
                setSelectedLocation(val === 'Lagos' ? 'Lagos' : `${val}, Lagos`)
              }}
              className="w-full bg-transparent border-0 py-2.5 px-2 text-body font-mono text-[13px] focus:outline-none focus-visible:!outline-none cursor-pointer"
            >
              <option value="Lagos">All Lagos</option>
              {LAGOS_LGAS.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm" className="h-[42px] px-6">
            Search
          </Button>
        </form>
      </section>

      {/* Main Panel Content */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto flex flex-col tablet:flex-row">
        
        {/* === LEFT COLUMN: FILTER SIDEBAR (Desktop) === */}
        <aside className="hidden tablet:block w-[280px] flex-shrink-0 border-r border-border bg-white p-6 sticky top-[138px] h-[calc(100vh-138px)] overflow-y-auto">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <h3 className="font-display font-bold text-[16px] text-navy">Filters</h3>
            <button 
              onClick={handleClearFilters}
              className="font-mono text-[12px] text-nxblue font-bold hover:underline"
            >
              Clear all
            </button>
          </div>

          {/* Categories */}
          <div className="py-5 border-b border-border">
            <h4 className="font-display font-semibold text-[13px] text-navy mb-3 uppercase tracking-wider">Category</h4>
            <div className="flex flex-col gap-2 font-body text-[14px]">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory.toLowerCase() === cat.toLowerCase()}
                    onChange={() => setSelectedCategory(cat)}
                    className="h-4 w-4 text-teal focus:ring-teal cursor-pointer"
                  />
                  <span className={selectedCategory.toLowerCase() === cat.toLowerCase() ? 'text-navy font-bold' : 'text-slate hover:text-navy'}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="py-5 border-b border-border">
            <h4 className="font-display font-semibold text-[13px] text-navy mb-3 uppercase tracking-wider">Rating</h4>
            <div className="flex flex-col gap-2 font-mono text-[13px]">
              {[5, 4, 3].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setMinRating(minRating === stars ? null : stars)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-btn border text-left transition-all w-full
                    ${minRating === stars 
                      ? 'border-orange bg-orange/5 text-orange font-bold' 
                      : 'border-border hover:border-slate text-slate hover:text-navy'
                    }`}
                >
                  <StarRating rating={stars} size="sm" />
                  <span className="text-[11px] font-bold">{stars === 5 ? 'Only' : 'and up'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="py-5 border-b border-border">
            <h4 className="font-display font-semibold text-[13px] text-navy mb-3 uppercase tracking-wider">Availability</h4>
            <div className="flex flex-col gap-2 font-body text-[14px]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === 'any'}
                  onChange={() => setAvailability('any')}
                  className="h-4 w-4 text-teal focus:ring-teal cursor-pointer"
                />
                <span className={availability === 'any' ? 'text-navy font-bold' : 'text-slate hover:text-navy'}>
                  Any time
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === 'now'}
                  onChange={() => setAvailability('now')}
                  className="h-4 w-4 text-teal focus:ring-teal cursor-pointer"
                />
                <span className={availability === 'now' ? 'text-navy font-bold' : 'text-slate hover:text-navy'}>
                  Available Now
                </span>
              </label>
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="py-5 border-b border-border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-display font-semibold text-[13px] text-navy uppercase tracking-wider">Max Price</h4>
              <span className="font-mono text-[12px] font-bold text-navy bg-lgray px-2 py-0.5 rounded">
                ₦{priceMax.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={100000}
              step={5000}
              value={priceMax}
              onChange={(e) => setPriceMax(parseInt(e.target.value))}
              className="w-full accent-teal cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate mt-1">
              <span>₦5k</span>
              <span>₦50k</span>
              <span>₦100k</span>
            </div>
          </div>

          {/* Verified Checkbox */}
          <div className="py-5">
            <label className="flex items-center gap-2.5 cursor-pointer justify-between w-full">
              <span className="font-display font-semibold text-[13px] text-navy uppercase tracking-wider">
                ID Verified Only
              </span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => setVerifiedOnly(!verifiedOnly)}
                className="h-4 w-4 rounded-btn border-border text-teal focus:ring-teal cursor-pointer"
              />
            </label>
          </div>
        </aside>

        {/* === RIGHT COLUMN: RESULTS PANEL === */}
        <main className="flex-grow p-4 tablet:p-6 flex flex-col min-w-0">
          
          {/* Results Header */}
          <div className="flex items-center justify-between mb-5 select-none">
            <div className="leading-tight">
              <p className="font-display font-semibold text-[15px] text-navy">
                Showing {filteredArtisans.length} {selectedCategory.toLowerCase() || 'artisan'}s
              </p>
              <p className="font-mono text-[11px] text-slate mt-0.5">
                in {selectedLocation}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Dropdown */}
              <div className="relative flex items-center bg-white border border-border rounded-[10px] shadow-[0_2px_8px_rgba(13,33,55,0.04)] hover:border-teal/40 hover:shadow-[0_4px_12px_rgba(42,157,143,0.08)] transition-all group h-[38px]">
                <div className="absolute left-3 pointer-events-none text-slate group-hover:text-teal transition-colors">
                  <SlidersHorizontal size={14} />
                </div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full bg-transparent border-0 pl-9 pr-8 py-2 focus:outline-none font-mono text-[12px] font-bold text-navy cursor-pointer appearance-none"
                >
                  <option value="best_match">Sort: Best Match</option>
                  <option value="highest_rated">Sort: Top Rated</option>
                  <option value="most_jobs">Sort: Most Jobs</option>
                  <option value="lowest_price">Sort: Lowest Price</option>
                </select>
                <div className="absolute right-3 pointer-events-none text-slate group-hover:text-teal transition-colors">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex bg-lgray/60 border border-border rounded-[10px] p-[3px] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] h-[38px]">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center w-10 sm:w-auto sm:px-3 rounded-[7px] transition-all font-mono text-[12px] font-bold ${
                    viewMode === 'list' 
                      ? 'bg-white text-navy shadow-[0_2px_6px_rgba(13,33,55,0.08)] border border-border/60' 
                      : 'text-slate hover:text-navy border border-transparent hover:bg-white/50'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
                  <span className="hidden sm:inline ml-1.5">List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center justify-center w-10 sm:w-auto sm:px-3 rounded-[7px] transition-all font-mono text-[12px] font-bold ${
                    viewMode === 'map' 
                      ? 'bg-white text-navy shadow-[0_2px_6px_rgba(13,33,55,0.08)] border border-border/60' 
                      : 'text-slate hover:text-navy border border-transparent hover:bg-white/50'
                  }`}
                  aria-label="Map view"
                >
                  <MapIcon size={16} />
                  <span className="hidden sm:inline ml-1.5">Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Layout Wrapper according to viewMode */}
          {viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="flex flex-col gap-4">
              {filteredArtisans.length === 0 ? (
                // Empty state
                <div className="bg-white border border-border rounded-card p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-lgray rounded-full flex items-center justify-center text-slate mb-4">
                    <SlidersHorizontal size={32} />
                  </div>
                  <h3 className="font-display font-bold text-[18px] text-navy">
                    No artisans found in this area
                  </h3>
                  <p className="font-body text-[14px] text-slate mt-1 max-w-xs leading-normal">
                    Try expanding your search parameters or clearing filters.
                  </p>
                  <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-5">
                    Clear all filters
                  </Button>
                </div>
              ) : (
                filteredArtisans.map((artisan) => (
                  <div 
                    key={artisan.id}
                    onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                    onMouseLeave={() => setHoveredArtisanId(null)}
                  >
                    <ArtisanCard variant="horizontal" {...artisan} />
                  </div>
                ))
              )}
            </div>
          ) : (
            /* MAP VIEW (50/50 Split) */
            <div className="flex-grow flex flex-col md:flex-row gap-4 h-[calc(100vh-230px)]">
              
              {/* Map Canvas (Left 50%) */}
              <div className="flex-1 bg-lgray border border-border rounded-card relative overflow-hidden flex flex-col items-center justify-center select-none shadow-card">
                
                {/* SVG Mock Map Layout */}
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2E86AB_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Grid Lines */}
                  <svg className="w-full h-full stroke-gray-200 stroke-1" fill="none">
                    <line x1="10%" y1="0" x2="10%" y2="100%" />
                    <line x1="30%" y1="0" x2="30%" y2="100%" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" />
                    <line x1="70%" y1="0" x2="70%" y2="100%" />
                    <line x1="90%" y1="0" x2="90%" y2="100%" />
                    <line x1="0" y1="20%" x2="100%" y2="20%" />
                    <line x1="0" y1="40%" x2="100%" y2="40%" />
                    <line x1="0" y1="60%" x2="100%" y2="60%" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" />

                    {/* Surulere Road map simulation outlines */}
                    <path d="M100 150 Q 250 200 400 150 T 600 300" stroke="#E5E8EC" strokeWidth="6" />
                    <path d="M50 300 L 550 50" stroke="#E5E8EC" strokeWidth="8" />
                    <path d="M300 20 L 300 450" stroke="#E5E8EC" strokeWidth="6" />
                  </svg>

                  {/* Customer static pin marker */}
                  <div className="absolute top-[40%] left-[45%] flex flex-col items-center z-10">
                    <span className="w-6 h-6 rounded-full bg-nxblue text-white flex items-center justify-center shadow-card border border-white">
                      🏠
                    </span>
                    <span className="font-mono text-[9px] font-bold text-navy bg-white/95 px-1 rounded shadow mt-0.5 select-none">
                      You (Surulere)
                    </span>
                  </div>

                  {/* Dynamic Artisan pins */}
                  {filteredArtisans.map((artisan, index) => {
                    const pinX = 20 + (index * 17) % 70 // spread mock markers on grid
                    const pinY = 30 + (index * 23) % 60
                    const isHovered = hoveredArtisanId === artisan.id || selectedPinId === artisan.id

                    return (
                      <button
                        key={artisan.id}
                        onClick={() => setSelectedPinId(artisan.id)}
                        className="absolute flex flex-col items-center group z-10 focus:outline-none"
                        style={{ left: `${pinX}%`, top: `${pinY}%` }}
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Pulsing ring */}
                          {artisan.isAvailable && (
                            <span className="absolute w-12 h-12 rounded-full bg-orange/20 border border-orange/40 animate-ping opacity-60" />
                          )}
                          <img
                            src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={artisan.name}
                            className={`w-9 h-9 rounded-full object-cover border-2 shadow-card transition-transform duration-200
                              ${isHovered ? 'scale-115 border-orange ring-2 ring-orange/30' : 'border-white'}
                              ${!artisan.isAvailable ? 'grayscale border-slate opacity-60' : ''}`}
                          />
                        </div>
                        <span className="font-mono text-[9px] font-bold text-white bg-navy/90 px-1.5 py-0.5 rounded shadow mt-1 select-none">
                          {artisan.name.split(' ')[0]} ({artisan.rating}★)
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Map Compass */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 text-navy border border-border shadow-card flex items-center gap-1.5 font-mono text-[10px] font-bold">
                  <Compass className="animate-spin text-nxblue" size={14} style={{ animationDuration: '6s' }} />
                  <span>GPS Tracking Active</span>
                </div>

                {/* Switch back accessibility warning helper */}
                <button
                  onClick={() => setViewMode('list')}
                  className="absolute bottom-4 left-4 bg-white text-navy font-mono text-[11px] font-bold border border-border shadow-card px-3 py-1.5 rounded-btn hover:bg-lgray transition-colors focus:outline-none"
                >
                  Switch to list view
                </button>

                {/* Mini card popup on pin select */}
                {selectedPinArtisan && (
                  <div className="absolute bottom-4 right-4 max-w-xs bg-white rounded-card shadow-modal border border-border p-4 z-20 animate-fade-in">
                    <button 
                      onClick={() => setSelectedPinId(null)}
                      className="absolute top-2.5 right-2.5 p-0.5 hover:bg-lgray rounded-btn text-slate hover:text-navy focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex gap-3">
                      <img 
                        src={selectedPinArtisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={selectedPinArtisan.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="font-display font-bold text-[14px] text-navy">{selectedPinArtisan.name}</h4>
                        <p className="font-mono text-[10px] text-slate">{selectedPinArtisan.trade} · {selectedPinArtisan.area}</p>
                        <div className="mt-1">
                          <StarRating rating={selectedPinArtisan.rating} />
                        </div>
                        <p className="font-mono text-[12px] font-bold text-navy mt-1.5">
                          ₦{selectedPinArtisan.priceMin.toLocaleString()} – ₦{selectedPinArtisan.priceMax.toLocaleString()}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Link href={`/artisans/${selectedPinArtisan.slug}`} className="flex-1">
                            <Button variant="secondary" size="sm" className="w-full text-[11px] h-8 px-2 font-mono">Profile</Button>
                          </Link>
                          <Link href={`/book/${selectedPinArtisan.slug}`} className="flex-1">
                            <Button variant="primary" size="sm" className="w-full text-[11px] h-8 px-2" disabled={!selectedPinArtisan.isAvailable}>Book</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable list (Right 50%) */}
              <div className="w-full md:w-[420px] overflow-y-auto pr-1 flex flex-col gap-3">
                {filteredArtisans.length === 0 ? (
                  <p className="text-slate text-center py-10 font-body">No matching records.</p>
                ) : (
                  filteredArtisans.map((artisan) => (
                    <div
                      key={artisan.id}
                      onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                      onMouseLeave={() => setHoveredArtisanId(null)}
                      className={`transition-all duration-200 border-2 rounded-card
                        ${selectedPinId === artisan.id ? 'border-orange ring-2 ring-orange/20' : 'border-transparent'}`}
                    >
                      {/* Simple horizontal card mapping details */}
                      <ArtisanCard variant="horizontal" {...artisan} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FILTER BUTTON TRIGGER FOR MOBILE SCREEN */}
      <div className="tablet:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="bg-navy hover:bg-navy-light text-white font-display font-semibold text-[14px] px-5 py-3 rounded-full shadow-modal flex items-center gap-1.5 border border-white/10 active:scale-95 transition-transform"
        >
          <Filter size={16} />
          <span>Filters</span>
          {selectedCategory && (
            <span className="w-2 h-2 rounded-full bg-orange" />
          )}
        </button>
      </div>

      {/* MOBILE BOTTOM DRAWER PANEL */}
      {isFilterDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-navy/50 z-[100] tablet:hidden" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-modal shadow-modal z-[101] max-h-[85vh] overflow-y-auto p-6 flex flex-col animate-slide-up tablet:hidden">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-display font-bold text-[18px] text-navy">Filters</h3>
              <button 
                onClick={() => {
                  handleClearFilters()
                  setIsFilterDrawerOpen(false)
                }}
                className="font-mono text-[13px] text-nxblue font-bold"
              >
                Clear all
              </button>
            </div>

            {/* Mobile Category selectors */}
            <div className="py-4 border-b border-border">
              <h4 className="font-display font-semibold text-[13px] text-navy mb-2.5 uppercase tracking-wider">Category</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-full border text-[13px] font-display font-semibold transition-all
                      ${selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-teal text-white border-teal'
                        : 'bg-lgray border-border text-slate'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="py-4 border-b border-border">
              <h4 className="font-display font-semibold text-[13px] text-navy mb-2.5 uppercase tracking-wider">Availability</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setAvailability('any')}
                  className={`flex-1 px-4 py-2 border text-[13px] font-display rounded-btn text-center font-bold
                    ${availability === 'any' ? 'bg-navy text-white' : 'bg-white text-slate'}`}
                >
                  Any time
                </button>
                <button
                  onClick={() => setAvailability('now')}
                  className={`flex-1 px-4 py-2 border text-[13px] font-display rounded-btn text-center font-bold
                    ${availability === 'now' ? 'bg-teal text-white' : 'bg-white text-slate'}`}
                >
                  Available Now
                </button>
              </div>
            </div>

            {/* Price slider */}
            <div className="py-4 border-b border-border">
              <div className="flex justify-between mb-2">
                <h4 className="font-display font-semibold text-[13px] text-navy uppercase tracking-wider">Max Price</h4>
                <span className="font-mono text-[13px] font-bold text-navy">
                  ₦{priceMax.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value))}
                className="w-full accent-teal cursor-pointer"
              />
            </div>

            {/* Verified checkbox */}
            <div className="py-4 flex justify-between items-center">
              <span className="font-display font-semibold text-[13px] text-navy uppercase tracking-wider">ID Verified Only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => setVerifiedOnly(!verifiedOnly)}
                className="h-5 w-5 text-teal focus:ring-teal rounded-btn border-border cursor-pointer"
              />
            </div>

            <Button variant="primary" onClick={() => setIsFilterDrawerOpen(false)} className="w-full mt-4">
              Apply Filters
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-lgray flex items-center justify-center font-mono text-navy">Loading search results...</div>}>
      <SearchResultsPageContent />
    </Suspense>
  )
}
