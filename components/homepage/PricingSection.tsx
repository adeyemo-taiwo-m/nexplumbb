"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Coins,
  CheckCircle2,
  Wrench,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";

type TabOption = "homeowners" | "artisans";

export default function PricingSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabOption>("homeowners");

  const handleCTA = (targetPath: string) => {
    router.push(targetPath);
  };

  return (
    <section
      id="pricing"
      className="w-full py-24 bg-gradient-to-b from-white to-lgray/30 relative overflow-hidden"
    >
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-teal/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-orange/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <span className="inline-block bg-teal/10 text-teal border border-teal/20 rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider mb-4 animate-pulse">
            🛡️ Transparent Economics
          </span>
          <h2 className="font-display font-bold text-[32px] md:text-[40px] text-navy leading-tight mb-4">
            Fair pricing. Zero hidden fees.
          </h2>
          <p className="font-body text-[16px] text-slate leading-relaxed">
            Choose the model that fits your needs. Whether you are booking a repair or growing your professional trade business, we keep our transactions secure, straightforward, and 100% transparent.
          </p>
        </div>

        {/* Tab Switcher Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-navy/5 p-1.5 rounded-full flex items-center relative w-full max-w-[480px] border border-border/40">
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-card transition-all duration-300 ease-out`}
              style={{
                width: "calc(50% - 12px)",
                left: activeTab === "homeowners" ? "6px" : "calc(50% + 6px)",
              }}
            />
            
            <button
              onClick={() => setActiveTab("homeowners")}
              className={`flex-1 text-center py-3.5 rounded-full font-display text-[14px] font-bold relative z-10 transition-colors duration-200 ${
                activeTab === "homeowners" ? "text-navy" : "text-slate hover:text-navy"
              }`}
            >
              For Homeowners
            </button>
            <button
              onClick={() => setActiveTab("artisans")}
              className={`flex-1 text-center py-3.5 rounded-full font-display text-[14px] font-bold relative z-10 transition-colors duration-200 ${
                activeTab === "artisans" ? "text-navy" : "text-slate hover:text-navy"
              }`}
            >
              For Professional Artisans
            </button>
          </div>
        </div>

        {/* Homeowners Cards Grid */}
        {activeTab === "homeowners" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch animate-scale-in">
            
            {/* Card 1: Booking & Search */}
            <div className="bg-white border border-border/50 rounded-card p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6">
                  <Users size={22} />
                </div>
                <h3 className="font-display font-bold text-[20px] text-navy mb-2">
                  Booking & Search
                </h3>
                <p className="font-mono text-slate text-[12px] uppercase tracking-wider mb-4">
                  Free Forever
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="font-display font-bold text-[40px] text-navy">₦0</span>
                </div>
                <p className="font-body text-[14px] text-slate leading-relaxed mb-6 border-b border-border/40 pb-6">
                  Browse vetted local tradespeople, read verified reviews, and submit quotes without any platform access fees.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Unlimited artisan browsing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Vetted review checking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Direct in-app messaging</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="full"
                onClick={() => handleCTA("/search")}
              >
                Find an Artisan
              </Button>
            </div>

            {/* Card 2: Escrow Trust Fee (Highlighted) */}
            <div className="bg-white border-2 border-teal rounded-card p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_40px_rgba(42,157,143,0.12)] hover:-translate-y-1 relative">
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-teal text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                Most Important
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-display font-bold text-[20px] text-navy mb-2">
                  Escrow Trust Fee
                </h3>
                <p className="font-mono text-teal text-[12px] uppercase tracking-wider mb-4 font-semibold">
                  Secured & Protected
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="font-display font-bold text-[40px] text-navy">3%</span>
                  <span className="font-mono text-slate text-[14px] ml-1">of job (max ₦3k)</span>
                </div>
                <p className="font-body text-[14px] text-slate leading-relaxed mb-6 border-b border-border/40 pb-6">
                  Secures your payment in safe escrow. Funds are only released when you confirm the job is successfully done.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80 font-semibold">100% Secure Escrow lock</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">₦100,000 damage insurance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Free dispute arbitration</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="success"
                size="full"
                onClick={() => handleCTA("/search")}
              >
                Book with Escrow
              </Button>
            </div>

            {/* Card 3: Diagnostic Callout */}
            <div className="bg-white border border-border/50 rounded-card p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-6">
                  <Coins size={22} />
                </div>
                <h3 className="font-display font-bold text-[20px] text-navy mb-2">
                  Diagnostic Callout
                </h3>
                <p className="font-mono text-slate text-[12px] uppercase tracking-wider mb-4">
                  Standard Flat Rate
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="font-display font-bold text-[40px] text-navy">₦2,500</span>
                </div>
                <p className="font-body text-[14px] text-slate leading-relaxed mb-6 border-b border-border/40 pb-6">
                  Covers the artisan&apos;s transport and inspection. This fee is credited back into the final bill if you hire them.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Credited to job cost if hired</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Covers artisan transport costs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-teal flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Detailed diagnostic report</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="full"
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                How It Works
              </Button>
            </div>
            
          </div>
        )}

        {/* Artisans Cards Grid */}
        {activeTab === "artisans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch animate-scale-in">
            
            {/* Card 1: Basic Starter */}
            <div className="bg-white border border-border/50 rounded-card p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange mb-6">
                  <Wrench size={22} />
                </div>
                <h3 className="font-display font-bold text-[20px] text-navy mb-2">
                  Basic Starter
                </h3>
                <p className="font-mono text-slate text-[12px] uppercase tracking-wider mb-4">
                  Free Registration
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="font-display font-bold text-[40px] text-navy">₦0</span>
                  <span className="font-mono text-slate text-[14px] ml-1">/ mo</span>
                </div>
                <p className="font-body text-[14px] text-slate leading-relaxed mb-6 border-b border-border/40 pb-6">
                  Set up your digital profile, receive local lead notifications, and start taking customer bookings.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Standard profile page</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">15% booking transaction fee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Standard 48-hour payouts</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="full"
                onClick={() => handleCTA("/join-as-artisan")}
              >
                Register Free
              </Button>
            </div>

            {/* Card 2: Pro Growth (Highlighted) */}
            <div className="bg-white border-2 border-orange rounded-card p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_40px_rgba(231,111,81,0.12)] hover:-translate-y-1 relative">
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-orange text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange mb-6">
                  <TrendingUp size={22} />
                </div>
                <h3 className="font-display font-bold text-[20px] text-navy mb-2">
                  Pro Growth
                </h3>
                <p className="font-mono text-orange text-[12px] uppercase tracking-wider mb-4 font-semibold">
                  Get Vetted Faster
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="font-display font-bold text-[40px] text-navy">₦4,500</span>
                  <span className="font-mono text-slate text-[14px] ml-1">/ mo</span>
                </div>
                <p className="font-body text-[14px] text-slate leading-relaxed mb-6 border-b border-border/40 pb-6">
                  Unlock priority verification, boost search visibility, and retain more earnings with lowered commissions.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80 font-semibold">Priority search ranking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Verified Badge on profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Lowered transaction fee (10%)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Same-day instant payouts</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="primary"
                size="full"
                onClick={() => handleCTA("/join-as-artisan")}
              >
                Go Pro Now
              </Button>
            </div>

            {/* Card 3: Agency Fleet */}
            <div className="bg-white border border-border/50 rounded-card p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange mb-6">
                  <Users size={22} />
                </div>
                <h3 className="font-display font-bold text-[20px] text-navy mb-2">
                  Agency Fleet
                </h3>
                <p className="font-mono text-slate text-[12px] uppercase tracking-wider mb-4">
                  For Teams & Agencies
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="font-display font-bold text-[40px] text-navy">₦15,000</span>
                  <span className="font-mono text-slate text-[14px] ml-1">/ mo</span>
                </div>
                <p className="font-body text-[14px] text-slate leading-relaxed mb-6 border-b border-border/40 pb-6">
                  Manage multiple team members, dispatch incoming jobs, and pay the lowest commissions on the market.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Up to 10 artisan sub-accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Centralized job dispatcher</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Super-low transaction fee (5%)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                    <span className="font-display text-[13px] text-navy/80">Dedicated manager support</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="full"
                onClick={() => handleCTA("/join-as-artisan")}
              >
                Register Agency
              </Button>
            </div>
            
          </div>
        )}

        {/* FAQ / Trust Checklist */}
        <div className="mt-20 pt-16 border-t border-border/60">
          <h4 className="font-display font-bold text-[22px] text-navy text-center mb-10">
            Platform Trust Assurances
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-[14px] text-navy mb-1.5">
                  ₦100,000 Guarantee
                </h5>
                <p className="font-body text-[13px] text-slate leading-relaxed">
                  Every job is insured up to ₦100,000. We fully guarantee work quality and resolve damage claims immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal flex-shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-[14px] text-navy mb-1.5">
                  Secure Escrow Lock
                </h5>
                <p className="font-body text-[13px] text-slate leading-relaxed">
                  Your funds stay locked in the NexPlumb vault. We only release it to the artisan when you confirm the job is done.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal flex-shrink-0">
                <Coins size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-[14px] text-navy mb-1.5">
                  Flat Diagnostic Rate
                </h5>
                <p className="font-body text-[13px] text-slate leading-relaxed">
                  The standard ₦2,500 callout rate is strictly capped. No pricing surprises or transport markup upon arrival.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h5 className="font-display font-bold text-[14px] text-navy mb-1.5">
                  No Hidden Charges
                </h5>
                <p className="font-body text-[13px] text-slate leading-relaxed">
                  The price you agree to in the quote is the price you pay. Material lists and receipt photos are logged inside the system.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
