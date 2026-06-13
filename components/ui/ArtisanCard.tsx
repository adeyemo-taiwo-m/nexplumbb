import React from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import StarRating from './StarRating'
import TrustBadge, { TrustBadgeType } from './TrustBadge'
import StatusBadge from './StatusBadge'
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
  bio: string
  skills: string[]
  variant?: 'horizontal' | 'vertical'
}

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
  bio,
  skills,
  variant = 'horizontal'
}) => {
  if (variant === 'vertical') {
    // Vertical grid card for homepage
    return (
      <div className={`flex flex-col bg-white rounded-card border border-border shadow-card hover:border-teal/50 hover:shadow-card-hover transition-all duration-200 w-full overflow-hidden ${!isAvailable ? 'opacity-70' : ''}`}>
        <div className="p-5 flex flex-col items-center text-center flex-1">
          {/* Avatar */}
          <div className="relative">
            <img
              src={photo}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border border-border bg-lgray"
              loading="lazy"
            />
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isAvailable ? 'bg-teal' : 'bg-slate'}`} />
          </div>

          <h4 className="font-display font-bold text-[15px] text-navy mt-3 leading-tight">
            {name}
          </h4>
          
          <p className="font-mono text-[11px] text-slate mt-1">
            {trade} · {area}
          </p>

          <div className="mt-2.5">
            <StarRating rating={rating} reviewCount={reviewCount} />
          </div>

          {/* Badges */}
          <div className="flex gap-1 mt-3 flex-wrap justify-center">
            {badges.slice(0, 3).map((badge) => (
              <TrustBadge key={badge} type={badge} />
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-0 border-t border-border bg-lgray/10 flex flex-col gap-2">
          <p className="font-mono text-[13px] font-semibold text-center text-navy py-2">
            {formatNairaRange(priceMin, priceMax)}
          </p>
          <Link href={`/artisans/${slug}`} className="w-full">
            <Button variant="primary" size="sm" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Horizontal Card (Search Results default)
  return (
    <div className={`flex flex-col tablet:flex-row gap-4 p-4 bg-white rounded-card border shadow-card hover:border-teal/50 hover:shadow-card-hover transition-all duration-200 cursor-pointer ${!isAvailable ? 'opacity-65' : 'border-border'}`}>
      
      {/* Photo / Left */}
      <div className="relative self-center tablet:self-start flex-shrink-0">
        <img
          src={photo}
          alt={name}
          className="w-20 h-20 rounded-full object-cover border border-border bg-lgray"
          loading="lazy"
        />
        <span className={`absolute bottom-0 right-1.5 w-4.5 h-4.5 rounded-full border-2 border-white ${isAvailable ? 'bg-teal' : 'bg-slate'}`} />
      </div>

      {/* Centre Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-between">
          <div>
            <h3 className="font-display font-bold text-[16px] text-navy flex items-center gap-2">
              {name}
            </h3>
            <p className="font-mono text-[12px] text-slate mt-0.5 flex items-center gap-1">
              <span>{trade}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <MapPin size={12} /> {area}, Lagos
              </span>
            </p>
          </div>
          <div>
            <StatusBadge status={isAvailable ? 'available' : 'cancelled'} showDot />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <StarRating rating={rating} reviewCount={reviewCount} jobCount={jobCount} />
        </div>

        {/* Bio */}
        <p className="font-body text-[14px] text-body line-clamp-2 mt-2 leading-relaxed">
          {bio}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="bg-lgray text-body font-mono text-[11px] rounded-full px-2.5 py-0.5 border border-border/50"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-slate font-mono text-[11px] px-2 py-0.5">
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-row tablet:flex-col justify-between tablet:justify-start items-center tablet:items-end gap-3 pt-3 tablet:pt-0 border-t tablet:border-t-0 border-border/50 tablet:pl-4 tablet:border-l border-dashed">
        <div className="text-left tablet:text-right">
          <p className="text-[11px] font-mono text-slate uppercase tracking-wider">Est. Price</p>
          <p className="font-mono text-[15px] font-bold text-navy mt-0.5">
            {formatNairaRange(priceMin, priceMax)}
          </p>
        </div>

        {/* Trust Badge Icons */}
        <div className="flex gap-1.5">
          {badges.map((badge) => (
            <TrustBadge key={badge} type={badge} />
          ))}
        </div>

        <div className="flex gap-2 w-full tablet:w-auto">
          <Link href={`/artisans/${slug}`} className="flex-1 tablet:flex-initial">
            <Button variant="secondary" size="sm" className="w-full text-center">
              View Profile
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
