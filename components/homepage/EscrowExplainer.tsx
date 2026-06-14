'use client'

import React, { useEffect, useRef } from 'react'
import { CreditCard, ShieldCheck, Wrench, CheckCircle, RefreshCcw, Clock, Headphones } from 'lucide-react'

const escrowSteps = [
  {
    number: 1,
    icon: CreditCard,
    label: 'You pay',
    sub: 'Card, transfer, or USSD',
  },
  {
    number: 2,
    icon: ShieldCheck,
    label: 'We hold it safely',
    sub: 'In a CBN-regulated escrow account',
  },
  {
    number: 3,
    icon: Wrench,
    label: 'Artisan does the job',
    sub: 'You track them live on a map',
  },
  {
    number: 4,
    icon: CheckCircle,
    label: 'You confirm & release',
    sub: 'Or get a full refund if anything goes wrong',
  },
]

const guarantees = [
  { icon: RefreshCcw, text: 'Full refund if artisan no-shows' },
  { icon: Clock, text: 'Auto-release in 24h if you forget' },
  { icon: Headphones, text: '48-hour dispute resolution' },
]

interface StepCardProps {
  step: typeof escrowSteps[number]
  index: number
}

function StepCard({ step, index }: StepCardProps) {
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
          }, index * 120)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  const Icon = step.icon

  return (
    <div
      ref={ref}
      className="bg-white/10 border border-white/20 rounded-card p-5 text-white text-center flex flex-col items-center w-full tablet:w-[220px] flex-shrink-0"
    >
      <div className="w-8 h-8 bg-orange text-white rounded-full flex items-center justify-center text-[13px] font-bold">
        {step.number}
      </div>
      <Icon size={40} className="text-teal mt-3" />
      <p className="font-bold text-[15px] mt-3 leading-snug">{step.label}</p>
      <p className="text-white/60 text-[12px] mt-1 leading-relaxed">{step.sub}</p>
    </div>
  )
}

// Animated dashed arrow SVG
function DashedArrow({ vertical = false }: { vertical?: boolean }) {
  return (
    <div className={`flex-shrink-0 ${vertical ? 'rotate-90' : ''} flex items-center justify-center`}>
      <svg
        width="48"
        height="16"
        viewBox="0 0 48 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="escrow-arrow"
      >
        <line
          x1="0"
          y1="8"
          x2="38"
          y2="8"
          stroke="rgba(42,157,143,0.6)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="arrow-dash"
        />
        <path
          d="M36 3L43 8L36 13"
          stroke="rgba(42,157,143,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .arrow-dash {
          animation: dash-flow 1.8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .arrow-dash { animation: none; }
        }
      `}</style>
    </div>
  )
}

export default function EscrowExplainer() {
  return (
    <section className="w-full bg-navy py-12 tablet:py-16 desktop:py-20">
      <div className="max-w-content mx-auto px-6 tablet:px-10">

        {/* Header */}
        <div className="text-center">
          <h2 className="font-display font-bold text-[28px] tablet:text-[32px] text-white leading-tight">
            Your money is safe. Always.
          </h2>
          <p className="text-white/70 text-[16px] max-w-[540px] mx-auto mt-3 leading-relaxed">
            We built Nexplumb around one promise: you never pay for a job that wasn&apos;t done.
            Here&apos;s exactly how it works.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="mt-14 flex flex-col tablet:flex-row items-center justify-center gap-4 tablet:gap-2">
          {escrowSteps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <StepCard step={step} index={idx} />
              {idx < escrowSteps.length - 1 && (
                <div className="hidden tablet:flex">
                  <DashedArrow />
                </div>
              )}
              {idx < escrowSteps.length - 1 && (
                <div className="flex tablet:hidden">
                  <DashedArrow vertical />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Guarantee Strip */}
        <div className="mt-12 flex flex-col tablet:flex-row items-center justify-center gap-3">
          {guarantees.map((g) => {
            const Icon = g.icon
            return (
              <div
                key={g.text}
                className="bg-white/10 rounded-full px-5 py-3 flex items-center gap-2 w-full tablet:w-auto justify-center"
              >
                <Icon size={16} className="text-teal flex-shrink-0" />
                <span className="text-white text-[13px] font-medium">{g.text}</span>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
