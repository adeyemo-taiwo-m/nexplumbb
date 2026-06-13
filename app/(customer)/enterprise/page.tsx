'use client'

import React from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import TrustBadge from '@/components/ui/TrustBadge'
import { 
  Building2, 
  ShieldCheck, 
  BarChart2, 
  FileCheck, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'

export default function EnterprisePortal() {
  
  const benefits = [
    {
      title: 'Facility Maintenance Management',
      description: 'Centralized dashboard control for corporate offices, retail networks, and commercial properties across Lagos.',
      icon: Building2
    },
    {
      title: 'Custom SLA Guarantees',
      description: 'Guaranteed 30-minute emergency plumbing or electrical dispatch responses backed by strict contractual SLA payouts.',
      icon: Clock
    },
    {
      title: 'Consolidated Bulk Invoicing',
      description: 'Single monthly itemized billing and corporate escrow ledgers, eliminating individual reimbursement paperwork.',
      icon: FileCheck
    },
    {
      title: 'Comprehensive Compliance Audit',
      description: 'All artisans are NIMC identity-vetted, BVN-matched, and trade certified, ensuring complete corporate security compliance.',
      icon: ShieldCheck
    }
  ]

  return (
    <div className="w-full min-h-screen bg-white select-none text-left animate-fade-in">
      
      {/* Hero Header */}
      <section className="bg-navy text-white py-16 tablet:py-24 px-6 tablet:px-10 border-b border-white/5 relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2A9D8F_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-[800px] mx-auto text-center flex flex-col items-center gap-6 relative z-10">
          <span className="font-mono text-[11px] font-bold text-teal bg-teal/15 border border-teal/20 px-3 py-1 rounded-full uppercase tracking-wider">
            NexPlumb Enterprise Solutions
          </span>
          <h1 className="text-[32px] tablet:text-[48px] font-semibold font-display leading-tight">
            Corporate Facility Maintenance, Vetted & Guaranteed
          </h1>
          <p className="font-body text-[16px] text-slate-light max-w-xl leading-relaxed">
            Standardize on-demand plumbing and electrical operations across all corporate sites in Lagos with certified SLAs and simplified monthly invoicing.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-4 select-none">
            <a href="mailto:enterprise@nexplumb.com">
              <Button variant="primary" size="lg" className="flex items-center gap-1">
                Schedule Corporate Demo <ArrowRight size={16} />
              </Button>
            </a>
            <Link href="/search">
              <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white/10">
                Browse Vetted Artisans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="max-w-[1200px] mx-auto px-6 tablet:px-10 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-h2 text-navy font-display font-semibold">Standardizing Local Repairs</h2>
          <p className="font-body text-[14px] text-slate mt-2 leading-relaxed">
            Corporate operations require dependability and liability coverage. Here is how NexPlumb serves corporate offices, commercial property networks, and retail centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon
            return (
              <div 
                key={idx} 
                className="border border-border rounded-card p-6 shadow-card hover:shadow-card-hover transition-all flex gap-4 text-left"
              >
                <div className="p-3 bg-teal/10 text-teal rounded-btn shrink-0 h-12 w-12 flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display font-bold text-[16px] text-navy">{b.title}</h3>
                  <p className="font-body text-[14px] text-slate leading-relaxed">{b.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SLA Metrics Section */}
      <section className="bg-lgray py-16 px-6 tablet:px-10">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 desktop:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-5 text-left">
            <span className="font-mono text-[11px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded uppercase self-start">
              Performance Guarantees
            </span>
            <h2 className="text-h2 text-navy font-display font-semibold">Strict Service Level Agreement</h2>
            
            <p className="font-body text-[14px] text-slate leading-relaxed">
              Every enterprise dispatch has contractually binding performance checkpoints. We do not just match artisans; we guarantee quality, security, and response times.
            </p>

            <ul className="flex flex-col gap-3 font-mono text-[12px] text-navy font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-teal" /> 99.4% Dispatch SLA Compliance Rating
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-teal" /> ₦10,000,000 Liability Damage Indemnity Cover
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-teal" /> 30-Minute Priority Dispatch Response (Lagos Mainland & Island)
              </li>
            </ul>
          </div>

          {/* SLA Status Widget Mockup */}
          <div className="bg-white rounded-card border border-border p-6 shadow-card text-left flex flex-col gap-4">
            <div className="border-b border-border pb-3 flex justify-between items-center select-none font-mono text-[11px]">
              <span className="font-bold text-slate uppercase">Live SLA Dispatch Status</span>
              <span className="bg-teal/15 text-teal border border-teal/20 px-2 py-0.5 rounded font-bold uppercase text-[9px] animate-pulse">
                Active Match
              </span>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[12px] text-navy leading-normal">
              <p>Corporate Office: **Standard Chartered Building, VI**</p>
              <p>Reported Leak: **Executive Bathroom Pipe Leak**</p>
              
              <div className="p-3 bg-lgray rounded border border-border mt-1">
                <p className="font-bold">Dispatch Timer Details:</p>
                <div className="mt-2 flex justify-between font-bold text-teal">
                  <span>Artisan Match: **Assigned ✓**</span>
                  <span>ETA Remaining: **14 mins**</span>
                </div>
              </div>

              <div className="w-full bg-teal/10 h-2 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-teal w-2/3" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Call to action */}
      <section className="bg-navy text-white py-16 text-center select-none">
        <div className="max-w-[640px] mx-auto px-6 flex flex-col items-center gap-4">
          <h2 className="text-h2 font-display font-semibold">Transform Corporate Maintenance Operations</h2>
          <p className="font-body text-[14px] text-slate-light leading-relaxed mb-4">
            Contact our business development operations to receive custom billing setup and contract options.
          </p>
          <a href="mailto:enterprise@nexplumb.com">
            <Button variant="primary" size="lg">
              Contact Enterprise Sales
            </Button>
          </a>
        </div>
      </section>

    </div>
  )
}
