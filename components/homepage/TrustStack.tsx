'use client'

import React, { useRef, useEffect } from 'react'
import { Fingerprint, MapPin, ShieldCheck, Camera, Users, Star } from 'lucide-react'

const trustPillars = [
  {
    icon: Fingerprint,
    iconBg: 'bg-nxblue/10',
    iconColor: 'text-nxblue',
    title: 'NIN-verified identity',
    description:
      'Every artisan on Nexplumb has their National Identification Number checked against the NIMC database before they can accept a single job. You always know who is coming.',
    badge: 'ID Verified',
    badgeBg: 'bg-nxblue/10 text-nxblue',
  },
  {
    icon: MapPin,
    iconBg: 'bg-teal/10',
    iconColor: 'text-teal',
    title: 'Live GPS tracking',
    description:
      'From the moment an artisan accepts your job to when they arrive, you track them on a live map — exactly like ordering a ride. You are never left waiting and wondering.',
    badge: 'Live Tracking',
    badgeBg: 'bg-teal/10 text-teal',
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-orange/10',
    iconColor: 'text-orange',
    title: 'Escrow payment protection',
    description:
      'Your payment is held in a secure escrow account — not given to the artisan until you confirm the job is done. If they don\'t show up, you get every naira back.',
    badge: 'Escrow Protected',
    badgeBg: 'bg-orange/10 text-orange',
  },
  {
    icon: Camera,
    iconBg: 'bg-teal/10',
    iconColor: 'text-teal',
    title: 'Before & after photo evidence',
    description:
      'For jobs above ₦15,000, artisans are required to upload before and after photos. You have a permanent record of every piece of work done in your home.',
    badge: 'Photo Evidence',
    badgeBg: 'bg-teal/10 text-teal',
  },
  {
    icon: Users,
    iconBg: 'bg-nxblue/10',
    iconColor: 'text-nxblue',
    title: 'Guarantor verification',
    description:
      'Every artisan provides two personal guarantors — real people we can contact in the unlikely event of a serious dispute. An extra layer of accountability behind every booking.',
    badge: 'Guarantor Verified',
    badgeBg: 'bg-nxblue/10 text-nxblue',
  },
  {
    icon: Star,
    iconBg: 'bg-amber/20',
    iconColor: 'text-amber-dark',
    title: 'Two-way review system',
    description:
      'After every job, customers rate artisans and artisans rate customers. Low-rated artisans are removed. This keeps quality high on both sides of every booking.',
    badge: 'Rated Both Ways',
    badgeBg: 'bg-amber/20 text-amber-dark',
  },
]

interface PillarCardProps {
  pillar: typeof trustPillars[number]
  index: number
}

function PillarCard({ pillar, index }: PillarCardProps) {
  const ref = useRef<HTMLDivElement>(null)

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

  const Icon = pillar.icon

  return (
    <div
      ref={ref}
      className="bg-lgray rounded-card p-6 border border-border hover:border-teal hover:shadow-card transition-all duration-200 flex flex-col"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${pillar.iconBg}`}
      >
        <Icon size={24} className={pillar.iconColor} />
      </div>
      <h3 className="font-display font-bold text-[16px] text-navy mt-4">{pillar.title}</h3>
      <p className="text-slate text-[14px] mt-2 leading-relaxed flex-1">{pillar.description}</p>
      <div className="mt-4 pt-4 border-t border-border">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${pillar.badgeBg}`}
        >
          <ShieldCheck size={12} />
          {pillar.badge}
        </span>
      </div>
    </div>
  )
}

export default function TrustStack() {
  return (
    <section className="w-full bg-white py-12 tablet:py-16 desktop:py-20">
      <div className="max-w-content mx-auto px-6 tablet:px-10">

        {/* Header */}
        <div className="text-center">
          <span className="font-mono text-[11px] text-teal font-bold tracking-widest uppercase">
            Built for Trust
          </span>
          <h2 className="font-display font-bold text-[28px] tablet:text-[30px] text-navy mt-2 max-w-[500px] mx-auto leading-tight">
            Every job is verified, tracked, and protected
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          {trustPillars.map((pillar, idx) => (
            <PillarCard key={pillar.title} pillar={pillar} index={idx} />
          ))}
        </div>

      </div>
    </section>
  )
}
