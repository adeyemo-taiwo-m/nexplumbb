# NEXPLUMB — Frontend Style Guide
**Version 1.0 · Single Source of Truth for All Visual Decisions**

> Read this entire file before writing any component. Every token — colour, type, spacing, radius, shadow, state — is defined here. Never hardcode values that exist as tokens. Never invent styles not in this guide.

---

## TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Colour System](#2-colour-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Border Radius](#5-border-radius)
6. [Borders & Dividers](#6-borders--dividers)
7. [Shadows & Elevation](#7-shadows--elevation)
8. [Iconography](#8-iconography)
9. [Component Specifications](#9-component-specifications)
10. [Layout & Grid](#10-layout--grid)
11. [Navigation Patterns](#11-navigation-patterns)
12. [Interactive States](#12-interactive-states)
13. [Animation & Motion](#13-animation--motion)
14. [Screen States](#14-screen-states)
15. [Nigerian UX Conventions](#15-nigerian-ux-conventions)
16. [Accessibility Standards](#16-accessibility-standards)
17. [Tailwind Config Reference](#17-tailwind-config-reference)
18. [Do / Don't Rules](#18-do--dont-rules)

---

## 1. DESIGN PHILOSOPHY

Nexplumb is a **trust-first marketplace** for Nigerian urban homeowners and tradespeople. Every design decision must answer yes to at least one of these questions:

- Does this **build trust** faster than before?
- Does this **reduce friction** for a first-time user?
- Does this **survive a 3G connection** and an interrupted session?

### Visual Character

The Nexplumb aesthetic is **confident and professional, with warmth**. Not a startup-playful product, not a cold enterprise tool. Think of a trusted local bank branch that also has an app that works on your infinix phone — familiar, clear, unambiguous.

- **Substance over decoration.** Every visual element earns its place by carrying information or building trust. Decorative gradients, heavy shadows, and animations for their own sake are cut.
- **The orange CTA is sacred.** One primary action per screen. The orange button is never used for secondary or tertiary actions.
- **Type does the heavy lifting.** Sora for authority and structure, Lora for warmth and readability in longer text, IBM Plex Mono for precision data.
- **Escrow is the emotional centrepiece.** Trust language and the escrow badge appear before every payment interaction, without exception.

---

## 2. COLOUR SYSTEM

### 2.1 Core Palette

| Token Name | Hex | Tailwind Class | Role |
|---|---|---|---|
| `navy` | `#0D2137` | `bg-navy` / `text-navy` | Primary brand, navbars, sidebar backgrounds, dark headers |
| `nxblue` | `#2E86AB` | `bg-nxblue` / `text-nxblue` | Links, active states, verified badges, informational |
| `teal` | `#2A9D8F` | `bg-teal` / `text-teal` | Success, availability, confirmed states, focus rings, progress fills |
| `orange` | `#E76F51` | `bg-orange` / `text-orange` | **All primary CTAs.** Book Now, Pay Now, Submit. Never used for anything else. |
| `amber` | `#E9C46A` | `bg-amber` / `text-amber` | Warnings, pending states, phase labels, emergency/urgent badges |
| `lgray` | `#F2F4F6` | `bg-lgray` | Page backgrounds, alternating rows, section dividers |
| `body` | `#1C2833` | `text-body` | All primary body text, table content, headings on white |
| `slate` | `#717D7E` | `text-slate` | Captions, timestamps, placeholders, secondary labels |
| `border` | `#D5D8DC` | `border-border` | All card borders, input borders, dividers |
| White | `#FFFFFF` | `bg-white` | Card and input backgrounds, modal surfaces |

### 2.2 Semantic Colour Usage

```
Success / Available / Confirmed  →  teal   (#2A9D8F)
Info / Links / Verified          →  nxblue (#2E86AB)
Warning / Pending / Urgent       →  amber  (#E9C46A)
Danger / Error / Disputed        →  red    (#DC2626)
All Primary CTAs                 →  orange (#E76F51)
Destructive / Suspend / Ban      →  red    (#DC2626)
```

### 2.3 Badge Colour System

All status badges use a 15% opacity background with 100% opacity text. Always `rounded-full`.

```css
/* Usage pattern: bg-{color}/15 text-{color} border border-{color}/20 */

.badge-active     { background: rgba(42,157,143,0.15);  color: #2A9D8F; }
.badge-available  { background: rgba(42,157,143,0.15);  color: #2A9D8F; }
.badge-pending    { background: rgba(233,196,106,0.20); color: #b38a2e; }  /* darkened for contrast */
.badge-en-route   { background: rgba(46,134,171,0.15);  color: #2E86AB; }
.badge-on-site    { background: rgba(42,157,143,0.20);  color: #2A9D8F; }
.badge-completed  { background: rgba(13,33,55,0.10);    color: #0D2137; }
.badge-disputed   { background: rgba(220,38,38,0.10);   color: #DC2626; }
.badge-cancelled  { background: rgba(113,125,126,0.15); color: #717D7E; }
.badge-verified   { background: rgba(46,134,171,0.15);  color: #2E86AB; }
.badge-suspended  { background: rgba(220,38,38,0.10);   color: #DC2626; }
.badge-urgent     { background: rgba(231,111,81,0.15);  color: #E76F51; }
```

### 2.4 Colour Don'ts

- **Never** use orange for anything that is not a primary CTA.
- **Never** use dollar signs, "NGN", or USD formatting for Naira values.
- **Never** use a bright colour on a bright background without checking WCAG contrast first.
- **Never** rely on colour alone to communicate meaning — always pair with text, icon, or shape.
- **Never** use `#000000` pure black for text — use `#1C2833` (body token).
- **Never** use `#FFFFFF` pure white for text — use it only for text on dark/coloured backgrounds.

---

## 3. TYPOGRAPHY

### 3.1 Font Families

| Role | Family | Used For |
|---|---|---|
| **Display** | `Sora` | All headings (H1–H5), section headers, card titles, nav labels, button text, page titles |
| **Body** | `Lora` | Paragraphs, multi-sentence descriptions, review text, artisan bios, legal copy, longer prose |
| **Mono** | `IBM Plex Mono` | All labels, captions, metadata, prices (₦), statistics, timestamps, badges, form labels, data table content, phone numbers, booking references, NIN/BVN fields |

> **Rule:** When in doubt between Display and Mono, ask: is this a label or metadata? If yes → IBM Plex Mono. Is this a heading or navigational element? → Sora. Is this a sentence of prose the user will read through? → Lora.

### 3.2 Google Fonts Import

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

### 3.3 Type Scale — Desktop

| Token | Font | Size | Weight | Line Height | Tailwind | Used For |
|---|---|---|---|---|---|---|
| `h1` | Sora | 40px | 600 | 125% | `text-[40px] font-semibold font-display` | Hero headlines, page titles |
| `h2` | Sora | 32px | 600 | 125% | `text-[32px] font-semibold font-display` | Section headings |
| `h3` | Sora | 24px | 600 | 125% | `text-[24px] font-semibold font-display` | Card headings, sub-sections |
| `h4` | Sora | 18px | 600 | 125% | `text-[18px] font-semibold font-display` | Component headers, sidebar titles |
| `h5` | Sora | 14px | 600 | 125% | `text-[14px] font-semibold font-display` | Small section labels, drawer titles |
| `p1-r` | Lora | 16px | 400 | 150% | `text-[16px] font-normal font-body` | Primary body text, artisan bios |
| `p1-b` | Lora | 16px | 500 | 150% | `text-[16px] font-medium font-body` | Emphasised body text |
| `p2-r` | Lora | 14px | 400 | 150% | `text-[14px] font-normal font-body` | Secondary body text |
| `p2-b` | Lora | 14px | 500 | 150% | `text-[14px] font-medium font-body` | Secondary emphasised |
| `p3-r` | Lora | 12px | 400 | 150% | `text-[12px] font-normal font-body` | Fine print, review excerpts |
| `p3-b` | Lora | 12px | 500 | 150% | `text-[12px] font-medium font-body` | Fine print emphasised |
| `l2-r` | IBM Plex Mono | 16px | 400 | 125% | `text-[16px] font-normal font-mono` | Large labels, stat values |
| `l2-b` | IBM Plex Mono | 16px | 600 | 125% | `text-[16px] font-semibold font-mono` | Large labels bold |
| `l3-r` | IBM Plex Mono | 14px | 400 | 125% | `text-[14px] font-normal font-mono` | Standard labels, captions |
| `l3-b` | IBM Plex Mono | 14px | 600 | 125% | `text-[14px] font-semibold font-mono` | Standard labels bold |
| `l4-r` | IBM Plex Mono | 12px | 400 | 125% | `text-[12px] font-normal font-mono` | Small labels, timestamps |
| `l4-b` | IBM Plex Mono | 12px | 600 | 125% | `text-[12px] font-semibold font-mono` | Small labels bold, badge text |

### 3.4 Type Scale — Mobile (≤ 767px)

| Token | Desktop | Mobile | Change |
|---|---|---|---|
| `h1` | 40px | 26px | −14px |
| `h2` | 32px | 22px | −10px |
| `h3` | 24px | 18px | −6px |
| `h4` | 18px | 16px | −2px |
| `h5` | 14px | 14px | — |
| `p1-r` | 16px | 15px | −1px |
| `p2-r` | 14px | 13px | −1px |

### 3.5 Typography Rules

- **Button labels:** Always Sora, 14px, font-weight 600. **Always sentence case.** Never ALL CAPS, never Title Case.
- **Naira amounts:** Always IBM Plex Mono. Format as `₦12,500` — never `NGN 12500`, never `₦12.5k`, never `$12,500`.
- **Phone numbers, NIN, BVN, booking references:** Always IBM Plex Mono.
- **Review text and artisan bios:** Always Lora, for warmth and readability.
- **Navigation labels:** Always Sora.
- **Table cell data:** IBM Plex Mono for all data values, Sora for column headers.
- **Minimum text size:** 12px on all screens. Never smaller.
- **Line length:** Body text (Lora) max 70 characters per line for readability.

---

## 4. SPACING SYSTEM

Only use values from this scale. Never write arbitrary pixel values like `mt-[13px]` or `padding: 7px`.

| Token | Value | Tailwind | Common Use |
|---|---|---|---|
| `space-1` | 4px | `p-1` / `gap-1` | Icon internal padding, dot margin |
| `space-2` | 8px | `p-2` / `gap-2` | Inline icon gap, tight row gap |
| `space-3` | 12px | `p-3` / `gap-3` | Nav item padding, badge padding |
| `space-4` | 16px | `p-4` / `gap-4` | Card padding (compact), grid gap |
| `space-5` | 20px | `p-5` / `gap-5` | Card padding (standard), section gap |
| `space-6` | 24px | `p-6` / `gap-6` | Main content padding, large gaps |
| `space-8` | 32px | `p-8` / `gap-8` | Section separation |
| `space-10` | 40px | `p-10` | Page side margins (desktop) |
| `space-12` | 48px | `p-12` | Modal/form generous padding |
| `space-16` | 64px | `p-16` | Large section vertical padding |
| `space-20` | 80px | `p-20` | Hero section padding |

### 4.1 Layout Constants

| Zone | Dimension | Tailwind |
|---|---|---|
| Customer Navbar height | 64px | `h-16` |
| Artisan Sidebar width | 240px | `w-60` |
| Admin Sidebar width | 220px | `w-[220px]` |
| Customer Dashboard Sidebar | 240px | `w-60` |
| Main content max-width | 1200px | `max-w-[1200px]` |
| Filter sidebar width | 280px | `w-[280px]` |
| Artisan profile booking widget | 360px | `w-[360px]` |
| Card inner padding | 20px | `p-5` |
| Button height (default) | 48px | `h-12` |
| Button height (large) | 56px | `h-14` |
| Button height (small) | 36px | `h-9` |
| Input height | 48px | `h-12` |
| Touch target minimum | 48×48px | — |

---

## 5. BORDER RADIUS

| Name | Value | Tailwind | Used For |
|---|---|---|---|
| `btn` | 8px | `rounded-btn` / `rounded-lg` | Buttons, inputs, nav items, small cards |
| `card` | 12px | `rounded-card` / `rounded-xl` | All card components, panels, dropdowns |
| `modal` | 16px | `rounded-modal` / `rounded-2xl` | Modals, dialogs, full-screen overlays |
| `badge` | 9999px | `rounded-full` | All status badges, pills, avatar circles, dots |

**Critical rule:** When using a single-sided border accent (`border-l-2`, `border-l-4`), set `border-radius: 0`. Rounded corners only make sense with borders on all four sides.

---

## 6. BORDERS & DIVIDERS

All borders use a single colour: `#D5D8DC` (`border-border`).

| Context | Style |
|---|---|
| Card default | `border border-border` (1px) |
| Card hover | `border-teal/50` |
| Input default | `border border-border` (1px) |
| Input focus | `border-teal` + `ring-2 ring-teal/20` |
| Input error | `border-red-500` + `ring-2 ring-red-500/20` |
| Section divider | `border-b border-border` |
| Card header bottom | `border-b border-border` |
| Sidebar active nav item | `border-l-[3px] border-teal` |
| Admin dispute (critical) | `border-l-4 border-red-500` |
| Admin dispute (warning) | `border-l-4 border-amber` |
| Escrow trust banner | `border border-teal` |
| Alert (amber warning) | `border border-amber/30` |
| Alert (red danger) | `border border-red-500/30` |

---

## 7. SHADOWS & ELEVATION

```css
/* tailwind.config.ts */
boxShadow: {
  'card':       '0 2px 8px rgba(13,33,55,0.08)',
  'card-hover': '0 6px 24px rgba(13,33,55,0.14)',
  'modal':      '0 20px 60px rgba(13,33,55,0.25)',
  'nav':        '0 2px 12px rgba(13,33,55,0.10)',
}
```

| Shadow | When to Use |
|---|---|
| `shadow-card` | Default on all Card components, stat cards, artisan cards |
| `shadow-card-hover` | On card hover transition |
| `shadow-modal` | All modals, dialogs, bottom sheets |
| `shadow-nav` | Navbar when scrolled (after page scroll > 0) |

**No glow effects. No coloured shadows. No drop shadows on text.** Shadows only convey elevation, never decoration.

---

## 8. ICONOGRAPHY

Icon library: **Lucide React** exclusively.

```tsx
import { ShieldCheck, MapPin, Star, Search, Phone, MessageCircle,
         Lock, Calendar, ChevronRight, CheckCircle, AlertTriangle,
         Wallet, Clock, User, Settings, LogOut, Heart, Share2 } from 'lucide-react'
```

### 8.1 Icon Sizes

| Context | Size | Usage |
|---|---|---|
| Inline in text | 16px | Inside buttons, beside labels |
| Card header / badge | 16px | Trust badges (card view) |
| Profile / sidebar | 20px | Sidebar nav items, profile trust badges |
| Section illustration | 32px | How It Works steps, Trust Bar |
| Hero / large feature | 40–48px | Large feature callouts |

### 8.2 Icon Colour Rules

- Sidebar nav icon: `text-white` (inactive), `text-teal` (active)
- Card action icons: `text-slate`
- Trust/verified icons: `text-nxblue` (blue shield), `text-teal` (certified star)
- Warning icons: `text-amber`
- Error/danger icons: `text-red-600`
- CTA/highlight icons: `text-orange`
- Escrow badge icon: `text-teal`, 24px, always `ShieldCheck`

### 8.3 Icon-only Buttons

Every icon-only button **must** have an `aria-label` attribute. Example:

```tsx
<button aria-label="Close modal" className="...">
  <X size={20} />
</button>
```

---

## 9. COMPONENT SPECIFICATIONS

### 9.1 Button

```tsx
// Base classes (always applied):
// font-display font-bold rounded-btn transition-all duration-200
// focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2
// disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]

const variants = {
  primary:   'bg-orange text-white hover:bg-[#c8522d] shadow-sm',
  secondary: 'border-[1.5px] border-navy text-navy bg-transparent hover:bg-navy hover:text-white',
  ghost:     'text-nxblue hover:bg-nxblue/10 bg-transparent',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  success:   'bg-teal text-white hover:bg-[#1f7a6e]',
}

const sizes = {
  sm:   'h-9  px-4  text-[13px]',
  md:   'h-12 px-6  text-[14px]',   // default — 48px height
  lg:   'h-14 px-8  text-[15px]',   // 56px height — payment CTAs
  full: 'h-12 w-full text-[14px]',
}
```

**Button rules:**
- Loading state: show spinner + "Processing..." text. Never hide text entirely.
- Label text in payment buttons: always include amount. Example: `"Confirm & pay ₦13,500"`.
- Never disable a button mid-payment flow — show visual loading instead.
- Never use orange for anything other than the one primary action on a screen.
- Never uppercase button labels.

### 9.2 Form Input

```tsx
// Base input classes:
// h-12 w-full rounded-btn border border-border bg-white px-4
// font-mono text-[14px] text-body placeholder:text-slate placeholder:font-mono
// focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20
// transition-colors duration-150
// aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20

// Label (always above input — never floating placeholder-only):
// font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide

// Error message (below input):
// font-mono text-[12px] text-red-600 mt-1

// Hint/helper text:
// font-mono text-[12px] text-slate mt-1
```

**Special input types:**

```tsx
// Phone number input — Nigerian format
// Prefix: "+234 |" displayed before the input field
// Accept: 08012345678 OR +2348012345678 OR 8012345678
// Validate: /^(0[7-9][01]\d{8}|(\+234)[7-9][01]\d{8})$/

// NIN input (11 digits)
// Info tooltip: "Your NIN is encrypted and never shared publicly"
// On blur: verify via API, show "Checking NIN..." state
// Success: teal inline badge "NIN Verified ✓"
// Error: "NIN not found. Check your number or call 08080908908"

// BVN input (11 digits)
// Security tooltip: "Your BVN is used only for payout verification. Encrypted at rest."
// Mask after entry: show *** *** *** ** — NEVER show raw BVN

// Password input
// Eye toggle icon on right side
// Strength bar: weak (1/3 red) | moderate (2/3 amber) | strong (3/3 teal)
// Rules: min 8 chars, 1 uppercase, 1 number
```

### 9.3 Artisan Card — Horizontal (Search Results)

```tsx
// Container:
// flex flex-row gap-4 p-4 bg-white rounded-card border border-border
// shadow-card hover:shadow-card-hover transition-shadow cursor-pointer

// Photo: w-20 h-20 rounded-full object-cover flex-shrink-0

// Centre section (flex-1 min-w-0):
//   Name: font-display font-bold text-[15px] text-navy
//   Trade + Area: font-mono text-[12px] text-slate
//   Stars row: amber stars + "(47 reviews)" font-mono text-[12px] text-slate + "· 134 jobs"
//   Availability badge: bg-teal/15 text-teal (available) OR bg-lgray text-slate (unavailable)
//   Bio: font-body text-[14px] text-body line-clamp-2
//   Skills chips: flex-wrap gap-1, bg-lgray text-body font-mono text-[11px] rounded-full px-2 py-0.5

// Right section (flex-col items-end gap-2):
//   Price: font-mono text-[14px] font-semibold text-navy "₦8,000 – ₦15,000"
//   Trust badges row: 16px icons with tooltips
//   "View Profile" secondary button (sm)
//   "Book Now" primary orange button (sm)

// UNAVAILABLE STATE:
// opacity-60, "Book Now" disabled, gray "Unavailable" badge
```

### 9.4 Status Badge

```tsx
// Base: inline-flex items-center gap-1.5 px-3 py-1 rounded-full
//       font-mono text-[11px] font-semibold

// With dot (for live status):
// <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
```

### 9.5 Trust Badge

```tsx
// id_verified:   nxblue ShieldCheck icon, "ID Verified" label
// certified:     teal Star icon, "Nexplumb Certified"
// guarantor:     green UserCheck icon, "Guarantor Verified"
// trade_tested:  orange Award icon, "Trade Tested"

// Card view: 16px icon only — hover tooltip shows label and explanation
// Profile view: 20px icon + text label
// All badges have cursor-pointer + tooltip on hover
```

### 9.6 Star Rating

```tsx
// Filled: colour #E9C46A (amber token)
// Empty:  colour #D5D8DC (border token)
// Half:   CSS clip-path half fill
// Always show: "4.8 ★" + "(47 reviews)" in font-mono text-[12px]
// Always show 1 decimal place minimum: "4.0" not "4"
```

### 9.7 Data Table

```tsx
// Sticky header: position sticky top-16 (below navbar)
// Header row: bg-lgray, font-display font-semibold text-[13px] text-slate uppercase tracking-wide
// Body rows alternating: white / bg-lgray
// Hover row: bg-nxblue/5 transition-colors
// Row text: font-mono text-[14px] text-body
// Action column: right-aligned, flex gap-2
// Sortable headers: show arrow icon, onClick toggles asc/desc

// Loading: skeleton rows same height as real rows, animate-pulse
// Empty: full-width cell, illustration + message + CTA — never bare "No data found"
```

### 9.8 Modal / Dialog

```tsx
// Overlay: bg-navy/50 (50% opacity navy backdrop)
// Modal card: bg-white max-w-xl rounded-modal shadow-modal
// Header: title (font-display font-bold text-[18px]) left + × close button right
// Body: overflow-y-auto if content overflows
// Footer: action buttons right-aligned

// Behaviour:
// - Escape key closes
// - Click outside closes
// - Focus trap: Tab cycles only inside modal
// - Scroll lock: body scroll disabled while open
```

### 9.9 Toast Notifications (Sonner)

```tsx
// Position: bottom-right, max-w-[320px], 4s auto-dismiss
// Font: font-mono text-[13px]

const toastVariants = {
  success: 'border-l-4 border-teal',     // + checkmark icon
  error:   'border-l-4 border-red-600',   // + x icon
  warning: 'border-l-4 border-amber',     // + triangle icon
  info:    'border-l-4 border-nxblue',    // + info icon
}

// Rule: Only trigger toasts for async outcomes (API responses).
// Never for trivial synchronous UI interactions.
```

### 9.10 Escrow Badge (Trust Component)

This is one of the most important trust signals in the product. **Never omit it from any payment-adjacent screen.**

```tsx
// Banner variant (full-width, on payment screens):
// bg-teal/10 border border-teal rounded-card p-6
// ShieldCheck icon (48px, text-teal) left
// Font-display font-bold text-[15px] text-navy: "Your payment is held safely by Nexplumb"
// Font-body text-[14px] text-slate: "₦13,500 is released to the artisan ONLY after you confirm the job is done."

// Inline variant (artisan profile, booking flow):
// flex items-center gap-2
// ShieldCheck 24px text-teal
// font-body text-[13px] text-slate: "Payment protected until job done"
```

### 9.11 Price Input (Naira)

```tsx
// components/ui/NairaInput.tsx
// Renders: "₦ [number input]"
// Internal value: raw number
// Display on blur: formatted with commas → "₦12,500"
// Font: font-mono text-[15px]
// Max value: 10,000,000 (₦10M per job)
// onChange returns raw number, not string
```

### 9.12 OTP Input (6 Digits)

```tsx
// Six individual input boxes, each 48×56px
// Auto-advance: focus moves to next box on digit entry
// Auto-back: backspace on empty box focuses previous box
// Font: font-mono text-[20px] font-semibold text-navy text-center
// Border: border-2 border-border focus:border-teal rounded-btn
// On Android: attempt navigator.credentials.get() for auto-read OTP
// Resend link: appears after 60s countdown, text-nxblue
```

### 9.13 Skeleton Loader

```tsx
// ALWAYS match the exact shape of the real content.
// Use: animate-pulse bg-gray-200 rounded
// NEVER use a standalone spinner for list content.
// A spinner is only acceptable inside a button during action loading.

// Artisan card skeleton:
<div className="flex gap-4 p-4 bg-white rounded-card border border-border animate-pulse">
  <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
  <div className="flex-1 space-y-3">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
    <div className="h-3 bg-gray-200 rounded w-2/3" />
  </div>
  <div className="flex flex-col gap-2 items-end">
    <div className="h-4 bg-gray-200 rounded w-20" />
    <div className="h-9 bg-gray-200 rounded w-24" />
  </div>
</div>
```

### 9.14 WhatsApp Float Button

```tsx
// Fixed bottom-right: bottom-6 right-6 z-40
// w-14 h-14 bg-green-500 rounded-full shadow-lg
// WhatsApp SVG icon (white)
// hover:scale-110 transition-transform
// Tooltip on hover: "Need help? Chat with us"
// href: "https://wa.me/[NUMBER]?text=Hello%20Nexplumb"
// Visible: ALL customer-facing pages
// Hidden: Admin dashboard
```

### 9.15 Step Progress Indicator (Booking Flow)

```tsx
// Horizontal stepper, always visible at top of booking flow

// Active step:   teal filled circle + teal text + font-semibold
// Completed:     navy filled circle + checkmark icon + nav text
// Upcoming:      gray border circle + gray text

// Connector line between steps:
// completed segment: bg-teal h-[2px]
// upcoming segment:  bg-border h-[2px]

// Completed steps clickable (to review, not re-edit after payment started)
```

---

## 10. LAYOUT & GRID

### 10.1 Breakpoints

| Name | Width | Grid Columns | Gutter | Side Margin |
|---|---|---|---|---|
| Mobile | 375px – 767px | 4 | 16px | 16px |
| Tablet | 768px – 1279px | 8 | 20px | 24px |
| Desktop | 1280px + | 12 | 24px | 40px |
| Wide | 1440px + | 12 | 24px | auto (centred) |

**Design direction: Desktop first for all web portals.** Start at 1280px, simplify downward.

### 10.2 Content Max-Widths

```css
.content-container  { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.wide-container     { max-width: 1280px; margin: 0 auto; }
.narrow-container   { max-width: 640px;  margin: 0 auto; } /* forms, auth */
.booking-container  { max-width: 960px;  margin: 0 auto; } /* booking flow */
```

### 10.3 Portal Layouts

**Customer Portal — Full-width pages (Homepage, Search, Profile)**
```
[Navbar — 64px sticky]
[Page content — full width up to max-w-[1200px]]
[Footer — bg-navy]
```

**Customer Dashboard**
```
[Navbar — 64px sticky]
[Sidebar 240px fixed left] [Main content ml-60 bg-lgray overflow-y-auto]
```

**Artisan Portal**
```
[Sidebar 240px fixed left bg-navy] [Main content ml-60 bg-lgray]
```

**Admin Dashboard**
```
[Sidebar 220px fixed left bg-navy] [Main content ml-[220px] bg-lgray]
Desktop only — no mobile optimisation.
```

---

## 11. NAVIGATION PATTERNS

### 11.1 Customer Navbar

```tsx
// Position: sticky top-0 z-50
// Height: 64px (h-16)
// Background: transparent over dark hero sections
// On scroll > 0: bg-white shadow-nav transition-all duration-300

// Left:    Nexplumb logo → /
// Centre:  "How it works" · "Find an artisan" · "For artisans" · "Pricing"
//          font-display text-[14px] text-navy hover:text-orange transition-colors
// Right:   "Log in" text link · "Get started" orange button
//          If authenticated: avatar dropdown (Dashboard, Settings, Logout)

// Mobile (< 768px):
// Hamburger replaces centre nav
// Drawer from left: full-height bg-white, stacked nav links
```

### 11.2 Artisan Sidebar Nav Item

```tsx
// Height: 40px (h-10), px-4 py-2.5
// Icon: 20px, mr-3
// Label: font-display text-[14px]

// Default:  text-white/70 hover:bg-white/10 hover:text-white
// Active:   border-l-[3px] border-teal bg-teal/20 text-teal font-semibold pl-[13px]
//           (pl-[13px] = px-4 − 3px border = visual alignment preserved)

// Badge (unread count): small rounded-full bg-orange text-white font-mono text-[10px] ml-auto

// Tablet: icon-only sidebar w-16, tooltip on hover shows label
// Mobile: bottom tab bar with 5 primary tabs
```

### 11.3 Admin Sidebar Nav Item

```tsx
// Same as Artisan but desktop-only
// Dispute item: red dot badge when unresolved disputes > 0
// Verification item: amber dot badge when pending > 0
```

---

## 12. INTERACTIVE STATES

Every interactive element **must** have visible hover and focus states. No exceptions.

| Element | Default | Hover | Focus / Active |
|---|---|---|---|
| Card | `border-border shadow-card` | `border-teal/50 shadow-card-hover translateY(-1px)` | — |
| Input | `border-border` | `border-border` (no change) | `border-teal ring-2 ring-teal/20` |
| Button Primary | `bg-orange` | `bg-[#c8522d]` | `ring-2 ring-orange/50` |
| Button Secondary | `border-navy text-navy` | `bg-navy text-white` | `ring-2 ring-navy/30` |
| Nav item (sidebar) | `text-white/70` | `bg-white/10 text-white` | Active style (teal border + bg) |
| Nav link (top) | `text-navy` | `text-orange` | `text-orange underline` |
| Filter tab | `text-slate` | `text-navy` | `border-b-2 border-orange text-orange font-bold` |
| Table row | `bg-white / bg-lgray` | `bg-nxblue/5` | — |
| Badge | Static — no hover | — | — |
| Star rating | — | `cursor-pointer opacity-80` | — |
| Artisan card | `shadow-card` | `shadow-card-hover` | — |

**All transitions:** `transition-all duration-200` or `transition-colors duration-150`. Never instant (`duration-0`).

### 12.1 Focus Ring (Accessibility — Never Omit)

```css
:focus-visible {
  outline: 2px solid #2A9D8F; /* teal */
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 13. ANIMATION & MOTION

**Principle: Purposeful, not decorative.** Every animation must make the interface clearer or more trustworthy. No animations for aesthetic pleasure alone.

```css
/* Booking confirmation checkmark — draws itself on success */
@keyframes draw-check {
  from { stroke-dashoffset: 200; }
  to   { stroke-dashoffset: 0; }
}

/* Map pin pulse — artisan location, en-route status */
@keyframes pin-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}

/* Available artisan pin pulse (homepage map, live tracking) */
.pin-available { animation: pin-pulse 2s ease-in-out infinite; }

/* Artisan position update — smooth position transition on map */
.map-marker { transition: all 0.5s ease; }

/* Page skeleton loading */
.skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

| Animation | Applied To | Duration |
|---|---|---|
| `draw-check` | Booking confirmed checkmark SVG | 0.6s ease |
| `pin-pulse` | Available artisan map pins | 2s loop |
| `map-marker transition` | Live GPS position updates | 0.5s ease |
| `skeleton pulse` | All skeleton loaders | 2s loop |
| Card hover lift | `translateY(-1px)` on hover | 0.2s |
| Sidebar drawer | Slide from left | 0.25s ease-out |
| Filter bottom sheet | Slide from bottom | 0.3s ease-out |
| Modal appear | Fade in + scale 0.95→1 | 0.2s ease |
| Toast appear | Slide in from right | 0.2s ease |

### 13.1 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .pin-available { animation: none; opacity: 1; }
  .skeleton      { animation: none; background: #E5E8EC; }
  * { transition-duration: 0.01ms !important; }
}
```

---

## 14. SCREEN STATES

Every screen must be built in all five states. A screen is not complete until all states are designed and coded.

| State | When | What to Show | Never Do |
|---|---|---|---|
| **Default** | Data loaded | Real representative data | Lorem ipsum, placeholder ₦ amounts |
| **Loading** | API in flight | Skeleton loaders matching exact shape | Blank page, full-page spinner |
| **Empty** | No data exists | Illustration + headline + CTA | Bare "No data found" text |
| **Error** | API failed | Inline red banner + specific message + retry | "Something went wrong" generic |
| **Success** | Action completed | Animated confirmation + next step | Silence — always confirm |

### 14.1 Empty State Components

```tsx
const emptyStates = {
  no_search_results: {
    headline: "No artisans found in this area",
    sub: "Try expanding your search distance or clearing some filters",
    cta: "Clear all filters",
  },
  no_bookings: {
    headline: "No bookings yet",
    sub: "Find a trusted artisan for your next home repair",
    cta: "Find an artisan → /search",
  },
  no_reviews: {
    headline: "No reviews yet",
    sub: "Reviews appear after customers rate completed jobs",
  },
  no_disputes: {
    headline: "No open disputes — great work!",
    variant: "success",
  },
}
```

---

## 15. NIGERIAN UX CONVENTIONS

These are non-negotiable product decisions, not design preferences.

### 15.1 Currency & Numbers

- **Always:** `₦12,500` — the ₦ symbol, comma separator, no decimals for whole amounts
- **Never:** `NGN 12500` · `₦12.5k` · `$12,500` · `12,500 naira`
- All Naira amounts use `font-mono` (IBM Plex Mono)
- Escrow amounts always shown in full — never abbreviated
- Emergency premium: `+30%` always shown explicitly when urgency is selected

```typescript
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}
export function formatNairaRange(min: number, max: number): string {
  return `${formatNaira(min)} – ${formatNaira(max)}`
}
```

### 15.2 Phone Numbers

```
Display format:  +234 801 234 5678
Input format:    accepts 08012345678, +2348012345678, 8012345678
Masked display:  +234 *** **** 678  (for privacy in messages/tracking)
```

```typescript
const nigerianPhoneRegex = /^(0[7-9][01]\d{8}|(\+234)[7-9][01]\d{8})$/

export const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank', 'First Bank',
  'FCMB', 'GT Bank', 'Heritage Bank', 'Keystone Bank', 'Kuda Bank',
  'Opay', 'Palmpay', 'Polaris Bank', 'Stanbic IBTC', 'Sterling Bank',
  'UBA', 'Union Bank', 'Unity Bank', 'Wema Bank', 'Zenith Bank',
]

export const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa (Lekki)', 'Ibeju-Lekki', 'Ifako-Ijaye',
  'Ikeja', 'Ikorodu', 'Isale-Eko', 'Kosofe', 'Lagos Island',
  'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu',
  'Surulere', 'Yaba',
]
```

### 15.3 Dates & Times

```
Date format:  14 Feb 2025  OR  Wed, 14 Feb 2025
              NEVER MM/DD/YYYY
Time format:  2:30 PM  ·  9:00 AM   (12-hour with AM/PM, always)
Relative:     "2 min ago"  ·  "3h ago"  ·  "Yesterday"
```

### 15.4 Trust-First Rules

1. **Escrow must be explained at every payment step.** Never assume the user remembers from a previous screen.
2. **NIN and BVN fields require a security tooltip** before the user types — not after.
3. **WhatsApp fallback** must be visible on every critical form flow. Nigerian users trust WhatsApp more than web forms.
4. **SMS is the primary notification channel.** Always confirm with SMS. Push notifications are secondary.
5. **Phone is the login identifier**, not email. Email is always optional.
6. **Auto-read OTP on Android** using `navigator.credentials.get()` — reduces friction significantly.
7. **Low-data states must be handled.** Images lazy-load. Maps do not auto-load on page render.
8. **Error messages in plain English.** No technical jargon. No generic "something went wrong".

---

## 16. ACCESSIBILITY STANDARDS

All screens must pass these checks before code review.

| Check | Standard | How to Verify |
|---|---|---|
| Colour contrast — body text | Min 4.5:1 (WCAG AA) | Figma contrast check / browser DevTools |
| Colour contrast — large text | Min 3:1 | Same |
| Keyboard navigation | All elements reachable via Tab | Test without mouse |
| Focus ring | 2px solid teal, 2px offset, on every interactive element | Never suppress `outline: none` without custom replacement |
| Image alt text | Descriptive for informative; empty `alt=""` for decorative | Check all `<img>` |
| Form labels | `<label>` element for every input — never placeholder-only | — |
| Error messages | Text description + colour — never colour alone | Red text + red border |
| Map alternative | "Switch to list view" always visible before and during map | — |
| Touch targets | Min 48×48px | Browser inspector |
| Body text size | Min 12px anywhere, 14px+ for primary content | — |
| Reduced motion | Animations pause on `prefers-reduced-motion: reduce` | OS accessibility settings |
| Heading hierarchy | H1 → H2 → H3, no skipping | Accessibility tree in DevTools |
| ARIA labels | All icon-only buttons have `aria-label` | Review icon buttons |
| Screen reader | Major flows work without visual | NVDA (Windows) / VoiceOver (Mac) |

---

## 17. TAILWIND CONFIG REFERENCE

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0D2137', light: '#1a3456' },
        nxblue: { DEFAULT: '#2E86AB', light: '#3a9bc4', dark: '#246d8a' },
        teal:   { DEFAULT: '#2A9D8F', light: '#33b8a7', dark: '#1f7a6e' },
        orange: { DEFAULT: '#E76F51', light: '#ec8a70', dark: '#c8522d' },
        amber:  { DEFAULT: '#E9C46A', light: '#f0d080', dark: '#c9a045' },
        lgray:  { DEFAULT: '#F2F4F6', dark: '#E5E8EC' },
        border: { DEFAULT: '#D5D8DC' },
        body:   { DEFAULT: '#1C2833' },
        slate:  { DEFAULT: '#717D7E' },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['Lora', 'Georgia', 'serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        'h1':      ['40px', { lineHeight: '1.25', fontWeight: '600' }],
        'h2':      ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        'h3':      ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        'h4':      ['18px', { lineHeight: '1.25', fontWeight: '600' }],
        'h5':      ['14px', { lineHeight: '1.25', fontWeight: '600' }],
        'p1':      ['16px', { lineHeight: '1.50', fontWeight: '400' }],
        'p2':      ['14px', { lineHeight: '1.50', fontWeight: '400' }],
        'p3':      ['12px', { lineHeight: '1.50', fontWeight: '400' }],
        'label':   ['14px', { lineHeight: '1.25', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.25', fontWeight: '400' }],
      },
      boxShadow: {
        'card':       '0 2px 8px rgba(13,33,55,0.08)',
        'card-hover': '0 6px 24px rgba(13,33,55,0.14)',
        'modal':      '0 20px 60px rgba(13,33,55,0.25)',
        'nav':        '0 2px 12px rgba(13,33,55,0.10)',
      },
      borderRadius: {
        'btn':   '8px',
        'card':  '12px',
        'modal': '16px',
      },
      spacing: {
        'sidebar':        '240px',
        'admin-sidebar':  '220px',
        'filter-sidebar': '280px',
      },
      screens: {
        'mobile':  '375px',
        'tablet':  '768px',
        'desktop': '1280px',
        'wide':    '1440px',
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

---

## 18. DO / DON'T RULES

### ✅ DO

- Use `font-display` (Sora) for all headings, navigation labels, and button text
- Use `font-body` (Lora) for artisan bios, review text, multi-sentence descriptions
- Use `font-mono` (IBM Plex Mono) for all labels, captions, prices, stats, timestamps, data values, phone numbers, booking references
- Use the `formatNaira()` utility for every ₦ value — never format inline
- Use `₦` symbol for every Naira amount — never NGN, never $
- Show escrow explanation on every screen that involves payment
- Show a WhatsApp fallback link on every critical form flow
- Use `animate-pulse` skeleton loaders that match the exact shape of real content
- Use `shadow-card` on all card components and `shadow-card-hover` on hover
- Use `rounded-full` on all badges and status pills
- Use `text-orange` / `bg-orange` only for primary CTA buttons
- Use `text-teal` / `bg-teal` for all success states and availability
- Use `transition-all duration-200` on all interactive elements
- Show loading states with "Processing..." text in buttons — never hide text
- Show real representative data in all design mocks — never lorem ipsum
- Use `aria-label` on all icon-only buttons
- Wrap all animations in `prefers-reduced-motion: reduce` check
- Use `dominant-baseline="central"` on all SVG text elements
- Auto-attempt OTP read on Android via `navigator.credentials.get()`
- Lazy-load all artisan photos and never auto-load maps on page render
- Show exact ₦ amounts in full — never abbreviate to "₦12.5k"

### ❌ DON'T

- Never use orange for anything other than the single primary CTA
- Never write arbitrary spacing values (`mt-[13px]`, `p-[7px]`)
- Never use `outline: none` without a custom focus ring replacement
- Never use `Lora` for headings or navigation — that's Sora's job
- Never use `Sora` for body text paragraphs — that's Lora's job
- Never use any font other than IBM Plex Mono for prices, labels, and data
- Never use `$` or `NGN` or `£` for Nigerian prices
- Never abbreviate Naira amounts ("₦12.5k") — always write in full
- Never use `#000000` pure black for body text — use `#1C2833`
- Never use `#FFFFFF` as a text colour — only as a background
- Never show a full-page spinner for list content — use skeleton loaders
- Never trigger a toast for trivial synchronous UI interactions
- Never omit the escrow badge from any payment-adjacent screen
- Never show raw BVN digits after entry — always mask
- Never say "something went wrong" — always give a specific error
- Never use bare "No data found" for empty states — always provide context + CTA
- Never use a border-radius on single-sided border accents (border-l, border-t)
- Never auto-load Google Maps on page render — load on user click
- Never show personal contact information (phone/email) outside of masked formats in tracking screens
- Never let a map screen exist without a visible "Switch to list view" option
- Never use button text in ALL CAPS or Title Case — always sentence case
- Never reuse the same empty state illustration/message for different contexts
- Never disable scroll on mobile while a dropdown is open (unless it's a modal)
- Never place `bg-card` directly on `bg-card` — always use a layer difference

---

*NEXPLUMB — Frontend Style Guide · Version 1.0 · Confidential*
*This document is the single source of truth for all visual implementation decisions.*
*All questions → product@nexplumb.com · Updates → Nexplumb Engineering Notion*
