# NEXPLUMB — Frontend Implementation Guide
**Complete AI Coding Agent Reference · Version 1.0 · Confidential**

> This document is the single source of truth for all frontend implementation decisions across the Nexplumb web platform. Every screen, component, state, interaction, and logic rule is defined here. Read this before writing any code.

---

## TABLE OF CONTENTS

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Tech Stack & Setup](#2-tech-stack--setup)
3. [Design System & Tokens](#3-design-system--tokens)
4. [Component Library Specification](#4-component-library-specification)
5. [Global Layout & Navigation](#5-global-layout--navigation)
6. [Phase 1 — Customer Web Portal](#6-phase-1--customer-web-portal)
   - CW-1: Public Homepage
   - CW-S: Customer Sign Up
   - CW-L: Customer Login
   - CW-2: Search Results
   - CW-3: Artisan Profile
   - CW-4: Booking Flow (Steps A–D)
   - CW-5: Live Job Tracking
   - CW-6: Customer Dashboard
7. [Phase 1 — Artisan Web Portal](#7-phase-1--artisan-web-portal)
   - AW-1: Artisan Registration
   - AW-2: Artisan Dashboard
   - AW-3: My Jobs
   - AW-4: Earnings & Payouts
   - AW-5: Profile Editor
   - AW-6: Reviews Tab
8. [Phase 1 — Admin Dashboard](#8-phase-1--admin-dashboard)
   - AD-1: Admin Overview
   - AD-2: Jobs Management
   - AD-3: Dispute Resolution
   - AD-4: Verification Queue
   - AD-5: Analytics & Reporting
   - AD-6: User Management
9. [Phase 2 — Supplier Portal](#9-phase-2--supplier-portal)
   - SP-1: Supplier Registration
   - SP-2: Supplier Dashboard
   - SP-3: Products Catalogue
   - SP-4: Orders Management
10. [Phase 2 — Enhanced Features](#10-phase-2--enhanced-features)
    - CW-E1: Price Estimator
    - CW-E2: Emergency Booking
    - WhatsApp Bot (display only)
11. [Phase 3 — Ecosystem Portals](#11-phase-3--ecosystem-portals)
    - EP-1: Enterprise Portal
    - FP-1: Artisan Finance Portal
12. [Shared Logic & Utilities](#12-shared-logic--utilities)
13. [API Integration Layer](#13-api-integration-layer)
14. [Screen States Reference](#14-screen-states-reference)
15. [Accessibility Checklist](#15-accessibility-checklist)
16. [SEO & Performance Rules](#16-seo--performance-rules)
17. [Figma-to-Code Handoff Checklist](#17-figma-to-code-handoff-checklist)

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### What Nexplumb Is
Nexplumb is a two-sided artisan services marketplace for Nigeria, beginning with plumbing in Lagos and expanding across all trade categories. It connects urban customers to NIN-verified, insured artisans through escrow-protected payments, real-time GPS tracking, and a structured review system.

### Four Web Portals
| Portal | URL | Primary User | Phase |
|--------|-----|-------------|-------|
| Customer Web Portal | `nexplumb.com` | Homeowners, tenants | Phase 1 |
| Artisan Web Portal | `app.nexplumb.com/artisan` | Plumbers, electricians, tradespeople | Phase 1 |
| Admin Dashboard | `admin.nexplumb.com` | Nexplumb operations team | Phase 1 |
| Supplier Portal | `supplier.nexplumb.com` | Material suppliers, importers | Phase 2 |

### Currency & Locale
- **All monetary values are in Nigerian Naira (₦)**
- Format: `₦1,500`, `₦12,000`, `₦150,000`
- Never use dollar signs. Never use "NGN" abbreviation in UI — always use the ₦ symbol.
- Phone numbers: Nigerian format `+234`, 11-digit local format
- Date format: `14 Feb 2025` or `Wed, 14 Feb 2025` — not MM/DD/YYYY
- Time format: 12-hour with AM/PM — `2:30 PM`, `9:00 AM`

### File Structure (Next.js App Router)
```
nexplumb/
├── app/
│   ├── (customer)/                  # Customer portal route group
│   │   ├── page.tsx                 # CW-1: Homepage
│   │   ├── register/page.tsx        # CW-S: Sign Up
│   │   ├── login/page.tsx           # CW-L: Login
│   │   ├── search/page.tsx          # CW-2: Search Results
│   │   ├── artisans/[slug]/page.tsx # CW-3: Artisan Profile
│   │   ├── book/[slug]/page.tsx     # CW-4: Booking Flow
│   │   ├── jobs/[id]/track/page.tsx # CW-5: Live Tracking
│   │   ├── dashboard/page.tsx       # CW-6: Customer Dashboard
│   │   └── price-estimator/page.tsx # CW-E1
│   ├── (artisan)/
│   │   ├── join-as-artisan/page.tsx # AW-1: Registration
│   │   └── artisan/
│   │       ├── dashboard/page.tsx   # AW-2
│   │       ├── jobs/page.tsx        # AW-3
│   │       ├── earnings/page.tsx    # AW-4
│   │       ├── profile/page.tsx     # AW-5
│   │       └── reviews/page.tsx     # AW-6
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/page.tsx   # AD-1
│   │       ├── jobs/page.tsx        # AD-2
│   │       ├── disputes/page.tsx    # AD-3
│   │       ├── verification/page.tsx# AD-4
│   │       ├── analytics/page.tsx   # AD-5
│   │       └── users/page.tsx       # AD-6
│   └── (supplier)/
│       └── supplier/
│           ├── register/page.tsx    # SP-1
│           ├── dashboard/page.tsx   # SP-2
│           ├── products/page.tsx    # SP-3
│           └── orders/page.tsx      # SP-4
├── components/
│   ├── ui/                          # Base design system components
│   ├── layout/                      # Nav, sidebars, footer
│   ├── customer/                    # Customer-specific components
│   ├── artisan/                     # Artisan-specific components
│   ├── admin/                       # Admin-specific components
│   └── supplier/                    # Supplier-specific components
├── lib/
│   ├── api.ts                       # API client
│   ├── auth.ts                      # Auth utilities
│   ├── format.ts                    # Naira formatter, date/time utils
│   ├── hooks/                       # Custom React hooks
│   └── store/                       # Zustand global state
├── types/
│   └── index.ts                     # TypeScript types
└── public/
    └── assets/                      # Static images, icons
```

---

## 2. TECH STACK & SETUP

### Core Stack
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS v3",
  "state": "Zustand (global) + React Query (server state)",
  "maps": "Google Maps API or Mapbox GL JS",
  "payments": "Paystack inline JS",
  "websockets": "Socket.io-client",
  "forms": "React Hook Form + Zod validation",
  "charts": "Recharts",
  "icons": "Lucide React",
  "toasts": "Sonner",
  "modals": "Headless UI Dialog",
  "http": "Axios + React Query"
}
```

### Tailwind Config
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nexplumb Design System Tokens
        navy:      { DEFAULT: '#0D2137', light: '#1a3456' },
        nxblue:    { DEFAULT: '#2E86AB', light: '#3a9bc4', dark: '#246d8a' },
        teal:      { DEFAULT: '#2A9D8F', light: '#33b8a7', dark: '#1f7a6e' },
        orange:    { DEFAULT: '#E76F51', light: '#ec8a70', dark: '#c8522d' },
        amber:     { DEFAULT: '#E9C46A', light: '#f0d080', dark: '#c9a045' },
        lgray:     { DEFAULT: '#F2F4F6', dark: '#E5E8EC' },
        border:    { DEFAULT: '#D5D8DC' },
        body:      { DEFAULT: '#1C2833' },
        slate:     { DEFAULT: '#717D7E' },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        // Web scale
        'h1':  ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2':  ['23px', { lineHeight: '1.3', fontWeight: '700' }],
        'h3':  ['19px', { lineHeight: '1.4', fontWeight: '700' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      boxShadow: {
        'card':   '0 2px 8px rgba(13,33,55,0.08)',
        'card-hover': '0 6px 24px rgba(13,33,55,0.14)',
        'modal':  '0 20px 60px rgba(13,33,55,0.25)',
        'nav':    '0 2px 12px rgba(13,33,55,0.10)',
      },
      borderRadius: {
        'btn': '8px',
        'card': '12px',
        'modal': '16px',
      },
      spacing: {
        'sidebar': '240px',
        'filter-sidebar': '280px',
      },
      screens: {
        'mobile': '375px',
        'tablet': '768px',
        'desktop': '1280px',
        'wide': '1440px',
      },
      maxWidth: {
        'content': '1200px',
        'wide-content': '1280px',
      },
    },
  },
  plugins: [],
}

export default config
```

### Currency Formatter Utility
```typescript
// lib/format.ts

/**
 * Format a number as Nigerian Naira
 * Usage: formatNaira(12500) => "₦12,500"
 * Usage: formatNaira(1500000) => "₦1,500,000"
 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

/**
 * Format a range of prices
 * Usage: formatNairaRange(8000, 15000) => "₦8,000 – ₦15,000"
 */
export function formatNairaRange(min: number, max: number): string {
  return `${formatNaira(min)} – ${formatNaira(max)}`
}

/**
 * Format date for Nigerian context
 * Usage: formatDate(new Date()) => "14 Feb 2025"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time as 12-hour
 * Usage: formatTime(new Date()) => "2:30 PM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format phone number for Nigerian display
 * Usage: formatPhone("08012345678") => "+234 801 234 5678"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) {
    const local = digits.slice(1)
    return `+234 ${local.slice(0,3)} ${local.slice(3,6)} ${local.slice(6)}`
  }
  return phone
}

/**
 * Mask phone number for privacy
 * Usage: maskPhone("+2348012345678") => "+234 *** **** 678"
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `+234 *** **** ${digits.slice(-3)}`
}

/**
 * Apply emergency 30% premium to a base price
 */
export function applyEmergencyPremium(amount: number): number {
  return Math.round(amount * 1.3)
}

/**
 * Calculate platform commission (10-15%)
 */
export function calculateCommission(amount: number, rate: number = 0.12): number {
  return Math.round(amount * rate)
}

/**
 * Format relative time (for timestamps)
 * Usage: timeAgo(new Date(Date.now() - 3600000)) => "1 hour ago"
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
```

---

## 3. DESIGN SYSTEM & TOKENS

### Colour Palette
| Token | CSS Variable | Hex | Tailwind Class | Primary Use |
|-------|-------------|-----|----------------|-------------|
| Navy | `--color-navy` | `#0D2137` | `bg-navy` / `text-navy` | Page headers, nav bg, admin sidebar, cover sections, primary text on light |
| Nexplumb Blue | `--color-nxblue` | `#2E86AB` | `bg-nxblue` / `text-nxblue` | Links, active sidebar items, info badges, verified shield |
| Teal | `--color-teal` | `#2A9D8F` | `bg-teal` / `text-teal` | Success states, available badge, booking confirmed, progress fill, focus rings |
| Orange | `--color-orange` | `#E76F51` | `bg-orange` / `text-orange` | ALL primary CTAs, Book Now, Pay Now, urgent badges, notification dots |
| Amber | `--color-amber` | `#E9C46A` | `bg-amber` / `text-amber` | Warning states, pending badges, Phase 2 labels, Pro highlights |
| Light Gray | `--color-lgray` | `#F2F4F6` | `bg-lgray` | Page backgrounds, section dividers, alternating table rows |
| Body Dark | `--color-body` | `#1C2833` | `text-body` | All primary body text, table content, headings on white |
| Slate | `--color-slate` | `#717D7E` | `text-slate` | Captions, timestamps, placeholders, secondary labels |
| White | — | `#FFFFFF` | `bg-white` | Card backgrounds, inputs, modals |
| Border | `--color-border` | `#D5D8DC` | `border-border` | All dividers, card borders, input borders |

### Typography Scale
```css
/* globals.css */
:root {
  --font-sans: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
}

/* Page Title / H1 */
h1, .text-h1 {
  font-size: 30px;          /* desktop */
  font-weight: 700;
  line-height: 1.2;
  color: #1C2833;
}

/* Section Header / H2 */
h2, .text-h2 {
  font-size: 23px;
  font-weight: 700;
  line-height: 1.3;
}

/* Component Header / H3 */
h3, .text-h3 {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.4;
}

/* Body Text */
p, .text-body {
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
}

/* Caption / Label */
.text-caption {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}

/* Button labels: always sentence case, 14–15px bold */
button, .btn {
  font-size: 14px;
  font-weight: 700;
  /* NEVER uppercase in buttons */
}

/* Mobile override (375px) */
@media (max-width: 767px) {
  h1, .text-h1 { font-size: 22px; }
  h2, .text-h2 { font-size: 18px; }
  h3, .text-h3 { font-size: 15px; }
  p, .text-body { font-size: 14px; }
  .text-caption { font-size: 11px; }
}
```

### Responsive Breakpoints
| Name | Width | Columns | Gutter | Margin |
|------|-------|---------|--------|--------|
| Mobile Web | 375px–767px | 4 | 16px | 16px |
| Tablet | 768px–1279px | 8 | 20px | 24px |
| Desktop | 1280px+ | 12 | 24px | 40px |
| Wide | 1440px+ | 12 | 24px | auto |

**Design direction: Desktop first for web portals.** Unlike mobile apps, start at 1280px and simplify downward.

### Focus Ring (Accessibility — Never Omit)
```css
/* All interactive elements must show this on keyboard focus */
:focus-visible {
  outline: 2px solid #2A9D8F; /* teal */
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 4. COMPONENT LIBRARY SPECIFICATION

### 4.1 Buttons

#### Primary Button (Orange — All CTAs)
```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'full'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

// Tailwind classes per variant:
const variants = {
  primary:   'bg-orange text-white hover:bg-orange-dark active:scale-[0.98] shadow-sm',
  secondary: 'border-[1.5px] border-navy text-navy bg-transparent hover:bg-navy hover:text-white',
  ghost:     'text-nxblue hover:bg-nxblue/10 bg-transparent',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  success:   'bg-teal text-white hover:bg-teal-dark',
}

const sizes = {
  sm:   'h-9  px-4  text-[13px]',
  md:   'h-12 px-6  text-[14px]',  // 48px height — default
  lg:   'h-14 px-8  text-[15px]',
  full: 'h-12 w-full text-[14px]',
}

// Base classes always applied:
// rounded-btn font-bold transition-all duration-200 focus-visible:outline-2
// focus-visible:outline-teal focus-visible:outline-offset-2
// disabled:opacity-50 disabled:cursor-not-allowed
```

#### Loading State in Button
```tsx
// Show spinner inside button, replace label text
// Never disable page interaction during payment — keep the button visually active
// Text during loading: "Processing..." (never disappear text entirely)
```

### 4.2 Form Inputs

```tsx
// All inputs: 48px height, full-width by default, 1px border, 8px radius
// Label ABOVE the input — never floating placeholder-only
// Teal 2px focus ring
// Error: red border (#DC2626) + red error text below
// Success: teal border + green checkmark icon right side

interface InputProps {
  label: string           // Always required — WCAG
  error?: string          // Red error message text
  hint?: string           // Helper text below input
  prefix?: string         // e.g. "+234" for phone
  suffix?: React.ReactNode // e.g. eye icon for password
}

// Base input classes:
// h-12 w-full rounded-btn border border-border bg-white px-4 text-body
// placeholder:text-slate focus:outline-none focus:border-teal focus:ring-2
// focus:ring-teal/20 transition-colors
// aria-invalid:border-red-500 aria-invalid:ring-red-500/20
```

#### Phone Input (Nigerian Format)
```tsx
// Always prepend +234 flag and prefix
// Accept: 08012345678 or +2348012345678 or 8012345678
// Validate: 11 digits starting with 0, or 13 digits starting with +234
// Display: "+234 | [input field]"
```

#### NIN Input
```tsx
// National Identification Number — 11 digits
// Show info tooltip: "Your NIN is encrypted and never shared publicly"
// On blur: call /api/verify/nin — show loading state "Checking NIN..."
// On success: teal badge "NIN Verified ✓"
// On error: specific message "NIN not found. Check your number or call 08080908908"
```

#### BVN Input
```tsx
// Bank Verification Number — 11 digits
// Show security tooltip: "Your BVN is used only for payout verification. Encrypted at rest."
// Never display BVN after entry — mask as *** *** *** **
```

### 4.3 Artisan Card

#### Horizontal Card (Search Results)
```tsx
interface ArtisanCardHorizontalProps {
  photo: string
  name: string
  trade: string
  rating: number      // e.g. 4.8
  reviewCount: number
  jobCount: number
  area: string        // e.g. "Surulere, Lagos"
  priceMin: number    // in Naira
  priceMax: number    // in Naira
  badges: ('id_verified' | 'certified' | 'guarantor' | 'trade_tested')[]
  isAvailable: boolean
  bio: string         // 2-line truncated
  skills: string[]    // chips
  onViewProfile: () => void
  onBookNow: () => void
}

// Layout: flex flex-row gap-4 p-4 bg-white rounded-card border border-border
// shadow-card hover:shadow-card-hover transition-shadow cursor-pointer
//
// Left:   w-20 h-20 rounded-full object-cover flex-shrink-0
// Centre: flex-1 min-w-0
//   - Name (font-bold text-body text-navy)
//   - Trade + Area (text-caption text-slate)
//   - Stars row: yellow stars + "(47 reviews)" + "· 134 jobs"
//   - "Available Now" badge (teal) or gray "Unavailable"
//   - Bio: 2 lines max, text-caption text-body, line-clamp-2
//   - Skills chips: flex-wrap gap-1, small pills bg-lgray text-body text-caption
// Right:  flex-col items-end gap-2
//   - Price range: "₦8,000 – ₦15,000" text-sm font-bold text-navy
//   - Badges row: shield (blue), star (teal) — 16px icons with tooltips
//   - "View Profile" secondary button
//   - "Book Now" primary orange button

// UNAVAILABLE STATE: opacity-60, "Book Now" disabled, "Unavailable" gray badge
```

#### Small/Grid Card (Homepage Featured)
```tsx
// Vertical card: w-full, image top (64x64 circle), name, trade, rating, area, CTA
// Used on homepage featured row — horizontal scroll on mobile
```

### 4.4 Status Badge
```tsx
// Pill badge: rounded-full px-3 py-1 text-caption font-bold
// Colour scheme: bg at 15% opacity, text at 100% opacity

const statusBadges = {
  active:     'bg-teal/15 text-teal',
  available:  'bg-teal/15 text-teal',
  pending:    'bg-amber/20 text-amber-dark',
  en_route:   'bg-nxblue/15 text-nxblue',
  on_site:    'bg-teal/20 text-teal',
  completed:  'bg-navy/10 text-navy',
  disputed:   'bg-red-100 text-red-700',
  cancelled:  'bg-gray-100 text-gray-600',
  verified:   'bg-nxblue/15 text-nxblue',
  suspended:  'bg-red-100 text-red-700',
  urgent:     'bg-orange/15 text-orange',
}
```

### 4.5 Trust Badge (Artisan Badges)
```tsx
// Small icon + label on artisan cards and profiles
// id_verified:   blue shield icon, "ID Verified"
// certified:     teal star, "Nexplumb Certified"
// guarantor:     green user-check, "Guarantor Verified"
// trade_tested:  orange ribbon, "Trade Tested"

// Tooltip: on hover, show full explanation of what the badge means
// Size on card: 16px icon only (tooltip for text)
// Size on profile: 20px icon + label text
```

### 4.6 Star Rating Display
```tsx
// Filled star: #E9C46A (amber/gold)
// Empty star: #D5D8DC (border)
// Half star: half fill using CSS clip-path
// Always show: "4.8 ★" + "(47 reviews)" text alongside
// Minimum display: 1 decimal place always shown
```

### 4.7 Data Table
```tsx
// Sticky header (position: sticky, top: 64px for navbar)
// Alternating rows: white / bg-lgray
// Hover row: bg-nxblue/5 transition-colors
// Sortable column headers: show arrow icon, onClick toggles asc/desc
// All text in cells: text-body text-[14px]
// Action column: right-aligned, flex gap-2

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  empty?: React.ReactNode
  onRowClick?: (row: T) => void
}

// Loading state: skeleton rows (same height as real rows) with animated pulse
// Empty state: full-width cell with illustration + message + CTA
// Never show "No data found" bare text
```

### 4.8 Modal / Dialog
```tsx
// Centred overlay, navy backdrop at 50% opacity
// Modal card: bg-white, max-w-xl (600px), rounded-modal, shadow-modal
// Header: title left, × close button right
// Body: scrollable if content overflows
// Footer: action buttons, right-aligned
//
// Keyboard: Escape to close, click-outside to close
// Focus trap: Tab cycles through focusable elements inside modal only
// Scroll lock: body scroll disabled while modal open
```

### 4.9 Toast Notifications (Sonner)
```tsx
// Fixed bottom-right, max-w-80 (320px), 4s auto-dismiss
// Multiple toasts stack vertically
// Types:
//   success: teal left-border + checkmark icon
//   error:   red left-border + x icon
//   warning: amber left-border + triangle icon
//   info:    nxblue left-border + info icon
// Never show toasts for trivial actions — only for async outcomes
```

### 4.10 Sidebar Navigation Item
```tsx
// height: 40px (h-10), horizontal padding 16px
// Icon: left, 20px, mr-3
// Label: text-body text-[14px]
// Active state: teal 3px left-border + bg-teal/10 + text-teal font-bold
// Hover: bg-lgray transition-colors
// Badge: small pill right-side (for unread counts, dispute counts)
```

### 4.11 Skeleton Loader
```tsx
// ALWAYS match the exact shape of the real content
// Use: animate-pulse bg-gray-200 rounded
// NEVER use a standalone spinner for list content
// A spinner is only acceptable inside a button during action loading

// Examples:
// Artisan card skeleton: same h-[88px] card structure with gray blocks
// Table skeleton: 5 rows × n columns of gray blocks
// Stat card skeleton: title block + large number block
// Map skeleton: full gray rectangle with "Loading map..." text
```

---

## 5. GLOBAL LAYOUT & NAVIGATION

### 5.1 Customer Portal Navbar

```tsx
// components/layout/CustomerNavbar.tsx
// Position: sticky top-0 z-50
// Height: 64px (h-16)
// Background: transparent over dark hero → white + shadow-nav on scroll
// Scroll detection: useEffect with window.addEventListener('scroll', ...)
// Transition: bg-white transition-all duration-300

// Structure (flex items-center justify-between px-10 max-w-content mx-auto):
//
// LEFT:   <Logo /> — nexplumb logo in navy, links to /
//
// CENTRE: <nav> with links:
//   - "How it works" → /#how-it-works (smooth scroll)
//   - "Find an artisan" → /search
//   - "For artisans" → /join-as-artisan
//   - "Pricing" → /#pricing
//   Text: text-body text-[14px] text-navy hover:text-orange transition-colors
//
// RIGHT:
//   - "Log in" → text link → /login
//   - "Get started" → orange primary button → /register
//   - If authenticated: avatar dropdown (Dashboard, Settings, Logout)
//
// MOBILE (< 768px):
//   - Hamburger button replaces centre nav
//   - Drawer slides in from left: full-height, white bg, nav links stacked

// "Join as an artisan" secondary link in right group (text-nxblue hover:underline)
```

### 5.2 Artisan Portal Sidebar

```tsx
// components/layout/ArtisanSidebar.tsx
// Fixed left sidebar: w-60 (240px), h-full, bg-navy, text-white
// Fixed: position fixed, top-0, left-0, bottom-0, z-30
// Main content: ml-60 padding adjustment

// Top section:
//   - Nexplumb logo (white version)
//   - Artisan avatar + name + "ID Verified" badge below name
//   - Online/Offline toggle: teal pill when online, gray when offline

// Nav items (from top):
//   Dashboard, My Jobs, Earnings, My Profile, Training, Materials, Reviews, Settings

// Bottom: "Get help" link + version tag

// Active item: left border 3px teal + bg-teal/20 + text-teal
// Hover: bg-white/10

// Tablet (768px): collapse to icon-only sidebar (w-16), hover tooltip shows label
// Mobile (<768px): bottom tab bar with 5 most important tabs
```

### 5.3 Admin Sidebar

```tsx
// components/layout/AdminSidebar.tsx
// Fixed left, w-[220px], bg-navy
// Desktop ONLY — admin not mobile-optimised
// Nav items: Overview, Live Jobs, Jobs Table, Disputes, Verification, Users, Analytics, Settings
// Dispute nav item: shows red badge with count if unresolved disputes > 0
// Verification nav item: amber badge if pending > 0
```

### 5.4 Customer Dashboard Sidebar

```tsx
// components/layout/DashboardSidebar.tsx
// Persistent left sidebar at w-60 (240px)
// Shows customer avatar, name, location
// Nav: Dashboard, My Bookings, Saved Artisans, Messages, Payments, Settings, Get Help
// "Book an artisan" CTA button at bottom of sidebar (orange, full-width)
```

### 5.5 WhatsApp Floating Button

```tsx
// components/layout/WhatsAppFloat.tsx
// Fixed bottom-right: bottom-6 right-6 z-40
// Circle button: 56px × 56px, bg-green-500, rounded-full, shadow-lg
// WhatsApp icon (SVG), white
// hover: scale-110 transition-transform
// tooltip on hover: "Need help? Chat with us"
// Opens: https://wa.me/[NEXPLUMB_WHATSAPP_NUMBER]?text=Hello%20Nexplumb
// Visible on ALL customer-facing pages. Hidden on Admin dashboard.
```

### 5.6 Footer

```tsx
// components/layout/Footer.tsx
// bg-navy text-white py-16
// 4-column grid (tablet: 2-col, mobile: 1-col)
// Columns: About Nexplumb | For Customers | For Artisans | Support
// Social row: Twitter, Instagram, LinkedIn, Facebook, YouTube icons
// Legal row: Terms | Privacy Policy | Escrow Policy (text-slate text-caption)
// Bottom: "© 2025 Nexplumb Technology Ltd. All rights reserved."
```

---

## 6. PHASE 1 — CUSTOMER WEB PORTAL

---

### CW-1: Public Homepage

**URL:** `nexplumb.com` | **File:** `app/(customer)/page.tsx`

#### Purpose
Convert first-time visitors into registered users and booked jobs. Primary SEO surface. Must answer "What is this?", "Can I trust it?", "How do I start?" within 3 seconds of load.

#### Section 1 — Hero
```tsx
// Full-width section, bg-navy, min-h-[580px]
// Layout: flex flex-col items-start max-w-content mx-auto px-10 pt-32 pb-20
// Desktop: 2-column (text left 55%, illustration right 45%)
// Mobile: single column, illustration hidden

// HEADLINE (H1 — critical for SEO):
// "Your trusted artisan, one tap away"
// font-bold text-white text-[44px] leading-tight
// MUST include "Lagos" in subheadline for SEO

// SUBHEADLINE:
// "Find verified plumbers, electricians, and tradespeople near you in Lagos — instantly"
// text-white/80 text-[18px] mt-4 max-w-[520px]

// SEARCH BAR (most important element on page):
// White card: bg-white rounded-card shadow-modal mt-10 p-2 flex gap-2 max-w-[640px]
// [Input: "What do you need? e.g. leaking pipe, electrical fault..."] [Orange "Search" button]
// Input takes up all available space, button is fixed-width
// On enter/click → /search?q=[value]&location=[auto-detected]

// LOCATION SELECTOR (below search bar):
// "📍 Auto-detecting your location..." → replaces with detected area
// OR: "📍 Lagos, Nigeria [change]" link to open dropdown
// Text: text-white/70 text-caption mt-3

// SERVICE CATEGORY CHIPS:
// Horizontal row of pills below location, mt-4
// Chips: "🔧 Plumbing" "⚡ Electrical" "🪚 Carpentry" "🎨 Painting" "🔲 Tiling"
// Style: bg-white/20 text-white border border-white/30 rounded-full px-4 py-2
//        hover:bg-white/30 hover:border-white/50 transition-all cursor-pointer
// On click: → /search?category=[trade]

// ILLUSTRATION (right side, desktop only):
// Nigerian home scene illustration with artisan + Nexplumb shield
// Positioned absolutely or flex-right, hidden on mobile (hidden tablet:block)
```

#### Section 2 — Trust Bar
```tsx
// Full-width, bg-navy/95, border-t border-white/10
// py-6, flex justify-center gap-16 (tablet: gap-8, mobile: flex-col items-center gap-4)

// Three metrics:
const trustMetrics = [
  { icon: ShieldCheck, value: "1,200+",   label: "Verified Artisans" },
  { icon: Lock,        value: "Escrow",   label: "Protected Payments" },
  { icon: Star,        value: "4.8 / 5", label: "Average Rating" },
]
// Each: flex items-center gap-3 text-white
// Icon: 32px, teal colour
// Value: text-[22px] font-bold
// Label: text-[14px] text-white/70
```

#### Section 3 — How It Works
```tsx
// bg-white py-20
// Title: "Book a trusted artisan in 3 steps" — h2 text-navy text-center mb-12

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Search",
    description: "Type what you need or pick a category. We'll show you verified artisans near your location in seconds."
  },
  {
    number: 2,
    icon: ShieldCheck,
    title: "Book & pay safely",
    description: "Choose your artisan, pick a time, and pay through secure escrow. Your money is protected until the job is done."
  },
  {
    number: 3,
    icon: MapPin,
    title: "Track & confirm",
    description: "Watch your artisan travel to you on a live map. Confirm when the job is complete and release payment."
  },
]

// Layout: 3-column grid (tablet: 3-col, mobile: 1-col stacked)
// Each step card:
//   - Circle number: w-12 h-12 bg-orange text-white rounded-full font-bold text-[18px]
//   - Icon below number: 40px, text-teal
//   - Title: h3 text-navy mt-4
//   - Description: text-body text-slate mt-2

// CTA below: "Find an artisan now" orange button, centred, mt-12
```

#### Section 4 — Featured Artisans
```tsx
// bg-lgray py-20
// Title: "Top-rated artisans near you" + location label in teal

// Fetch: GET /api/artisans/featured?location=[detected-lga]
// Loading: 4 skeleton cards
// Error: Non-blocking — section shows "Unable to load artisans. Try searching above."

// Desktop: 4-column grid
// Tablet: 2-column grid
// Mobile: Horizontal scroll (overflow-x-auto, flex gap-4, w-[200px] per card)

// "See all artisans" link → /search, right-aligned above the grid, text-nxblue
```

#### Section 5 — Category SEO Sections
```tsx
// One section per trade — CRITICAL for Google rankings
// Each section alternates bg (white / bg-lgray)

const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling']

// For each category:
// <section id="plumbers-in-lagos">
//   <h2>Plumbers in Lagos</h2>  ← H2 with trade + city REQUIRED for SEO
//   <p>Find verified, NIN-checked plumbers near you in Lagos. Escrow-protected payments.</p>
//   [3 artisan grid cards]
//   <a href="/search?category=plumbing">Find more plumbers near you →</a>
// </section>

// Structured data (JSON-LD) on this page:
// LocalBusiness schema for Nexplumb
// ItemList schema for featured artisans
```

#### Section 6 — Social Proof
```tsx
// bg-white py-20
// 3 review cards in a row (tablet: 2, mobile: 1-col)
// Each card: bg-lgray rounded-card p-6 shadow-card
//   - Avatar (circle, 48px) + first name + area label
//   - Star rating (5 gold stars)
//   - Review text: 2–3 sentences from real jobs
// Data: static at first, then pulled from /api/reviews/featured
```

#### Homepage Screen States
| State | Implementation |
|-------|----------------|
| **Loading** | Hero renders immediately (static). Featured artisans show 4 skeleton cards. |
| **No artisans** | "Coming soon — artisans signing up now in your area" + "Join waitlist" CTA |
| **Location denied** | "Showing artisans across Lagos" — default to Lagos-wide |
| **API error** | Featured section hides gracefully, page still functional |

---

### CW-S: Customer Sign Up

**URL:** `nexplumb.com/register` | **File:** `app/(customer)/register/page.tsx`

#### Layout
```tsx
// Two-panel desktop layout:
// LEFT (40%): navy bg, Nexplumb logo, trust statement, 3 bullet trust points
// RIGHT (60%): white bg, sign-up form
// Mobile: form only, left panel hidden

// Left panel content:
// - Logo (white)
// - "Join thousands of Lagos residents who book trusted artisans safely"
// - Trust points: [ShieldCheck] Verified artisans only
//                [Lock] Escrow-protected payments
//                [Star] 4.8/5 average rating
```

#### Form Fields & Validation
```tsx
// Using React Hook Form + Zod

const customerSignUpSchema = z.object({
  firstName: z.string().min(2, 'Enter your first name'),
  phone: z.string()
    .regex(/^(0[7-9][01]\d{8}|(\+234)[7-9][01]\d{8})$/, 'Enter a valid Nigerian phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Fields in order:
// 1. First Name — "First Name" label, placeholder "e.g. Chisom"
// 2. Phone Number — "+234 | [input]" — Nigeria flag emoji prefix
// 3. Password — eye toggle icon, strength bar below (weak/moderate/strong)
// 4. Confirm Password — teal checkmark when passwords match
// 5. Terms checkbox — "I agree to Nexplumb's [Terms of Service] and [Privacy Policy]"
// 6. Submit: "Create account" full-width orange button

// Password strength bar:
// weak: 1/3 red, moderate: 2/3 amber, strong: 3/3 teal

// After successful form submit:
// → OTP verification step (slide transition, NOT new page)
// OTP screen: "Enter the 6-digit code sent to +234 *** **** XXX"
// 6 individual digit boxes (auto-advance to next on type)
// "Resend code" link (appears after 60s countdown)
// Auto-read OTP on Android (if navigator.credentials.get available)
// On verify success → redirect to /dashboard

// "Already have an account?" link → /login (below form)
```

---

### CW-L: Customer Login

**URL:** `nexplumb.com/login` | **File:** `app/(customer)/login/page.tsx`

```tsx
// Same two-panel layout as sign-up

const loginSchema = z.object({
  phone: z.string().min(1, 'Enter your phone number'),
  password: z.string().min(1, 'Enter your password'),
})

// Fields:
// 1. Phone Number — "+234 | [input]"
// 2. Password — eye toggle
// 3. "Forgot password?" link — right-aligned, opens reset flow
// 4. "Log in" — full-width orange button

// Error handling:
// Wrong credentials → red banner: "Incorrect phone number or password. Please try again."
// NEVER say which field is wrong (security standard)
// Too many attempts (5) → "Account temporarily locked. Try again in 10 minutes."

// Password reset flow (in-page, NOT new page):
// Step 1: "Enter your phone number" → sends OTP
// Step 2: OTP verification (6 boxes)
// Step 3: "Create new password" (+ confirm)
// → redirect to /dashboard on success

// "Don't have an account?" link → /register
```

---

### CW-2: Search Results

**URL:** `nexplumb.com/search` | **File:** `app/(customer)/search/page.tsx`

#### URL Parameters
```typescript
// Query params:
// q: string       — search query
// location: string — area/LGA
// category: string — trade category
// sort: 'best_match' | 'highest_rated' | 'nearest' | 'most_jobs' | 'lowest_price'
// rating: number  — minimum star rating (3, 4, 5)
// available: 'now' | 'today' | 'any'
// distance: number — km radius
// price_min: number
// price_max: number
// verified: boolean
// certified: boolean
// view: 'list' | 'map'
// page: number
```

#### Desktop Layout (1280px) — Two Column
```tsx
// Overall: flex h-screen (with sticky sidebar)
// Main wrapper: max-w-[1280px] mx-auto flex gap-0

// === LEFT PANEL — Filter Sidebar ===
// w-[280px] flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto
// bg-white border-r border-border p-6

// Header:
// "Filters" h3 + "Clear all" text-nxblue text-[14px] button

// Applied filters chips (if any):
// flex-wrap gap-2 mb-4
// Each chip: bg-teal/10 text-teal rounded-full px-3 py-1 text-caption
//            with × button to remove individual filter

// FILTER GROUPS (each collapsible with chevron):

// 1. Trade Category (checkboxes)
const trades = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling', 'Other']

// 2. Minimum Rating
// Clickable star rows: "3+ stars", "4+ stars", "5 stars only"
// Selected: orange stars + bold text

// 3. Availability
// Radio buttons: "Available now" | "Available today" | "Any time"

// 4. Distance from me
// Custom range slider: 1km to 20km
// Label: "Within [X] km" — updates in real time

// 5. Price range
// Dual-handle slider: ₦0 to ₦100,000
// Labels above handles: "₦[min]" and "₦[max]"
// Use: react-range or similar library

// 6. Verified only toggle
// On/off switch

// 7. Certification
// Radio: "Any" | "Nexplumb Certified" | "Trade Tested"

// ALL FILTERS: onChange → update URL params → trigger new API fetch
// NO "Apply filters" button — live filtering

// === RIGHT PANEL — Results ===
// flex-1 min-w-0 p-6

// Results header:
// flex justify-between items-center mb-4
// Left: "Showing 24 plumbers in Yaba and nearby areas" text-body text-slate
// Right:
//   Sort dropdown: select element, styled as outlined button
//   View toggle: two icon buttons [List icon] [Map icon]
//               active: bg-navy text-white, inactive: bg-lgray text-body

// === ARTISAN CARDS LIST ===
// flex flex-col gap-3
// Each: <ArtisanCardHorizontal /> (see Component Library section 4.3)
// Available artisans first, then unavailable (grayed out, opacity-60)

// Pagination:
// Page size: 24 per page
// "Load more" button: secondary, full-width, mt-4
// OR numbered pagination (choose based on data size)
```

#### Map View
```tsx
// On toggle to map view: layout shifts to 50/50 split
// Left 50%: embedded Google Maps / Mapbox
// Right 50%: scrollable artisan list (same cards, narrower)

// Map pins:
// Available artisans: solid orange circle + artisan photo thumbnail (32px circle)
// Busy artisans: semi-transparent gray pin (opacity-50)
// Customer location: blue pin with house icon + "You" label
// Available pins: pulse animation (CSS keyframe, 2s loop)

// Pin hover → mini-card tooltip above pin:
//   artisan photo, name, trade, rating, price range
//   "View Profile" button

// Clicking list card → highlights corresponding map pin (scale up, ring)
// "Search this area" button: appears on map pan, top-center of map
//   On click: re-fetch artisans in visible bounds

// Map implementation:
// Google Maps: use @googlemaps/js-api-loader, place markers with custom PinElement
// Mapbox: use mapbox-gl, add custom markers with artisan photos
// Recommend: Mapbox for better customisation and lower cost

// REQUIRED: "Switch to list view" button always visible near map for accessibility
```

#### Tablet & Mobile Adaptation
```tsx
// Tablet (768px): Filter sidebar collapses
//   → "Filter" button top-left, opens as a Drawer (slides from left)
//   → Results take full width

// Mobile (375px): Filter as bottom sheet
//   → "Filter" floating button bottom-center
//   → Bottom sheet modal with filter form

// Map on mobile: full-screen, list overlaid as bottom sheet
```

#### Screen States
```tsx
// Loading: 6 skeleton artisan cards, filter sidebar renders immediately
// Empty (no results): illustration + "No artisans found in this area"
//   + "Try expanding your search distance" slider CTA
//   + "Clear all filters" button
// Error: red banner top of results + "Retry" button
//   Filter sidebar still works
```

---

### CW-3: Artisan Public Profile

**URL:** `nexplumb.com/artisans/[slug]` | **File:** `app/(customer)/artisans/[slug]/page.tsx`

#### SEO Requirements
```tsx
// page metadata:
export async function generateMetadata({ params }) {
  const artisan = await getArtisan(params.slug)
  return {
    title: `${artisan.name} — ${artisan.trade} in ${artisan.area}, Lagos | Nexplumb`,
    description: `Book ${artisan.name}, verified ${artisan.trade.toLowerCase()} in ${artisan.area} Lagos. ${artisan.jobCount} jobs completed, ${artisan.rating}★ rating. Escrow-protected payments.`,
  }
}

// JSON-LD structured data (for Google star ratings in search):
// Type: Person (artisan) + AggregateRating + Review list
// Add as <script type="application/ld+json"> in page head
```

#### Desktop Layout — Two Column
```tsx
// Max-w-[1200px] mx-auto flex gap-8 px-10 py-10

// === LEFT COLUMN (flex-1, max-w-[700px]) ===

// Hero banner:
// w-full h-[240px] rounded-card overflow-hidden relative
// Banner image: object-cover w-full h-full
// Profile photo overlay: absolute bottom-[-32px] left-8
//   w-20 h-20 rounded-full border-4 border-white shadow-card object-cover

// Name + trade + location (below banner, mt-12):
// h1 text-navy "Chukwuemeka Okonkwo"
// "Plumber · Surulere, Lagos" text-slate text-body mt-1

// Trust badges row:
// flex gap-3 mt-4 flex-wrap
// Each: <TrustBadge /> with icon + label + tooltip

// Stats row:
// flex gap-8 mt-4 py-4 border-y border-border
// Rating: "4.8 ★" text-[24px] font-bold text-amber + "(47 reviews)" text-slate
// Jobs: "134 jobs" text-navy font-bold
// Member since: "Since Jan 2024" text-slate

// About section:
// h3 "About" mt-8 mb-3
// artisan.bio text-body text-body leading-relaxed

// Skills & Services:
// h3 "Skills & Services" mt-8 mb-3
// flex-wrap gap-2: skill chips (bg-lgray text-body rounded-full px-3 py-1)

// Portfolio Grid:
// h3 "Portfolio" mt-8 mb-3
// 3-column CSS grid, gap-3
// Each photo: rounded-card overflow-hidden cursor-pointer hover:opacity-90
// On click: open lightbox modal (full-screen image with prev/next navigation)
// "Before/After" label if applicable: absolute badge on image top-left

// Service Area Map:
// h3 "Service area" mt-8 mb-3
// Small embedded map (300px height) showing artisan coverage zone in teal
// "Load service area map" button → loads map on demand (not on page load)

// Reviews Section:
// h3 "Reviews (47)" mt-8 mb-3
// Rating breakdown chart: horizontal bars 1★–5★, teal fill, % and count
// Review list: flex flex-col gap-4
// Each review card: bg-lgray rounded-card p-4
//   - Customer first name + area + date (text-caption text-slate)
//   - Stars (5 gold stars, partially filled for exact rating)
//   - Review text (text-body)
//   - Artisan reply (if exists): indented, bg-white rounded p-3 mt-2, "Nexplumb response:" label
// "See all reviews" button → expands list OR goes to /artisans/[slug]/reviews

// === RIGHT COLUMN — Sticky Booking Widget ===
// w-[360px] flex-shrink-0 self-start sticky top-[80px]
// bg-white rounded-card shadow-card p-6 border border-border

// Price range:
// "₦8,000 – ₦15,000" text-[22px] font-bold text-navy
// "per job (estimated)" text-caption text-slate mt-1

// Availability:
// "Available Now" → teal dot + teal badge
// "Available from Tue, 18 Feb" → amber badge

// "Book this artisan" — full-width orange primary button (h-14, text-[16px])
// "Request a quote" — full-width secondary outlined button mt-3

// Save + Share row:
// flex justify-between mt-4
// Heart icon button (fills red on click, requires login)
// Share: copy link + WhatsApp share

// Escrow trust message:
// flex items-center gap-2 mt-4 pt-4 border-t border-border
// ShieldCheck icon (24px, teal) + "Your payment is protected by Nexplumb Escrow"
// text-caption text-slate

// "Message artisan" link (text-nxblue, requires login):
// "You can message after booking is confirmed"

// Mobile: booking widget becomes sticky bottom bar
//   Full-width orange "Book now" + price shown in bar
//   Taps open the booking flow
```

#### Screen States
```tsx
// Loading: hero banner skeleton, stats skeleton, widget skeleton
// No portfolio: "No portfolio photos yet" placeholder (gray rectangle with camera icon)
//   Show job count as social proof: "14 jobs completed"
// Artisan unavailable: Widget shows "Currently unavailable"
//   "Save to favourites to get notified when available"
// Artisan suspended: redirect to /search with toast "This artisan is not available"
```

---

### CW-4: Web Booking Flow (Steps A–D)

**URL:** `nexplumb.com/book/[slug]` | **File:** `app/(customer)/book/[slug]/page.tsx`

#### Step Indicator (All Steps)
```tsx
const steps = ['Job details', 'Schedule', 'Review & pay', 'Confirmed']
// Horizontal stepper, always visible at top
// Active: teal filled circle + teal text + bold
// Completed: navy filled circle + navy text + checkmark icon
// Upcoming: gray border circle + gray text
// Completed steps: clickable (review, not re-edit after payment initiated)
```

#### Artisan Context Panel (Persistent Left, Desktop)
```tsx
// Fixed left panel on desktop: w-[300px], flex-shrink-0
// Shows: artisan photo (80px), name, trade, rating, "Escrow Protected" badge
// "Your money is held safely until the job is done" text-caption text-slate
// This panel stays through all steps 1-3. Hidden on step 4 (success).
```

#### Step A — Job Details (CW-4A)
```tsx
const jobDetailsSchema = z.object({
  jobType: z.string().min(1, 'Select a job type'),
  description: z.string().min(30, 'Please describe the issue in at least 30 characters'),
  photos: z.array(z.instanceof(File)).max(5, 'Maximum 5 photos'),
  isUrgent: z.boolean(),
  address: z.string().min(10, 'Enter your full address'),
  addressDetails: z.string().optional(), // "Flat 3B, Block A"
})

// Job type: dropdown with search
const jobTypes = {
  Plumbing: ['Pipe repair', 'Drain unblocking', 'Tap replacement', 'Full bathroom installation', 'Boiler repair', 'Water heater', 'Other'],
  Electrical: ['Light fixture', 'Socket repair', 'Full rewiring', 'Generator connection', 'Other'],
  // etc.
}

// Description textarea:
// min-h-[120px] resize-y
// Live character count: "47 characters (30 minimum)" — turns teal when >= 30
// Auto-save: localStorage save on every keystroke with debounce 1s

// Photo upload:
// Drag-and-drop zone: dashed border rounded-card p-8 text-center
//   "Drag photos here or click to browse" + camera icon
//   Accept: image/* only, reject non-image with toast error
//   Max 5MB per photo — toast error if exceeded
//   Show progress bar during upload
//   Previews: 4-column grid of thumbnails with × remove button
//   On hover thumbnail: show × more prominently

// Urgency toggle:
// Toggle switch + label "This is urgent (+30% premium)"
// When toggled ON: expand to show explanation box (amber bg)
//   "Emergency bookings are prioritised. The 30% premium is added to ensure
//    artisans respond faster to your urgent need."
//   Show estimated price with premium applied in amber text

// Address:
// Searchable input with Google Places autocomplete
// Restrict to Lagos, Nigeria
// "Apartment/flat details" additional optional field below (shows after address selected)

// "Continue to schedule" → orange full-width button
// Disabled until: jobType selected + description >= 30 chars + address filled
```

#### Step B — Schedule (CW-4B)
```tsx
// Full month calendar — NOT a date picker dropdown
// Fetch: GET /api/artisans/[id]/availability?month=[YYYY-MM]

// Calendar:
// Grid of 7 columns (Mon-Sun) × 5-6 rows
// Today: ringed with teal circle
// Available dates: bg-white text-navy hover:bg-teal hover:text-white
// Unavailable/booked: bg-lgray text-slate cursor-not-allowed
// Past dates: opacity-30 cursor-not-allowed
// Selected date: bg-teal text-white rounded-full

// On date click → show time slots below calendar (animated expand)
// Time slots: grid of available hours (8am–6pm typically)
// Each slot: "9:00 AM" pill button
//   Available: bg-white border border-border hover:border-teal hover:text-teal
//   Booked: bg-lgray text-slate cursor-not-allowed "(Booked)" label
//   Selected: bg-teal text-white border-teal

// "Flexible" shortcut:
// Prominent card at top: "⚡ Flexible — any time today or tomorrow"
// Subtext: "(Priority matching — seen by more artisans)"
// Click: selects "flexible" mode, calendar collapses

// Duration estimate below slots:
// "⏱ Pipe repairs typically take 1–2 hours" — text-caption text-slate

// Back + Continue navigation buttons
```

#### Step C — Review & Pay (CW-4C)
```tsx
// === FULL JOB SUMMARY ===
// Read-only card with all entered details
// Fields: Artisan, Trade, Description, Address, Date, Time
// "Edit" links per section that go back to respective step

// === PRICE BREAKDOWN TABLE ===
// Clean table with borders
const priceBreakdown = [
  { label: 'Service estimate',                    amount: 10000 },
  { label: 'Platform booking fee',                amount: 500   },
  { label: 'Materials (if pre-requested)',         amount: 0     },
  { label: 'Urgent premium (30%)', amount: 3000, conditionalOnUrgent: true },
  // divider line
  { label: 'Total',               amount: 13500, isTotal: true  },
]
// Total row: bold, larger text, bg-lgray, text-navy

// === ESCROW EXPLANATION BANNER ===
// Full-width, bg-teal/10, border border-teal rounded-card p-6 mt-6
// ShieldCheck icon (48px, teal, left) + text right:
// "Your payment is held safely by Nexplumb"
// "₦13,500 is released to the artisan ONLY after you confirm the job is done."
// "Full refund if the artisan does not show up."
// This is the most important trust moment — design it prominently

// === PAYMENT METHOD TABS ===
// 4 tabs: Debit Card | Bank Transfer | USSD Code | Wallet Balance
// Active tab: border-b-2 border-orange text-orange font-bold
// Inactive: text-slate border-b-2 border-transparent

// Debit Card tab:
// Paystack inline (DO NOT redirect to external page — trust collapses)
// Import Paystack JS, use popup or inline mode
// Fields: Card number (16 digits, auto-space every 4), Expiry (MM/YY), CVV
// "Secured by Paystack" badge below card form

// Bank Transfer tab:
// Large monospace block: "Account: 0123456789 | Bank: Access Bank"
// "Reference: NX-2024-00847" (customer must include this)
// "Amount to transfer: ₦13,500 exactly"
// Status: "Waiting for payment..." → polling /api/payment/status/[ref]
// On confirmation: auto-advance to Step D

// USSD tab:
// GTBank: *737*[amount]*[ref]#
// First Bank: *894*[amount]*[ref]#
// Access Bank: *901*[amount]*[ref]#
// UBA: *919*[amount]*[ref]#
// Zenith: *966*[amount]*[ref]#
// Show steps: 1. Dial the code 2. Approve the transaction 3. Return to this page

// Wallet Balance tab:
// "Your wallet balance: ₦20,000" (if sufficient → enable)
// "Use ₦13,500 from wallet" checkbox
// If insufficient: "Top up needed: ₦3,500" → bank transfer CTA

// === CONFIRM & PAY BUTTON ===
// Full-width orange, height 56px, text-[16px] font-bold
// Button label: "Confirm & pay ₦13,500" (amount in button always)
// Loading: "Processing payment — do not close this page..." + spinner
// Below button: padlock icon + "Secured by Nexplumb Escrow and Paystack"
```

#### Step D — Booking Confirmed (CW-4D)
```tsx
// Full-page success state (no artisan context panel)
// bg-lgray min-h-screen flex items-center justify-center

// Centre card: bg-white rounded-modal shadow-modal p-10 max-w-[480px] text-center

// Animated teal checkmark (Lottie or CSS SVG animation — draws itself)
// "Booking confirmed!" h1 text-teal mt-4

// Booking reference:
// bg-lgray rounded p-3 mt-4 font-mono text-[18px] text-navy font-bold
// "NX-2025-00847"
// Copy button right of ref → toast "Reference copied!"

// Summary card:
// bg-white border border-border rounded-card p-4 mt-4 text-left
// artisan photo (48px) + name + trade + date + time

// Action buttons (stacked):
// "Track your artisan" — primary orange, full-width
// "Add to Google Calendar" — secondary outlined, full-width
// "Share via WhatsApp" — green outlined, full-width, WhatsApp icon
// "View your bookings" — ghost text link, mt-2
```

---

### CW-5: Live Job Tracking

**URL:** `nexplumb.com/jobs/[id]/track` | **File:** `app/(customer)/jobs/[id]/track/page.tsx`

#### Architecture
```tsx
// WebSocket connection: connect on page mount, disconnect on unmount
// Socket room: job_[jobId]
// Events received: 'position_update', 'status_change', 'job_complete'
// Position update interval: 10–15 seconds from backend GPS polling

// useJobTracking hook:
function useJobTracking(jobId: string) {
  const [artisanPosition, setArtisanPosition] = useState<{lat, lng} | null>(null)
  const [status, setStatus] = useState<JobStatus>('confirmed')
  const [eta, setEta] = useState<number | null>(null) // minutes
  const [distance, setDistance] = useState<number | null>(null) // km
  
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL, { query: { jobId } })
    
    socket.on('position_update', (data) => {
      setArtisanPosition(data.position)
      setEta(data.etaMinutes)
      setDistance(data.distanceKm)
    })
    
    socket.on('status_change', (data) => {
      setStatus(data.status)
    })
    
    socket.on('disconnect', () => {
      // Show "reconnecting" indicator
    })
    
    return () => socket.disconnect()
  }, [jobId])
  
  return { artisanPosition, status, eta, distance }
}
```

#### Desktop Layout (Full-Width Split)
```tsx
// Overall: flex h-[calc(100vh-64px)] (full height minus navbar)

// === LEFT PANEL (420px, flex-shrink-0) ===
// bg-white border-r border-border overflow-y-auto p-6

// Status progress bar:
const statusSteps = ['Confirmed', 'En route', 'On site', 'Job complete']
// Horizontal stepper with connecting lines
// Active: teal filled, Completed: navy filled with check, Upcoming: gray

// Status message (large, bold):
// "Chukwuemeka is on his way"
// "Estimated arrival in ~12 minutes"
// font-bold text-navy text-[20px]

// ETA countdown (very prominent):
// "~12 min" → bg-lgray rounded-card p-4 text-center text-[48px] font-bold text-teal
// Updates smoothly every 15 seconds
// "2.3 km away" below in text-slate

// Artisan strip:
// flex items-center gap-4 mt-6 p-4 bg-lgray rounded-card
// Photo 64px circle + name bold + trade text-slate + rating stars

// Contact buttons:
// flex gap-3 mt-4
// "📞 Call artisan" (secondary button) — uses masked number
// "💬 Message" (secondary button) — opens inline chat drawer

// Job details accordion:
// Collapsible: job description + address + booking reference
// Default: collapsed

// "Report an issue" button:
// Always visible at bottom of panel
// text-orange border border-orange rounded-btn px-4 py-2 hover:bg-orange/5

// === RIGHT PANEL (remaining width, min ~60% on desktop) ===
// bg-lgray relative overflow-hidden

// Google Maps / Mapbox embed: w-full h-full
// Markers:
//   Customer: blue circle with house icon, "Your location" label
//   Artisan: orange circle with artisan photo thumbnail, animated pulse
//             smooth CSS transition on position update (transition: all 0.5s ease)
// Route line: dashed orange polyline from artisan → customer
//             updates on position_update
// Map auto-centers: fitBounds to keep both pins visible with padding
// ETA text: mid-route small label "~12 min"
// "Open in Google Maps" link: absolute bottom-4 right-4, white bg pill

// GPS lost state:
// Orange banner at top of left panel:
// "⚠️ Artisan location temporarily unavailable — last seen 5 min ago"
// Call button becomes prominent (scale up, ring animation)
```

#### Status Transitions (Auto-Update UI)
```tsx
const statusMessages = {
  confirmed:    "Your booking is confirmed. Waiting for artisan to depart.",
  en_route:     "Chukwuemeka is on his way to you.",
  on_site:      "Chukwuemeka has arrived at your location.",
  in_progress:  "Job is in progress...",
  job_complete: "Job marked as complete. Please confirm below.",
}

// On status 'job_complete':
// Left panel transforms to show completion prompt
// Two photo panels (before/after uploaded by artisan)
// Two large buttons:
//   "Yes, job is done — release payment" → green → calls /api/escrow/release/[jobId]
//   "There is an issue" → orange → opens dispute modal
// Auto-release countdown: "₦12,500 will be auto-released in 23h 47m if you don't respond"
```

#### Mobile Layout
```tsx
// Map: full screen (100vw 100vh)
// Left panel content: collapsed to bottom drawer
// Bottom drawer: min-height 120px, draggable up to full screen
// Always visible at bottom: status pill + ETA + "Report issue" button
// Drawer handle: gray pill at top of drawer
```

---

### CW-6: Customer Dashboard

**URL:** `app.nexplumb.com/dashboard` | **File:** `app/(customer)/dashboard/page.tsx`

#### Layout
```tsx
// flex h-screen overflow-hidden
// <DashboardSidebar /> (w-60, fixed)
// Main content: ml-60 flex-1 overflow-y-auto bg-lgray

// Mobile: sidebar becomes bottom tab bar (5 tabs)
// Dashboard | Bookings | Messages | Payments | Profile
```

#### Overview Tab
```tsx
// Greeting: "Good morning, Chisom 👋" (time-based: morning/afternoon/evening)
// Use customer's first name from auth state

// Active booking card (if exists — most prominent element):
// bg-orange/10 border border-orange rounded-card p-5
// "Active booking" label (orange, bold)
// Artisan photo + name + "Plumber" + status badge
// "Track now" → /jobs/[id]/track (large orange button)

// Upcoming bookings timeline:
// List of next 3 future bookings
// Date chip (teal) | artisan name | trade | time | "View details" link

// Recent activity feed:
// Last 5 events with icons + timestamps
// payment received → ₦ icon green
// review submitted → star icon amber
// artisan replied → chat icon nxblue

// Quick stats row (4 cards):
// "Total jobs: 7" | "Avg rating given: 4.3★" | "Total spent: ₦84,500" | "NexPoints: 350"
// bg-white rounded-card p-4 shadow-card text-center
// Large number bold + label below in text-slate
```

#### My Bookings Tab
```tsx
// Filter tabs: All | Active | Upcoming | Completed | Cancelled | Disputed
// Active tab: border-b-2 border-orange text-orange font-bold

// Booking card:
// bg-white rounded-card p-4 flex gap-4 items-start mb-3 shadow-card

// Left: artisan photo 48px circle
// Centre:
//   Job type + trade (font-bold text-navy)
//   Artisan name (text-body text-slate)
//   Date + time (text-caption text-slate) + StatusBadge
// Right:
//   Amount (font-bold text-navy) "₦12,500"
//   Action buttons stack

// Action buttons per booking:
const bookingActions = {
  active:    ['Track now', 'Report issue'],
  upcoming:  ['View details', 'Cancel booking'],
  completed: ['View details', 'Download receipt', 'Leave review', 'Book again'],
  disputed:  ['View details', 'View dispute'],
  cancelled: ['View details'],
}

// "Book again" feature (RETENTION CRITICAL):
// → /book/[same-artisan-slug] with pre-filled job type
// Pre-fill: same artisan, same job type, NOT same date/time
// Shows confirmation toast: "Booking form pre-filled with your previous details"
```

#### Messages Tab (Desktop)
```tsx
// Split view: conversation list (left 40%) + message thread (right 60%)
// Left list: artisan photo + name + last message preview (truncated) + unread count badge + time
// Right thread: standard chat UI
//   - Messages: mine (right, orange bg) + artisan (left, gray bg)
//   - Masked phone numbers — NEVER show real numbers
//   - Input at bottom + send button
//   - "You can only message artisans from active or recent bookings" note at top

// Mobile: list view → tap → full-screen thread
```

#### Payments Tab
```tsx
// Transaction history table:
// Columns: Date | Artisan | Trade | Amount | Status | Actions
// Status: "Held in escrow" (amber) | "Released" (teal) | "Refunded" (red)
// Actions: "Download receipt" (PDF) per row
// Total spent this month shown at top: "₦ Spent this month: ₦24,500"
```

---

## 7. PHASE 1 — ARTISAN WEB PORTAL

---

### AW-1: Artisan Registration

**URL:** `nexplumb.com/join-as-artisan` | **File:** `app/(artisan)/join-as-artisan/page.tsx`

#### Hero Section
```tsx
// Full-width bg-navy hero (300px)
// "Join Nexplumb — Start earning more, today."
// Value props: "More jobs · Instant payment · Build your reputation"
// Social proof: "2,400+ artisans already earning on Nexplumb in Lagos"
// [Join now] button → scrolls to form below
```

#### 4-Step Wizard
```tsx
// Desktop: 2-column — LEFT: form (60%), RIGHT: sticky progress + live profile preview (40%)
// Mobile: single column, full-width form, preview shown at end (Step 4 review screen)

// Progress bar: "Step 2 of 4" with teal filled progress bar
// Back button always available (except Step 1)
// Auto-save: save each step to localStorage on Continue

// === STEP 1 — IDENTITY ===
const step1Schema = z.object({
  fullName:      z.string().min(3, 'Enter your full legal name'),
  phone:         z.string().regex(/^0[7-9][01]\d{8}$/, 'Enter a valid Nigerian phone number'),
  email:         z.string().email().optional().or(z.literal('')),
  nin:           z.string().length(11, 'NIN must be 11 digits').regex(/^\d+$/),
  area:          z.string().min(1, 'Select your area in Lagos'),
  trade:         z.enum(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tiling', 'Other']),
  experience:    z.enum(['<1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years']),
})

// NIN field: info tooltip, async verification on blur
// Show during NIN verify: "Verifying your NIN — please wait..."
// NIN verified: teal checkmark badge inline
// NIN error: "NIN not found. Double-check your number or call 08080908908"

// Area selector: Lagos LGAs dropdown (Surulere, Yaba, Ikeja, Lekki, etc.)

// "Need help? Complete via WhatsApp" link:
// → wa.me/[number]?text=I+want+to+register+as+an+artisan
// ALWAYS visible as fallback for low-digital-literacy users

// === STEP 2 — PROFILE PHOTO ===
// Large drag-and-drop zone (full-width, 200px height)
// "Drag your photo here or click to upload" + camera icon
// "Use webcam" button → opens getUserMedia, circular crop overlay
// After upload: circular preview (200px), crop tool
// "Looks good" → Continue, "Retake" → re-upload
// Quality tips: "Good: face clearly visible, plain background, good lighting"
// Show example: good photo ✓ vs bad photo ✗ (blurry, dark)

// === STEP 3 — PORTFOLIO ===
// Minimum 3 photos encouraged, maximum 10
// "Artisans with portfolio photos get 3× more bookings" — social proof copy
// Upload grid: responsive 3-col, each cell = 150px × 150px
// Each uploaded photo:
//   - Preview (object-cover)
//   - Caption field below (optional, max 100 chars)
//   - "Before" / "After" / "On-the-job" label toggle
//   - × remove button (top-right corner)
// Drag to reorder: react-dnd or @dnd-kit

// === STEP 4 — BANK & GUARANTORS ===
const step4Schema = z.object({
  bankName:      z.string().min(1, 'Select your bank'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
  bvn:           z.string().length(11, 'BVN must be 11 digits'),
  guarantor1Name:  z.string().min(3),
  guarantor1Phone: z.string().regex(/^0[7-9][01]\d{8}$/),
  guarantor1Relation: z.string().min(1),
  guarantor2Name:  z.string().min(3),
  guarantor2Phone: z.string().regex(/^0[7-9][01]\d{8}$/),
  guarantor2Relation: z.string().min(1),
})

// Bank account: select bank from dropdown + enter 10-digit number
// BVN: security tooltip "Only used for payout setup. Encrypted and never shared."
//      Mask after entry: *** *** *** **
// Guarantors: collapsible sections, each with name + phone + relationship

// Explanation text above guarantors:
// "Your guarantors are people who can vouch for your character.
//  They are only contacted in the event of an unresolved dispute.
//  Their details are kept private."
```

#### Profile Preview Panel (Right Side, Desktop)
```tsx
// Live preview of how the artisan's public profile will look
// Updates as form fields are filled
// Shows: photo, name, trade, skills, portfolio (as thumbnails)
// Profile completeness bar: 0-100% with tick list of missing items
// "Preview as customers see it" label above the preview
```

#### Completion Screen
```tsx
// Animated success: teal checkmark drawing
// "You're in! We'll review your profile within 24 hours"
// "You'll receive an SMS when your profile goes live."
// Progress illustration: 3-step (Submitted → Under Review → Live)
// "Download the Nexplumb mobile app" (App Store / Play Store links)
// "Tell a friend" WhatsApp share button
```

---

### AW-2: Artisan Dashboard

**URL:** `app.nexplumb.com/artisan/dashboard` | **File:** `app/(artisan)/artisan/dashboard/page.tsx`

#### Sidebar
```tsx
// <ArtisanSidebar /> — navy background, full height

// TOP: Online/Offline toggle
// Prominent, top of sidebar, large toggle switch
// Online: teal pill "● Online" — receives job alerts
// Offline: gray pill "○ Offline" — no job alerts
// State persists: PUT /api/artisan/availability

// Avatar section below toggle:
// Artisan photo (56px circle) + name + "ID Verified" badge
// "Nexplumb Pro" badge if subscribed (gold/amber)
```

#### Metric Cards Row
```tsx
// 5-card flex row (mobile: 2-column grid)
// Each card: bg-white rounded-card shadow-card p-4

const metricCards = [
  {
    id: 'today_earnings',
    label: "Today's earnings",
    value: '₦5,200',          // formatNaira()
    sparkline: [2000, 3500, 4000, 1800, 5200], // 7-day trend
    trend: '+12% vs yesterday',
    trendUp: true,
  },
  {
    id: 'active_jobs',
    label: 'Active jobs',
    value: '2',
    link: '/artisan/jobs?status=active',
    linkLabel: 'View',
  },
  {
    id: 'profile_views',
    label: 'Profile views this week',
    value: '47',
    trend: '+8 vs last week',
    trendUp: true,
  },
  {
    id: 'rating',
    label: 'Your rating',
    value: '4.8 ★',
    sub: '134 reviews',
    link: '/artisan/reviews',
  },
  {
    id: 'completion_rate',
    label: 'Completion rate',
    value: '96%',
    sub: 'Platform avg: 92%',
    comparison: 'above_avg',
  },
]

// Sparkline: small 60×30px SVG line chart for earnings trend
```

#### New Jobs Near You Feed
```tsx
// "New jobs near you" section below metric cards
// Polls: GET /api/artisan/jobs/available every 30s when online
// Each job card: bg-white rounded-card border border-border p-4 shadow-card

interface JobAlertCard {
  jobType: string       // "Pipe repair"
  customerArea: string  // "Yaba, Lagos"
  estimatedPayMin: number
  estimatedPayMax: number
  distanceKm: number
  urgency: 'normal' | 'urgent'
  timePosted: string    // "2 min ago"
}

// Card layout:
// Top row: job type (bold) + "URGENT 🔥" badge (orange) if urgent + time posted (right)
// Middle: customer area + distance "3.2 km away"
// Price: "₦8,000 – ₦15,000" prominent in teal
// Market rate note: "Market rate for this job: ₦10,000" (smaller, slate)
// Actions: "Accept" (teal filled) + "Pass" (ghost) + "Counter" (secondary)

// Accept: POST /api/artisan/jobs/[id]/accept → redirect to active job view
// Pass: POST /api/artisan/jobs/[id]/pass → removes from feed
// Counter: opens counter-quote modal with price input
```

---

### AW-3: My Jobs

**URL:** `app.nexplumb.com/artisan/jobs` | **File:** `app/(artisan)/artisan/jobs/page.tsx`

```tsx
// Filter tabs: Active | Upcoming | Completed | Cancelled | All
// Search bar: job reference or customer area

// Job table:
// Columns: Job ID | Customer area | Trade | Date | Escrow amount | Status | Duration | Actions
// "View details" → job detail drawer (slides from right)

// Job detail drawer:
// Full job record: description + customer area + GPS route taken + chat history
// Before/after photos (if uploaded)
// Download receipt/invoice PDF
// Timeline: status change events with timestamps

// Export CSV button: top-right of table
// Filters: date range, status, trade, amount range
```

---

### AW-4: Earnings & Payouts

**URL:** `app.nexplumb.com/artisan/earnings` | **File:** `app/(artisan)/artisan/earnings/page.tsx`

#### Balance Widget
```tsx
// Three columns, bg-white rounded-card shadow-card p-6
// "Available" | "Pending" | "All-time earned"
// Each: label (text-slate text-caption) + amount (text-[32px] font-bold text-navy)
// Pending tooltip: "Released after job is confirmed by customer (or auto-release after 24h)"

// "Withdraw to bank" button:
// Full-width, orange, height 56px
// Tooltip on disabled state: "Nothing to withdraw yet"
// Withdrawal modal:
//   Artisan's bank details shown (name + account last-4 + bank)
//   Amount input: pre-fills with full available balance
//   "Confirm withdrawal" → POST /api/artisan/wallet/withdraw
//   Loading: "Processing transfer — please don't close..."
//   Success: "Transfer sent! Check your SMS for confirmation." + green tick
//   Error: specific Paystack error message + retry

// Commission breakdown note:
// "Commission breakdown: Gross earned ₦X — Platform commission (12%) ₦Y = Net received ₦Z"
// Shows transparency to address artisan trust concerns
```

#### Earnings Chart
```tsx
// Recharts BarChart, 30 days of daily earnings
// x-axis: dates (abbreviated: "Feb 14")
// y-axis: amounts in ₦ (formatNaira)
// Bar fill: orange (#E76F51)
// Hover tooltip: "Wed, 14 Feb 2025: ₦5,200" (formatted)
// Date filter: "This week | This month | Last 3 months | Custom" — tabs above chart
// Custom range: date range picker (two date inputs)
```

#### Transaction Table
```tsx
// Sortable by date (default: newest first)
// Columns: Date | Job ID | Customer area | Trade | Gross | Commission | Net | Status
// Gross: full amount
// Commission: red text "–₦1,500" (negative to show it's deducted)
// Net: green text "₦13,000" (what artisan receives)
// Status: "Completed" (teal) | "Pending" (amber)
// Download CSV: top-right button
```

---

### AW-5: Profile Editor

**URL:** `app.nexplumb.com/artisan/profile` | **File:** `app/(artisan)/artisan/profile/page.tsx`

```tsx
// Desktop: 2-column — LEFT: editor form (60%), RIGHT: live profile preview (40%)
// "Preview as customer" toggle: full iframe of public profile when toggled

// Profile completeness bar:
// Progress bar 0-100%, teal fill
// Current: "75% complete"
// Missing items list: "Add 2 more portfolio photos · Fill in your bio · Set your service area"
// Each missing item: clickable → scrolls to that section in the editor

// EDITOR SECTIONS (each with Save button or auto-save):

// 1. Bio section:
//    Textarea min-h-[150px], "Write about your experience and what makes you great"
//    Character count: 0/500

// 2. Skills tags:
//    Input to type a skill → press Enter to add as chip
//    Existing skills: chips with × to remove
//    Suggested skills (pre-defined per trade): clickable to add
//    Max 15 skills

// 3. Service area:
//    Map with Lagos overlaid
//    Artisan can click LGAs to add to service area (highlights in teal)
//    OR: drag a radius circle
//    Currently selected areas listed as chips below map

// 4. Availability schedule:
//    Weekly timetable: Mon–Sun rows
//    Each day: toggle on/off, then if on: time range (9am–6pm default)
//    "Available all day" quick option per day
//    Copy: "Apply this schedule to all days" button

// 5. Portfolio manager:
//    Same grid as registration Step 3
//    Drag to reorder (numbers show order)
//    Add photos (max 10)
//    Remove photos (with confirmation)
//    Before/After/On-the-job labels

// Save changes flow:
// Auto-save on blur (for text fields)
// Manual save for photos and service area
// Success toast: "Profile updated successfully"
// If validation error: red inline error + scroll to first error
```

---

### AW-6: Reviews Tab

**URL:** `app.nexplumb.com/artisan/reviews` | **File:** `app/(artisan)/artisan/reviews/page.tsx`

```tsx
// === RATING SUMMARY ===
// Large average: "4.8 ★" text-[48px] font-bold text-amber
// Total: "Based on 134 reviews"
// Distribution bars (1★ through 5★):
//   Each row: "5 ★ ████████████████░░ 87% (116)"
//   Bar: teal fill, proportional width
//   Percentage and count shown right

// === REVIEW LIST ===
// Newest first, pagination (10 per page)
// Each review card: bg-white rounded-card border border-border p-5 mb-3

// Review header:
// "Chisom A. · Surulere" text-body font-bold
// "Wed, 14 Feb 2025" text-caption text-slate
// Star rating: rendered stars

// Review text: text-body leading-relaxed

// Artisan reply (if exists):
// Indented card: bg-lgray rounded p-4 mt-3 border-l-4 border-teal
// "Your response:" text-caption text-teal font-bold above reply text

// Actions per review:
// "Reply" button → expands textarea below review → "Submit reply"
// "Flag for review" → opens modal with reason field (NOT delete — can't delete reviews)

// After submitting reply:
// Reply appears inline, "Reply" button changes to "Edit reply"
```

---

## 8. PHASE 1 — ADMIN DASHBOARD

> **Admin is desktop-only.** Never optimise for mobile. Prioritise information density over visual simplicity.

---

### AD-1: Admin Overview

**URL:** `admin.nexplumb.com/dashboard` | **File:** `app/(admin)/admin/dashboard/page.tsx`

#### Metric Strip
```tsx
// Auto-refreshes every 30 seconds: setInterval + refetch()
// "Last updated: 12 seconds ago" text-caption text-slate top-right

const adminMetrics = [
  { id: 'active_jobs',     label: 'Jobs active now',    urgentThreshold: null },
  { id: 'completed_today', label: 'Completed today',    urgentThreshold: null },
  { id: 'new_users',       label: 'New users today',    urgentThreshold: null },
  { id: 'revenue_today',   label: 'Revenue today (₦)',  format: 'naira'       },
  { id: 'open_disputes',   label: 'Open disputes',      urgentThreshold: 5    },
  { id: 'pending_verify',  label: 'Pending verification', urgentThreshold: 10 },
]

// Each card: bg-white rounded-card p-4 shadow-card
// Large number: text-[32px] font-bold text-navy
// Trend: "↑ 12% vs yesterday" text-caption — green if up, red if down
// Urgent styling: when metric > urgentThreshold
//   open_disputes > 5: card background amber/10, border amber
//   open_disputes > 10: card background red/10, border red
//   pending_verify > 10: card background amber/10

// Clicking any metric card: navigates to the relevant management section
```

#### Live Jobs Map
```tsx
// Full-width map (60% of main area)
// All active jobs as pins colour-coded by status:
//   Pending:    amber pin
//   En Route:   nxblue pin (moving)
//   On Site:    teal pin
//   Disputed:   red pin (pulsing)

// Map auto-refreshes marker positions every 30 seconds
// Click pin → sidebar drawer slides from right:
//   Job ID, customer name (masked), artisan name, trade, status, amount, time elapsed
//   "View full record" link → /admin/jobs/[id]

// Below map: Active Jobs Table (last 10 most recent)
// Columns: Job ID | Customer | Artisan | Trade | Area | Status | Time Since | Actions
```

#### Right Panel
```tsx
// === DISPUTE QUEUE ===
// Sorted by urgency: SLA time remaining (ascending, shortest first)
// Top dispute always shown expanded with key details
// Each item: border-l-4 colour coding
//   < 24h: border-green
//   24-36h: border-amber
//   36-48h: border-orange
//   > 48h: border-red (CRITICAL)
// "View all disputes →" link

// === VERIFICATION QUEUE ===
// Count of pending artisan applications
// "X applications pending — oldest: 18 hours ago"
// "Review now →" link

// === FLAGGED USERS ===
// Count of flagged accounts needing review
// "X accounts flagged"
```

---

### AD-2: Jobs Management

**URL:** `admin.nexplumb.com/jobs` | **File:** `app/(admin)/admin/jobs/page.tsx`

```tsx
// Filter sidebar (left, collapsible): date range | status | trade | area | amount range | flagged only
// Saved filter presets: "Today's disputes" | "Unreviewed artisans" | "High-value jobs (>₦50,000)"

// Jobs table:
// Columns: Job ID (clickable) | Customer | Artisan | Service | Location | Status |
//          Amount (₦) | Booked At | Last Update | Actions
// All sortable except Job ID and Actions columns
// Row click → job detail page or slide-in drawer
// Hover: bg-nxblue/5

// Status pills: colour-coded (see StatusBadge component)

// Action buttons per row:
// "View" (secondary small) | "Flag" (amber icon) | "Force refund" (danger small)
// "Message both" → opens compose modal with pre-filled template

// Export CSV: top-right, always available
// Includes filtered results only

// Bulk actions: checkbox column, "Select all" → bulk status update or export
```

---

### AD-3: Dispute Resolution Centre

**URL:** `admin.nexplumb.com/disputes` | **File:** `app/(admin)/admin/disputes/page.tsx`

#### Dispute List
```tsx
// Two-column layout on large screens: list left (380px), detail right (remaining)

// Dispute list:
// Sorted: SLA time remaining (oldest first)
// Filter tabs: All | Open | Under Review | Resolved | Escalated

// SLA timer (MOST IMPORTANT VISUAL):
// Each dispute shows countdown: "14h 32m remaining"
// Colour: < 24h = green, 24-36h = amber, 36-44h = orange, 44-48h = red, > 48h = red flashing
// ⚠️ A dispute approaching 48h MUST be impossible to miss

// High-value flag: automatic "HIGH VALUE" badge for disputes > ₦20,000
```

#### Dispute Detail View
```tsx
// Header: Dispute #NXD-847 | Amount: ₦12,500 | Opened: 14 Feb 2:30 PM | Status: Open

// === TIMELINE ===
// Left panel: chronological event feed
// "Job booked — 14 Feb 9:00 AM"
// "Artisan arrived — 14 Feb 11:45 AM"
// "Customer filed dispute — 14 Feb 3:00 PM"
// etc. Each: icon + description + timestamp

// === EVIDENCE COMPARISON ===
// Side-by-side: Customer (left) | Artisan (right)
// Customer side: statement text + uploaded photos
// Artisan side: statement text + before/after job photos
// Photo lightbox: click to enlarge + side-by-side comparison mode

// === JOB RECORD ===
// Right panel:
// Escrow amount | Payment method | Chat history | GPS route log

// === RESOLUTION PANEL ===
// Full-width, bottom of main area, bg-lgray, p-6, border-t

// Three resolution buttons:
// "Release to artisan" (green bg-teal text-white) → confirmation modal → note required
// "Refund to customer" (orange bg-orange text-white) → confirmation modal → note required
// "Partial resolution" (gray outlined) → input: artisan gets ₦X, customer gets ₦Y

// Mandatory note field:
// "Reason for decision (required, minimum 20 characters)"
// Resolution button stays DISABLED until 20 chars typed
// After confirm: "Are you sure? This cannot be undone without manager approval."

// Auto-notifications on resolution: SMS + in-app to both parties
// Audit trail tab: permanent log of all decisions on this dispute
```

---

### AD-4: Artisan Verification Queue

**URL:** `admin.nexplumb.com/verification` | **File:** `app/(admin)/admin/verification/page.tsx`

```tsx
// Queue list sorted: oldest first (FIFO — do NOT allow reordering by trade/area to prevent bias)
// Columns: Name | Trade | Location | NIN Status | BVN Status | Photo Flag | Time Waiting | Actions

// NIN Status icons:
// ✅ Green checkmark: "NIN Verified" — NIMC API returned match
// ⚠️ Amber warning: "Manual review" — NIMC API inconclusive
// ❌ Red x: "NIN Failed" — No match found

// Photo flag: AI-flagged low quality ("Blurry", "Face not visible", "Low lighting")

// Application Detail View:
// LEFT: Profile preview (how artisan appears to customers if approved)
// RIGHT: Document panel

// Document panel tabs:
// NIN Card Photo | Profile Photo | Portfolio (3+ images) | Guarantor Details
// Photos: full-size view in lightbox

// NIMC result display:
// "Identity verified: Chukwuemeka John Okonkwo, Male, DOB: 12 Mar 1990"
// OR: "Verification pending — NIMC API response awaited. Check in 2 minutes."

// Action buttons:
// "Approve" (green, full-width) → immediate: profile goes live, SMS sent
// "Request more info" (amber) → message template modal, custom message, WhatsApp+SMS
// "Reject" (red outlined) → mandatory rejection reason, rejection SMS sent

// After approval: "Artisan is now live on Nexplumb. ✓" success toast
// Queue auto-advances to next application
```

---

### AD-5: Analytics & Reporting

**URL:** `admin.nexplumb.com/analytics` | **File:** `app/(admin)/admin/analytics/page.tsx`

```tsx
// Date period toggle: "Day | Week | Month | Quarter | Custom"
// Custom: date range picker
// All charts: Recharts

// === PLATFORM OVERVIEW ===
// Line charts (4-up grid):
// Total jobs | Revenue (₦) | New users | Active artisans
// Each chart: small (200px height), teal line, area fill

// === GEOGRAPHIC HEAT MAP ===
// Lagos map with LGA polygons
// Colour intensity: light beige (0 jobs) → dark orange (many jobs)
// Legend: gradient scale
// Click LGA: shows top 5 artisans in that area + job count

// === ARTISAN QUALITY ===
// Rating distribution: horizontal bar chart (1★–5★)
// Completion rate by trade: grouped bar chart
// No-show rate by trade: separate line chart (threshold line at 10% in red)

// === CUSTOMER BEHAVIOUR ===
// Repeat booking rate: gauge chart (target: 25%+)
// Review rate: %
// Average job value: line chart with ₦ y-axis

// === REVENUE BREAKDOWN ===
// Stacked bar chart: Commission | Platform fees | Subscriptions | Materials
// Colours: orange | nxblue | teal | amber

// === CONVERSION FUNNEL ===
// Funnel chart (wide at top, narrow at bottom):
// Search (100%) → Profile view (65%) → Booking started (32%) → Payment complete (21%)
// Drop-off % shown in RED at each step transition
// → These conversion rates are the most important numbers in the product

// EXPORT: any section → CSV or PDF button, top-right of each section
```

---

### AD-6: User Management

**URL:** `admin.nexplumb.com/users` | **File:** `app/(admin)/admin/users/page.tsx`

```tsx
// Search: phone, name, or user ID — debounced 300ms
// Toggle tabs: Customers | Artisans
// Table: Name | Phone (masked) | Area | Join date | Jobs | Status | Actions

// User detail view (click row → slide-in drawer):
// Profile info | All bookings/jobs history | Payment history | Reviews | Account status
// Action buttons: "Flag" | "Suspend" | "Ban" | "Send message" | "Download data"
// ALL actions require mandatory reason note (GDPR/NDPA compliance)
// All actions permanently logged: admin name + timestamp + reason

// "Download data" → NDPA compliance: generates JSON/CSV of all user data
//   Confirms: "This will export all data held on this user per NDPA 2024."
```

---

## 9. PHASE 2 — SUPPLIER PORTAL

---

### SP-1: Supplier Registration

**URL:** `supplier.nexplumb.com/register` | **File:** `app/(supplier)/supplier/register/page.tsx`

```tsx
const supplierSchema = z.object({
  businessName:    z.string().min(3, 'Enter the registered business name'),
  cacNumber:       z.string().min(6, 'Enter valid CAC registration number'),
  businessAddress: z.string().min(10),
  warehouseAddress: z.string().min(10),
  contactName:     z.string().min(3),
  contactPhone:    z.string().regex(/^0[7-9][01]\d{8}$/),
  contactEmail:    z.string().email(),
  categories:      z.array(z.string()).min(1, 'Select at least one product category'),
  bankName:        z.string().min(1),
  accountNumber:   z.string().length(10),
  cacDocument:     z.instanceof(File, { message: 'Upload your CAC certificate' }),
  productPhotos:   z.array(z.instanceof(File)).min(3, 'Upload at least 3 product photos'),
})

const supplierCategories = [
  'Pipes & Fittings',
  'Electrical Cables & Components',
  'Bathroom Fittings',
  'Power Tools',
  'Building Materials',
  'Other',
]

// CAC document upload: PDF or image, shows preview
// "Submit for review" → admin approval within 48 hours
// Confirmation: "Application received. Our team will contact you within 48 hours."
```

---

### SP-2: Supplier Dashboard

**URL:** `supplier.nexplumb.com/dashboard` | **File:** `app/(supplier)/supplier/dashboard/page.tsx`

```tsx
// Left sidebar: Dashboard | Products | Orders | Artisan Requests | Earnings | Reviews | Settings

// Dashboard metrics:
const supplierMetrics = [
  'Orders received today',
  'Pending orders to fulfil',
  'Revenue this month (₦)',
  'Active product listings',
  'Average product rating',
]

// New order badge: email notification + sidebar badge
// Auto-confirm warning: "Auto-confirmed in 24h if no response" on pending orders
```

---

### SP-3: Products Catalogue

**URL:** `supplier.nexplumb.com/products` | **File:** `app/(supplier)/supplier/products/page.tsx`

```tsx
// Products table:
// Columns: Image | Name | Category | Price (₦) | Stock | Status | Views/week | Orders/week
// Toggle active/inactive: switch per row (instant update)
// Stock alert: count shown in red when < 5 units

// "Add product" form (slide-in panel or modal):
// Product name | Category (from supplier's registered categories)
// Brand | Detailed description (textarea)
// Price in ₦ | Stock count | Estimated delivery time (days)
// Photos: up to 8 images, drag-and-drop

// Bulk CSV import:
// Download template button → template.csv
// Upload CSV → validate → show error report for failed rows
// Preview valid rows before importing

// "Request Nexplumb Verified badge":
// Per product → submits for quality review
// "NX Verified" badge appears after admin approval
// Badge increases artisan trust in product listings
```

---

### SP-4: Orders Management

**URL:** `supplier.nexplumb.com/orders` | **File:** `app/(supplier)/supplier/orders/page.tsx`

```tsx
// Orders table:
// Columns: Order ID | Artisan name | Product(s) | Qty | Amount (₦) | Delivery area | Status | Actions

// Status lifecycle: New → Confirmed → Packing → Shipped → Delivered
// New order: highlighted row (amber bg) + "New" badge

// Actions per order:
// "Confirm order" → status to Confirmed
// "Mark as shipped" → input tracking number (required) → status to Shipped
// "View artisan details" → shows area only (NOT personal contact info)

// Bulk actions: checkboxes + "Mark selected as Shipped" etc.

// Auto-confirm note: "Order will auto-confirm in 24h if no action taken"
```

---

## 10. PHASE 2 — ENHANCED FEATURES

---

### CW-E1: Price Estimator Tool

**URL:** `nexplumb.com/price-estimator` | **File:** `app/(customer)/price-estimator/page.tsx`

```tsx
// Page title H1: "How much does an artisan cost in Lagos?"
// ← This exact phrase targets Google's high-volume search query

// Tool card: bg-white rounded-card shadow-card p-8 max-w-[600px] mx-auto

// 3 selectors:
// 1. Job type: dropdown with all service types
//    Options include: "Burst pipe · Drain unblocking · Tap replacement · Full bathroom installation
//                     Electrical wiring · Light fixture · Carpentry repair · Paint (1 room) · ..."

// 2. Location: Lagos LGA dropdown (affects price ranges)

// 3. Complexity: radio buttons with examples
//    Simple:   "e.g. single tap replacement, 1 light socket"
//    Standard: "e.g. bathroom leaks, standard wiring"
//    Complex:  "e.g. full bathroom renovation, complete rewiring"

// RESULT (shows immediately on selection change — NO calculate button):
// Price range bar:
// Gradient horizontal bar: green → teal → orange (left to right)
// Three markers on bar: "Budget: ₦5,000" | "Typical: ₦12,000" | "Premium: ₦22,000"
// "Typical" marker: larger + bold + teal line above it

// "Find artisans in this price range" orange CTA
// → /search?price_min=[budget]&price_max=[premium]&category=[trade]

// "Share this estimate" button: WhatsApp icon
// → "I got a price estimate for [job type] in [area] on Nexplumb: ₦X–₦Y"

// SEO article below tool (400+ words):
// H2: "How much does a plumber cost in Lagos? (2025 guide)"
// Covers: factors affecting price, typical ranges, how Nexplumb protects you, etc.
// This content targets long-tail search queries

// No authentication required — completely anonymous access
```

---

### CW-E2: Emergency Booking

**URL:** `nexplumb.com/emergency` | **File:** `app/(customer)/emergency/page.tsx`

```tsx
// Full-page urgency design
// NO normal navbar (too much distraction in emergency)
// Nexplumb logo top-left only (links to home)

// Red/orange banner: FULL-WIDTH
// "EMERGENCY BOOKING — Available 24 hours a day, 7 days a week"
// bg-gradient-to-r from-orange to-red-600, text-white, py-3, font-bold, text-center

// Emergency phone number: ABOVE THE FOLD, always
// "Rather call? 0800-NEXPLUMB" — large, prominent, clickable (tel: link)
// on mobile: tappable call button

// === SIMPLIFIED FORM (2 fields only) ===
// "What is the emergency?" — dropdown
const emergencies = [
  'Burst pipe / flooding',
  'No electricity / power fault',
  'Gas leak',
  'Electrical sparks / fire risk',
  'Blocked drain (urgent)',
  'Bathroom/toilet completely unusable',
  'Other urgent issue',
]

// "Your area in Lagos" — autocomplete (auto-detect first, manual override)
// "Find emergency artisans NOW" — full-width red/orange button h-16 text-[18px]

// On click:
// Spinner while searching
// Results: show ONLY available artisans within 5km, sorted by nearest
// Auto-refresh results every 60 seconds
// Each result card: ETA prominent "~8 min away" + emergency rate badge "+30% applies"

// No artisans in 5km:
// "Expanding search to 10km..." → auto-expand
// If still none: "No artisans available right now. Call 0800-NEXPLUMB immediately."

// Logged-in user experience:
// Address pre-filled from account
// Saved payment method pre-selected
// → Booking confirmed in 2 clicks (pick artisan → confirm)
```

---

## 11. PHASE 3 — ECOSYSTEM PORTALS

---

### EP-1: Enterprise Portal

**URL:** `enterprise.nexplumb.com` | **File:** `app/(enterprise)/page.tsx`

```tsx
// Left sidebar: Contract Overview | Properties | Bulk Jobs | SLA Dashboard | Invoices

// Contract Overview:
// Active SLAs | Total jobs this month | Spend vs budget (progress bar) | Issue rate

// Multi-Property Management:
// Card grid of managed properties
// Each property card: name + jobs this month + issue count + dedicated artisans
// "+ Add property" button → form: property name + address + type (residential/commercial)

// Bulk Job Request form:
// Multi-select properties
// Service needed: type + description
// Preferred artisan (from dedicated pool) or "Any available"
// Priority level
// Target date range
// → Generates multiple job requests in one submission

// SLA Dashboard:
// Table: artisan | response time avg | completion rate | rating | issues | [Edit pool]
// Trend arrows on all metrics

// Monthly Invoice:
// Auto-generated PDF: all jobs in billing period
// Download + "Send by email" button
```

---

### FP-1: Artisan Finance Portal

**URL:** `app.nexplumb.com/artisan/finance` | **File:** `app/(artisan)/artisan/finance/page.tsx`

```tsx
// "Your Nexplumb Financial Identity" — hero card
// bg-gradient-to-r from-navy to-nxblue, text-white, rounded-card, p-8

// Stats in the card:
// Jobs completed: 47 | Total earned: ₦312,000 | Completion rate: 96% | Rating: 4.8★ | Member since: Jan 2024

// === NEXPLUMB CREDIT SCORE ===
// Circular gauge (SVG): 0–850 scale
// Current score: 724 (good range)
// Colour zones: 0-399 red | 400-599 amber | 600-849 teal | 850 navy
// Label: "724 — Good"
// Explanation: "Based on your 47 completed jobs, earnings, ratings, and consistency"
// Score factors: collapsible breakdown

// === APPLY FOR MATERIAL CREDIT ===
// Pre-calculated limit: "Based on your history, you qualify for up to ₦50,000"
// Partner badge: Migo / Carbon / FairMoney logo
// "Apply now" → opens partner's application with pre-filled Nexplumb data
// Status tracker: "Application submitted · Under review · Approved: ₦50,000"

// === BNPL TOGGLE ===
// Explanation: "Pay for materials in 3 installments automatically deducted from earnings"
// Toggle to enable
// "Next deduction: ₦5,000 from your next job payout"

// === LOAN HISTORY ===
// Table: Date drawn | Amount | Repaid | Outstanding | Next payment
// "₦0 outstanding" success state with green checkmark
```

---

## 12. SHARED LOGIC & UTILITIES

### Auth State (Zustand)
```typescript
// lib/store/auth.ts
interface AuthState {
  user: {
    id: string
    type: 'customer' | 'artisan' | 'admin' | 'supplier'
    firstName: string
    phone: string
    avatar?: string
    isVerified?: boolean
    isOnline?: boolean       // artisan only
    nexScore?: number        // artisan credit score
  } | null
  token: string | null
  setUser: (user: AuthState['user']) => void
  setToken: (token: string) => void
  logout: () => void
}

// Auth guards: middleware.ts
// Protect routes based on user type:
// /artisan/* → requires type: 'artisan'
// /admin/* → requires type: 'admin'
// /supplier/* → requires type: 'supplier'
// /dashboard → requires type: 'customer'
```

### Naira Price Input Component
```tsx
// components/ui/NairaInput.tsx
// Renders: "₦ [number input]"
// Internal value: number (no formatting during input)
// Display: formatted on blur → "12,500"
// Accepts: 0 to 10,000,000 (max ₦10M per job)
// onChange: returns raw number (not string)

// Usage:
// <NairaInput label="Minimum price" value={priceMin} onChange={setPriceMin} />
```

### Escrow Badge Component
```tsx
// components/ui/EscrowBadge.tsx
// Always shows the same trust message
// Used on: artisan profile, booking Step C, any payment confirmation
// Props: size ('sm' | 'md' | 'lg'), variant ('banner' | 'inline')

// Banner variant: full-width teal/10 bg, shield icon left, text right
// Inline variant: single line, small shield icon, text in slate

const escrowMessages = {
  short: "Payment protected until job done",
  medium: "Your money is held safely until you confirm the job is complete",
  long: "Your payment is held by Nexplumb Escrow and released to the artisan only after you confirm the job is done. Full refund if the artisan does not show up.",
}
```

### GPS Distance Calculator
```typescript
// lib/distance.ts
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in km
}
```

### Nigerian Phone Validator
```typescript
// lib/validation.ts
export const nigerianPhoneRegex = /^(0[7-9][01]\d{8}|(\+234)[7-9][01]\d{8})$/

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234') && digits.length === 13) {
    return `+${digits}`
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.slice(1)}`
  }
  return phone
}

export const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank',
  'First Bank', 'FCMB', 'GT Bank', 'Heritage Bank',
  'Keystone Bank', 'Kuda Bank', 'Opay', 'Palmpay',
  'Polaris Bank', 'Stanbic IBTC', 'Sterling Bank',
  'UBA', 'Union Bank', 'Unity Bank', 'Wema Bank', 'Zenith Bank',
]

export const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa (Lekki)', 'Ibeju-Lekki', 'Ifako-Ijaye',
  'Ikeja', 'Ikorodu', 'Isale-Eko', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere', 'Yaba',
]
```

---

## 13. API INTEGRATION LAYER

### Base API Client
```typescript
// lib/api.ts
import axios from 'axios'
import { useAuthStore } from './store/auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Error interceptor
api.interceptors.response.use(
  res => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Key API Endpoints
```typescript
// lib/api-endpoints.ts

// Authentication
export const AUTH = {
  REGISTER_CUSTOMER:   '/auth/customer/register',
  REGISTER_ARTISAN:    '/auth/artisan/register',
  LOGIN:               '/auth/login',
  SEND_OTP:            '/auth/otp/send',
  VERIFY_OTP:          '/auth/otp/verify',
  RESET_PASSWORD:      '/auth/password/reset',
  VERIFY_NIN:          '/auth/verify/nin',
}

// Customer
export const CUSTOMER = {
  PROFILE:             '/customer/profile',
  BOOKINGS:            '/customer/bookings',
  SAVED_ARTISANS:      '/customer/saved-artisans',
  MESSAGES:            '/customer/messages',
  PAYMENTS:            '/customer/payments',
}

// Artisans
export const ARTISANS = {
  SEARCH:              '/artisans/search',
  FEATURED:            '/artisans/featured',
  PROFILE:             (slug: string) => `/artisans/${slug}`,
  AVAILABILITY:        (id: string) => `/artisans/${id}/availability`,
  REVIEWS:             (id: string) => `/artisans/${id}/reviews`,
  SAVE:                (id: string) => `/artisans/${id}/save`,
}

// Bookings
export const BOOKINGS = {
  CREATE:              '/bookings',
  GET:                 (id: string) => `/bookings/${id}`,
  TRACKING:            (id: string) => `/bookings/${id}/tracking`,
  CONFIRM_COMPLETE:    (id: string) => `/bookings/${id}/confirm`,
  DISPUTE:             (id: string) => `/bookings/${id}/dispute`,
}

// Escrow
export const ESCROW = {
  RELEASE:             (jobId: string) => `/escrow/${jobId}/release`,
  REFUND:              (jobId: string) => `/escrow/${jobId}/refund`,
  STATUS:              (jobId: string) => `/escrow/${jobId}/status`,
}

// Admin
export const ADMIN = {
  METRICS:             '/admin/metrics',
  JOBS:                '/admin/jobs',
  DISPUTES:            '/admin/disputes',
  RESOLVE_DISPUTE:     (id: string) => `/admin/disputes/${id}/resolve`,
  VERIFY_ARTISAN:      (id: string) => `/admin/artisans/${id}/verify`,
  USERS:               '/admin/users',
  ANALYTICS:           '/admin/analytics',
}

// Payments (Paystack)
export const PAYMENTS = {
  INITIALIZE:          '/payments/initialize',
  VERIFY:              (ref: string) => `/payments/verify/${ref}`,
  BANKS:               '/payments/banks',
  ACCOUNT_RESOLVE:     '/payments/account/resolve',
}
```

### React Query Hooks (Examples)
```typescript
// lib/hooks/useArtisans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'
import { ARTISANS } from '../api-endpoints'

export function useArtisanSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['artisans', 'search', params],
    queryFn: () => api.get(ARTISANS.SEARCH, { params }).then(r => r.data),
    staleTime: 30_000, // 30 seconds
  })
}

export function useArtisanProfile(slug: string) {
  return useQuery({
    queryKey: ['artisan', slug],
    queryFn: () => api.get(ARTISANS.PROFILE(slug)).then(r => r.data),
    staleTime: 60_000,
  })
}

export function useSaveArtisan(artisanId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(ARTISANS.SAVE(artisanId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'saved-artisans'] })
    },
  })
}
```

### Paystack Integration
```typescript
// lib/paystack.ts
// Load Paystack inline JS
export function initializePaystack(config: {
  email: string
  amount: number  // in kobo (multiply ₦ by 100)
  reference: string
  onSuccess: (reference: string) => void
  onClose: () => void
}) {
  const handler = (window as any).PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: config.amount * 100,  // Convert ₦ to kobo
    currency: 'NGN',
    ref: config.reference,
    callback: (response: any) => config.onSuccess(response.reference),
    onClose: config.onClose,
  })
  handler.openIframe()
}

// In booking flow: Paystack popup (not redirect) — trust stays on Nexplumb
// Verify payment server-side: POST /payments/verify/[ref]
```

---

## 14. SCREEN STATES REFERENCE

Every screen must be designed and coded in all 5 states. Submitting only the Default state is **not acceptable**.

| State | When | What to Show | Never Do |
|-------|------|-------------|----------|
| **Default** | Data loaded successfully | Real representative data | Lorem ipsum or placeholder numbers |
| **Loading** | API in-flight | Skeleton loaders matching default shape | Blank page, standalone spinner for lists |
| **Empty** | No data exists | Illustration + descriptive headline + CTA | "No data found" bare text |
| **Error** | API failed / network lost | Red banner or inline error + "Try again" + specific error | "Something went wrong" generic message |
| **Success** | Action completed | Animated confirmation + summary + next step | No feedback to user |

### Loading State Pattern
```tsx
// components/ui/Skeleton.tsx
// Always match the exact shape of real content

// Artisan card skeleton:
function ArtisanCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-card border border-border animate-pulse">
      <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
    </div>
  )
}
```

### Empty State Pattern
```tsx
// components/ui/EmptyState.tsx
// Each empty state is unique — never reuse the same one for different contexts

const emptyStates = {
  no_search_results: {
    icon: SearchX,
    headline: "No artisans found in this area",
    sub: "Try expanding your search distance or clearing some filters",
    cta: "Clear all filters",
  },
  no_bookings: {
    icon: Calendar,
    headline: "No bookings yet",
    sub: "Find a trusted artisan for your next home repair or installation",
    cta: "Find an artisan",
    ctaLink: "/search",
  },
  no_reviews: {
    icon: Star,
    headline: "No reviews yet",
    sub: "Reviews will appear here after customers rate completed jobs",
  },
  no_disputes: {
    icon: CheckCircle,
    headline: "No open disputes — great work!",
    sub: "All disputes have been resolved",
    variant: 'success',
  },
  no_artisans_for_verification: {
    icon: UserCheck,
    headline: "No pending verifications",
    sub: `${verifiedToday} artisans verified today`,
    variant: 'success',
  },
}
```

---

## 15. ACCESSIBILITY CHECKLIST

Every screen must pass these checks before handoff:

| Check | Standard | How to Verify |
|-------|----------|---------------|
| Colour contrast — body text | Min 4.5:1 (WCAG AA) | Figma contrast checker / browser DevTools |
| Colour contrast — large text / UI | Min 3:1 | Same tools |
| Keyboard navigation | All elements reachable via Tab | Test without mouse — Tab → Enter → Space |
| Focus ring | 2px solid teal, 2px offset on every interactive element | Never suppress `outline: none` without custom replacement |
| Image alt text | Descriptive for informative, empty (`alt=""`) for decorative | Review all `<img>` tags |
| Form labels | `<label>` element for every input | No placeholder-only labels |
| Error messages | Text description, never colour alone | Red text + red border (not just border) |
| Map alternative | "Switch to list view" always visible | Before map loads AND while displayed |
| Touch targets | Min 48×48px | Use browser inspector to measure |
| Body text size | Min 14px on web | Check all type styles |
| Reduced motion | Animations pause on `prefers-reduced-motion: reduce` | Test in OS accessibility settings |
| Heading hierarchy | H1 → H2 → H3 (no skipping) | Accessibility tree in DevTools |
| ARIA labels | Interactive icons without text labels need `aria-label` | Review all icon buttons |
| Screen reader | Major flows work without visual | Test with NVDA (Windows) or VoiceOver (Mac) |

---

## 16. SEO & PERFORMANCE RULES

### SEO Requirements
```tsx
// Every customer-facing page needs:
// 1. Unique <title> and <meta description>
// 2. H1 with primary keyword (each page: exactly one H1)
// 3. Structured data (JSON-LD) where applicable
// 4. Open Graph tags for social sharing
// 5. Canonical URL

// Homepage H1: "Your trusted artisan, one tap away"
// Subtext must include: "Lagos", "Nigeria", "plumbers", "electricians"

// Search results: 
// H1: "Plumbers in Yaba, Lagos" (dynamically generated)
// Meta: "Find verified plumbers in Yaba, Lagos. Escrow-protected. 4.8★ rated. Book in minutes."

// Artisan profile:
// H1: "[Artisan Name] — [Trade] in [Area], Lagos"
// JSON-LD: LocalBusiness + Person + AggregateRating + Review

// Price estimator:
// H1: "How much does an artisan cost in Lagos? (2025 guide)"
// Target: "plumber cost Lagos" — 1,000+ monthly searches
```

### Performance Budget
```typescript
// next.config.ts performance settings
const config = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 768, 1280, 1440],
    imageSizes: [32, 48, 64, 80, 128, 256],
    // Serve artisan photos at correct size — never full-res for 80×80 thumbnails
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

// Performance rules:
// Homepage: < 3 seconds on 4G (target: Core Web Vitals "Good")
// Map loading: NEVER on page load — only on user click (saves ~200KB JS)
// Artisan photos on cards: 80×80px served, lazy-loaded
// Fonts: system font stack first (no FOIT)
// All images: explicit width + height attributes (prevents CLS)
// Animations: CSS-only on critical paths (no GSAP/Framer on homepage)
// Route prefetching: Next.js handles automatically for <Link> components
```

### Image Optimisation Rules
```tsx
// ALWAYS use Next.js <Image> component, never <img> directly
// Exception: avatar URLs from external providers (use img with manual loading="lazy")

// Artisan card photo: width={80} height={80} (served at exact size)
// Artisan profile banner: width={700} height={240} priority (above fold)
// Homepage hero illustration: sizes="(max-width: 768px) 0px, 45vw"
// Portfolio photos: width={300} height={200} loading="lazy"

// For map pins (artisan photo thumbnails):
// Pre-process to 40×40px before using as map marker
// Use: canvas.drawImage() to create circular crop
```

---

## 17. FIGMA-TO-CODE HANDOFF CHECKLIST

Every screen must be checked off before engineering starts:

### Per-Screen Checklist
```
□ Screen ID from this document matches Figma frame name
□ All THREE breakpoints designed: Desktop 1280px / Tablet 768px / Mobile Web 375px
□ All FIVE states designed: Default / Loading / Empty / Error / Success
□ Hover states on ALL interactive elements
□ Focus states on ALL interactive elements (keyboard navigation)
□ All breakpoint behaviour annotated ("at 768px: sidebar collapses to drawer")
□ Sticky behaviour annotated with z-index requirements
□ Animation specs: duration, easing, trigger
□ Real data used in Default state (no Lorem ipsum, no placeholder prices)
□ All Naira amounts formatted: ₦12,500 not "NGN 12500" not "$12,500"
□ All phone numbers in Nigerian format
□ Colour contrast checked (WCAG AA) on all text
□ Component library used (no custom one-off components that break the system)
□ CSS grid spec annotated per breakpoint
□ API dependencies listed (what data does this screen need?)
□ Real-time flag: does this screen update live? (WebSocket required?)
□ Third-party integrations: Paystack / Google Maps / NIMC / WhatsApp
□ Accessibility notes: special keyboard or screen reader behaviour
□ Map screens: "Switch to list" button designed and annotated
□ Form screens: error states for every field designed
□ Notion handoff card created
```

### Mandatory Annotation Types
| Annotation | Example |
|-----------|---------|
| Breakpoint behaviour | "At 768px: left filter sidebar collapses to bottom-sheet drawer opened by 'Filter' button" |
| Hover state | "Card hover: box-shadow increases to shadow-card-hover, border changes to teal" |
| Sticky behaviour | "Navbar: position:sticky top:0 z-index:50. Must exceed map z-index (z-10)." |
| Animation | "Artisan map pin: position transition 0.5s ease. Updates every 10–15 seconds via WebSocket" |
| Grid | "Desktop: CSS grid 12-col, 24px gutter. Content max-width 1200px centred." |
| Real-time | "Metric strip: polls API every 30 seconds. Shows 'Last updated X seconds ago'." |
| Integration | "Paystack inline SDK (no redirect). Key: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY" |
| Accessibility | "Modal: focus-trap inside. Escape key closes. Scroll-lock on body while open." |

---

## APPENDIX A — NIGERIAN UX CONSIDERATIONS

### Trust-First Design Principles
1. **Escrow must be explained every time money is involved.** Never assume the user understands escrow from a previous visit.
2. **NIN and BVN collection requires reassurance.** Always show a security tooltip before the user types sensitive data.
3. **WhatsApp fallback on every critical flow.** Nigerian users are extremely comfortable with WhatsApp and suspicious of forms.
4. **Naira amounts must be exact.** Never round or abbreviate — "₦12,500" not "₦12.5k".
5. **SMS is the primary notification channel.** Push notifications are secondary. Always confirm with SMS.
6. **Low-data states must be handled gracefully.** Images must be lazy-loaded. Maps must not auto-load.
7. **Phone is the login identifier, not email.** Email is optional throughout the product.
8. **Auto-read OTP on Android** using `navigator.credentials.get()` — reduces friction for Nigerian Android users.

### Design for Emeka (Artisan Persona)
- 34 years old, self-taught plumber from Mushin
- May never have completed a web form
- Data is precious — no unnecessary form fields
- WhatsApp fallback on EVERY step
- Error messages in plain English — no technical jargon
- "Join Nexplumb" → must feel like a professional achievement, not a burden

### Design for Chisom (Customer Persona)
- 31 years old, HR officer from Surulere
- Primary fear: being scammed, stranger in home
- Trust signals must be ABOVE THE FOLD
- Escrow message must be visible before any payment
- Live GPS tracking is a core emotional reassurance feature

---

## APPENDIX B — COMPONENT IMPORT REFERENCE

```typescript
// Recommended library imports
import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import { z }               from 'zod'
import { useQuery,
         useMutation }     from '@tanstack/react-query'
import { create }          from 'zustand'
import { io }              from 'socket.io-client'
import { BarChart, Bar,
         LineChart, Line,
         FunnelChart }     from 'recharts'
import { toast }           from 'sonner'
import { Dialog }          from '@headlessui/react'
import { ShieldCheck, Star,
         MapPin, Lock,
         Search, Phone,
         MessageCircle,
         ChevronRight,
         CheckCircle }     from 'lucide-react'
import Image               from 'next/image'
import Link                from 'next/link'
import { useRouter,
         useSearchParams }  from 'next/navigation'
```

---

## APPENDIX C — ENVIRONMENT VARIABLES

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.nexplumb.com/v1
NEXT_PUBLIC_WS_URL=wss://api.nexplumb.com
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyxxxxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoxxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=2348012345678  # Nexplumb support number
NEXT_PUBLIC_SUPPORT_PHONE=08000639786       # 0800-NEXPLUMB
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Server-only
PAYSTACK_SECRET_KEY=sk_live_xxxxx
NIMC_API_KEY=xxxxx
NIMC_API_URL=https://api.nimc.gov.ng/v1
JWT_SECRET=xxxxx
DATABASE_URL=postgresql://xxxxx
REDIS_URL=redis://xxxxx
TERMII_API_KEY=xxxxx  # SMS OTP
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
```

---

*NEXPLUMB · Frontend Implementation Guide · Version 1.0 · Confidential*
*This document is the single source of truth for all frontend implementation decisions.*
*All engineering and design decisions must be validated against it.*
*Questions → product@nexplumb.com · Updates → Nexplumb Engineering Notion*
