'use client'

import React, { useMemo } from 'react'
import { useMockDb } from '@/lib/store/mockDb'
import { formatNaira } from '@/lib/format'
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Map, 
  Users,
  Briefcase
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { bookings, artisans, customers } = useMockDb()

  // General counts
  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'job_complete').length
  const disputedBookings = bookings.filter(b => b.status === 'disputed').length

  // Financial calculations
  const totalVolume = useMemo(() => {
    return bookings
      .filter(b => b.status === 'completed' || b.status === 'job_complete')
      .reduce((sum, b) => sum + b.amount, 0)
  }, [bookings])

  const platformRevenue = useMemo(() => {
    // 12% commission
    return Math.round(totalVolume * 0.12)
  }, [totalVolume])

  const averageJobValue = useMemo(() => {
    if (totalBookings === 0) return 0
    const totalSum = bookings.reduce((sum, b) => sum + b.amount, 0)
    return Math.round(totalSum / totalBookings)
  }, [bookings, totalBookings])

  // Conversion rates (mocked ratios based on seed metrics)
  const funnel = {
    visitors: 12400,
    searchClicks: 4210,
    bookingsCreated: totalBookings + 84, // add offset for realistic scale
    jobsCompleted: completedBookings + 76
  }

  // Calculate percentages
  const searchConversion = ((funnel.searchClicks / funnel.visitors) * 100).toFixed(1)
  const bookingConversion = ((funnel.bookingsCreated / funnel.searchClicks) * 100).toFixed(1)
  const completionConversion = ((funnel.jobsCompleted / funnel.bookingsCreated) * 100).toFixed(1)

  // Geographic breakdowns
  const areaBreakdown = useMemo(() => {
    const counts: { [key: string]: number } = {}
    artisans.forEach(a => {
      counts[a.area] = (counts[a.area] || 0) + 1
    })
    
    // Sort areas by count descending
    return Object.entries(counts)
      .map(([area, count]) => ({
        area,
        count,
        percentage: Math.round((count / (artisans.length || 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }, [artisans])

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-h1 text-navy font-display font-semibold">Operational Analytics</h1>
        <p className="font-body text-[14px] text-slate mt-0.5">
          Review revenue trajectories, conversion funnel performance, and artisan coverage densities in Lagos.
        </p>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 desktop:grid-cols-4 gap-4">
        
        {/* Total GMV */}
        <div className="bg-white rounded-card p-5 border border-border shadow-card text-left flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider block">Completed Escrow Volume (GMV)</span>
            <p className="font-mono text-[24px] font-bold text-navy mt-1.5">{formatNaira(totalVolume)}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-green-600 font-bold">
            <TrendingUp size={14} /> +18.4% vs last month
          </div>
        </div>

        {/* Platform Commission Revenue */}
        <div className="bg-white rounded-card p-5 border border-border shadow-card text-left flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider block">Net Revenue (12% Commission)</span>
            <p className="font-mono text-[24px] font-bold text-teal mt-1.5">{formatNaira(platformRevenue)}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-green-600 font-bold">
            <TrendingUp size={14} /> +18.4% vs last month
          </div>
        </div>

        {/* Avg Job Value */}
        <div className="bg-white rounded-card p-5 border border-border shadow-card text-left flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider block">Average Booking Value</span>
            <p className="font-mono text-[24px] font-bold text-navy mt-1.5">{formatNaira(averageJobValue)}</p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-slate font-bold">
            Based on all platform jobs
          </div>
        </div>

        {/* Dispute Rate */}
        <div className="bg-white rounded-card p-5 border border-border shadow-card text-left flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider block">Dispute Arbitration Rate</span>
            <p className="font-mono text-[24px] font-bold text-red-600 mt-1.5">
              {totalBookings > 0 ? ((disputedBookings / totalBookings) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-green-600 font-bold">
            <TrendingDown size={14} /> -0.4% SLA reduction
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONVERSION FUNNEL & TRAJECTORY (8 columns) */}
        <div className="desktop:col-span-8 flex flex-col gap-6">
          
          {/* Conversion Funnel */}
          <section className="bg-white rounded-card border border-border p-5 shadow-card text-left">
            <h3 className="font-display font-bold text-[15px] text-navy mb-4 flex items-center gap-1.5 border-b border-border pb-2.5">
              <Percent size={18} className="text-teal" />
              Customer Search-to-Payout Funnel (Lagos Traffic)
            </h3>

            <div className="flex flex-col gap-4 font-mono text-[12px] mt-4">
              
              {/* Funnel Stage 1 */}
              <div className="flex items-center gap-4">
                <span className="w-32 text-slate uppercase font-bold text-[10px]">1. Search Visitors</span>
                <div className="flex-1 h-8 bg-lgray rounded overflow-hidden relative flex items-center justify-between px-3">
                  <div className="absolute inset-0 bg-navy/10 w-full" />
                  <span className="relative font-bold text-navy">{funnel.visitors.toLocaleString()}</span>
                  <span className="relative text-slate text-[10px]">100% Entry</span>
                </div>
              </div>

              {/* Conversion bar 1 */}
              <div className="flex justify-center pl-32 text-teal font-bold text-[11px]">
                ↓ Conversion: {searchConversion}%
              </div>

              {/* Funnel Stage 2 */}
              <div className="flex items-center gap-4">
                <span className="w-32 text-slate uppercase font-bold text-[10px]">2. Artisan Clicks</span>
                <div className="flex-1 h-8 bg-lgray rounded overflow-hidden relative flex items-center justify-between px-3">
                  <div className="absolute inset-0 bg-teal/20" style={{ width: `${searchConversion}%` }} />
                  <span className="relative font-bold text-navy">{funnel.searchClicks.toLocaleString()}</span>
                  <span className="relative text-slate text-[10px]">{searchConversion}% click-thru</span>
                </div>
              </div>

              {/* Conversion bar 2 */}
              <div className="flex justify-center pl-32 text-teal font-bold text-[11px]">
                ↓ Conversion: {bookingConversion}%
              </div>

              {/* Funnel Stage 3 */}
              <div className="flex items-center gap-4">
                <span className="w-32 text-slate uppercase font-bold text-[10px]">3. Bookings Lock</span>
                <div className="flex-1 h-8 bg-lgray rounded overflow-hidden relative flex items-center justify-between px-3">
                  <div className="absolute inset-0 bg-nxblue/20" style={{ width: `${parseFloat(searchConversion) * parseFloat(bookingConversion) / 100}%` }} />
                  <span className="relative font-bold text-navy">{funnel.bookingsCreated.toLocaleString()}</span>
                  <span className="relative text-slate text-[10px]">Escrow secured</span>
                </div>
              </div>

              {/* Conversion bar 3 */}
              <div className="flex justify-center pl-32 text-teal font-bold text-[11px]">
                ↓ Conversion: {completionConversion}%
              </div>

              {/* Funnel Stage 4 */}
              <div className="flex items-center gap-4">
                <span className="w-32 text-slate uppercase font-bold text-[10px]">4. Jobs Released</span>
                <div className="flex-1 h-8 bg-lgray rounded overflow-hidden relative flex items-center justify-between px-3">
                  <div className="absolute inset-0 bg-teal/40" style={{ width: `${parseFloat(searchConversion) * parseFloat(bookingConversion) * parseFloat(completionConversion) / 10000}%` }} />
                  <span className="relative font-bold text-teal">{funnel.jobsCompleted.toLocaleString()}</span>
                  <span className="relative text-teal font-bold uppercase text-[10px]">Payout Released</span>
                </div>
              </div>

            </div>
          </section>

          {/* Monthly trajectory chart using custom SVG */}
          <section className="bg-white rounded-card border border-border p-5 shadow-card text-left">
            <h3 className="font-display font-bold text-[15px] text-navy mb-4 flex items-center gap-1.5 border-b border-border pb-2.5">
              <BarChart2 size={18} className="text-teal" />
              Monthly Gross Merchandise Volume Trajectory (GMV)
            </h3>

            {/* SVG Chart */}
            <div className="w-full flex justify-center py-2">
              <svg className="w-full max-w-[600px] h-48 font-mono text-[9px] text-slate" viewBox="0 0 600 200">
                {/* Grid Lines */}
                <line x1="50" y1="20" x2="560" y2="20" stroke="#E5E8EC" strokeDasharray="3" />
                <line x1="50" y1="60" x2="560" y2="60" stroke="#E5E8EC" strokeDasharray="3" />
                <line x1="50" y1="100" x2="560" y2="100" stroke="#E5E8EC" strokeDasharray="3" />
                <line x1="50" y1="140" x2="560" y2="140" stroke="#E5E8EC" strokeDasharray="3" />
                <line x1="50" y1="170" x2="560" y2="170" stroke="#D5D8DC" strokeWidth="1.5" />

                {/* Y Axis Labels */}
                <text x="10" y="24" fill="#717D7E">₦400,000</text>
                <text x="10" y="64" fill="#717D7E">₦300,000</text>
                <text x="10" y="104" fill="#717D7E">₦200,000</text>
                <text x="10" y="144" fill="#717D7E">₦100,000</text>
                <text x="35" y="174" fill="#717D7E">0</text>

                {/* Bars - Monthly GMV (Jan to Jun 2026) */}
                {/* Jan: 110k */}
                <rect x="75" y="126" width="36" height="44" rx="3" fill="#0D2137" />
                <text x="78" y="120" fill="#0D2137" fontWeight="bold">₦110k</text>
                <text x="83" y="186" fill="#717D7E">JAN</text>

                {/* Feb: 160k */}
                <rect x="155" y="106" width="36" height="64" rx="3" fill="#0D2137" />
                <text x="158" y="100" fill="#0D2137" fontWeight="bold">₦160k</text>
                <text x="163" y="186" fill="#717D7E">FEB</text>

                {/* Mar: 220k */}
                <rect x="235" y="82" width="36" height="88" rx="3" fill="#0D2137" />
                <text x="238" y="76" fill="#0D2137" fontWeight="bold">₦220k</text>
                <text x="243" y="186" fill="#717D7E">MAR</text>

                {/* Apr: 280k */}
                <rect x="315" y="58" width="36" height="112" rx="3" fill="#0D2137" />
                <text x="318" y="52" fill="#0D2137" fontWeight="bold">₦280k</text>
                <text x="323" y="186" fill="#717D7E">APR</text>

                {/* May: 340k */}
                <rect x="395" y="34" width="36" height="136" rx="3" fill="#0D2137" />
                <text x="398" y="28" fill="#0D2137" fontWeight="bold">₦340k</text>
                <text x="403" y="186" fill="#717D7E">MAY</text>

                {/* Jun (Current): 420k */}
                <rect x="475" y="18" width="36" height="152" rx="3" fill="#2A9D8F" />
                <text x="478" y="12" fill="#2A9D8F" fontWeight="bold">₦420k</text>
                <text x="483" y="186" fill="#717D7E" fontWeight="bold">JUN*</text>
              </svg>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: DENSITY BREAKDOWN (4 columns) */}
        <aside className="desktop:col-span-4 bg-white rounded-card border border-border p-5 shadow-card text-left flex flex-col gap-4">
          <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2.5 flex items-center gap-1.5">
            <Map size={18} className="text-teal" />
            LGA Artisan Density
          </h3>

          <p className="font-body text-[13px] text-slate leading-normal">
            Breakdown of registered and active tradespeople across Lagos local government coverage maps.
          </p>

          <div className="flex flex-col gap-3 font-mono text-[12px] text-navy">
            {areaBreakdown.length === 0 ? (
              <span className="font-body text-slate text-center">No coverage registered.</span>
            ) : (
              areaBreakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span>{item.area} LGA</span>
                    <span>{item.count} artisan{item.count === 1 ? '' : 's'} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-lgray rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

        </aside>

      </div>

    </div>
  )
}
