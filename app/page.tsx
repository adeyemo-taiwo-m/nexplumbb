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
  ArrowRight,
  Zap,
  CheckCircle,
  Users,
  Clock,
} from "lucide-react";
import { useMockDb } from "@/lib/store/mockDb";
import ArtisanCard from "@/components/ui/ArtisanCard";
import Button from "@/components/ui/Button";
import CustomerNavbar from "@/components/layout/CustomerNavbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

export default function Homepage() {
  const router = useRouter();
  const artisans = useMockDb((state) => state.artisans);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customLocation, setCustomLocation] = useState("Surulere");
  const [detectedLocation, setDetectedLocation] = useState("Detecting...");
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([]);
  const [loadingArtisans, setLoadingArtisans] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setFeaturedArtisans(artisans.slice(0, 4));
        setLoadingArtisans(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mounted, artisans]);

  useEffect(() => {
    if (mounted) {
      const t = setTimeout(() => {
        setDetectedLocation("Surulere, Lagos");
        setCustomLocation("Surulere");
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [mounted]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/search?q=${encodeURIComponent(searchQuery.trim())}&location=${encodeURIComponent(customLocation)}`,
    );
  };

  const handleCategoryClick = (category: string) => {
    router.push(
      `/search?category=${encodeURIComponent(category.toLowerCase())}&location=${encodeURIComponent(customLocation)}`,
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D2137] via-[#122A44] to-[#0A1A2B] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const trustMetrics = [
    {
      icon: ShieldCheck,
      value: "1,200+",
      label: "Verified Artisans",
      color: "teal",
    },
    {
      icon: Lock,
      value: "Escrow",
      label: "Protected Payments",
      color: "orange",
    },
    { icon: Star, value: "4.8 / 5", label: "Average Rating", color: "amber" },
    { icon: Users, value: "5,000+", label: "Happy Customers", color: "nxblue" },
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
      icon: Lock,
      title: "Book & Pay Safely",
      description:
        "Choose your artisan, pick a time, and pay through secure escrow. Your money is protected until the job is done.",
    },
    {
      number: 3,
      icon: MapPin,
      title: "Track & Confirm",
      description:
        "Watch your artisan travel to you on a live map. Confirm when the job is complete and release payment.",
    },
  ];

  const seoSections = [
    {
      id: "plumbers-in-lagos",
      title: "Plumbers in Lagos",
      desc: "Access highly rated plumbing professionals for leak repairs, drain unblocking, faucet installations, and pipe layouts. Secure escrow payments ensure full service satisfaction.",
      trade: "Plumbing",
      label: "plumbers",
    },
    {
      id: "electricians-in-lagos",
      title: "Electricians in Lagos",
      desc: "Expert electricians for domestic re-wiring, generator changeover switches, socket replacements, and troubleshooting power outages. Fast response and fully verified profiles.",
      trade: "Electrical",
      label: "electricians",
    },
    {
      id: "carpenters-in-lagos",
      title: "Carpenters in Lagos",
      desc: "Custom woodworking, cabinet makers, door installations, and roof repairs. Connecting you to verified local carpenters with guaranteed expertise across Lagos.",
      trade: "Carpentry",
      label: "carpenters",
    },
    {
      id: "painters-in-lagos",
      title: "Painters in Lagos",
      desc: "Professional screeding and painting services for residential and commercial layouts. Transform your spaces with vetted local artisans offering transparent pricing.",
      trade: "Painting",
      label: "painters",
    },
    {
      id: "tilers-in-lagos",
      title: "Tilers in Lagos",
      desc: "Porcelain, ceramic, marble, and mosaic tile professionals. Floor tiling, wall tiling, and bathroom renovations by trusted, identity-verified artisans.",
      trade: "Tiling",
      label: "tilers",
    },
  ];

  const socialProofReviews = [
    {
      name: "Chisom A.",
      area: "Surulere",
      stars: 5,
      text: "Nexplumb completely saved my day! A kitchen pipe burst at 9:00 AM. I booked Emeka, tracked him, and by 11:30 AM the pipe was replaced. The escrow system felt super secure!",
    },
    {
      name: "Kunle O.",
      area: "Yaba",
      stars: 4,
      text: "Very smooth experience. Tunde was professional, did neat wiring, and cleared up afterwards. Love that I can pay by bank transfer directly on the app.",
    },
    {
      name: "Nkechi E.",
      area: "Lekki",
      stars: 5,
      text: "Having a verified artisan come into my home makes me feel safe. Knowing their NIN has been checked by Nexplumb is a game changer for safety in Lagos.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CustomerNavbar />

      <main className="flex-grow flex flex-col">
        {/* ══════════════ HERO ══════════════ */}
        <section className="w-full bg-gradient-to-br from-[#0D2137] via-[#122A44] to-[#0A1A2B] text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1200px] mx-auto w-full px-6 tablet:px-10 py-20 md:py-28 grid grid-cols-1 desktop:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left */}
            <div className="desktop:col-span-7 flex flex-col items-start">
              <div className="animate-fade-in-up">
                <span className="inline-flex items-center gap-2 bg-teal/15 text-teal border border-teal/20 rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider mb-6">
                  <Zap size={12} /> Nigeria&apos;s #1 Artisan Marketplace
                </span>
              </div>

              <h1 className="font-display font-bold text-[40px] tablet:text-[52px] text-white leading-[1.1] animate-fade-in-up delay-100">
                Your trusted artisan, <br />
                <span className="gradient-text">one tap away</span>
              </h1>

              <p className="font-body text-[16px] tablet:text-[18px] text-white/80 mt-5 max-w-[560px] leading-relaxed animate-fade-in-up delay-200">
                Find verified plumbers, electricians, carpenters and painters
                near you in Lagos, Nigeria — instantly. Your funds are protected
                in escrow until the work is complete.
              </p>

              {/* Search Panel */}
              <form
                onSubmit={handleSearch}
                className="w-full max-w-[620px] glass-card rounded-modal mt-8 p-3 animate-fade-in-up delay-300"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2.5 bg-white/10 rounded-card px-4 py-3 border border-white/10 focus-within:bg-white/15 transition-colors">
                    <Search size={18} className="text-white/50 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="What do you need? e.g. leaking pipe..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-white font-mono text-[13px] focus:outline-none focus-visible:!outline-none placeholder:text-white/40"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-card px-4 py-3 border border-white/10 sm:w-40 focus-within:bg-white/15 transition-colors">
                    <MapPin size={16} className="text-orange flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Area / LGA"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full bg-transparent text-white font-mono text-[13px] focus:outline-none focus-visible:!outline-none placeholder:text-white/40"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full sm:w-28 flex-shrink-0"
                  >
                    Search
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-white/50 px-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                  {detectedLocation}
                </div>
              </form>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2 mt-6 w-full animate-fade-in-up delay-400">
                {[
                  "🔧 Plumbing",
                  "⚡ Electrical",
                  "🪚 Carpentry",
                  "🎨 Painting",
                  "🔲 Tiling",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat.split(" ")[1])}
                    className="bg-white/8 text-white/90 font-display text-[12px] font-semibold border border-white/15 rounded-full px-4 py-2 hover:bg-white/15 hover:border-white/30 transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — Floating Trust Visual */}
            <div className="hidden desktop:flex desktop:col-span-5 flex-col items-center justify-center relative">
              <div className="animate-fade-in-up delay-300 w-full">
                <div className="glass-card rounded-modal p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-teal/8 rounded-bl-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange/8 rounded-tr-full pointer-events-none" />

                  <div className="animate-float">
                    <div className="w-20 h-20 bg-orange/15 rounded-full flex items-center justify-center text-orange mx-auto mb-5 border border-orange/20 animate-border-glow">
                      <ShieldCheck size={40} />
                    </div>
                  </div>

                  <h3 className="text-white text-[20px] font-display font-bold">
                    Trust-First Platform
                  </h3>
                  <p className="text-white/65 font-body text-[14px] mt-2 max-w-[280px] mx-auto leading-relaxed">
                    Every artisan undergoes NIMC NIN checks, BVN verification,
                    and guarantor audits.
                  </p>

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                      { label: "Verified", value: "1.2K+", icon: CheckCircle },
                      { label: "Avg. ETA", value: "35min", icon: Clock },
                      { label: "Rating", value: "4.8★", icon: Star },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white/5 rounded-card py-3 px-2 border border-white/8"
                      >
                        <p className="font-mono text-[14px] font-bold text-white">
                          {stat.value}
                        </p>
                        <p className="font-mono text-[9px] text-white/50 uppercase tracking-wider mt-0.5">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ TRUST BAR ══════════════ */}
        <section className="w-full bg-gradient-to-r from-[#0A1A2B] to-[#0D2137] border-t border-white/5 py-8">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 tablet:grid-cols-4 gap-6">
            {trustMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-white animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`p-2.5 rounded-card bg-${metric.color}/10 text-${metric.color} border border-${metric.color}/15`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[18px] font-display font-bold leading-none">
                      {metric.value}
                    </p>
                    <p className="text-[10px] font-mono text-white/55 mt-1 uppercase tracking-wider">
                      {metric.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section
          id="how-it-works"
          className="w-full bg-white py-24 border-b border-border"
        >
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
            <span className="inline-block font-mono text-[11px] font-bold text-teal uppercase tracking-widest mb-3">
              Simple Process
            </span>
            <h2 className="text-h2 text-navy mb-4">
              Book a trusted artisan in 3 steps
            </h2>
            <p className="font-body text-[16px] text-slate max-w-[520px] mx-auto mb-16">
              Our secure process protects your time, your money, and your home
              from start to finish.
            </p>

            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 text-left">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="card-hover-lift flex flex-col items-start p-7 rounded-card border border-border bg-lgray/30 group"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="w-11 h-11 bg-orange text-white rounded-full font-display font-bold text-[16px] flex items-center justify-center select-none shadow-lg group-hover:scale-110 transition-transform">
                        {step.number}
                      </span>
                      <div className="p-2 bg-teal/8 rounded-card group-hover:bg-teal/15 transition-colors">
                        <Icon size={24} className="text-teal" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-[18px] text-navy mt-6">
                      {step.title}
                    </h3>
                    <p className="font-body text-[14px] text-slate mt-2.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-16">
              <Link href="/search">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-10 py-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  Find an artisan now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════ FEATURED ARTISANS ══════════════ */}
        <section className="w-full bg-lgray/30 py-24 border-b border-border">
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="inline-block font-mono text-[11px] font-bold text-teal uppercase tracking-widest mb-2">
                  Top Rated
                </span>
                <h2 className="text-h2 text-navy">
                  Featured artisans near you
                </h2>
                <p className="font-mono text-[12px] text-teal mt-2 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal inline-block animate-pulse" />
                  Vetted &amp; Active in Lagos
                </p>
              </div>
              <Link
                href="/search"
                className="font-mono text-[13px] text-nxblue font-bold hover:underline flex items-center gap-1.5 select-none group"
              >
                See all artisans{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {loadingArtisans ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-card border border-border p-6 flex flex-col items-center animate-pulse shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-full bg-lgray-dark" />
                    <div className="h-4 bg-lgray-dark rounded w-2/3 mt-5" />
                    <div className="h-3 bg-lgray-dark rounded w-1/2 mt-2" />
                    <div className="h-10 bg-lgray-dark rounded w-full mt-6" />
                  </div>
                ))}
              </div>
            ) : featuredArtisans.length === 0 ? (
              <div className="bg-white border border-border rounded-card p-12 text-center">
                <p className="text-slate font-body">
                  No artisans found yet. Be the first to sign up!
                </p>
                <Link href="/join-as-artisan">
                  <Button variant="secondary" size="sm" className="mt-4">
                    Register Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-6">
                {featuredArtisans.map((artisan) => (
                  <ArtisanCard
                    key={artisan.id}
                    variant="vertical"
                    {...artisan}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ══════════════ SEO TRADE SECTIONS ══════════════ */}
        {seoSections.map((sec, index) => {
          const matchingArtisans = artisans
            .filter((a) => a.trade === sec.trade)
            .slice(0, 2);
          return (
            <section
              key={sec.id}
              id={sec.id}
              className={`w-full py-20 border-b border-border ${index % 2 === 0 ? "bg-white" : "bg-lgray/20"}`}
            >
              <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 grid grid-cols-1 desktop:grid-cols-12 gap-10 items-center">
                <div className="desktop:col-span-5">
                  <span className="inline-block font-mono text-[11px] font-bold text-teal uppercase tracking-widest mb-2">
                    Trade Category
                  </span>
                  <h2 className="text-h2 text-navy mb-4">{sec.title}</h2>
                  <p className="font-body text-[15px] text-body leading-relaxed max-w-[480px]">
                    {sec.desc}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 select-none">
                    <span className="font-mono text-[10px] font-bold bg-teal/8 text-teal border border-teal/15 px-3 py-1.5 rounded-full">
                      Escrow Guarded
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-nxblue/8 text-nxblue border border-nxblue/15 px-3 py-1.5 rounded-full">
                      NIN Verified
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(sec.trade)}
                    className="mt-6 font-mono text-[13px] font-bold text-orange hover:underline flex items-center gap-1 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal"
                  >
                    Find more {sec.label} near you{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
                <div className="desktop:col-span-7 flex flex-col gap-4">
                  {matchingArtisans.length === 0 ? (
                    <div className="p-6 bg-lgray/30 border border-border border-dashed rounded-card text-center text-slate text-[14px]">
                      Onboarding {sec.label} in your area...
                    </div>
                  ) : (
                    matchingArtisans.map((art) => (
                      <ArtisanCard key={art.id} variant="horizontal" {...art} />
                    ))
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* ══════════════ SOCIAL PROOF ══════════════ */}
        <section className="w-full bg-white py-24">
          <div className="max-w-[1200px] mx-auto px-6 tablet:px-10 text-center">
            <span className="inline-block font-mono text-[11px] font-bold text-teal uppercase tracking-widest mb-3">
              Testimonials
            </span>
            <h2 className="text-h2 text-navy mb-14">
              What Lagos residents say
            </h2>

            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 text-left">
              {socialProofReviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="card-hover-lift bg-lgray/40 rounded-card p-6 border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-0.5 text-amber mb-4 select-none">
                      {Array.from({ length: rev.stars }).map((_, i) => (
                        <Star key={i} size={14} className="fill-current" />
                      ))}
                    </div>
                    <p className="font-body text-[14px] text-body italic leading-relaxed">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                    <div className="w-9 h-9 bg-navy text-white rounded-full font-display font-bold text-[13px] flex items-center justify-center select-none uppercase">
                      {rev.name[0]}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-[13px] text-navy leading-none">
                        {rev.name}
                      </h4>
                      <p className="font-mono text-[10px] text-slate mt-1">
                        {rev.area}, Lagos
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
