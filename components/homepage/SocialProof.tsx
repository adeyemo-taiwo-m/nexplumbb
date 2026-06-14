'use client'

import React from 'react'
import { Star, Lock } from 'lucide-react'
import { formatNaira } from '@/lib/format'

const reviews = [
  {
    avatar: null,
    initials: 'ET',
    avatarColor: 'bg-teal/20 text-teal',
    name: 'Emeka T.',
    area: 'Yaba, Lagos',
    trade: 'Plumbing',
    rating: 5,
    text: 'My sink had been leaking for 3 weeks. Booked a plumber at 9am, he arrived by 10:30 and was done by noon. The before and after photos he took proved everything. Will use again.',
    artisanName: 'Chukwuemeka A.',
    jobLabel: 'Sink repair',
    amount: 7500,
  },
  {
    avatar: null,
    initials: 'FB',
    avatarColor: 'bg-orange/20 text-orange',
    name: 'Folake B.',
    area: 'Ikeja, Lagos',
    trade: 'Electrical',
    rating: 5,
    text: "Our whole flat lost power after a storm. The electrician came within 2 hours, traced the fault, and fixed it. Paying through escrow meant I wasn't nervous handing over money.",
    artisanName: 'Sunday E.',
    jobLabel: 'Electrical fault',
    amount: 15000,
  },
  {
    avatar: null,
    initials: 'KA',
    avatarColor: 'bg-nxblue/20 text-nxblue',
    name: 'Kemi A.',
    area: 'Lekki Phase 1',
    trade: 'Carpentry',
    rating: 4,
    text: 'I needed my front door rehung properly — it had been sticking for months. The carpenter arrived on time, did a clean job, and charged exactly what the estimate said. No surprises.',
    artisanName: 'Bola A.',
    jobLabel: 'Door repair',
    amount: 8000,
  },
]

function StarRow({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < count ? 'fill-amber text-amber' : 'text-border fill-border'}
        />
      ))}
    </div>
  )
}

export default function SocialProof() {
  return (
    <section className="w-full bg-lgray py-12 tablet:py-16 desktop:py-20">
      <div className="max-w-content mx-auto px-6 tablet:px-10">

        {/* Header */}
        <div className="text-left">
          <span className="font-mono text-[11px] text-teal font-bold tracking-widest uppercase">
            Customer Stories
          </span>
          <h2 className="font-display font-bold text-[28px] tablet:text-[30px] text-navy mt-2">
            Real experiences from real Lagos residents
          </h2>
        </div>

        {/* Featured Quote */}
        <div className="bg-navy rounded-card p-8 tablet:p-10 mx-auto max-w-[760px] mt-12 relative overflow-hidden">
          {/* Decorative gradient glow */}
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-orange/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Large open-quote */}
          <svg
            className="absolute top-6 left-8 opacity-80"
            width="52"
            height="40"
            viewBox="0 0 52 40"
            fill="none"
          >
            <path
              d="M0 40V24C0 14.4 5.6 6.4 16.8 0L21.6 6C16 9.2 12.4 13.6 11.2 19.2H20V40H0ZM30 40V24C30 14.4 35.6 6.4 46.8 0L51.6 6C46 9.2 42.4 13.6 41.2 19.2H50V40H30Z"
              fill="#E76F51"
            />
          </svg>

          <blockquote className="text-white text-[16px] tablet:text-[18px] leading-relaxed font-medium italic pt-8 tablet:pt-4 relative z-10">
            &ldquo;I paid a plumber from the roadside ₦8,000 to fix my bathroom pipe. He
            collected the money and made it worse. On Nexplumb, I paid ₦6,500, watched the
            plumber arrive on the map, and he fixed it in 45 minutes. That was six months ago.
            I haven&apos;t called a stranger from the street since.&rdquo;
          </blockquote>

          <div className="mt-6 flex items-center gap-3 relative z-10">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-orange/30 flex items-center justify-center font-mono text-[11px] font-bold text-orange flex-shrink-0">
              CO
            </div>
            <div>
              <p className="font-bold text-white text-[14px] leading-none">Chidinma O.</p>
              <p className="text-white/60 text-[13px] mt-0.5">Surulere, Lagos</p>
            </div>
            <div className="ml-auto flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-amber text-amber" />
              ))}
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <div className="mt-8 grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.name}
              className="bg-white rounded-card p-6 shadow-card border border-border flex flex-col"
            >
              {/* Top row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0 ${rev.avatarColor}`}
                  >
                    {rev.initials}
                  </div>
                  <div>
                    <p className="font-display font-bold text-[13px] text-navy leading-none">
                      {rev.name}
                    </p>
                    <p className="font-mono text-[10px] text-slate mt-1">{rev.area}</p>
                  </div>
                </div>
                <StarRow count={rev.rating} />
              </div>

              {/* Trade badge */}
              <span className="mt-3 inline-block bg-lgray rounded-full px-3 py-1 text-[11px] text-slate font-mono self-start">
                {rev.trade}
              </span>

              {/* Review text */}
              <p className="mt-3 text-[14px] text-body leading-relaxed flex-1">{rev.text}</p>

              {/* Bottom row */}
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-end">
                <div>
                  <p className="text-[11px] text-slate">Serviced by</p>
                  <p className="font-bold text-navy text-[13px]">{rev.artisanName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate">{rev.jobLabel}</p>
                  <p className="font-bold text-teal text-[13px] font-mono">
                    {formatNaira(rev.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform note */}
        <p className="text-[12px] text-slate text-center mt-8 flex items-center justify-center gap-1.5">
          <Lock size={12} />
          All reviews are from verified completed bookings on Nexplumb.
        </p>

      </div>
    </section>
  )
}
