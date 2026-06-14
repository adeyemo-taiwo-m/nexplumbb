'use client'

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react'
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
  AlertCircle,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { LAGOS_LGAS } from '@/lib/validation'
import { formatNairaRange } from '@/lib/format'

/* ─── Distance helper ─── */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ─── Dual-handle price slider ─── */
const DualRangeSlider: React.FC<{
  min: number; max: number; valueMin: number; valueMax: number
  onChange: (min: number, max: number) => void
}> = ({ min, max, valueMin, valueMax, onChange }) => (
  <div className="relative w-full h-8 mt-5">
    <div className="absolute inset-x-0 top-3 h-2 bg-border/60 rounded-full" />
    <div
      className="absolute top-3 h-2 bg-gradient-to-r from-teal to-teal/70 rounded-full"
      style={{ left: `${((valueMin - min) / (max - min)) * 100}%`, right: `${100 - ((valueMax - min) / (max - min)) * 100}%` }}
    />
    <input type="range" min={min} max={max} step={5000} value={valueMin}
      onChange={(e) => onChange(Math.min(+e.target.value, valueMax - 5000), valueMax)}
      className="absolute pointer-events-none appearance-none w-full bg-transparent top-0 h-8 focus:outline-none
        [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal
        [&::-webkit-slider-thumb]:shadow-card [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
      style={{ zIndex: valueMin > max - 10000 ? 5 : 3 }}
    />
    <input type="range" min={min} max={max} step={5000} value={valueMax}
      onChange={(e) => onChange(valueMin, Math.max(+e.target.value, valueMin + 5000))}
      className="absolute pointer-events-none appearance-none w-full bg-transparent top-0 h-8 focus:outline-none
        [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal
        [&::-webkit-slider-thumb]:shadow-card [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
    />
  </div>
)

/* ─── Toggle Switch ─── */
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none flex-shrink-0 ${value ? 'bg-teal shadow-[0_0_12px_rgba(42,157,143,0.4)]' : 'bg-slate/25'}`}
      aria-label="Toggle"
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-card transform transition-all duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  )
}

/* ─── Filter group section ─── */
function FilterGroup({ label, collapsed, onToggle, children }: {
  label: string; collapsed: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="py-4 border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full group"
      >
        <span className="font-display font-bold text-[11px] text-slate group-hover:text-navy uppercase tracking-widest transition-colors">
          {label}
        </span>
        {collapsed
          ? <ChevronDown size={14} className="text-slate group-hover:text-navy transition-colors" />
          : <ChevronUp size={14} className="text-slate group-hover:text-navy transition-colors" />
        }
      </button>
      {!collapsed && <div className="mt-3">{children}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────── */
function SearchResultsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const artisans = useMockDb((state) => state.artisans)

  // URL params
  const q = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialLocation = searchParams.get('location') || 'Surulere, Lagos'
  const initialSort = searchParams.get('sort') || 'best_match'
  const initialView = searchParams.get('view') || 'list'

  const customerCoords = { lat: 6.5022, lng: 3.3582 }

  // Filter state
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

  // UI
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isFilterTabletOpen, setIsFilterTabletOpen] = useState(false)
  const [hoveredArtisanId, setHoveredArtisanId] = useState<string | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [mapPanned, setMapPanned] = useState(false)
  const [collapsed, setCollapsed] = useState({
    category: false, rating: false, availability: false,
    distance: false, price: false, verified: false, certification: false,
  })

  const trades = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling', 'Other']

  // Sync URL params on filter change
  useEffect(() => { setSearchVal(q) }, [q])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(t)
  }, [searchVal, selectedLocation, selectedCategories, minRating, availability, distanceRange, priceMin, priceMax, verifiedOnly, certification, sortOption])

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchVal) params.set('q', searchVal)
    if (selectedLocation) params.set('location', selectedLocation)
    if (selectedCategories.length) params.set('category', selectedCategories.join(','))
    if (sortOption !== 'best_match') params.set('sort', sortOption)
    if (viewMode !== 'list') params.set('view', viewMode)
    window.history.replaceState({}, '', `/search?${params}`)
  }, [searchVal, selectedLocation, selectedCategories, sortOption, viewMode])

  const toggle = (group: keyof typeof collapsed) =>
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }))

  // ── Filter logic ──
  const filteredArtisans = useMemo(() => {
    return artisans
      .filter((a) => {
        if (searchVal) {
          const t = searchVal.toLowerCase()
          if (!a.name.toLowerCase().includes(t) && !a.bio.toLowerCase().includes(t) && !a.skills.some(s => s.toLowerCase().includes(t)) && !a.trade.toLowerCase().includes(t)) return false
        }
        if (selectedCategories.length && !selectedCategories.some(c => a.trade.toLowerCase() === c.toLowerCase())) return false
        if (selectedLocation) {
          const lga = selectedLocation.split(',')[0].trim().toLowerCase()
          if (lga !== 'lagos' && !a.area.toLowerCase().includes(lga) && !lga.includes(a.area.toLowerCase())) return false
        }
        if (minRating && a.rating < minRating) return false
        if (availability === 'now' && (!a.isAvailable || !a.isOnline)) return false
        if (availability === 'today' && !a.isAvailable) return false
        const dist = calculateDistance(customerCoords.lat, customerCoords.lng, a.lat, a.lng)
        if (dist > distanceRange) return false
        if (a.priceMin > priceMax || a.priceMax < priceMin) return false
        if (verifiedOnly && !a.isVerified) return false
        if (certification === 'certified' && !a.badges.includes('certified')) return false
        if (certification === 'trade_tested' && !a.badges.includes('trade_tested')) return false
        return true
      })
      .sort((a, b) => {
        if (sortOption === 'highest_rated') return b.rating - a.rating
        if (sortOption === 'most_jobs') return b.jobCount - a.jobCount
        if (sortOption === 'lowest_price') return a.priceMin - b.priceMin
        if (sortOption === 'nearest') return calculateDistance(customerCoords.lat, customerCoords.lng, a.lat, a.lng) - calculateDistance(customerCoords.lat, customerCoords.lng, b.lat, b.lng)
        return a.isAvailable === b.isAvailable ? b.rating - a.rating : a.isAvailable ? -1 : 1
      })
  }, [artisans, searchVal, selectedLocation, selectedCategories, minRating, availability, distanceRange, priceMin, priceMax, verifiedOnly, certification, sortOption])

  const handleClearFilters = () => {
    setSearchVal(''); setSelectedLocation('Lagos'); setSelectedCategories([])
    setMinRating(null); setAvailability('any'); setDistanceRange(20)
    setPriceMin(0); setPriceMax(100000); setVerifiedOnly(false); setCertification('any')
    setSortOption('best_match')
  }

  // ── Active chips ──
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onClear: () => void }[] = []
    selectedCategories.forEach(c => chips.push({ id: `cat-${c}`, label: c, onClear: () => setSelectedCategories(p => p.filter(x => x !== c)) }))
    if (minRating) chips.push({ id: 'rating', label: `${minRating}+ ★`, onClear: () => setMinRating(null) })
    if (availability !== 'any') chips.push({ id: 'avail', label: availability === 'now' ? 'Available now' : 'Available today', onClear: () => setAvailability('any') })
    if (distanceRange < 20) chips.push({ id: 'dist', label: `Within ${distanceRange}km`, onClear: () => setDistanceRange(20) })
    if (priceMin > 0 || priceMax < 100000) chips.push({ id: 'price', label: `₦${(priceMin / 1000).toFixed(0)}k–₦${(priceMax / 1000).toFixed(0)}k`, onClear: () => { setPriceMin(0); setPriceMax(100000) } })
    if (verifiedOnly) chips.push({ id: 'ver', label: 'ID Verified', onClear: () => setVerifiedOnly(false) })
    if (certification !== 'any') chips.push({ id: 'cert', label: certification === 'certified' ? 'NX Certified' : 'Trade Tested', onClear: () => setCertification('any') })
    return chips
  }, [selectedCategories, minRating, availability, distanceRange, priceMin, priceMax, verifiedOnly, certification])

  const selectedPinArtisan = useMemo(() => artisans.find(a => a.id === selectedPinId), [artisans, selectedPinId])

  // ── Sidebar content ──
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border/60 mb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-[15px] text-navy">Filters</h3>
          {activeChips.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] font-bold flex items-center justify-center">
              {activeChips.length}
            </span>
          )}
        </div>
        <button onClick={handleClearFilters} className="font-mono text-[11px] text-nxblue font-bold hover:underline">
          Clear all
        </button>
      </div>

      {/* Active chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-border/60 mb-1">
          {activeChips.map(chip => (
            <span key={chip.id} className="bg-teal/10 text-teal rounded-full px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1 border border-teal/20">
              {chip.label}
              <button onClick={chip.onClear} className="hover:text-red-500 ml-0.5 transition-colors">
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* 1. Category */}
        <FilterGroup label="Category" collapsed={collapsed.category} onToggle={() => toggle('category')}>
          <div className="flex flex-col gap-2">
            {trades.map(cat => {
              const checked = selectedCategories.includes(cat)
              return (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setSelectedCategories(p => checked ? p.filter(c => c !== cat) : [...p, cat])}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${checked ? 'bg-teal border-teal' : 'border-border group-hover:border-teal/50'}`}
                  >
                    {checked && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className={`text-[13px] font-body transition-colors ${checked ? 'text-navy font-bold' : 'text-slate group-hover:text-navy'}`}>{cat}</span>
                </label>
              )
            })}
          </div>
        </FilterGroup>

        {/* 2. Rating */}
        <FilterGroup label="Rating" collapsed={collapsed.rating} onToggle={() => toggle('rating')}>
          <div className="flex flex-col gap-2">
            {[{ stars: 3, label: '3+ stars' }, { stars: 4, label: '4+ stars' }, { stars: 5, label: '5 stars only' }].map(r => {
              const sel = minRating === r.stars
              return (
                <button
                  key={r.stars}
                  onClick={() => setMinRating(minRating === r.stars ? null : r.stars)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all w-full ${sel ? 'border-orange bg-orange/5 shadow-sm' : 'border-border hover:border-orange/30 hover:bg-orange/2'}`}
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={12} className={i <= r.stars ? (sel ? 'fill-orange text-orange' : 'fill-amber text-amber') : 'text-border fill-border'} />
                    ))}
                  </div>
                  <span className={`text-[11px] font-mono font-bold ${sel ? 'text-orange' : 'text-slate'}`}>{r.label}</span>
                </button>
              )
            })}
          </div>
        </FilterGroup>

        {/* 3. Availability */}
        <FilterGroup label="Availability" collapsed={collapsed.availability} onToggle={() => toggle('availability')}>
          <div className="flex flex-col gap-2">
            {[{ value: 'any', label: 'Any time', icon: null }, { value: 'today', label: 'Available today', icon: null }, { value: 'now', label: 'Available now', icon: Zap }].map(opt => {
              const sel = availability === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => setAvailability(opt.value as any)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all w-full ${sel ? 'border-teal bg-teal/5 shadow-sm' : 'border-border hover:border-teal/30'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'border-teal bg-teal' : 'border-border'}`}>
                    {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {Icon && <Icon size={13} className="text-teal flex-shrink-0" />}
                  <span className={`text-[13px] font-body ${sel ? 'text-navy font-bold' : 'text-slate'}`}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </FilterGroup>

        {/* 4. Distance */}
        <FilterGroup label="Distance from me" collapsed={collapsed.distance} onToggle={() => toggle('distance')}>
          <div>
            <div className="flex justify-between items-center font-mono text-[12px]">
              <span className="text-slate">Within</span>
              <span className="font-bold text-navy bg-lgray px-2 py-0.5 rounded-lg">{distanceRange} km</span>
            </div>
            <input
              type="range" min={1} max={20} step={1} value={distanceRange}
              onChange={(e) => setDistanceRange(+e.target.value)}
              className="w-full accent-teal cursor-pointer mt-3"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate mt-1">
              <span>1 km</span><span>10 km</span><span>20 km</span>
            </div>
          </div>
        </FilterGroup>

        {/* 5. Price */}
        <FilterGroup label="Price range" collapsed={collapsed.price} onToggle={() => toggle('price')}>
          <div>
            <div className="flex justify-between font-mono text-[12px] font-bold">
              <span className="text-teal">₦{priceMin.toLocaleString()}</span>
              <span className="text-teal">₦{priceMax.toLocaleString()}</span>
            </div>
            <DualRangeSlider min={0} max={100000} valueMin={priceMin} valueMax={priceMax} onChange={(a, b) => { setPriceMin(a); setPriceMax(b) }} />
          </div>
        </FilterGroup>

        {/* 6. Verified only */}
        <FilterGroup label="Verified only" collapsed={collapsed.verified} onToggle={() => toggle('verified')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-body text-navy">NIN-Verified artisans</p>
              <p className="text-[11px] font-mono text-slate mt-0.5">Government-ID checked</p>
            </div>
            <Toggle value={verifiedOnly} onChange={() => setVerifiedOnly(!verifiedOnly)} />
          </div>
        </FilterGroup>

        {/* 7. Certification */}
        <FilterGroup label="Certification" collapsed={collapsed.certification} onToggle={() => toggle('certification')}>
          <div className="flex flex-col gap-2">
            {[{ value: 'any', label: 'Any' }, { value: 'certified', label: 'Nexplumb Certified' }, { value: 'trade_tested', label: 'Trade Tested' }].map(opt => {
              const sel = certification === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setCertification(opt.value as any)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all w-full ${sel ? 'border-nxblue bg-nxblue/5 shadow-sm' : 'border-border hover:border-nxblue/30'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'border-nxblue bg-nxblue' : 'border-border'}`}>
                    {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-[13px] font-body ${sel ? 'text-navy font-bold' : 'text-slate'}`}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </FilterGroup>
      </div>
    </div>
  )

  return (
    <div className="w-full flex-grow flex flex-col min-h-[calc(100vh-64px)] bg-lgray/30">

      {/* ── Sticky Search Header Bar ── */}
      <div className="bg-white border-b border-border sticky top-16 z-40 shadow-[0_2px_12px_rgba(13,33,55,0.06)]">
        <div className="max-w-[1280px] mx-auto px-4 tablet:px-6 py-3">
          <div className="flex flex-col md:flex-row gap-2.5">

            {/* Search input */}
            <div className="flex-1 flex items-center gap-2 bg-lgray/50 border border-border rounded-xl px-3.5 h-11 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/15 focus-within:bg-white transition-all">
              <SearchIcon size={17} className="text-slate flex-shrink-0" />
              <input
                type="text"
                placeholder="Search: plumber, socket repair, door fix…"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent border-0 py-0 font-body text-[14px] text-navy focus:outline-none placeholder:text-slate/60"
              />
              {searchVal && (
                <button onClick={() => setSearchVal('')} className="text-slate hover:text-navy transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Location dropdown */}
            <div className="w-full md:w-52 flex items-center gap-2 bg-lgray/50 border border-border rounded-xl px-3.5 h-11 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/15 transition-all">
              <MapPin size={17} className="text-orange flex-shrink-0" />
              <select
                value={selectedLocation.split(',')[0]}
                onChange={(e) => setSelectedLocation(e.target.value === 'Lagos' ? 'Lagos' : `${e.target.value}, Lagos`)}
                className="w-full bg-transparent border-0 py-0 font-body text-[13px] text-navy focus:outline-none cursor-pointer appearance-none"
              >
                <option value="Lagos">All Lagos</option>
                {LAGOS_LGAS.map(lga => <option key={lga} value={lga}>{lga}</option>)}
              </select>
            </div>

            {/* Error toggle (dev only) */}
            <button
              onClick={() => setApiError(!apiError)}
              className={`hidden md:flex items-center gap-1.5 font-mono text-[10px] font-bold border rounded-xl px-3 h-11 transition-colors ${apiError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-lgray border-border text-slate hover:text-navy'}`}
            >
              {apiError ? '⚠ Error on' : 'Simulate error'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex max-w-[1280px] mx-auto w-full">

        {/* Tablet Drawer */}
        {isFilterTabletOpen && (
          <>
            <div className="fixed inset-0 top-[112px] bg-navy/30 backdrop-blur-[2px] z-[45] hidden tablet:block desktop:hidden" onClick={() => setIsFilterTabletOpen(false)} />
            <div className="fixed left-0 top-[112px] bottom-0 w-[300px] bg-white border-r border-border p-5 z-[46] shadow-modal hidden tablet:flex desktop:hidden flex-col animate-slide-in overflow-y-auto">
              <button onClick={() => setIsFilterTabletOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-lgray rounded-lg text-slate hover:text-navy transition-colors">
                <X size={16} />
              </button>
              <SidebarContent />
            </div>
          </>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden desktop:flex w-[280px] flex-shrink-0 border-r border-border bg-white p-5 sticky top-[112px] h-[calc(100vh-112px)] overflow-y-auto flex-col">
          <SidebarContent />
        </aside>

        {/* ── Results Area ── */}
        <main className="flex-1 min-w-0 p-4 tablet:p-5 flex flex-col">

          {/* Error banner */}
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-700 animate-fade-in">
              <div className="flex gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-[13px]">Search request failed</p>
                  <p className="font-body text-[12px] mt-0.5 text-red-600">Could not fetch search results. Check connection and retry.</p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setApiError(false)}>Retry</Button>
            </div>
          )}

          {/* Results header: count + sort + view toggle */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Tablet filter button */}
              <button
                onClick={() => setIsFilterTabletOpen(true)}
                className="hidden tablet:flex desktop:hidden items-center gap-1.5 px-3.5 py-2 bg-white border border-border rounded-xl text-navy font-display font-semibold text-[13px] hover:border-teal hover:shadow-sm transition-all"
              >
                <Filter size={14} />
                Filters
                {activeChips.length > 0 && <span className="w-4 h-4 rounded-full bg-orange text-white text-[9px] font-bold flex items-center justify-center">{activeChips.length}</span>}
              </button>

              <div>
                <p className="font-display font-bold text-[15px] text-navy">
                  {loading ? (
                    <span className="inline-block w-24 h-4 bg-border/60 rounded animate-pulse" />
                  ) : (
                    <>
                      {filteredArtisans.length}{' '}
                      <span className="text-teal">{selectedCategories.length === 1 ? selectedCategories[0].toLowerCase() : 'artisan'}{filteredArtisans.length !== 1 ? 's' : ''}</span>
                      {' '}found
                    </>
                  )}
                </p>
                <p className="font-mono text-[11px] text-slate mt-0.5">in {selectedLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative flex items-center bg-white border border-border rounded-xl h-10 hover:border-teal/40 transition-all shadow-sm group">
                <SlidersHorizontal size={13} className="absolute left-3 text-slate group-hover:text-teal transition-colors pointer-events-none" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent border-0 pl-8 pr-6 h-full font-mono text-[11px] font-bold text-navy focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="best_match">Best Match</option>
                  <option value="highest_rated">Top Rated</option>
                  <option value="most_jobs">Most Jobs</option>
                  <option value="lowest_price">Lowest Price</option>
                  <option value="nearest">Nearest</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 text-slate pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex bg-white border border-border rounded-xl p-0.5 h-10 shadow-sm">
                {(['list', 'map'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1.5 px-3 rounded-[10px] font-mono text-[11px] font-bold transition-all ${viewMode === mode ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
                  >
                    {mode === 'list' ? <List size={14} /> : <MapIcon size={14} />}
                    <span className="hidden sm:inline">{mode === 'list' ? 'List' : 'Map'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active chips (above results, visible on mobile/tablet) */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 desktop:hidden">
              {activeChips.map(chip => (
                <span key={chip.id} className="bg-teal/10 text-teal rounded-full px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1 border border-teal/20">
                  {chip.label}
                  <button onClick={chip.onClear}><X size={9} /></button>
                </span>
              ))}
            </div>
          )}

          {/* ── Content ── */}
          {loading ? (
            /* Skeleton */
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-5 bg-white rounded-xl border border-border/60 animate-pulse shadow-sm h-[120px]">
                  <div className="w-16 h-16 rounded-xl bg-border/40 shrink-0 self-center" />
                  <div className="flex-1 space-y-2.5 self-center">
                    <div className="h-3.5 bg-border/40 rounded-lg w-1/3" />
                    <div className="h-3 bg-border/40 rounded-lg w-2/3" />
                    <div className="h-3 bg-border/40 rounded-lg w-1/2" />
                  </div>
                  <div className="w-28 h-10 bg-border/40 rounded-xl shrink-0 hidden md:block self-center" />
                </div>
              ))}
            </div>

          ) : filteredArtisans.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-border rounded-xl p-12 text-center flex flex-col items-center shadow-sm">
              <div className="w-20 h-20 bg-lgray rounded-2xl flex items-center justify-center text-slate mb-5">
                <SlidersHorizontal size={36} className="text-border" />
              </div>
              <h3 className="font-display font-bold text-[18px] text-navy">No artisans found</h3>
              <p className="font-body text-[14px] text-slate mt-2 max-w-xs leading-relaxed">
                Try expanding your distance or clearing some filters to see more results.
              </p>
              <div className="mt-8 w-full max-w-xs">
                <div className="flex justify-between font-mono text-[11px] text-navy font-bold mb-1.5">
                  <span>Expand distance</span>
                  <span className="bg-lgray px-2 rounded">{distanceRange} km</span>
                </div>
                <input
                  type="range" min={1} max={20} value={distanceRange}
                  onChange={(e) => setDistanceRange(+e.target.value)}
                  className="w-full accent-teal cursor-pointer"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-6">
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
                  className={`transition-all duration-200 ${!artisan.isAvailable ? 'opacity-60' : ''}`}
                >
                  <ArtisanCard variant="horizontal" {...artisan} />
                </div>
              ))}
            </div>

          ) : (
            /* MAP VIEW */
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-220px)] min-h-[500px]">

              {/* Map Canvas */}
              <div className="flex-1 bg-white border border-border rounded-xl relative overflow-hidden shadow-card">
                {/* Mock map grid */}
                <div className="absolute inset-0 bg-[#f0f4f8]">
                  <div className="absolute inset-0 opacity-30 bg-[linear-gradient(#d8e4f0_1px,transparent_1px),linear-gradient(90deg,#d8e4f0_1px,transparent_1px)] [background-size:40px_40px]" />
                  {/* "Road" lines */}
                  <svg className="absolute inset-0 w-full h-full" fill="none">
                    <path d="M0 45% Q 30% 40% 60% 55% T 100% 45%" stroke="#c5d5e4" strokeWidth="12" />
                    <path d="M40% 0 L 40% 100%" stroke="#c5d5e4" strokeWidth="8" />
                    <path d="M0 70% L 100% 20%" stroke="#c5d5e4" strokeWidth="6" />
                    <path d="M0 30% Q 50% 25% 100% 60%" stroke="#c5d5e4" strokeWidth="4" />
                  </svg>

                  {/* Customer pin */}
                  <div className="absolute top-[42%] left-[38%] flex flex-col items-center z-10">
                    <div className="w-8 h-8 rounded-full bg-nxblue border-2 border-white shadow-modal flex items-center justify-center text-white text-[14px]">🏠</div>
                    <span className="font-mono text-[9px] font-bold text-navy bg-white/95 px-1.5 py-0.5 rounded-lg shadow mt-1">You</span>
                  </div>

                  {/* Artisan pins */}
                  {filteredArtisans.map((artisan, idx) => {
                    const px = 8 + (idx * 17) % 78
                    const py = 8 + (idx * 23) % 72
                    const isHov = hoveredArtisanId === artisan.id || selectedPinId === artisan.id
                    return (
                      <button
                        key={artisan.id}
                        onClick={() => setSelectedPinId(artisan.id === selectedPinId ? null : artisan.id)}
                        onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                        onMouseLeave={() => setHoveredArtisanId(null)}
                        className="absolute flex flex-col items-center z-10 focus:outline-none transition-transform duration-200"
                        style={{ left: `${px}%`, top: `${py}%`, transform: isHov ? 'scale(1.2)' : 'scale(1)' }}
                      >
                        <div className="relative">
                          {artisan.isAvailable && (
                            <span className="absolute -inset-1.5 rounded-full bg-orange/20 animate-ping" />
                          )}
                          <div className={`p-[2px] rounded-full shadow-card border-2 transition-all ${artisan.isAvailable ? 'border-orange' : 'border-slate/40'} ${!artisan.isAvailable ? 'opacity-50' : ''} ${isHov ? 'ring-2 ring-orange/40' : ''}`}>
                            <img
                              src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                              alt={artisan.name}
                              className="w-8 h-8 rounded-full object-cover bg-white"
                            />
                          </div>
                        </div>
                        <span className="font-mono text-[8px] font-bold text-white bg-navy/85 px-1.5 py-0.5 rounded-md shadow mt-1">
                          {artisan.name.split(' ')[0]} {artisan.rating}★
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Search this area button */}
                {mapPanned && (
                  <button
                    onClick={() => { setMapPanned(false); toast.success('Artisans refreshed for this area!') }}
                    className="absolute top-3 left-1/2 -translate-x-1/2 bg-white border border-border text-navy font-mono text-[11px] font-bold px-4 py-2 rounded-full shadow-modal hover:border-teal hover:text-teal transition-all z-20"
                  >
                    🔄 Search this area
                  </button>
                )}

                {/* Drag overlay */}
                <div className="absolute inset-0 cursor-grab active:cursor-grabbing" onClick={() => setMapPanned(true)} />

                {/* Compass HUD */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl px-2.5 py-1.5 border border-border shadow-card flex items-center gap-1.5 font-mono text-[10px] font-bold text-navy pointer-events-none z-20">
                  <Compass size={12} className="text-nxblue animate-spin" style={{ animationDuration: '8s' }} />
                  Lagos, Nigeria
                </div>

                {/* Back to list */}
                <button
                  onClick={() => setViewMode('list')}
                  className="absolute bottom-3 left-3 bg-white border border-border text-navy font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-card hover:border-teal transition-colors z-20"
                >
                  ← List view
                </button>

                {/* Selected pin popup */}
                {selectedPinArtisan && (
                  <div className="absolute bottom-3 right-3 w-72 bg-white rounded-xl shadow-modal border border-border p-4 z-30 animate-fade-in">
                    <button onClick={() => setSelectedPinId(null)} className="absolute top-2.5 right-2.5 p-1 hover:bg-lgray rounded-lg text-slate">
                      <X size={13} />
                    </button>
                    <div className="flex gap-3">
                      <img src={selectedPinArtisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'} alt={selectedPinArtisan.name} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-[14px] text-navy truncate">{selectedPinArtisan.name}</p>
                        <p className="font-mono text-[10px] text-slate mt-0.5">{selectedPinArtisan.trade} · {selectedPinArtisan.area}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={10} className={i <= Math.round(selectedPinArtisan.rating) ? 'fill-amber text-amber' : 'text-border fill-border'} />
                          ))}
                          <span className="font-mono text-[10px] text-navy font-bold ml-1">{selectedPinArtisan.rating}</span>
                        </div>
                        <p className="font-mono text-[11px] font-bold text-teal mt-1">{formatNairaRange(selectedPinArtisan.priceMin, selectedPinArtisan.priceMax)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/artisans/${selectedPinArtisan.slug}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full text-[11px]">Profile</Button>
                      </Link>
                      <Link href={`/book/${selectedPinArtisan.slug}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full text-[11px]" disabled={!selectedPinArtisan.isAvailable}>Book</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable list beside map */}
              <div className="w-full md:w-[380px] flex-shrink-0 overflow-y-auto flex flex-col gap-3">
                {filteredArtisans.map(artisan => (
                  <div
                    key={artisan.id}
                    onMouseEnter={() => setHoveredArtisanId(artisan.id)}
                    onMouseLeave={() => setHoveredArtisanId(null)}
                    onClick={() => setSelectedPinId(artisan.id)}
                    className={`transition-all duration-200 rounded-xl border-2 cursor-pointer ${selectedPinId === artisan.id ? 'border-orange ring-2 ring-orange/20' : 'border-transparent'}`}
                  >
                    <ArtisanCard variant="horizontal" {...artisan} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter FAB */}
      <div className="tablet:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="bg-navy text-white font-display font-bold text-[13px] px-5 py-3 rounded-full shadow-modal flex items-center gap-2 border border-white/10 active:scale-95 transition-all hover:bg-navy/90"
        >
          <Filter size={15} />
          Filters
          {activeChips.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange text-white text-[10px] font-bold flex items-center justify-center">{activeChips.length}</span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      {isFilterDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-navy/40 backdrop-blur-[2px] z-[100] tablet:hidden" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-[20px] shadow-modal z-[101] max-h-[88vh] flex flex-col tablet:hidden animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <SidebarContent />
            </div>
            <div className="p-4 border-t border-border flex-shrink-0">
              <Button variant="primary" onClick={() => setIsFilterDrawerOpen(false)} className="w-full h-12 text-[15px]">
                Show {filteredArtisans.length} results
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-lgray flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-[13px] text-slate">Finding artisans near you…</p>
        </div>
      </div>
    }>
      <SearchResultsPageContent />
    </Suspense>
  )
}
