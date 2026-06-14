'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { Droplets, Zap, Hammer, Paintbrush, Grid3X3 } from 'lucide-react'

const tradeIconColors: Record<string, string> = {
  plumbing: 'text-nxblue',
  electrical: 'text-amber-dark',
  carpentry: 'text-orange',
  painting: 'text-teal',
  tiling: 'text-navy',
}

const TradeIcons: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  plumbing: Droplets,
  electrical: Zap,
  carpentry: Hammer,
  painting: Paintbrush,
  tiling: Grid3X3,
}

const allTrades = [
  { id: 'plumbing', label: 'Plumbing', count: 420, link: '/search?category=plumbing' },
  { id: 'electrical', label: 'Electrical', count: 318, link: '/search?category=electrical' },
  { id: 'carpentry', label: 'Carpentry', count: 195, link: '/search?category=carpentry' },
  { id: 'painting', label: 'Painting', count: 142, link: '/search?category=painting' },
  { id: 'tiling', label: 'Tiling', count: 87, link: '/search?category=tiling' },
]

interface TradeCardProps {
  trade: typeof allTrades[number]
  index: number
}

function TradeCard({ trade, index }: TradeCardProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    el.style.opacity = '0'
    el.style.transform = 'translateY(16px)'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out'
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }, index * 80)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  const Icon = TradeIcons[trade.id] ?? Droplets
  const iconColor = tradeIconColors[trade.id] ?? 'text-teal'

  return (
    <Link
      ref={ref}
      href={trade.link}
      className="flex flex-col items-center p-6 rounded-card border border-border bg-lgray hover:border-teal hover:bg-teal/5 hover:shadow-card transition-all duration-200 cursor-pointer group"
    >
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-card transition-shadow">
        <Icon size={36} className={iconColor} />
      </div>
      <p className="text-navy font-bold text-[14px] mt-4">{trade.label}</p>
      <p className="text-slate text-[12px] mt-1">{trade.count}+ artisans</p>
    </Link>
  )
}

export default function TradesBrowser() {
  return (
    <section className="w-full bg-white py-12 tablet:py-14 desktop:py-16">
      <div className="max-w-content mx-auto px-6 tablet:px-10">

        {/* Header */}
        <div className="flex flex-col tablet:flex-row tablet:items-end tablet:justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display font-bold text-[26px] tablet:text-[28px] text-navy">
              Browse by trade
            </h2>
            <p className="text-slate text-[14px] mt-1">
              Find the right specialist for your job
            </p>
          </div>
          <Link
            href="/search"
            className="font-body text-[14px] text-nxblue hover:underline whitespace-nowrap"
          >
            Search all artisans →
          </Link>
        </div>

        {/* Trades Grid */}
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-4">
          {allTrades.map((trade, idx) => (
            <TradeCard key={trade.id} trade={trade} index={idx} />
          ))}
        </div>

        {/* Bottom CTA Strip */}
        <p className="text-slate text-[14px] text-center mt-10">
          Don&apos;t see your trade?{' '}
          <Link href="/search" className="text-nxblue font-medium hover:underline">
            Tell us what you need →
          </Link>
        </p>

      </div>
    </section>
  )
}
