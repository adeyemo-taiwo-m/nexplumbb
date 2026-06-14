'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Droplets, Zap, Hammer, Paintbrush, Grid3X3 } from 'lucide-react'
import { formatNaira } from '@/lib/format'

// Using Lucide icons as proxies for trade icons (no SVG file needed)
const TRADE_ICONS = {
  plumbing: Droplets,
  electrical: Zap,
  carpentry: Hammer,
  painting: Paintbrush,
}

interface ServiceItem {
  label: string
  price: number | null
  customPrice?: string
  artisanPhoto?: string
}

interface TradeCategory {
  id: string
  title: string
  description: string
  features: string[]
  ctaText: string
  ctaLink: string
  services: ServiceItem[]
}

const tradeCategories: TradeCategory[] = [
  {
    id: 'plumbing',
    title: 'Verified Plumbers',
    description:
      'From emergency leaks to full bathroom installations. All work comes with a 30-day Nexplumb guarantee.',
    features: ['Pipe Repair & Installation', 'Water Heater Maintenance', 'Sewage & Drainage Clearing'],
    ctaText: 'Find a plumber near you',
    ctaLink: '/search?category=plumbing',
    services: [
      { label: 'Emergency Repair', price: 5000 },
      { label: 'Installation', price: 12000 },
      { label: 'Leak Detection', price: 3500 },
      { label: 'Sewer Cleaning', price: 8000 },
    ],
  },
  {
    id: 'electrical',
    title: 'Certified Electricians',
    description:
      'Fully certified for complex wiring, solar installations, and generator maintenance.',
    features: ['Residential Wiring', 'Generator Servicing', 'Solar & Inverter Setup'],
    ctaText: 'Book an electrician',
    ctaLink: '/search?category=electrical',
    services: [
      { label: 'Fault Finding', price: 4000 },
      { label: 'Solar Install', price: null, customPrice: 'Custom quote' },
      { label: 'Inverter Repair', price: 10000 },
      { label: 'Socket/Light Fix', price: 2000 },
    ],
  },
  {
    id: 'carpentry',
    title: 'Skilled Carpenters',
    description:
      'Custom furniture, door repairs, and full interior joinery. Precise, on-time work.',
    features: ['Door & Window Frames', 'Custom Furniture', 'Ceiling & Partition'],
    ctaText: 'Find a carpenter',
    ctaLink: '/search?category=carpentry',
    services: [
      { label: 'Door Repair', price: 3000 },
      { label: 'Custom Wardrobe', price: 45000 },
      { label: 'POP Ceiling', price: 15000 },
      { label: 'Furniture Fix', price: 2500 },
    ],
  },
  {
    id: 'painting',
    title: 'Professional Painters',
    description:
      'Interior and exterior painting, wall prep, and textured finishes. Neat, dust-free work.',
    features: ['Interior & Exterior', 'Wall Preparation', 'Textured Finishes'],
    ctaText: 'Get a painter',
    ctaLink: '/search?category=painting',
    services: [
      { label: '1 Room (Interior)', price: 8000 },
      { label: 'Full Apartment', price: 35000 },
      { label: 'Exterior Wall', price: 25000 },
      { label: 'Touch-Up', price: 3000 },
    ],
  },
]

// Avatar placeholder colours per service index
const avatarColors = ['bg-teal/20', 'bg-nxblue/20', 'bg-orange/20', 'bg-amber/20']
const avatarText = ['EP', 'IN', 'LD', 'SC']

function ServiceCard({
  service,
  trade,
  serviceIdx,
  cardIdx,
}: {
  service: ServiceItem
  trade: string
  serviceIdx: number
  cardIdx: number
}) {
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
          }, serviceIdx * 80)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [serviceIdx])

  return (
    <Link
      ref={ref}
      href={`/search?category=${trade}&service=${encodeURIComponent(service.label)}`}
      className="bg-white rounded-card border border-border p-4 flex items-center gap-3 hover:border-teal hover:shadow-card transition-all duration-200 cursor-pointer group"
    >
      {/* Avatar circle */}
      <div
        className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-mono text-[10px] font-bold text-navy ${avatarColors[cardIdx % avatarColors.length]}`}
      >
        {avatarText[cardIdx % avatarText.length]}
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-navy leading-none truncate">{service.label}</p>
        {service.customPrice ? (
          <p className="text-[12px] text-slate italic mt-1">{service.customPrice}</p>
        ) : service.price ? (
          <p className="text-[12px] text-slate mt-1">
            From{' '}
            <span className="font-mono font-semibold text-navy">
              {formatNaira(service.price)}
            </span>
          </p>
        ) : null}
      </div>
    </Link>
  )
}

interface TradeCategoryBlockProps {
  category: TradeCategory
  isLast: boolean
  isReversed: boolean
}

function TradeCategoryBlock({ category, isLast, isReversed }: TradeCategoryBlockProps) {
  return (
    <>
      {/* Block: alternating text/cards direction on desktop */}
      <div
        className={`flex flex-col gap-8 desktop:gap-16 items-start
          desktop:flex-row ${isReversed ? 'desktop:flex-row-reverse' : ''}`}
      >
        {/* TEXT COLUMN */}
        <div className={`flex-shrink-0 desktop:w-[42%] w-full ${isReversed ? 'desktop:text-right' : ''}`}>
          <h3 className="font-display font-bold text-[22px] text-navy">{category.title}</h3>
          <p className={`font-body text-slate mt-2 leading-relaxed text-[15px] ${isReversed ? 'ml-auto' : ''} max-w-[340px]`}>
            {category.description}
          </p>
          <ul className={`mt-4 flex flex-col gap-2 ${isReversed ? 'items-end' : 'items-start'}`}>
            {category.features.map((f) => (
              <li key={f} className={`flex items-center gap-2 text-navy text-[14px] ${isReversed ? 'flex-row-reverse' : ''}`}>
                <CheckCircle size={16} className="text-teal flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {/* CTA — text link on desktop, orange button on mobile */}
          <Link
            href={category.ctaLink}
            className={`mt-6 hidden tablet:inline-flex items-center gap-1 text-orange font-medium text-[14px] hover:underline ${isReversed ? 'flex-row-reverse' : ''}`}
          >
            {isReversed ? `← ${category.ctaText}` : `${category.ctaText} →`}
          </Link>
          <Link
            href={category.ctaLink}
            className="mt-6 tablet:hidden flex items-center justify-center w-full bg-orange text-white font-bold rounded-btn h-11 text-[14px]"
          >
            {category.ctaText}
          </Link>
        </div>

        {/* CARDS GRID */}
        <div className="flex-1 w-full grid grid-cols-2 gap-3">
          {category.services.map((svc, idx) => (
            <ServiceCard
              key={svc.label}
              service={svc}
              trade={category.id}
              serviceIdx={idx}
              cardIdx={idx}
            />
          ))}
        </div>
      </div>

      {/* Separator */}
      {!isLast && <hr className="border-border my-14" />}
    </>
  )
}

export default function ServicesCatalogue() {
  return (
    <section className="w-full bg-lgray py-12 tablet:py-16 desktop:py-20">
      <div className="max-w-content mx-auto px-6 tablet:px-10">

        {/* Header */}
        <div className="flex flex-col tablet:flex-row tablet:items-end tablet:justify-between mb-10 gap-4">
          <div>
            <span className="font-mono text-[11px] text-teal font-bold tracking-widest uppercase">
              Our Services
            </span>
            <h2 className="font-display font-bold text-[28px] tablet:text-[30px] text-navy mt-2">
              What can we help you with?
            </h2>
          </div>
          <Link
            href="/search"
            className="font-body text-[14px] font-medium text-nxblue hover:underline whitespace-nowrap"
          >
            Browse all services →
          </Link>
        </div>

        {/* Trade Category Blocks */}
        <div className="flex flex-col">
          {tradeCategories.map((cat, idx) => (
            <TradeCategoryBlock
              key={cat.id}
              category={cat}
              isLast={idx === tradeCategories.length - 1}
              isReversed={idx % 2 !== 0}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
