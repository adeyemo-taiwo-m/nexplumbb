import React from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Briefcase, Star, ShieldCheck, CheckCircle } from 'lucide-react'
import TrustBadge, { TrustBadgeType } from './TrustBadge'
import Button from './Button'
import { formatNairaRange } from '@/lib/format'

interface ArtisanCardProps {
  id: string
  slug: string
  photo?: string
  name: string
  trade: string
  rating: number
  reviewCount: number
  jobCount: number
  area: string
  priceMin: number
  priceMax: number
  badges: TrustBadgeType[]
  isAvailable: boolean
  isOnline?: boolean
  bio: string
  skills: string[]
  variant?: 'horizontal' | 'vertical'
}

/* ── Trade accent colors ── */
const tradeColors: Record<string, { bg: string; text: string; border: string }> = {
  Plumbing:   { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-100' },
  Electrical: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
  Carpentry:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  Painting:   { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  Tiling:     { bg: 'bg-teal/5',    text: 'text-teal',       border: 'border-teal/15' },
}

const getTradeColor = (trade: string) =>
  tradeColors[trade] || { bg: 'bg-lgray', text: 'text-slate', border: 'border-border' }

export const ArtisanCard: React.FC<ArtisanCardProps> = ({
  id,
  slug,
  photo = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
  name,
  trade,
  rating,
  reviewCount,
  jobCount,
  area,
  priceMin,
  priceMax,
  badges,
  isAvailable,
  isOnline,
  bio,
  skills,
  variant = 'horizontal'
}) => {
  const tc = getTradeColor(trade)

  /* ═══════════ VERTICAL CARD — Homepage Grid ═══════════ */
  if (variant === 'vertical') {
    return (
      <Link href={`/artisans/${slug}`} className="group block">
        <div className={`relative flex flex-col bg-white rounded-[16px] border border-border/60 overflow-hidden transition-all duration-300 ease-out group-hover:border-teal/40 group-hover:shadow-[0_8px_30px_rgba(13,33,55,0.1)] group-hover:-translate-y-1 ${!isAvailable ? 'opacity-60' : ''}`}>
          
          {/* Top gradient accent */}
          <div className="h-1 w-full bg-gradient-to-r from-teal via-nxblue to-orange" />

          <div className="p-5 flex flex-col items-center text-center flex-1">
            {/* Avatar with ring */}
            <div className="relative mt-1">
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-teal/20 to-orange/20 p-[2.5px]">
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full rounded-full object-cover bg-lgray"
                  loading="lazy"
                />
              </div>
              <span className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-[2.5px] border-white ${isAvailable ? 'bg-emerald-400' : 'bg-slate/40'}`} />
            </div>

            {/* Name & trade */}
            <h4 className="font-display font-bold text-[15px] text-navy mt-3.5 leading-tight group-hover:text-teal transition-colors">
              {name}
            </h4>
            
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`inline-flex items-center gap-1 ${tc.bg} ${tc.text} ${tc.border} border rounded-full px-2 py-0.5 font-mono text-[10px] font-bold`}>
                {trade}
              </span>
              <span className="flex items-center gap-0.5 font-mono text-[10px] text-slate">
                <MapPin size={10} /> {area}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex items-center gap-0.5">
                <Star size={13} className="text-amber fill-amber" />
                <span className="font-mono text-[13px] font-bold text-navy">{rating}</span>
              </div>
              <span className="font-mono text-[10px] text-slate">({reviewCount})</span>
              <span className="w-px h-3 bg-border mx-0.5" />
              <span className="font-mono text-[10px] text-slate flex items-center gap-0.5">
                <Briefcase size={10} /> {jobCount}
              </span>
            </div>

            {/* Badges */}
            <div className="flex gap-1 mt-3 flex-wrap justify-center">
              {badges.slice(0, 3).map((badge) => (
                <TrustBadge key={badge} type={badge} />
              ))}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="px-5 pb-5 pt-3 border-t border-border/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-center gap-1">
              <span className="font-mono text-[10px] text-slate uppercase tracking-wider">From</span>
              <span className="font-mono text-[16px] font-bold text-navy">{formatNairaRange(priceMin, priceMax)}</span>
            </div>
            <Button variant="primary" size="sm" className="w-full group-hover:shadow-lg transition-shadow">
              View Profile <ArrowRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </Link>
    )
  }

  /* ═══════════ HORIZONTAL CARD — Search / SEO Sections ═══════════ */
  return (
    <div className={`group relative flex flex-col tablet:flex-row gap-5 p-5 bg-white rounded-[16px] border overflow-hidden transition-all duration-300 ease-out hover:shadow-[0_8px_30px_rgba(13,33,55,0.08)] hover:-translate-y-0.5 ${!isAvailable ? 'opacity-60 border-border/40' : 'border-border/60 hover:border-teal/30'}`}>
      
      {/* Left accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${tc.bg} rounded-l-[16px]`} />

      {/* Photo */}
      <div className="relative self-center tablet:self-start flex-shrink-0 ml-1">
        <div className="w-[76px] h-[76px] rounded-[14px] bg-gradient-to-br from-teal/15 to-orange/15 p-[2px]">
          <img
            src={photo}
            alt={name}
            className="w-full h-full rounded-[12px] object-cover bg-lgray"
            loading="lazy"
          />
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[2.5px] border-white ${isAvailable ? 'bg-emerald-400' : 'bg-slate/40'}`} />
      </div>

      {/* Centre */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 justify-between">
          <div>
            <h3 className="font-display font-bold text-[16px] text-navy group-hover:text-teal transition-colors flex items-center gap-2">
              {name}
              {badges.includes('id_verified') && (
                <CheckCircle size={15} className="text-teal flex-shrink-0" />
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 ${tc.bg} ${tc.text} ${tc.border} border rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold`}>
                {trade}
              </span>
              <span className="flex items-center gap-0.5 font-mono text-[11px] text-slate">
                <MapPin size={11} /> {area}, Lagos
              </span>
            </div>
          </div>

          {/* Availability pill */}
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold shrink-0 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-slate/5 text-slate border border-slate/10 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold shrink-0 select-none">
              Unavailable
            </span>
          )}
        </div>

        {/* Rating row */}
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.round(rating) ? 'text-amber fill-amber' : 'text-border fill-border'}
              />
            ))}
            <span className="font-mono text-[12px] font-bold text-navy ml-1">{rating}</span>
            <span className="font-mono text-[11px] text-slate">({reviewCount})</span>
          </div>
          <span className="w-px h-3.5 bg-border" />
          <span className="font-mono text-[11px] text-slate flex items-center gap-1">
            <Briefcase size={11} /> {jobCount} jobs
          </span>
        </div>

        {/* Bio */}
        <p className="font-body text-[13px] text-body/80 line-clamp-2 mt-2 leading-relaxed">
          {bio}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="bg-lgray/80 text-body/70 font-mono text-[10px] font-semibold rounded-full px-2.5 py-1 border border-border/30"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-slate font-mono text-[10px] font-semibold px-2 py-1">
              +{skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-row tablet:flex-col justify-between tablet:justify-start items-center tablet:items-end gap-3 pt-3 tablet:pt-0 border-t tablet:border-t-0 border-border/30 tablet:pl-5 tablet:border-l tablet:border-border/30">
        <div className="text-left tablet:text-right">
          <p className="text-[9px] font-mono text-slate uppercase tracking-widest font-bold">Est. Price</p>
          <p className="font-mono text-[17px] font-bold text-navy mt-0.5 tracking-tight">
            {formatNairaRange(priceMin, priceMax)}
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex gap-1">
          {badges.map((badge) => (
            <TrustBadge key={badge} type={badge} />
          ))}
        </div>

        <div className="flex gap-2 w-full tablet:w-auto mt-1">
          <Link href={`/artisans/${slug}`} className="flex-1 tablet:flex-initial">
            <Button variant="secondary" size="sm" className="w-full text-center">
              Profile
            </Button>
          </Link>
          <Link href={`/book/${slug}`} className="flex-1 tablet:flex-initial">
            <Button variant="primary" size="sm" className="w-full" disabled={!isAvailable}>
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
export default ArtisanCard
