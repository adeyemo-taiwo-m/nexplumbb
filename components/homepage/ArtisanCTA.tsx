'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, TrendingUp, Shield, Smartphone } from 'lucide-react'

const artisanBenefits = [
  { icon: Zap, text: 'Get paid the moment a job is confirmed complete' },
  { icon: TrendingUp, text: 'Build a verified profile that wins new customers' },
  { icon: Shield, text: 'We protect you from customers who refuse to pay' },
  { icon: Smartphone, text: 'Manage all your jobs from one simple app' },
]

const artisanStats = [
  { value: '₦45,000', label: 'Average monthly earnings', sub: 'for active artisans', highlight: true },
  { value: '< 24h', label: 'Profile approval time', sub: 'after NIN verification', highlight: false },
  { value: '2,400+', label: 'Artisans already on platform', sub: 'across Lagos', highlight: false },
  { value: 'Instant', label: 'Payment after job complete', sub: 'via bank transfer', highlight: false },
]

export default function ArtisanCTA() {
  return (
    <section className="w-full bg-navy py-12 tablet:py-16 desktop:py-20">
      <div className="max-w-content mx-auto px-6 tablet:px-10">
        <div className="flex flex-col desktop:flex-row gap-12 desktop:gap-20 items-start">

          {/* LEFT: text */}
          <div className="flex-1">
            <span className="font-mono text-[11px] text-orange font-bold tracking-widest uppercase">
              For Artisans
            </span>
            <h2 className="font-display font-bold text-[30px] tablet:text-[34px] text-white leading-tight mt-2">
              Earn more.<br />Get paid instantly.
            </h2>
            <p className="text-white/70 text-[16px] mt-4 max-w-[420px] leading-relaxed">
              Join 2,400+ verified plumbers, electricians, and tradespeople already earning more on
              Nexplumb. No more chasing payment. No more slow months.
            </p>

            {/* Benefits */}
            <ul className="mt-6 flex flex-col gap-3">
              {artisanBenefits.map((b) => {
                const Icon = b.icon
                return (
                  <li key={b.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-teal" />
                    </div>
                    <span className="text-white text-[14px]">{b.text}</span>
                  </li>
                )
              })}
            </ul>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col tablet:flex-row gap-3">
              <Link
                href="/join-as-artisan"
                className="bg-orange text-white h-12 px-6 rounded-btn font-bold text-[14px] flex items-center justify-center hover:bg-orange/90 transition-colors"
              >
                Join as an artisan
              </Link>
              <Link
                href="/for-artisans"
                className="border border-white/30 text-white h-12 px-6 rounded-btn text-[14px] flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>

          {/* RIGHT: 2×2 stat cards */}
          <div className="w-full desktop:w-auto desktop:min-w-[380px] grid grid-cols-2 gap-4">
            {artisanStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 border border-white/20 rounded-card p-5 text-white text-center hover:bg-white/15 transition-colors"
              >
                <p className={`text-[26px] font-bold leading-none ${stat.highlight ? 'text-teal' : 'text-white'}`}>
                  {stat.value}
                </p>
                <p className="text-[13px] text-white mt-1">{stat.label}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
