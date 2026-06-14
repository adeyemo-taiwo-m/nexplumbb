# NEXPLUMB — Homepage Sections Amendment Guide
**Supplement to Frontend Implementation Guide v1.0 · Confidential**

> This document covers ONLY the homepage sections that are being amended. It does not touch the Hero, Trust Bar (metrics), or "Top-Rated Artisans Near You" sections — those remain exactly as specified in the main implementation guide. Read this alongside that document.

---

## WHAT IS CHANGING AND WHY

### What stays (unchanged)
- **Hero section** — search bar, category chips, location, illustration
- **Trust bar** — 1,200+ verified, Escrow, 4.8/5 rating
- **How It Works** — 3-step process (keep this, it earns its place before payment sections)
- **Top-Rated Artisans Near You** — 4 cards + "See all artisans" button

### What is being removed
- ❌ All per-category SEO sections ("Plumbers in Lagos", "Electricians in Lagos", etc.)
  - **Why:** Repeating the same artisan card layout 5 times makes the page feel like a directory. It buries conversion-critical content and makes the product look shallow. Users who reach the 3rd category section are not converting — they're confused about what else the page has to offer.

### What replaces it (in order)
1. **How We Handle Your Money** (Escrow explainer)
2. **What Can We Help You With?** (Consolidated trades + pricing)
3. **Why Customers Trust Nexplumb** (Trust stack / safety deep dive)
4. **Real Stories From Lagos** (Social proof / reviews)
5. **Are You a Tradesperson?** (Artisan recruitment CTA)
6. **Browse All Trades** (Single clean entry point replacing 5 category sections)

---

## NEW HOMEPAGE SECTION ORDER (FULL)

```
1. Hero                              [UNCHANGED]
2. Trust Bar (metrics)               [UNCHANGED]
3. How It Works                      [UNCHANGED]
4. Top-Rated Artisans Near You       [UNCHANGED]
─────────────────────────────────────────────────
5. How We Handle Your Money          [NEW]
6. What Can We Help You With?        [NEW — replaces all category sections]
7. Why Customers Trust Nexplumb      [NEW]
8. Real Stories From Lagos           [NEW — was brief, now fuller]
9. Are You a Tradesperson?           [NEW]
10. Browse All Trades                [NEW — single clean CTA grid]
11. Footer                           [UNCHANGED]
```

---

## SECTION 5 — HOW WE HANDLE YOUR MONEY

**File location:** `components/homepage/EscrowExplainer.tsx`

**Why this section exists:** Escrow is Nexplumb's biggest differentiator and the biggest customer trust blocker. Many first-time Nigerian users have lost money to artisans who took payment and disappeared. This section converts skeptics before they reach the booking flow. It belongs here — after artisan cards create desire, before anything else.

### Layout

```
bg-navy  ·  py-20  ·  full-width

Max-width container: max-w-content mx-auto px-10

Title (centred):
  "Your money is safe. Always."
  h2 text-white font-bold text-[32px]

Subtitle (centred, below title):
  "We built Nexplumb around one promise: you never pay for a job
   that wasn't done. Here's exactly how it works."
  text-white/70 text-[16px] max-w-[540px] mx-auto mt-3 text-center

──────────────────────────────────────────────
FLOW DIAGRAM (horizontal, desktop / vertical mobile):

4 steps connected by animated dashed arrow lines

[Step 1] ──────► [Step 2] ──────► [Step 3] ──────► [Step 4]
  You              Nexplumb          Artisan           You
  pay              holds it          does the          confirm &
                                     job               release

Each step is a card:
  bg-white/10  border border-white/20  rounded-card
  p-5  text-white  text-center  w-[220px]

  Top: step number pill (bg-orange text-white rounded-full
       w-8 h-8 flex items-center justify-center text-[13px] font-bold)
  Icon: 40px, teal, mt-3
  Step label: font-bold text-[15px] mt-3
  Sub-label: text-white/60 text-caption mt-1

const escrowSteps = [
  {
    number: 1,
    icon: CreditCard,
    label: "You pay",
    sub: "Card, transfer, or USSD",
  },
  {
    number: 2,
    icon: ShieldCheck,
    label: "We hold it safely",
    sub: "In a CBN-regulated escrow account",
  },
  {
    number: 3,
    icon: Wrench,
    label: "Artisan does the job",
    sub: "You track them live on a map",
  },
  {
    number: 4,
    icon: CheckCircle,
    label: "You confirm & release",
    sub: "Or get a full refund if anything goes wrong",
  },
]

──────────────────────────────────────────────
GUARANTEE STRIP (below flow diagram):

3 guarantee pills in a row (mobile: stacked)
Each pill: bg-white/10 rounded-full px-5 py-3 flex items-center gap-2

const guarantees = [
  { icon: RefreshCcw, text: "Full refund if artisan no-shows" },
  { icon: Clock,      text: "Auto-release in 24h if you forget" },
  { icon: HeadphonesIcon, text: "48-hour dispute resolution" },
]

Text: text-white text-[13px] font-medium
Icon: 16px, teal
```

### Animations
```
// Flow diagram arrows: CSS dashed line animation
// Each arrow: stroke-dasharray + stroke-dashoffset animation
// Duration: 2s loop, offset so each arrow animates in sequence
// Respect prefers-reduced-motion: pause all animations
// Entry: each step card fades up with staggered delay on scroll-into-view
//        (use IntersectionObserver, no heavy animation library)
```

### Mobile (375px)
```
// Flow diagram: stacks vertically
// Arrows become vertical (rotate 90deg) between cards
// Each card: full-width
// Guarantee pills: flex-col, full-width
```

---

## SECTION 6 — WHAT CAN WE HELP YOU WITH?

**File location:** `components/homepage/ServicesCatalogue.tsx`

**Why this section exists:** Replaces the 5 separate category sections. Instead of showing artisan cards repeatedly, this section shows trades + real starting prices. It answers "how much will this cost?" — the most common pre-booking question — while being a single clean section, not five. The pricing data builds trust (transparency) and drives click-through to search.

### Layout

```
bg-lgray  ·  py-20  ·  full-width

Header row (flex justify-between items-end mb-10):
  LEFT:
    Eyebrow: "OUR SERVICES" — text-caption text-teal font-bold tracking-widest
    Title: "What can we help you with?"
             h2 text-navy font-bold text-[30px] mt-2
  RIGHT:
    "Browse all services →" link → /search
    text-nxblue text-[14px] font-medium hover:underline

──────────────────────────────────────────────
TRADE CATEGORIES GRID:

Desktop: 2-column grid, gap-12
Each column = one trade category

const tradeCategories = [
  {
    id: 'plumbing',
    title: 'Verified Plumbers',
    description: 'From emergency leaks to full bathroom installations. All work comes with a 30-day Nexplumb guarantee.',
    features: [
      'Pipe Repair & Installation',
      'Water Heater Maintenance',
      'Sewage & Drainage Clearing',
    ],
    ctaText: 'Find a plumber near you',
    ctaLink: '/search?category=plumbing',
    services: [
      { label: 'Emergency Repair', price: 5000,  artisanPhoto: '/assets/artisans/plumber-1.jpg' },
      { label: 'Installation',     price: 12000, artisanPhoto: '/assets/artisans/plumber-2.jpg' },
      { label: 'Leak Detection',   price: 3500,  artisanPhoto: '/assets/artisans/plumber-3.jpg' },
      { label: 'Sewer Cleaning',   price: 8000,  artisanPhoto: '/assets/artisans/plumber-4.jpg' },
    ],
  },
  {
    id: 'electrical',
    title: 'Certified Electricians',
    description: 'Fully certified for complex wiring, solar installations, and generator maintenance.',
    features: [
      'Residential Wiring',
      'Generator Servicing',
      'Solar & Inverter Setup',
    ],
    ctaText: 'Book an electrician',
    ctaLink: '/search?category=electrical',
    services: [
      { label: 'Fault Finding',    price: 4000,  artisanPhoto: '/assets/artisans/elec-1.jpg'   },
      { label: 'Solar Install',    price: null,  customPrice: 'Custom quote', artisanPhoto: '/assets/artisans/elec-2.jpg' },
      { label: 'Inverter Repair',  price: 10000, artisanPhoto: '/assets/artisans/elec-3.jpg'   },
      { label: 'Socket/Light Fix', price: 2000,  artisanPhoto: '/assets/artisans/elec-4.jpg'   },
    ],
  },
  {
    id: 'carpentry',
    title: 'Skilled Carpenters',
    description: 'Custom furniture, door repairs, and full interior joinery. Precise, on-time work.',
    features: [
      'Door & Window Frames',
      'Custom Furniture',
      'Ceiling & Partition',
    ],
    ctaText: 'Find a carpenter',
    ctaLink: '/search?category=carpentry',
    services: [
      { label: 'Door Repair',       price: 3000,  artisanPhoto: '/assets/artisans/carp-1.jpg' },
      { label: 'Custom Wardrobe',   price: 45000, artisanPhoto: '/assets/artisans/carp-2.jpg' },
      { label: 'POP Ceiling',       price: 15000, artisanPhoto: '/assets/artisans/carp-3.jpg' },
      { label: 'Furniture Fix',     price: 2500,  artisanPhoto: '/assets/artisans/carp-4.jpg' },
    ],
  },
  {
    id: 'painting',
    title: 'Professional Painters',
    description: 'Interior and exterior painting, wall prep, and textured finishes. Neat, dust-free work.',
    features: [
      'Interior & Exterior',
      'Wall Preparation',
      'Textured Finishes',
    ],
    ctaText: 'Get a painter',
    ctaLink: '/search?category=painting',
    services: [
      { label: '1 Room (Interior)', price: 8000,  artisanPhoto: '/assets/artisans/paint-1.jpg' },
      { label: 'Full Apartment',    price: 35000, artisanPhoto: '/assets/artisans/paint-2.jpg' },
      { label: 'Exterior Wall',     price: 25000, artisanPhoto: '/assets/artisans/paint-3.jpg' },
      { label: 'Touch-Up',          price: 3000,  artisanPhoto: '/assets/artisans/paint-4.jpg' },
    ],
  },
]
```

### Trade Category Block Layout
```tsx
// Each trade category renders as a 2-column block:
// LEFT (45%): text content
// RIGHT (55%): 2×2 service card grid

// LEFT side:
//   Title: h3 text-navy font-bold text-[22px]
//   Description: text-body text-slate mt-2 max-w-[340px]
//   Feature list: mt-4, each item: flex items-center gap-2
//     CheckCircle icon (16px, teal) + label text-body text-navy
//   CTA link: mt-6 text-orange font-medium text-[14px]
//             hover:underline flex items-center gap-1
//             "Find a plumber near you →"

// RIGHT side:
//   2×2 grid, gap-3

// SERVICE CARD:
//   bg-white rounded-card border border-border p-4
//   flex items-center gap-3
//   hover:border-teal hover:shadow-card transition-all cursor-pointer
//   → onClick: /search?category=[trade]&service=[label]

//   Artisan photo:
//     w-12 h-12 rounded-full object-cover flex-shrink-0
//     (representative artisan for that service type)

//   Content:
//     Service label: text-[14px] font-bold text-navy
//     Price: "From ₦5,000" text-caption text-slate mt-0.5
//            If customPrice: render that string instead (e.g. "Custom quote")
//            font: font-mono for price values (makes numbers feel precise)

// Separator between category blocks:
//   <hr className="border-border my-16" />
//   Only between blocks, not after the last one
```

### Pricing Display Rules
```typescript
// ALWAYS use ₦ symbol — never NGN, never $
// Format: formatNaira(5000) → "₦5,000"
// Display: "From ₦5,000" — "From" in regular weight, amount in font-mono
// Custom quote services: show "Custom quote" in italic text-slate
//                        (not a price, so no ₦ prefix)
// Never show "₦0" — if no price, use "Custom quote"
// Price data sourced from: GET /api/services/pricing
//   Fallback: static values as shown in the const above
//   Update frequency: quarterly from platform transaction data
```

### Mobile (375px)
```
// Each trade category block: stack LEFT then RIGHT
// Service card grid: stays 2×2 (cards are small enough)
// CTA link: full-width orange button instead of text link
//           (text links are hard to tap on mobile)
// Category blocks separated by border-t border-border, pt-12
```

### Tablet (768px)
```
// Trade categories: single column (1 block at a time, full-width)
// Service grid: 2×2 stays
// LEFT content and RIGHT grid: stack (left on top, grid below)
```

---

## SECTION 7 — WHY CUSTOMERS TRUST NEXPLUMB

**File location:** `components/homepage/TrustStack.tsx`

**Why this section exists:** The trust bar (Section 2) shows numbers. This section shows *how* — the actual mechanisms. Customers in Nigeria have heard promises before. Showing the verification stack visually is more convincing than claiming it. This is where NIN, GPS, guarantors, and photos get their moment.

### Layout

```
bg-white  ·  py-20  ·  full-width

Header (centred):
  Eyebrow: "BUILT FOR TRUST" — text-caption text-teal font-bold tracking-widest
  Title: "Every job is verified, tracked, and protected"
          h2 text-navy font-bold text-[30px] mt-2 max-w-[500px] mx-auto text-center

──────────────────────────────────────────────
TRUST PILLARS GRID:

Desktop: 3-column grid, gap-6, mt-14
Tablet:  2-column grid
Mobile:  1-column

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
    badgeBg: 'bg-amber/15 text-amber-dark',
  },
]
```

### Pillar Card Design
```tsx
// Each pillar card:
// bg-lgray rounded-card p-6 border border-border
// hover:border-teal hover:shadow-card transition-all duration-200

// Icon container:
//   w-12 h-12 rounded-xl flex items-center justify-center
//   [iconBg from data]
//   Icon: 24px [iconColor from data]

// Title: h3 text-navy font-bold text-[16px] mt-4

// Description: text-body text-slate text-[14px] mt-2 leading-relaxed

// Badge (bottom of card):
//   mt-4 pt-4 border-t border-border
//   inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold
//   [badgeBg from data]
//   ShieldCheck icon (12px) + badge text
```

---

## SECTION 8 — REAL STORIES FROM LAGOS

**File location:** `components/homepage/SocialProof.tsx`

**Why this section exists:** Replaced the brief 3-card review section with something that has more emotional weight. Nigerian customers respond to stories they recognise — same neighbourhoods, same problems they've had. Reviews must feel local and specific, not generic.

### Layout

```
bg-lgray  ·  py-20  ·  full-width

Header (centred):
  Eyebrow: "CUSTOMER STORIES" — text-caption text-teal font-bold tracking-widest
  Title: "Real experiences from real Lagos residents"
          h2 text-navy font-bold text-[30px] mt-2

──────────────────────────────────────────────
FEATURED QUOTE (full-width, prominent):

Large pull-quote above the review cards.
bg-navy rounded-card p-10 mx-auto max-w-[760px] mt-12

  Large open-quote SVG: " (text-orange, 64px, absolute top-left of card)
  
  Quote text:
    "I paid a plumber from the roadside ₦8,000 to fix my bathroom pipe.
     He collected the money and made it worse. On Nexplumb, I paid ₦6,500,
     watched the plumber arrive on the map, and he fixed it in 45 minutes.
     That was six months ago. I haven't called a stranger from the street since."
    text-white text-[18px] leading-relaxed font-medium italic
    
  Attribution row (mt-6 flex items-center gap-3):
    Avatar: w-10 h-10 rounded-full (real photo)
    Name: "Chidinma O." font-bold text-white text-[14px]
    Location: "· Surulere, Lagos" text-white/60 text-[14px]
    Stars: 5 gold stars (right side, ml-auto)

──────────────────────────────────────────────
REVIEW CARDS ROW:

3 cards, desktop: 3-col grid, tablet: 2-col, mobile: 1-col
mt-8, gap-6

const reviews = [
  {
    avatar: '/assets/avatars/review-1.jpg',
    name: 'Emeka T.',
    area: 'Yaba, Lagos',
    trade: 'Plumbing',
    rating: 5,
    text:
      'My sink had been leaking for 3 weeks. Booked a plumber at 9am, he arrived by 10:30 and was done by noon. The before and after photos he took proved everything. Will use again.',
    artisanName: 'Chukwuemeka A.',
    jobLabel: 'Sink repair',
    amount: 7500,
  },
  {
    avatar: '/assets/avatars/review-2.jpg',
    name: 'Folake B.',
    area: 'Ikeja, Lagos',
    trade: 'Electrical',
    rating: 5,
    text:
      'Our whole flat lost power after a storm. The electrician came within 2 hours, traced the fault, and fixed it. Paying through escrow meant I wasn\'t nervous handing over money.',
    artisanName: 'Sunday E.',
    jobLabel: 'Electrical fault',
    amount: 15000,
  },
  {
    avatar: '/assets/avatars/review-3.jpg',
    name: 'Kemi A.',
    area: 'Lekki Phase 1',
    trade: 'Carpentry',
    rating: 4,
    text:
      'I needed my front door rehung properly — it had been sticking for months. The carpenter arrived on time, did a clean job, and charged exactly what the estimate said. No surprises.',
    artisanName: 'Bola A.',
    jobLabel: 'Door repair',
    amount: 8000,
  },
]
```

### Review Card Design
```tsx
// Each review card:
// bg-white rounded-card p-6 shadow-card border border-border

// TOP ROW (flex justify-between items-start):
//   LEFT: Avatar (w-10 h-10 rounded-full) + Name + Area (stacked, ml-3)
//   RIGHT: Star rating (gold stars, text-caption)

// Trade badge:
//   mt-3 inline-block bg-lgray rounded-full px-3 py-1 text-caption text-slate

// Review text:
//   mt-3 text-[14px] text-body leading-relaxed

// BOTTOM ROW (mt-4 pt-4 border-t border-border flex justify-between):
//   LEFT: Artisan name label
//     "Serviced by" text-caption text-slate + artisanName font-bold text-navy
//   RIGHT: Job amount
//     jobLabel text-caption text-slate + formatNaira(amount) font-bold text-teal

// Platform note (below all cards, centred):
// "All reviews are from verified completed bookings on Nexplumb."
// text-caption text-slate text-center mt-8
// Small lock icon (12px) inline before text
```

---

## SECTION 9 — ARE YOU A TRADESPERSON?

**File location:** `components/homepage/ArtisanCTA.tsx`

**Why this section exists:** The homepage is currently 100% customer-facing. But artisan supply is a critical business metric. This section recruits supply without forcing artisans to find a separate page. It sits here because customers who see it are not offended by it — if anything, it adds credibility ("real artisans are signing up").

### Layout

```
bg-navy  ·  py-20  ·  full-width

Max-width container: max-w-content mx-auto px-10

Desktop: 2-column split (left 55% / right 45%)
Mobile: stack (text first, then stats)

──────────────────────────────────────────────
LEFT COLUMN:

  Eyebrow: "FOR ARTISANS" — text-caption text-orange font-bold tracking-widest

  Title: "Earn more. Get paid instantly."
          text-white font-bold text-[34px] leading-tight mt-2

  Subtitle:
    "Join 2,400+ verified plumbers, electricians, and tradespeople
     already earning more on Nexplumb. No more chasing payment.
     No more slow months."
    text-white/70 text-[16px] mt-4 max-w-[420px] leading-relaxed

  Benefits list (mt-6, flex flex-col gap-3):
  
  const artisanBenefits = [
    { icon: Zap,         text: 'Get paid the moment a job is confirmed complete' },
    { icon: TrendingUp,  text: 'Build a verified profile that wins new customers' },
    { icon: Shield,      text: 'We protect you from customers who refuse to pay' },
    { icon: Smartphone,  text: 'Manage all your jobs from one simple app' },
  ]
  
  Each benefit: flex items-center gap-3
    Icon container: w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center
    Icon: 16px text-teal
    Text: text-white text-[14px]

  CTA buttons row (mt-8 flex gap-3):
    Primary: "Join as an artisan" bg-orange text-white h-12 px-6 rounded-btn font-bold
             → /join-as-artisan
    Secondary: "Learn more" border border-white/30 text-white h-12 px-6 rounded-btn
               hover:bg-white/10
               → /for-artisans (informational page)

──────────────────────────────────────────────
RIGHT COLUMN:

  4 stat cards in 2×2 grid, gap-4

  const artisanStats = [
    { value: '₦45,000',  label: 'Average monthly earnings',   sub: 'for active artisans'    },
    { value: '< 24h',    label: 'Profile approval time',      sub: 'after NIN verification' },
    { value: '2,400+',   label: 'Artisans already on platform', sub: 'across Lagos'         },
    { value: 'Instant',  label: 'Payment after job complete', sub: 'via bank transfer'       },
  ]

  Each stat card:
    bg-white/10 border border-white/20 rounded-card p-5 text-white text-center
    hover:bg-white/15 transition-colors

    Value: text-[26px] font-bold text-teal (or text-white for non-₦ values)
    Label: text-[13px] text-white mt-1
    Sub:   text-[11px] text-white/50 mt-0.5

  Note: "₦45,000" should use text-teal to visually separate income data from labels
  Note: "Instant" uses text-white (not teal) since it's not a numeric value
```

### Mobile (375px)
```
// Stack: LEFT text content → RIGHT stats grid
// Stats grid: stays 2×2
// CTA buttons: flex-col (stacked), each full-width
```

---

## SECTION 10 — BROWSE ALL TRADES

**File location:** `components/homepage/TradesBrowser.tsx`

**Why this section exists:** A clean, single entry point that replaces 5 category sections. Instead of showing artisan cards per category, it shows trade icons in a grid. Users pick their trade and land on a filtered search results page. Elegant, not repetitive.

### Layout

```
bg-white  ·  py-16  ·  full-width

Header (flex justify-between items-end mb-10):
  LEFT:
    Title: "Browse by trade"
            h2 text-navy font-bold text-[28px]
    Subtitle: "Find the right specialist for your job"
               text-slate text-[14px] mt-1
  RIGHT:
    "Search all artisans →" → /search
    text-nxblue text-[14px] hover:underline

──────────────────────────────────────────────
TRADES GRID:

Desktop: 5-column flex row (all trades in one row)
Tablet:  3-column grid
Mobile:  2-column grid (2×3, 6 total)

const allTrades = [
  {
    id: 'plumbing',
    label: 'Plumbing',
    icon: '/icons/trade-plumbing.svg',   // pipe wrench icon
    count: 420,                          // artisans on platform
    link: '/search?category=plumbing',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    icon: '/icons/trade-electrical.svg',  // lightning bolt
    count: 318,
    link: '/search?category=electrical',
  },
  {
    id: 'carpentry',
    label: 'Carpentry',
    icon: '/icons/trade-carpentry.svg',   // hammer
    count: 195,
    link: '/search?category=carpentry',
  },
  {
    id: 'painting',
    label: 'Painting',
    icon: '/icons/trade-painting.svg',    // paint roller
    count: 142,
    link: '/search?category=painting',
  },
  {
    id: 'tiling',
    label: 'Tiling',
    icon: '/icons/trade-tiling.svg',      // tiles grid
    count: 87,
    link: '/search?category=tiling',
  },
]
```

### Trade Card Design
```tsx
// Each trade card: <Link href={link}>

// Container:
//   flex flex-col items-center p-6 rounded-card border border-border bg-lgray
//   hover:border-teal hover:bg-teal/5 hover:shadow-card
//   transition-all duration-200 cursor-pointer group

// Icon container:
//   w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center
//   group-hover:shadow-card transition-shadow

//   Icon: 36px, trade-specific colour (see below)

// Trade label:
//   text-navy font-bold text-[14px] mt-4

// Artisan count:
//   text-slate text-[12px] mt-1
//   "[count]+ artisans" — e.g. "420+ artisans"

// Trade icon colours (icons use teal as base but trade-specific fill):
const tradeIconColors = {
  plumbing:   'text-nxblue',
  electrical: 'text-amber-dark',
  carpentry:  'text-orange',
  painting:   'text-teal',
  tiling:     'text-navy',
}

// Count sourced from: GET /api/trades/counts
// Fallback: static values in the const above
// Revalidate: every 24h (Next.js ISR or SWR with revalidateOnFocus: false)
```

### Bottom CTA Strip
```tsx
// Below the trades grid, mt-10, text-center

// "Don't see your trade?"
// text-slate text-[14px]

// "Tell us what you need →" text-nxblue ml-1 font-medium hover:underline
// → /search (general search, no category pre-selected)
// This handles edge cases (AC repair, cleaning, etc.) without cluttering the grid
```

---

## COMPLETE COMPONENT FILE STRUCTURE (AMENDED SECTIONS ONLY)

```
components/
└── homepage/
    ├── EscrowExplainer.tsx       # Section 5 — How We Handle Your Money
    ├── ServicesCatalogue.tsx     # Section 6 — What Can We Help You With?
    ├── TrustStack.tsx            # Section 7 — Why Customers Trust Nexplumb
    ├── SocialProof.tsx           # Section 8 — Real Stories From Lagos
    ├── ArtisanCTA.tsx            # Section 9 — Are You a Tradesperson?
    └── TradesBrowser.tsx         # Section 10 — Browse All Trades
```

### Updated `app/(customer)/page.tsx` Section Order
```tsx
// app/(customer)/page.tsx

import Hero              from '@/components/homepage/Hero'              // UNCHANGED
import TrustBar          from '@/components/homepage/TrustBar'          // UNCHANGED
import HowItWorks        from '@/components/homepage/HowItWorks'        // UNCHANGED
import FeaturedArtisans  from '@/components/homepage/FeaturedArtisans'  // UNCHANGED
import EscrowExplainer   from '@/components/homepage/EscrowExplainer'   // NEW
import ServicesCatalogue from '@/components/homepage/ServicesCatalogue' // NEW
import TrustStack        from '@/components/homepage/TrustStack'        // NEW
import SocialProof       from '@/components/homepage/SocialProof'       // NEW
import ArtisanCTA        from '@/components/homepage/ArtisanCTA'        // NEW
import TradesBrowser     from '@/components/homepage/TradesBrowser'     // NEW
import Footer            from '@/components/layout/Footer'              // UNCHANGED

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <HowItWorks />
      <FeaturedArtisans />
      {/* ─── Amended sections begin ─── */}
      <EscrowExplainer />
      <ServicesCatalogue />
      <TrustStack />
      <SocialProof />
      <ArtisanCTA />
      <TradesBrowser />
      {/* ─── Amended sections end ─── */}
      <Footer />
    </main>
  )
}
```

---

## SCREEN STATES FOR ALL NEW SECTIONS

| Section | Loading | Empty | Error |
|---------|---------|-------|-------|
| EscrowExplainer | Static — no API dependency | N/A | N/A |
| ServicesCatalogue | Skeleton: gray blocks matching card shape | N/A — use static fallback prices | Render static fallback prices silently |
| TrustStack | Static — no API dependency | N/A | N/A |
| SocialProof | Skeleton: 3 review card shapes | "Reviews loading..." — never empty | Render static reviews (hardcoded) |
| ArtisanCTA | Static — no API dependency | N/A | Render static artisan count (2,400+) |
| TradesBrowser | Skeleton: 5 trade card shapes | N/A — always has 5 trades | Render static counts |

**Rule:** If any of these sections fail an API call, they must **never crash the page** and must **never show an error state to the customer**. Fall back to static/hardcoded values silently. These sections are marketing content — network failures should be invisible to the user.

---

## SHARED RULES ACROSS ALL NEW SECTIONS

### Visual Rhythm
```
// The 6 new sections alternate between two backgrounds:
// Section 5 (Escrow):       bg-navy       ← dark
// Section 6 (Services):     bg-lgray      ← light
// Section 7 (Trust Stack):  bg-white      ← light
// Section 8 (Social Proof): bg-lgray      ← light
// Section 9 (Artisan CTA):  bg-navy       ← dark
// Section 10 (Trades):      bg-white      ← light

// The two navy sections (5 + 9) add visual weight and natural breaks.
// They also separate the light sections so they don't blur together.
// Never put two bg-navy sections adjacent to each other.
```

### Section Padding
```
// Desktop: py-20 (80px top and bottom) for all sections
// Tablet:  py-16
// Mobile:  py-12
// Never use different top vs bottom padding within a section — keep it symmetric
```

### Eyebrow Labels
```
// Sections 6, 7, 8, 9 use eyebrow labels above the title:
// Style: text-caption text-teal font-bold tracking-widest uppercase
// Keep under 20 characters
// Purpose: gives the section a context anchor before the headline hits
// Never use for Section 5 (Escrow) — it opens with a direct emotional claim
// Never use on the sections carried over from the original spec (Hero, Trust Bar, etc.)
```

### Section Titles
```
// All new section titles: h2, font-bold, text-navy (or text-white on navy bg)
// Font size desktop: text-[28px] to text-[32px] — see each section spec
// Subtitle/subtext: max-w-[540px] to avoid line lengths that are too long to read
// Centred: EscrowExplainer and TrustStack (symmetric sections)
// Left-aligned: ServicesCatalogue, SocialProof, ArtisanCTA, TradesBrowser
```

### Scroll Entry Animations
```typescript
// Apply to: TrustStack pillar cards, ServicesCatalogue service cards, TradesBrowser cards
// DO NOT apply to: EscrowExplainer (too important — render immediately)
// DO NOT apply to: SocialProof reviews (too small to warrant motion)

// Implementation: IntersectionObserver (no Framer Motion — keeps bundle lean)
// Effect: fade up + slight Y translate (translateY(16px) → translateY(0))
// Duration: 300ms ease-out
// Stagger: 80ms between cards in a grid

// Respect prefers-reduced-motion:
// @media (prefers-reduced-motion: reduce) → skip animation, render in place

// Example hook:
function useScrollReveal(ref: RefObject<HTMLElement>, delay = 0) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
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
          }, delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
}
```

---

## WHAT THIS HOMEPAGE NOW COMMUNICATES (IN ORDER)

```
Hero              → "Here's what Nexplumb does. Start searching."
Trust Bar         → "It's big. It's trusted. It's rated well."
How It Works      → "It's this simple."
Featured Artisans → "These are real people near you."
Escrow Explainer  → "Your money is completely safe. Here's exactly how."
Services + Prices → "We cover these trades. Here's what it costs."
Trust Stack       → "Here's every protection mechanism behind every booking."
Social Proof      → "Real Lagosians with real problems — solved."
Artisan CTA       → "Artisans: you belong here too."
Browse Trades     → "Pick your trade and go."
Footer            → "Everything else you need to know."
```

Each section answers the next most important question a skeptical Lagos customer would have after reading the section above it. The page builds trust progressively, not all at once.

---

*NEXPLUMB · Homepage Sections Amendment Guide*
*Supplement to Frontend Implementation Guide v1.0*
*Applies to: `app/(customer)/page.tsx` and all files under `components/homepage/`*
*Sections not listed here are unchanged from the main implementation guide.*
