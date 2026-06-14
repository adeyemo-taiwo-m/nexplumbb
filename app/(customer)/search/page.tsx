'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockDb, Artisan } from '@/lib/store/mockDb'
import ArtisanCard from '@/components/ui/ArtisanCard'
import Button from '@/components/ui/Button'
import StarRating from '@/components/ui/StarRating'
import { toast } from 'sonner'
import { 
  Filter, 
  Map as MapIcon, 
  List, 
  Search as SearchIcon, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Compass, 
  SlidersHorizontal,
  Star,
  AlertCircle
} from 'lucide-react'
import { LAGOS_LGAS } from '@/lib/validation'
import { formatNairaRange } from '@/lib/format'

// Distance calculator helper
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Custom Dual Range Slider
interface DualRangeSliderProps {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (minVal: number, maxVal: number) => void
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({ min, max, valueMin, valueMax, onChange }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), valueMax - 5000);
    onChange(val, valueMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), valueMin + 5000);
    onChange(valueMin, val);
  };

  return (
    <div className="relative w-full h-8 mt-6">
      {/* Background Track */}
      <div className="absolute inset-x-0 top-3 h-2 bg-lgray rounded-full" />
      {/* Highlighted range */}
      <div
        className="absolute top-3 h-2 bg-teal rounded-full"
        style={{
          left: `${((valueMin - min) / (max - min)) * 100}%`,
          right: `${100 - ((valueMax - min) / (max - min)) * 100}%`,
        }}
      />
      {/* Min Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={5000}
        value={valueMin}
        onChange={handleMinChange}
        className="absolute pointer-events-none appearance-none w-full bg-transparent top-0 h-8 focus:outline-none accent-teal 
          [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal 
          [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-teal"
        style={{ zIndex: valueMin > max - 10000 ? 5 : 3 }}
      />
      {/* Max Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={5000}
        value={valueMax}
        onChange={handleMaxChange}
        className="absolute pointer-events-none appearance-none w-full bg-transparent top-0 h-8 focus:outline-none accent-teal 
          [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal 
          [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-teal"
      />
    </div>
  );
};

function SearchResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const artisans = useMockDb((state) => state.artisans)

  // URL parameters state
  const q = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialLocation = searchParams.get('location') || 'Surulere, Lagos'
  const initialSort = searchParams.get('sort') || 'best_match'
  const initialView = searchParams.get('view') || 'list'

  // Geolocation customer coordinates (default Surulere)
  const customerCoords = { lat: 6.5022, lng: 3.3582 };

  // Local state variables for live search/filtering
  const [searchVal, setSearchVal] = useState(q)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? initialCategory.split(',') : []
  )
  const [minRating, setMinRating] = useState<number | null>(null)
  const [availability, setAvailability] = useState<'any' | 'today' | 'now'>('any')
  const [distanceRange, setDistanceRange] = useState<number>(20)
  const [priceMin, setPriceMin] = useState<number>(0)
  const [priceMax, setPriceMax] = useState<number>(100000)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [certification, setCertification] = useState<'any' | 'certified' | 'trade_tested'>('any')
  const [sortOption, setSortOption] = useState(initialSort)
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialView as 'list' | 'map')

  // Screen States
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(false)
  
  // UI states
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isFilterTabletOpen, setIsFilterTabletOpen] = useState(false)
  const [hoveredArtisanId, setHoveredArtisanId] = useState<string | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [mapPanned, setMapPanned] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    category: false,
    rating: false,
    availability: false,
    distance: false,
    price: false,
    verified: false,
    certification: false,
  })

  const trades = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling', 'Other']

  // Update input text when URL query changes
  useEffect(() => {
    setSearchVal(q)
  }, [q])

  // Simulate a live search API loading state when filters change
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [searchVal, selectedLocation, selectedCategories, minRating, availability, distanceRange, priceMin, priceMax, verifiedOnly, certification, sortOption])

  // live sync of sorting & view choices with URL without full page reload
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchVal) params.set('q', searchVal)
    if (selectedLocation) params.set('location', selectedLocation)
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
    if (sortOption !== 'best_match') params.set('sort', sortOption)
    if (viewMode !== 'list') params.set('view', viewMode)
    
    // Use window.history to avoid resetting filters
    const newUrl = `/search?${params.toString()}`
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl)
  }, [searchVal, selectedLocation, selectedCategories, sortOption, viewMode])

  // Collapsible toggle helper
  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }

  // Filter core logic
  const filteredArtisans = useMemo(() => {
    return artisans
      .filter((artisan) => {
        // 1. Text Query (Name, Bio, Skills, Trade)
        if (searchVal) {
          const term = searchVal.toLowerCase()
          const nameMatch = artisan.name.toLowerCase().includes(term)
          const bioMatch = artisan.bio.toLowerCase().includes(term)
          const skillsMatch = artisan.skills.some(s => s.toLowerCase().includes(term))
          const tradeMatch = artisan.trade.toLowerCase().includes(term)
          if (!nameMatch && !bioMatch && !skillsMatch && !tradeMatch) return false
        }

        // 2. Categories
        if (selectedCategories.length > 0) {
          const catMatch = selectedCategories.some(
            (cat) => artisan.trade.toLowerCase() === cat.toLowerCase()
          )
          if (!catMatch) return false
        }

        // 3. Location
        if (selectedLocation) {
          const lga = selectedLocation.split(',')[0].trim().toLowerCase()
          if (lga !== 'lagos') {
            const artisanArea = artisan.area.toLowerCase()
            if (!artisanArea.includes(lga) && !lga.includes(artisanArea)) return false
          }
        }

        // 4. Minimum Rating
        if (minRating) {
          if (artisan.rating < minRating) return false
        }

        // 5. Availability
        if (availability === 'now') {
          // Available now: must be online and active
          if (!artisan.isAvailable || !artisan.isOnline) return false
        } else if (availability === 'today') {
          // Available today: online/offline available
          if (!artisan.isAvailable) return false
        }

        // 6. Distance range
        const dist = calculateDistance(customerCoords.lat, customerCoords.lng, artisan.lat, artisan.lng)
        if (dist > distanceRange) return false

        // 7. Price range
        if (artisan.priceMin > priceMax || artisan.priceMax < priceMin) return false

        // 8. Verified Only
        if (verifiedOnly && !artisan.isVerified) return false

        // 9. Certification
        if (certification === 'certified') {
          if (!artisan.badges.includes('certified')) return false
        } else if (certification === 'trade_tested') {
          if (!artisan.badges.includes('trade_tested')) return false
        }

        return true
      })
      .sort((a, b) => {
        // Sort choices
        if (sortOption === 'highest_rated') return b.rating - a.rating
        if (sortOption === 'most_jobs') return b.jobCount - a.jobCount
        if (sortOption === 'lowest_price') return a.priceMin - b.priceMin
        if (sortOption === 'nearest') {
          const distA = calculateDistance(customerCoords.lat, customerCoords.lng, a.lat, a.lng)
          const distB = calculateDistance(customerCoords.lat, customerCoords.lng, b.lat, b.lng)
          return distA - distB
        }
        // best_match defaults: available first, then sort by rating
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1
        }
        return b.rating - a.rating
      })
  }, [artisans, searchVal, selectedLocation, selectedCategories, minRating, availability, distanceRange, priceMin, priceMax, verifiedOnly, certification, sortOption])

  // Clear filters
  const handleClearFilters = () => {
    setSearchVal('')
    setSelectedLocation('Lagos')
    setSelectedCategories([])
    setMinRating(null)
    setAvailability('any')
    setDistanceRange(20)
    setPriceMin(0)
    setPriceMax(100000)
    setVerifiedOnly(false)
    setCertification('any')
    setSortOption('best_match')
  }

  // Remove individual category
  const handleRemoveCategory = (cat: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== cat))
  }

  // Active filter chips list generator
  const activeChips = useMemo(() => {
    const chips = []
    
    // Categories
    selectedCategories.forEach(cat => {
      chips.push({ id: `cat-${cat}`, label: cat, onClear: () => handleRemoveCategory(cat) })
    })

    // Rating
    if (minRating) {
      chips.push({ id: 'rating', label: `${minRating}+ ★`, onClear: () => setMinRating(null) })
    }

    // Availability
    if (availability !== 'any') {
      chips.push({ 
        id: 'avail', 
        label: availability === 'now' ? 'Available now' : 'Available today', 
        onClear: () => setAvailability('any') 
      })
    }

    // Distance
    if (distanceRange < 20) {
      chips.push({ id: 'dist', label: `Within ${distanceRange}km`, onClear: () => setDistanceRange(20) })
    }

    // Price
    if (priceMin > 0 || priceMax < 100000) {
      chips.push({ 
        id: 'price', 
        label: `₦${(priceMin/1000).toFixed(0)}k - ₦${(priceMax/1000).toFixed(0)}k`, 
        onClear: () => {
          setPriceMin(0)
          setPriceMax(100000)
        } 
      })
    }

    // Verified
    if (verifiedOnly) {
      chips.push({ id: 'verified', label: 'ID Verified', onClear: () => setVerifiedOnly(false) })
    }

    // Certification
    if (certification !== 'any') {
      chips.push({ 
        id: 'cert', 
        label: certification === 'certified' ? 'Nexplumb Certified' : 'Trade Tested', 
        onClear: () => setCertification('any') 
      })
    }

    return chips
  }, [selectedCategories, minRating, availability, distanceRange, priceMin, priceMax, verifiedOnly, certification])

  const selectedPinArtisan = useMemo(() => {
    return artisans.find(a => a.id === selectedPinId)
  }, [artisans, selectedPinId])

  // Render collapsible chevron helper
  const renderChevron = (collapsed: boolean) => {
    return collapsed ? <ChevronDown size={16} className="text-slate" /> : <ChevronUp size={16} className="text-slate" />
  }

  // Sidebar Filter Form markup shared across Desktop / Tablet Drawer / Mobile Modal
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <h3 className="font-display font-bold text-[16px] text-navy">Filters</h3>
        <button 
          onClick={handleClearFilters}
          className="font-mono text-[12px] text-nxblue font-bold hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Applied Chips inside sidebar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 py-4 border-b border-border select-none">
          {activeChips.map(chip => (
            <span 
              key={chip.id} 
              className="bg-teal/10 text-teal rounded-full px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1"
            >
              <span>{chip.label}</span>
              <button onClick={chip.onClear} className="hover:text-red-500 font-bold ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter Groups */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* 1. Trade Categories Checkboxes */}
        <div className="py-4 border-b border-border">
          <button 
            type="button"
            onClick={() => toggleGroup('category')}
            className="flex items-center justify-between w-full font-display font-semibold text-[13px] text-navy uppercase tracking-wider mb-2"
          >
            <span>Category</span>
            {renderChevron(collapsedGroups.category)}
          </button>
          
          {!collapsedGroups.category && (
            <div className="flex flex-col gap-2 font-body text-[14px] mt-2 select-none">
              {trades.map((cat) => {
                const isChecked = selectedCategories.includes(cat)
                return (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedCategories(prev => prev.filter(c => c !== cat))
                        } else {
                          setSelectedCategories(prev => [...prev, cat])
                        }
                      }}
                      className="h-4 w-4 text-teal focus:ring-teal rounded-btn border-border cursor-pointer"
                    />
                    <span className={isChecked ? 'text-navy font-bold' : 'text-slate hover:text-navy'}>
                      {cat}
                    </span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* 2. Minimum Rating */}
        <div className="py-4 border-b border-border">
          <button 
            type="button"
            onClick={() => toggleGroup('rating')}
            className="flex items-center justify-between w-full font-display font-semibold text-[13px] text-navy uppercase tracking-wider mb-2"
          >
            <span>Rating</span>
            {renderChevron(collapsedGroups.rating)}
          </button>

          {!collapsedGroups.rating && (
            <div className="flex flex-col gap-2 mt-2 select-none">
              {[
                { stars: 3, label: '3+ stars' },
                { stars: 4, label: '4+ stars' },
                { stars: 5, label: '5 stars only' }
              ].map((r) => {
                const isSelected = minRating === r.stars
                return (
                  <button
                    key={r.stars}
                    type="button"
                    onClick={() => setMinRating(minRating === r.stars ? null : r.stars)}
                    className={`flex items-center justify-between px-3 py-2 rounded-btn border text-left transition-all w-full
                      ${isSelected 
                        ? 'border-orange bg-orange/5 text-orange font-bold font-mono' 
                        : 'border-border hover:border-slate text-slate font-mono hover:text-navy'
                      }`}
                  >
                    <div className="flex items-center gap-1 text-[13px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < r.stars 
                            ? (isSelected ? 'text-orange fill-orange' : 'text-amber fill-amber')
                            : 'text-border fill-border'} 
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold">{r.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. Availability */}
        <div className="py-4 border-b border-border">
          <button 
            type="button"
            onClick={() => toggleGroup('availability')}
            className="flex items-center justify-between w-full font-display font-semibold text-[13px] text-navy uppercase tracking-wider mb-2"
          >
            <span>Availability</span>
            {renderChevron(collapsedGroups.availability)}
          </button>

          {!collapsedGroups.availability && (
            <div className="flex flex-col gap-2 font-body text-[14px] mt-2 select-none">
              {[
                { value: 'any', label: 'Any time' },
                { value: 'today', label: 'Available today' },
                { value: 'now', label: 'Available now' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === opt.value}
                    onChange={() => setAvailability(opt.value as any)}
                    className="h-4 w-4 text-teal focus:ring-teal cursor-pointer"
                  />
                  <span className={availability === opt.value ? 'text-navy font-bold' : 'text-slate hover:text-navy'}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 4. Distance from me */}
        <div className="py-4 border-b border-border">
          <button 
            type="button"
            onClick={() => toggleGroup('distance')}
            className="flex items-center justify-between w-full font-display font-semibold text-[13px] text-navy uppercase tracking-wider mb-2"
          >
            <span>Distance from me</span>
            {renderChevron(collapsedGroups.distance)}
          </button>

          {!collapsedGroups.distance && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1.5 font-mono text-[12px] font-bold text-navy">
                <span>Within</span>
                <span className="bg-lgray px-2 py-0.5 rounded">{distanceRange} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={distanceRange}
                onChange={(e) => setDistanceRange(parseInt(e.target.value))}
                className="w-full accent-teal cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate mt-1">
                <span>1 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. Price range (Dual handle slider) */}
        <div className="py-4 border-b border-border">
          <button 
            type="button"
            onClick={() => toggleGroup('price')}
            className="flex items-center justify-between w-full font-display font-semibold text-[13px] text-navy uppercase tracking-wider mb-2"
          >
            <span>Price range</span>
            {renderChevron(collapsedGroups.price)}
          </button>

          {!collapsedGroups.price && (
            <div className="mt-2">
              <div className="flex justify-between items-center font-mono text-[11px] font-bold text-navy">
                <span>₦{priceMin.toLocaleString()}</span>
                <span>₦{priceMax.toLocaleString()}</span>
              </div>
              <DualRangeSlider
                min={0}
                max={100000}
                valueMin={priceMin}
                valueMax={priceMax}
                onChange={(minV, maxV) => {
                  setPriceMin(minV)
                  setPriceMax(maxV)
                }}
              />
            </div>
          )}
        </div>

        {/* 6. Verified only toggle */}
        <div className="py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-[13px] text-navy uppercase tracking-wider">
              Verified only
            </span>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                verifiedOnly ? 'bg-teal' : 'bg-slate/30'
              }`}
              aria-label="Toggle ID Verified Only"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-card transform duration-200 ${
                verifiedOnly ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* 7. Certification */}
        <div className="py-4 pb-12">
          <button 
            type="button"
            onClick={() => toggleGroup('certification')}
            className="flex items-center justify-between w-full font-display font-semibold text-[13px] text-navy uppercase tracking-wider mb-2"
          >
            <span>Certification</span>
            {renderChevron(collapsedGroups.certification)}
          </button>

          {!collapsedGroups.certification && (
            <div className="flex flex-col gap-2 font-body text-[14px] mt-2 select-none">
              {[
                { value: 'any', label: 'Any' },
                { value: 'certified', label: 'Nexplumb Certified' },
                { value: 'trade_tested', label: 'Trade Tested' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="certification"
                    checked={certification === opt.value}
                    onChange={() => setCertification(opt.value as any)}
                    className="h-4 w-4 text-teal focus:ring-teal cursor-pointer"
                  />
                  <span className={certification === opt.value ? 'text-navy font-bold' : 'text-slate hover:text-navy'}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )

  return (
    <div className="w-full flex-grow flex flex-col min-h-[calc(100vh-64px)] select-none">
      
      {/* Search Input and LGA Select Sticky Header Bar */}
      <section className="bg-white border-b border-border py-4 px-6 tablet:px-10 z-40 sticky top-16">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-3">
          
          {/* Text Input */}
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

          {/* LGA dropdown */}
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

          {/* API Error simulator toggle for testing */}
          <button 
            type="button"
            onClick={() => setApiError(!apiError)}
            className={`font-mono text-[10px] font-semibold border rounded px-3 py-1 text-center md:self-center cursor-pointer transition-colors
              ${apiError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-lgray border-border text-slate'}`}
          >
            {apiError ? "Simulating Error ✓" : "Simulate Error"}
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto flex flex-col tablet:flex-row relative">
        
        {/* Tablet Filter Drawer sliding from left */}
        {isFilterTabletOpen && (
          <>
            <div className="fixed inset-0 top-[138px] bg-navy/40 z-[45] hidden tablet:block desktop:hidden" onClick={() => setIsFilterTabletOpen(false)} />
            <div className="fixed left-0 top-[138px] bottom-0 w-[290px] bg-white border-r border-border p-6 z-[46] shadow-modal hidden tablet:block desktop:hidden animate-slide-in">
              {renderSidebarContent()}
              <button 
                onClick={() => setIsFilterTabletOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-lgray rounded"
              >
                <X size={18} />
              </button>
            </div>
          </>
        )}

        {/* === DESKTOP SIDEBAR FILTER PANEL === */}
        <aside className="hidden desktop:block w-[280px] flex-shrink-0 border-r border-border bg-white p-6 sticky top-[138px] h-[calc(100vh-138px)] overflow-y-auto">
          {renderSidebarContent()}
        </aside>

        {/* === RIGHT RESULTS CONTAINER === */}
        <main className="flex-grow p-4 tablet:p-6 flex flex-col min-w-0">
          
          {/* Simulated API Error Banner */}
          {apiError && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-card flex items-start justify-between gap-3 text-red-700">
              <div className="flex gap-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-[14px]">Search request failed</p>
                  <p className="font-body text-[13px] mt-0.5">Could not fetch updated artisan search results. Please check connection and try again.</p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setApiError(false)}>
                Retry
              </Button>
            </div>
          )}

          {/* Results Header Info & Toggles */}
          <div className="flex items-center justify-between mb-5 select-none">
            <div className="leading-tight flex items-center gap-3">
              {/* Tablet Filter Button */}
              <button
                onClick={() => setIsFilterTabletOpen(true)}
                className="hidden tablet:flex desktop:hidden items-center gap-1.5 px-3 py-2 border border-border rounded-[10px] text-navy font-display font-semibold text-[13px] hover:bg-lgray"
              >
                <Filter size={14} />
                <span>Filters</span>
                {activeChips.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange" />
                )}
              </button>

              <div className="text-left">
                <p className="font-display font-semibold text-[15px] text-navy">
                  Showing {filteredArtisans.length} {selectedCategories.length === 1 ? selectedCategories[0].toLowerCase() : 'artisan'}s
                </p>
                <p className="font-mono text-[11px] text-slate mt-0.5">
                  in {selectedLocation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Selector */}
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
                  <option value="nearest">Sort: Nearest</option>
                </select>
                <div className="absolute right-3 pointer-events-none text-slate group-hover:text-teal transition-colors">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* View switches */}
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
                  <span className="hidden sm:inline ml-1.5 font-display">List</span>
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
                  <span className="hidden sm:inline ml-1.5 font-display">Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Results Listing / Map */}
          {loading ? (
            /* Loading skeletons: 6 cards */
            <div className={`grid gap-4 ${viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-white rounded-card border border-border/60 animate-pulse shadow-sm h-36">
                  <div className="w-16 h-16 rounded-xl bg-border/40 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-border/40 rounded w-1/3" />
                    <div className="h-3 bg-border/40 rounded w-2/3" />
                    <div className="h-3 bg-border/40 rounded w-1/2" />
                  </div>
                  <div className="w-32 bg-border/40 rounded shrink-0 hidden md:block" />
                </div>
              ))}
            </div>
          ) : filteredArtisans.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-border rounded-card p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-card">
              <div className="w-16 h-16 bg-lgray rounded-full flex items-center justify-center text-slate mb-4">
                <SlidersHorizontal size={32} />
              </div>
              <h3 className="font-display font-bold text-[18px] text-navy">
                No artisans found in this area
              </h3>
              <p className="font-body text-[14px] text-slate mt-1 max-w-xs leading-normal">
                Try expanding your search parameters or clearing filters.
              </p>
              
              {/* Distance range slider helper inside empty state */}
              <div className="mt-6 w-full max-w-xs p-4 bg-lgray/30 border border-border rounded-btn text-left">
                <div className="flex justify-between items-center mb-1 font-mono text-[11px] font-bold text-navy">
                  <span>Distance threshold</span>
                  <span className="bg-white px-2 py-0.5 rounded border">{distanceRange} km</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={distanceRange}
                  onChange={(e) => setDistanceRange(parseInt(e.target.value))}
                  className="w-full accent-teal cursor-pointer"
                />
              </div>

              <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-5">
                Clear all filters
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="flex flex-col gap-3">
              {filteredArtisans.map((artisan) => (
                <div 
                  key={artisan.id}
                  onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                  onMouseLeave={() => setHoveredArtisanId(null)}
                >
                  <ArtisanCard variant="horizontal" {...artisan} />
                </div>
              ))}
            </div>
          ) : (
            /* MAP VIEW (50/50 Split Layout) */
            <div className="flex-grow flex flex-col md:flex-row gap-4 h-[calc(100vh-230px)]">
              
              {/* Map Canvas (Left 50%) */}
              <div className="flex-1 bg-lgray border border-border rounded-card relative overflow-hidden flex flex-col items-center justify-center select-none shadow-card">
                
                {/* SVG Mock Map Grid */}
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2E86AB_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Grid Lines */}
                  <svg className="w-full h-full stroke-gray-200 stroke-1" fill="none">
                    <line x1="15%" y1="0" x2="15%" y2="100%" />
                    <line x1="35%" y1="0" x2="35%" y2="100%" />
                    <line x1="55%" y1="0" x2="55%" y2="100%" />
                    <line x1="75%" y1="0" x2="75%" y2="100%" />
                    <line x1="95%" y1="0" x2="95%" y2="100%" />
                    <line x1="0" y1="15%" x2="100%" y2="15%" />
                    <line x1="0" y1="35%" x2="100%" y2="35%" />
                    <line x1="0" y1="55%" x2="100%" y2="55%" />
                    <line x1="0" y1="75%" x2="100%" y2="75%" />
                    
                    {/* Simulated Lagos streets overlay */}
                    <path d="M50 80 Q 200 130 350 180 T 500 320" stroke="#E5E8EC" strokeWidth="8" />
                    <path d="M10 280 L 480 30" stroke="#E5E8EC" strokeWidth="6" />
                    <path d="M250 10 L 250 500" stroke="#E5E8EC" strokeWidth="6" />
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

                  {/* Artisan pins */}
                  {filteredArtisans.map((artisan, index) => {
                    const pinX = 15 + (index * 19) % 75 
                    const pinY = 20 + (index * 27) % 65
                    const isHovered = hoveredArtisanId === artisan.id || selectedPinId === artisan.id

                    return (
                      <button
                        key={artisan.id}
                        onClick={() => setSelectedPinId(artisan.id)}
                        onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                        onMouseLeave={() => setHoveredArtisanId(null)}
                        className="absolute flex flex-col items-center group z-10 focus:outline-none"
                        style={{ left: `${pinX}%`, top: `${pinY}%` }}
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Pulsing ring for available artisans */}
                          {artisan.isAvailable && (
                            <span className="absolute w-12 h-12 rounded-full bg-orange/25 border border-orange/40 animate-ping opacity-60" />
                          )}
                          
                          {/* Solid orange / gray border container */}
                          <div className={`p-[2.5px] rounded-full shadow-card transition-all duration-200
                            ${artisan.isAvailable 
                              ? 'bg-orange' 
                              : 'bg-slate opacity-50'}
                            ${isHovered ? 'scale-120 ring-4 ring-orange/30' : ''}`}
                          >
                            <img
                              src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={artisan.name}
                              className="w-8 h-8 rounded-full object-cover bg-white"
                            />
                          </div>
                        </div>
                        <span className="font-mono text-[9px] font-bold text-white bg-navy/90 px-1.5 py-0.5 rounded shadow mt-1 select-none">
                          {artisan.name.split(' ')[0]} ({artisan.rating}★)
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Simulated Map Bounds search trigger */}
                {mapPanned && (
                  <button
                    onClick={() => {
                      setMapPanned(false)
                      toast.success("Artisans in this map viewport re-fetched successfully!")
                    }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-teal text-white font-mono text-[11px] font-bold px-4 py-2 rounded-full shadow-modal border border-teal-light focus:outline-none hover:bg-teal-light transition-colors"
                  >
                    Search this area
                  </button>
                )}

                {/* Trigger map pan on click simulation */}
                <div 
                  className="absolute inset-0 bg-transparent cursor-grab active:cursor-grabbing" 
                  onClick={() => setMapPanned(true)}
                  title="Click/drag to simulate map panning"
                />

                {/* Compass HUD */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-full p-2 text-navy border border-border shadow-card flex items-center gap-1.5 font-mono text-[10px] font-bold pointer-events-none">
                  <Compass className="animate-spin text-nxblue" size={14} style={{ animationDuration: '6s' }} />
                  <span>GPS Map Interface</span>
                </div>

                {/* Switch back accessibility button */}
                <button
                  onClick={() => setViewMode('list')}
                  className="absolute bottom-4 left-4 bg-white hover:bg-lgray text-navy font-mono text-[11px] font-bold border border-border shadow-card px-3 py-2 rounded-btn focus:outline-none transition-colors z-25"
                >
                  Switch to list view
                </button>

                {/* Floating tooltip above selected pin */}
                {selectedPinArtisan && (
                  <div className="absolute bottom-4 right-4 w-72 bg-white rounded-card shadow-modal border border-border p-4 z-30 animate-fade-in">
                    <button 
                      onClick={() => setSelectedPinId(null)}
                      className="absolute top-2 right-2 p-1 hover:bg-lgray rounded-btn text-slate hover:text-navy focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex gap-3 text-left">
                      <img 
                        src={selectedPinArtisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={selectedPinArtisan.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-[14px] text-navy">{selectedPinArtisan.name}</h4>
                        <p className="font-mono text-[10px] text-slate">{selectedPinArtisan.trade} · {selectedPinArtisan.area}</p>
                        
                        <div className="flex items-center gap-1 mt-1 text-amber select-none">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < Math.round(selectedPinArtisan.rating) ? 'fill-current' : 'text-border'} />
                          ))}
                          <span className="font-mono text-[11px] text-navy font-bold ml-1">{selectedPinArtisan.rating}</span>
                        </div>
                        
                        <p className="font-mono text-[12px] font-bold text-navy mt-1.5">
                          {formatNairaRange(selectedPinArtisan.priceMin, selectedPinArtisan.priceMax)}
                        </p>
                        <div className="mt-3.5 flex gap-2">
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
                {filteredArtisans.map((artisan) => (
                  <div
                    key={artisan.id}
                    onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                    onMouseLeave={() => setHoveredArtisanId(null)}
                    className={`transition-all duration-200 border-2 rounded-card
                      ${selectedPinId === artisan.id ? 'border-orange ring-2 ring-orange/25' : 'border-transparent'}`}
                  >
                    <ArtisanCard variant="horizontal" {...artisan} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM STICKY TRIGGER FOR FILTERS */}
      <div className="tablet:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="bg-navy hover:bg-navy-light text-white font-display font-semibold text-[14px] px-5 py-3 rounded-full shadow-modal flex items-center gap-1.5 border border-white/10 active:scale-95 transition-transform"
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeChips.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-orange" />
          )}
        </button>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET MODAL */}
      {isFilterDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-navy/50 z-[100] tablet:hidden" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-modal shadow-modal z-[101] max-h-[85vh] overflow-y-auto p-6 flex flex-col animate-slide-up tablet:hidden">
            {renderSidebarContent()}
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
