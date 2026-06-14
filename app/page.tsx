"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  ShieldCheck,
  Lock,
  Star,
  Zap,
  CheckCircle,
} from "lucide-react";
import { useMockDb, Artisan } from "@/lib/store/mockDb";
import ArtisanCard from "@/components/ui/ArtisanCard";
import Button from "@/components/ui/Button";
import CustomerNavbar from "@/components/layout/CustomerNavbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { toast } from "sonner";
import EscrowExplainer from "@/components/homepage/EscrowExplainer";
import ServicesCatalogue from "@/components/homepage/ServicesCatalogue";
import TrustStack from "@/components/homepage/TrustStack";
import SocialProof from "@/components/homepage/SocialProof";
import HeroSearchBar from "@/components/homepage/HeroSearchBar";
import ArtisanCTA from "@/components/homepage/ArtisanCTA";
import TradesBrowser from "@/components/homepage/TradesBrowser";
import PricingSection from "@/components/homepage/PricingSection";

export default function Homepage() {
  const router = useRouter();
  const dbArtisans = useMockDb((state) => state.artisans);

  // States
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("Lagos");
  const [locationStatus, setLocationStatus] = useState<
    "detecting" | "detected" | "denied" | "error"
  >("detecting");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const [loadingArtisans, setLoadingArtisans] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<Record<string, boolean>>(
    {},
  );

  const availableLGAs = [
    "Surulere",
    "Yaba",
    "Ikeja",
    "Lekki",
    "Victoria Island",
    "Ebute Metta",
    "Maryland",
    "Apapa",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Geolocation detector
  useEffect(() => {
    if (mounted) {
      if (!navigator.geolocation) {
        setLocationStatus("denied");
        setLocationName("Lagos");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setLocationStatus("detected");
            setLocationName("Surulere");
          }, 1200);
        },
        (error) => {
          setTimeout(() => {
            setLocationStatus("denied");
            setLocationName("Lagos");
          }, 1200);
        },
        { timeout: 4000 },
      );
    }
  }, [mounted]);

  // Featured Artisans fetch simulator
  useEffect(() => {
    if (mounted) {
      setLoadingArtisans(true);
      setApiError(false);

      const timer = setTimeout(() => {
        try {
          let filtered = dbArtisans;
          if (locationName !== "Lagos") {
            filtered = dbArtisans.filter(
              (artisan) =>
                artisan.area.toLowerCase() === locationName.toLowerCase(),
            );
          }
          setFeaturedArtisans(filtered.slice(0, 4));
          setLoadingArtisans(false);
        } catch (err) {
          setApiError(true);
          setLoadingArtisans(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mounted, locationName, dbArtisans]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/search?q=${encodeURIComponent(searchQuery.trim())}&location=${encodeURIComponent(locationName)}`,
    );
  };

  const handleCategoryClick = (category: string) => {
    router.push(
      `/search?category=${encodeURIComponent(category.toLowerCase())}&location=${encodeURIComponent(locationName)}`,
    );
  };

  const handleJoinWaitlist = (lga: string) => {
    setWaitlistStatus((prev) => ({ ...prev, [lga]: true }));
    toast.success(
      `Successfully joined the artisan waitlist for ${lga}! We'll notify you as soon as they register.`,
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const trustMetrics = [
    { icon: ShieldCheck, value: "1,200+", label: "Verified Artisans" },
    { icon: Lock, value: "Escrow", label: "Protected Payments" },
    { icon: Star, value: "4.8 / 5", label: "Average Rating" },
  ];

  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Search",
      description:
        "Type what you need or pick a category. We'll show you verified artisans near your location in seconds.",
    },
    {
      number: 2,
      icon: ShieldCheck,
      title: "Book & pay safely",
      description:
        "Choose your artisan, pick a time, and pay through secure escrow. Your money is protected until the job is done.",
    },
    {
      number: 3,
      icon: MapPin,
      title: "Track & confirm",
      description:
        "Watch your artisan travel to you on a live map. Confirm when the job is complete and release payment.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Structured SEO Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "NexPlumb",
            image: "https://nexplumb.com/logo.png",
            description:
              "Nigeria's trust-first artisan marketplace connecting urban residents to vetted, insured professionals through secure escrow.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Lagos",
              addressCountry: "NG",
            },
            url: "https://nexplumb.com",
          }),
        }}
      />

      <CustomerNavbar />

      <main className="flex-grow flex flex-col">
        {/* ══════════════ SECTION 1: HERO ══════════════ */}
        <section className="w-full bg-navy text-white min-h-[580px] relative overflow-hidden flex items-center">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-[1200px] mx-auto w-full px-6 tablet:px-10 py-24 md:py-32 grid grid-cols-1 desktop:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column (55%) */}
            <div className="desktop:col-span-7 flex flex-col items-start text-left">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-2 bg-teal/10 text-teal border border-teal/20 rounded-full px-4.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider mb-6">
                  <Zap size={12} className="animate-pulse" /> Nigeria&apos;s #1
                  Escrow Artisan Marketplace
                </span>
              </div>

              {/* H1 Headline */}
              <h1 className="font-display font-bold text-[44px] tablet:text-[54px] text-white leading-tight animate-fade-in-up delay-100">
                Your trusted artisan, <br />
                <span className="text-orange">
                  one tap away
                </span>
              </h1>

              {/* Subheadline */}
              <p className="font-body text-[18px] text-white/80 mt-4 max-w-[520px] leading-relaxed animate-fade-in-up delay-200">
                Find verified plumbers, electricians, and tradespeople near you
                in Lagos — instantly
              </p>

              {/* ── FIXED SEARCH BAR ── */}
              <HeroSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
              />

              {/* Location Selector */}
              <div className="mt-3 flex items-center gap-2 font-mono text-[12px] text-white/70 relative">
                <span>📍</span>
                {locationStatus === "detecting" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                    Auto-detecting your location...
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span>
                      {locationName === "Lagos"
                        ? "Lagos, Nigeria"
                        : `${locationName}, Lagos`}
                    </span>
                    {locationStatus === "denied" && (
                      <span className="text-white/40 text-[10px]">
                        (Location denied, showing Lagos-wide)
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowLocationDropdown(!showLocationDropdown)
                      }
                      className="text-teal hover:text-teal-light underline font-bold focus:outline-none transition-colors"
                    >
                      [change]
                    </button>
                  </div>
                )}

                {/* LGA Dropdown */}
                {showLocationDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLocationDropdown(false)}
                    />
                    <div className="absolute left-0 mt-8 w-56 bg-white border border-border rounded-card shadow-modal py-2 z-50 text-body font-display text-[13px]">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationName("Lagos");
                          setLocationStatus("denied");
                          setShowLocationDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-lgray transition-colors font-bold text-navy"
                      >
                        All Lagos (Lagos-wide)
                      </button>
                      <div className="border-t border-border/40 my-1" />
                      {availableLGAs.map((lga) => (
                        <button
                          key={lga}
                          type="button"
                          onClick={() => {
                            setLocationName(lga);
                            setLocationStatus("detected");
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-lgray transition-colors"
                        >
                          {lga}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Service Category Chips */}
              <div className="flex flex-wrap gap-2.5 mt-6 w-full animate-fade-in-up delay-400">
                {[
                  { label: "🔧 Plumbing", slug: "plumbing" },
                  { label: "⚡ Electrical", slug: "electrical" },
                  { label: "🪚 Carpentry", slug: "carpentry" },
                  { label: "🎨 Painting", slug: "painting" },
                  { label: "🔲 Tiling", slug: "tiling" },
                ].map((chip) => (
                  <button
                    key={chip.slug}
                    type="button"
                    onClick={() => handleCategoryClick(chip.slug)}
                    className="bg-white/20 text-white border border-white/30 rounded-full px-4 py-2 hover:bg-white/30 hover:border-white/50 transition-all cursor-pointer font-display text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column Illustration (45%, Desktop Only) */}
            <div className="hidden tablet:block desktop:col-span-5 relative justify-center items-center">
              <div className="w-full max-w-[420px] mx-auto animate-fade-in-up delay-300">
                <svg
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-2xl"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="180"
                    fill="url(#hero-circle-grad)"
                  />
                  <circle
                    cx="200"
                    cy="200"
                    r="140"
                    fill="none"
                    stroke="rgba(42, 157, 143, 0.15)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    className="animated-dashed"
                  />
                  <rect
                    x="90"
                    y="240"
                    width="220"
                    height="70"
                    rx="14"
                    fill="#122A44"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                  />
                  <rect
                    x="110"
                    y="220"
                    width="180"
                    height="40"
                    rx="8"
                    fill="#0D2137"
                  />
                  <path
                    d="M 70 310 Q 50 240 85 200 Q 110 240 70 310"
                    fill="url(#plant-grad)"
                    opacity="0.85"
                    className="animated-plant"
                  />
                  <circle cx="75" cy="300" r="10" fill="#E76F51" />
                  <g filter="url(#shield-shadow)" className="animated-shield">
                    <path
                      d="M 200 80 Q 250 80 270 120 Q 270 190 200 230 Q 130 190 130 120 Q 150 80 200 80 Z"
                      fill="#2A9D8F"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                    />
                    <path
                      d="M 180 155 L 195 170 L 225 130"
                      stroke="#FFFFFF"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animated-checkmark"
                    />
                  </g>
                  <g transform="translate(260, 240)">
                    <g className="animated-badge-right">
                      <rect
                        x="0"
                        y="0"
                        width="110"
                        height="36"
                        rx="18"
                        fill="rgba(13,33,55,0.9)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1.5"
                      />
                      <circle cx="18" cy="18" r="8" fill="#2E86AB" />
                      <text
                        x="34"
                        y="22"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontFamily="Sora, sans-serif"
                        fontWeight="bold"
                      >
                        NIN Vetted
                      </text>
                    </g>
                  </g>
                  <g transform="translate(30, 130)">
                    <g className="animated-badge-left">
                      <rect
                        x="0"
                        y="0"
                        width="100"
                        height="36"
                        rx="18"
                        fill="rgba(13,33,55,0.9)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1.5"
                      />
                      <circle cx="18" cy="18" r="8" fill="#E76F51" />
                      <text
                        x="34"
                        y="22"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontFamily="Sora, sans-serif"
                        fontWeight="bold"
                      >
                        Escrow Safe
                      </text>
                    </g>
                  </g>
                  <defs>
                    <style>{`
                      @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                      }
                      @keyframes rotate-dashed {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                      @keyframes pulse-glow {
                        0%, 100% { filter: drop-shadow(0 0 4px rgba(42, 157, 143, 0.3)); }
                        50% { filter: drop-shadow(0 0 14px rgba(42, 157, 143, 0.75)); }
                      }
                      @keyframes sway {
                        0%, 100% { transform: rotate(0deg); }
                        50% { transform: rotate(-3deg); }
                      }
                      @keyframes bob-right {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-4px); }
                      }
                      @keyframes bob-left {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(4px); }
                      }
                      @keyframes draw-check {
                        from { stroke-dashoffset: 80; }
                        to { stroke-dashoffset: 0; }
                      }
                      .animated-shield {
                        animation: float 5s ease-in-out infinite, pulse-glow 3.5s ease-in-out infinite;
                        transform-origin: 200px 155px;
                      }
                      .animated-dashed {
                        animation: rotate-dashed 30s linear infinite;
                        transform-origin: 200px 200px;
                      }
                      .animated-plant {
                        animation: sway 7s ease-in-out infinite;
                        transform-origin: 75px 300px;
                      }
                      .animated-badge-right {
                        animation: bob-right 4s ease-in-out infinite;
                      }
                      .animated-badge-left {
                        animation: bob-left 4.2s ease-in-out infinite;
                      }
                      .animated-checkmark {
                        stroke-dasharray: 80;
                        stroke-dashoffset: 80;
                        animation: draw-check 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        animation-delay: 0.5s;
                      }
                    `}</style>
                    <linearGradient
                      id="hero-circle-grad"
                      x1="200"
                      y1="20"
                      x2="200"
                      y2="380"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="rgba(42, 157, 143, 0.08)" />
                      <stop offset="1" stopColor="rgba(231, 111, 81, 0.03)" />
                    </linearGradient>
                    <linearGradient
                      id="plant-grad"
                      x1="70"
                      y1="200"
                      x2="70"
                      y2="310"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#2A9D8F" />
                      <stop offset="1" stopColor="#122A44" />
                    </linearGradient>
                    <filter
                      id="shield-shadow"
                      x="110"
                      y="60"
                      width="180"
                      height="200"
                      filterUnits="userSpaceOnUse"
                    >
                      <feDropShadow
                        dx="0"
                        dy="8"
                        stdDeviation="10"
                        floodColor="#0D2137"
                        floodOpacity="0.4"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ SECTION 2: TRUST BAR ══════════════ */}
        <section className="w-full bg-navy/95 border-t border-white/10 py-6">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center gap-6 tablet:flex-row tablet:justify-center tablet:gap-12 desktop:gap-20">
            {trustMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div key={idx} className="flex items-center gap-3 text-white">
                  <Icon size={32} className="text-teal" />
                  <div className="text-left">
                    <p className="text-[22px] font-bold leading-none">
                      {metric.value}
                    </p>
                    <p className="text-[14px] text-white/70 mt-1">
                      {metric.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ SECTION 3: HOW IT WORKS ══════════════ */}
        <section
          id="how-it-works"
          className="bg-white py-20 border-b border-border"
        >
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
            <h2 className="text-h2 font-display font-bold text-navy text-center mb-12">
              Book a trusted artisan in 3 steps
            </h2>
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8 text-left">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-start p-6 rounded-card border border-border bg-lgray/10 hover:border-teal/30 hover:shadow-card transition-all duration-200"
                  >
                    <div className="flex items-center justify-between w-full mb-6">
                      <Icon size={40} className="text-teal" />
                      <div className="w-10 h-10 bg-orange text-white rounded-full font-bold text-[16px] flex items-center justify-center shadow-md">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-h3 font-display font-semibold text-navy">
                      {step.title}
                    </h3>
                    <p className="font-body text-[14px] text-slate mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Link href="/search">
                <Button variant="primary" size="md" className="px-8 font-bold">
                  Find an artisan now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════ SECTION 4: FEATURED ARTISANS ══════════════ */}
        <section className="w-full bg-lgray py-20 border-b border-border">
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10">
            <div className="flex items-end justify-between mb-8">
              <div className="text-left">
                <h2 className="text-h2 font-display font-bold text-navy leading-tight">
                  Top-rated artisans near you
                </h2>
                <p className="font-mono text-[13px] text-teal font-bold mt-1">
                  {locationStatus === "denied"
                    ? "in Lagos"
                    : `in ${locationName}`}
                </p>
              </div>
              <Link
                href="/search"
                className="font-display text-[14px] font-semibold text-nxblue hover:underline whitespace-nowrap"
              >
                See all artisans
              </Link>
            </div>

            {loadingArtisans ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-card border border-border p-5 flex flex-col items-center animate-pulse shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-full bg-border/40" />
                    <div className="h-4 bg-border/40 rounded w-2/3 mt-5" />
                    <div className="h-3 bg-border/40 rounded w-1/2 mt-2" />
                    <div className="h-10 bg-border/40 rounded w-full mt-6" />
                  </div>
                ))}
              </div>
            ) : apiError ? (
              <div className="py-4 text-center text-slate font-mono text-[13px]">
                Unable to load artisans. Try searching above.
              </div>
            ) : featuredArtisans.length === 0 ? (
              <div className="bg-white border border-border rounded-card p-10 text-center max-w-[600px] mx-auto shadow-card">
                <p className="font-display font-bold text-navy text-[16px] mb-2">
                  Coming soon — artisans signing up now in {locationName}
                </p>
                <p className="font-body text-slate text-[14px] mb-6">
                  We are currently onboarding top-rated plumbers, electricians,
                  and tilers in your neighborhood.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleJoinWaitlist(locationName)}
                  disabled={!!waitlistStatus[locationName]}
                >
                  {waitlistStatus[locationName]
                    ? "Joined Waitlist ✓"
                    : "Join waitlist"}
                </Button>
              </div>
            ) : (
              <div>
                <div className="hidden sm:grid sm:grid-cols-2 desktop:grid-cols-4 gap-6">
                  {featuredArtisans.map((artisan) => (
                    <ArtisanCard
                      key={artisan.id}
                      variant="vertical"
                      {...artisan}
                    />
                  ))}
                </div>
                <div className="sm:hidden overflow-x-auto pb-4 flex gap-4 w-full scrollbar-hide">
                  {featuredArtisans.map((artisan) => (
                    <div
                      key={artisan.id}
                      className="min-w-[280px] w-[280px] flex-shrink-0"
                    >
                      <ArtisanCard variant="vertical" {...artisan} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════ SECTIONS 5-10 ══════════════ */}
        <EscrowExplainer />
        <ServicesCatalogue />
        <TrustStack />
        <SocialProof />
        <PricingSection />
        <ArtisanCTA />
        <TradesBrowser />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
