import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Review {
  id: string
  customerName: string
  customerArea: string
  date: string
  rating: number
  text: string
  reply?: string
}

export interface Artisan {
  id: string
  slug: string
  name: string
  phone: string
  email: string
  trade: string
  rating: number
  reviewCount: number
  jobCount: number
  area: string
  lat: number
  lng: number
  priceMin: number
  priceMax: number
  badges: ('id_verified' | 'certified' | 'guarantor' | 'trade_tested')[]
  isAvailable: boolean
  isOnline: boolean
  bio: string
  skills: string[]
  portfolio: { url: string; caption?: string; tag?: 'Before' | 'After' | 'On-the-job' }[]
  reviews: Review[]
  experience: string
  bankName?: string
  accountNumber?: string
  bvn?: string
  nin?: string
  earningsAvailable: number
  earningsPending: number
  earningsAllTime: number
  isVerified: boolean
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'under_review'
  ninStatus: 'verified' | 'failed' | 'pending'
  bvnStatus: 'verified' | 'failed' | 'pending'
}

export interface Booking {
  id: string
  reference: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  customerAddressDetails?: string
  artisanId: string
  artisanName: string
  artisanTrade: string
  artisanPhoto: string
  jobType: string
  description: string
  photos: string[]
  isUrgent: boolean
  date: string
  timeSlot: string
  status: 'confirmed' | 'en_route' | 'on_site' | 'in_progress' | 'job_complete' | 'completed' | 'disputed' | 'cancelled'
  amount: number
  paymentMethod: 'card' | 'transfer' | 'ussd' | 'wallet'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: string
  updatedAt: string
  beforePhoto?: string
  afterPhoto?: string
  disputeId?: string
  artisanPosition?: { lat: number; lng: number }
  etaMinutes?: number
}

export interface Dispute {
  id: string
  bookingId: string
  bookingReference: string
  customerId: string
  customerName: string
  artisanId: string
  artisanName: string
  amount: number
  status: 'open' | 'under_review' | 'resolved'
  slaDeadline: string // ISO date string
  customerStatement: string
  customerPhotos: string[]
  artisanStatement?: string
  artisanPhotos: string[]
  openedAt: string
  resolvedAt?: string
  resolutionDecision?: 'refund_customer' | 'release_artisan' | 'partial'
  resolutionReason?: string
  resolvedBy?: string
}

export interface Transaction {
  id: string
  date: string
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'refund'
  amount: number
  fee?: number
  bookingReference?: string
  description: string
  status: 'completed' | 'pending' | 'failed'
  userId: string // customer or artisan ID
}

export interface Message {
  id: string
  bookingId: string
  senderId: string
  senderType: 'customer' | 'artisan' | 'system'
  text: string
  timestamp: string
}

interface MockDbState {
  artisans: Artisan[]
  bookings: Booking[]
  disputes: Dispute[]
  transactions: Transaction[]
  messages: Message[]
  customers: { id: string; name: string; phone: string; email?: string; walletBalance: number; joinedAt: string }[]
  
  // Actions
  seedDb: () => void
  addCustomer: (customer: { id: string; name: string; phone: string; email?: string }) => void
  addArtisan: (artisan: Omit<Artisan, 'id' | 'slug' | 'rating' | 'reviewCount' | 'jobCount' | 'earningsAvailable' | 'earningsPending' | 'earningsAllTime' | 'isVerified' | 'verificationStatus' | 'reviews'>) => string
  updateArtisan: (id: string, data: Partial<Artisan>) => void
  addBooking: (booking: Omit<Booking, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'status'>) => string
  updateBookingStatus: (id: string, status: Booking['status']) => void
  submitJobComplete: (id: string, beforePhoto?: string, afterPhoto?: string) => void
  fileDispute: (bookingId: string, customerStatement: string, customerPhotos: string[]) => string
  resolveDispute: (disputeId: string, decision: Dispute['resolutionDecision'], reason: string, refundCustomerAmount: number, releaseArtisanAmount: number) => void
  addMessage: (bookingId: string, senderId: string, senderType: Message['senderType'], text: string) => void
  withdrawArtisanEarnings: (artisanId: string, amount: number) => { success: boolean; message: string }
}

const initialArtisans: Artisan[] = [
  {
    id: 'art_1',
    slug: 'chukwuemeka-okonkwo',
    name: 'Chukwuemeka Okonkwo',
    phone: '08031234567',
    email: 'emeka.plumbing@gmail.com',
    trade: 'Plumbing',
    rating: 4.8,
    reviewCount: 47,
    jobCount: 134,
    area: 'Surulere',
    lat: 6.5022,
    lng: 3.3582,
    priceMin: 8000,
    priceMax: 15000,
    badges: ['id_verified', 'certified', 'guarantor'],
    isAvailable: true,
    isOnline: true,
    bio: 'Licensed professional plumber with over 8 years of experience. Specializing in leak detection, drain cleaning, and complete bathroom installations in mainland Lagos. Fast service, neat job, and escrow friendly!',
    skills: ['Leak Detection', 'Pipe Repair', 'Drain Cleaning', 'Shower Installation', 'Water Heater Repair'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop', caption: 'Fixing copper pipes under kitchen sink', tag: 'On-the-job' },
      { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop', caption: 'Newly tiled bathroom plumbing layout', tag: 'After' },
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop', caption: 'Replacing burst water tank main valve', tag: 'On-the-job' }
    ],
    experience: '5-10 years',
    bankName: 'Access Bank',
    accountNumber: '0123456789',
    bvn: '222******89',
    nin: '12345678901',
    earningsAvailable: 28500,
    earningsPending: 15000,
    earningsAllTime: 420000,
    isVerified: true,
    verificationStatus: 'verified',
    ninStatus: 'verified',
    bvnStatus: 'verified',
    reviews: [
      {
        id: 'rev_1',
        customerName: 'Chisom A.',
        customerArea: 'Surulere',
        date: '2026-06-10T14:30:00Z',
        rating: 5,
        text: 'Emeka did an excellent job fixing my kitchen pipes. He arrived on time and was very neat. Recommend him to anyone!',
        reply: 'Thank you Chisom. It was a pleasure working for you.'
      },
      {
        id: 'rev_2',
        customerName: 'Kunle O.',
        customerArea: 'Yaba',
        date: '2026-06-08T09:15:00Z',
        rating: 4,
        text: 'Very professional, resolved the leak within 1 hour. Price was reasonable.'
      }
    ]
  },
  {
    id: 'art_2',
    slug: 'babatunde-folorunsho',
    name: 'Babatunde Folorunsho',
    phone: '08098765432',
    email: 'tunde_electrics@yahoo.com',
    trade: 'Electrical',
    rating: 4.9,
    reviewCount: 32,
    jobCount: 98,
    area: 'Yaba',
    lat: 6.5172,
    lng: 3.3752,
    priceMin: 6000,
    priceMax: 12000,
    badges: ['id_verified', 'guarantor', 'trade_tested'],
    isAvailable: true,
    isOnline: true,
    bio: 'Expert electrician in Yaba. Specializing in domestic wiring, generator transfer switches, and repairing burnt sockets. NIN-verified and guaranteed work.',
    skills: ['House Wiring', 'Generator Connections', 'Inverter Installation', 'DB Board Repair', 'Socket Repair'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=500&auto=format&fit=crop', caption: 'Wiring distribution box neat work', tag: 'After' },
      { url: 'https://images.unsplash.com/photo-145882650111-993a426fbf0a?w=500&auto=format&fit=crop', caption: 'Generator changeover installation', tag: 'On-the-job' }
    ],
    experience: '3-5 years',
    bankName: 'GT Bank',
    accountNumber: '0234567890',
    bvn: '223******12',
    nin: '98765432109',
    earningsAvailable: 12000,
    earningsPending: 0,
    earningsAllTime: 230000,
    isVerified: true,
    verificationStatus: 'verified',
    ninStatus: 'verified',
    bvnStatus: 'verified',
    reviews: [
      {
        id: 'rev_3',
        customerName: 'Nkechi E.',
        customerArea: 'Ebute Metta',
        date: '2026-06-05T16:45:00Z',
        rating: 5,
        text: 'Tunde helped rewire my shop panel. Very experienced and polite.'
      }
    ]
  },
  {
    id: 'art_3',
    slug: 'nura-mohammed',
    name: 'Nura Mohammed',
    phone: '07034567890',
    email: 'nura.carpentry@gmail.com',
    trade: 'Carpentry',
    rating: 4.6,
    reviewCount: 19,
    jobCount: 54,
    area: 'Ikeja',
    lat: 6.5967,
    lng: 3.3400,
    priceMin: 10000,
    priceMax: 25000,
    badges: ['id_verified', 'certified'],
    isAvailable: true,
    isOnline: false,
    bio: 'Bespoke carpenter and woodworker. Wardrobes, doors, kitchen cabinets, and furniture repairs. Based in Ikeja but serving surrounding mainland areas.',
    skills: ['Cabinet Making', 'Door Hanging', 'Furniture Repair', 'Roof Trusses', 'Wood Sanding'],
    portfolio: [
      { url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop', caption: 'Custom kitchen cabinet doors installed', tag: 'After' }
    ],
    experience: '5-10 years',
    bankName: 'Zenith Bank',
    accountNumber: '0987654321',
    bvn: '221******45',
    nin: '34567890123',
    earningsAvailable: 0,
    earningsPending: 0,
    earningsAllTime: 180000,
    isVerified: true,
    verificationStatus: 'verified',
    ninStatus: 'verified',
    bvnStatus: 'verified',
    reviews: []
  },
  {
    id: 'art_4',
    slug: 'femi-badmus',
    name: 'Femi Badmus',
    phone: '08123456789',
    email: 'femi.painter@gmail.com',
    trade: 'Painting',
    rating: 4.7,
    reviewCount: 15,
    jobCount: 42,
    area: 'Lekki',
    lat: 6.4281,
    lng: 3.4219,
    priceMin: 15000,
    priceMax: 35000,
    badges: ['id_verified', 'guarantor'],
    isAvailable: true,
    isOnline: true,
    bio: 'Professional house painter specializing in interior, exterior, wallpaper, and decorative finishes. Standard and complex designs in Lekki, Victoria Island, and Ajah.',
    skills: ['Wall Painting', 'Screeding', 'Wallpaper Installation', 'Exterior Painting'],
    portfolio: [],
    experience: '1-3 years',
    bankName: 'UBA',
    accountNumber: '1023456789',
    bvn: '224******56',
    nin: '45678901234',
    earningsAvailable: 5000,
    earningsPending: 0,
    earningsAllTime: 120000,
    isVerified: true,
    verificationStatus: 'verified',
    ninStatus: 'verified',
    bvnStatus: 'verified',
    reviews: []
  }
]

export const useMockDb = create<MockDbState>()(
  persist(
    (set, get) => ({
      artisans: [],
      bookings: [],
      disputes: [],
      transactions: [],
      messages: [],
      customers: [
        { id: 'cust_1', name: 'Chisom Alabi', phone: '08080908908', email: 'chisom.alabi@gmail.com', walletBalance: 20000, joinedAt: '2026-01-15T08:00:00Z' }
      ],

      seedDb: () => {
        const currentArtisans = get().artisans
        if (currentArtisans.length === 0) {
          set({
            artisans: initialArtisans,
            bookings: [
              {
                id: 'bk_1',
                reference: 'NX-2026-00847',
                customerId: 'cust_1',
                customerName: 'Chisom Alabi',
                customerPhone: '08080908908',
                customerAddress: '15, Bode Thomas Street, Surulere',
                customerAddressDetails: 'Apt 2B, First Floor',
                artisanId: 'art_1',
                artisanName: 'Chukwuemeka Okonkwo',
                artisanTrade: 'Plumbing',
                artisanPhoto: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=100&auto=format&fit=crop',
                jobType: 'Pipe repair',
                description: 'Burst kitchen pipe behind the cabinet. Water is leaking rapidly and the cabinet is starting to rot.',
                photos: [],
                isUrgent: true,
                date: '2026-06-13',
                timeSlot: '10:00 AM',
                status: 'completed',
                amount: 13500,
                paymentMethod: 'card',
                paymentStatus: 'paid',
                createdAt: '2026-06-13T08:00:00Z',
                updatedAt: '2026-06-13T12:00:00Z',
                beforePhoto: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300',
                afterPhoto: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300'
              }
            ],
            disputes: [],
            transactions: [
              {
                id: 'tx_1',
                date: '2026-06-13T08:02:00Z',
                type: 'escrow_hold',
                amount: 13500,
                bookingReference: 'NX-2026-00847',
                description: 'Escrow payment hold for Pipe repair',
                status: 'completed',
                userId: 'cust_1'
              },
              {
                id: 'tx_2',
                date: '2026-06-13T12:05:00Z',
                type: 'escrow_release',
                amount: 11880, // Net: 13500 - 12% commission (1620)
                bookingReference: 'NX-2026-00847',
                description: 'Escrow release for Pipe repair',
                status: 'completed',
                userId: 'art_1'
              }
            ],
            messages: []
          })
        }
      },

      addCustomer: (customer) => {
        const id = `cust_${Date.now()}`
        set((state) => ({
          customers: [
            ...state.customers,
            { ...customer, id, walletBalance: 0, joinedAt: new Date().toISOString() }
          ]
        }))
      },

      addArtisan: (artisanData) => {
        const id = `art_${Date.now()}`
        const slug = artisanData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const newArtisan: Artisan = {
          ...artisanData,
          id,
          slug,
          rating: 5.0,
          reviewCount: 0,
          jobCount: 0,
          earningsAvailable: 0,
          earningsPending: 0,
          earningsAllTime: 0,
          isVerified: false,
          verificationStatus: 'under_review',
          ninStatus: 'pending',
          bvnStatus: 'pending',
          reviews: []
        }
        set((state) => ({
          artisans: [...state.artisans, newArtisan]
        }))
        return slug
      },

      updateArtisan: (id, data) => {
        set((state) => ({
          artisans: state.artisans.map((art) =>
            art.id === id ? { ...art, ...data } : art
          )
        }))
      },

      addBooking: (bookingData) => {
        const id = `bk_${Date.now()}`
        const refNum = Math.floor(10000 + Math.random() * 90000)
        const reference = `NX-2026-${refNum}`
        const newBooking: Booking = {
          ...bookingData,
          id,
          reference,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          etaMinutes: bookingData.isUrgent ? 15 : undefined,
          artisanPosition: bookingData.isUrgent
            ? { lat: 6.5022 + (Math.random() - 0.5) * 0.05, lng: 3.3582 + (Math.random() - 0.5) * 0.05 }
            : undefined
        }

        // Add Transaction
        const newTransaction: Transaction = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'escrow_hold',
          amount: bookingData.amount,
          bookingReference: reference,
          description: `Escrow hold for ${bookingData.jobType}`,
          status: 'completed',
          userId: bookingData.customerId
        }

        set((state) => ({
          bookings: [...state.bookings, newBooking],
          transactions: [...state.transactions, newTransaction],
          // Deduct from wallet if paid by wallet
          customers: state.customers.map((c) =>
            c.id === bookingData.customerId && bookingData.paymentMethod === 'wallet'
              ? { ...c, walletBalance: c.walletBalance - bookingData.amount }
              : c
          )
        }))

        // Seed messages with initial system notification
        get().addMessage(id, 'system', 'system', `Booking created. Escrow payment of ₦${bookingData.amount.toLocaleString()} is held safely by Nexplumb.`)

        return id
      },

      updateBookingStatus: (id, status) => {
        const booking = get().bookings.find((b) => b.id === id)
        if (!booking) return

        const updatedArtisanPos = status === 'en_route' 
          ? { lat: 6.5022 + 0.015, lng: 3.3582 + 0.015 }
          : booking.artisanPosition

        set((state) => ({
          bookings: state.bookings.map((b) => {
            if (b.id === id) {
              const u: Partial<Booking> = { status, updatedAt: new Date().toISOString(), artisanPosition: updatedArtisanPos }
              if (status === 'en_route') {
                u.etaMinutes = 12
              } else if (status === 'on_site') {
                u.etaMinutes = 0
              }
              return { ...b, ...u } as Booking
            }
            return b
          })
        }))

        get().addMessage(id, 'system', 'system', `Status changed to: ${status.replace('_', ' ')}`)

        // If completed by customer, release payment
        if (status === 'completed') {
          const amount = booking.amount
          const comm = Math.round(amount * 0.12)
          const net = amount - comm

          // Update artisan balance
          set((state) => ({
            artisans: state.artisans.map((art) =>
              art.id === booking.artisanId
                ? {
                    ...art,
                    earningsPending: Math.max(0, art.earningsPending - amount),
                    earningsAvailable: art.earningsAvailable + net,
                    earningsAllTime: art.earningsAllTime + net,
                    jobCount: art.jobCount + 1
                  }
                : art
            ),
            transactions: [
              ...state.transactions,
              {
                id: `tx_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'escrow_release',
                amount: net,
                fee: comm,
                bookingReference: booking.reference,
                description: `Payment released for ${booking.jobType}`,
                status: 'completed',
                userId: booking.artisanId
              }
            ]
          }))
        } else if (status === 'job_complete') {
          // Put in pending for artisan
          set((state) => ({
            artisans: state.artisans.map((art) =>
              art.id === booking.artisanId
                ? { ...art, earningsPending: art.earningsPending + booking.amount }
                : art
            )
          }))
        }
      },

      submitJobComplete: (id, beforePhoto, afterPhoto) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: 'job_complete',
                  beforePhoto: beforePhoto || b.beforePhoto,
                  afterPhoto: afterPhoto || b.afterPhoto,
                  updatedAt: new Date().toISOString()
                }
              : b
          )
        }))

        get().addMessage(id, 'system', 'system', `Artisan marked the job as complete and uploaded proof. Waiting for customer confirmation.`)
      },

      fileDispute: (bookingId, customerStatement, customerPhotos) => {
        const booking = get().bookings.find((b) => b.id === bookingId)
        if (!booking) return ''

        const id = `dsp_${Date.now()}`
        const deadline = new Date()
        deadline.setHours(deadline.getHours() + 48) // SLA 48h deadline

        const newDispute: Dispute = {
          id,
          bookingId,
          bookingReference: booking.reference,
          customerId: booking.customerId,
          customerName: booking.customerName,
          artisanId: booking.artisanId,
          artisanName: booking.artisanName,
          amount: booking.amount,
          status: 'open',
          slaDeadline: deadline.toISOString(),
          customerStatement,
          customerPhotos,
          artisanStatement: '',
          artisanPhotos: booking.afterPhoto ? [booking.afterPhoto] : [],
          openedAt: new Date().toISOString()
        }

        set((state) => ({
          disputes: [...state.disputes, newDispute],
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'disputed', disputeId: id, updatedAt: new Date().toISOString() } : b
          )
        }))

        get().addMessage(bookingId, 'system', 'system', `Customer filed a dispute: "${customerStatement.slice(0, 50)}..." Nexplumb Support will resolve this within 48 hours.`)

        return id
      },

      resolveDispute: (disputeId, decision, reason, refundCustomerAmount, releaseArtisanAmount) => {
        const dispute = get().disputes.find((d) => d.id === disputeId)
        if (!dispute) return

        const booking = get().bookings.find((b) => b.id === dispute.bookingId)
        if (!booking) return

        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status: 'resolved',
                  resolutionDecision: decision,
                  resolutionReason: reason,
                  resolvedAt: new Date().toISOString(),
                  resolvedBy: 'Admin (System)'
                }
              : d
          ),
          bookings: state.bookings.map((b) =>
            b.id === dispute.bookingId
              ? {
                  ...b,
                  status: decision === 'refund_customer' ? 'cancelled' : 'completed',
                  updatedAt: new Date().toISOString()
                }
              : b
          )
        }))

        // Handle Funds
        const total = dispute.amount
        
        // Payout to Artisan
        if (releaseArtisanAmount > 0) {
          const comm = Math.round(releaseArtisanAmount * 0.12)
          const net = releaseArtisanAmount - comm

          set((state) => ({
            artisans: state.artisans.map((art) =>
              art.id === dispute.artisanId
                ? {
                    ...art,
                    earningsPending: Math.max(0, art.earningsPending - total),
                    earningsAvailable: art.earningsAvailable + net,
                    earningsAllTime: art.earningsAllTime + net,
                    jobCount: art.jobCount + 1
                  }
                : art
            ),
            transactions: [
              ...state.transactions,
              {
                id: `tx_${Date.now()}_art`,
                date: new Date().toISOString(),
                type: 'escrow_release',
                amount: net,
                fee: comm,
                bookingReference: dispute.bookingReference,
                description: `Dispute payout: ${reason}`,
                status: 'completed',
                userId: dispute.artisanId
              }
            ]
          }))
        } else {
          // Total refund, reduce pending
          set((state) => ({
            artisans: state.artisans.map((art) =>
              art.id === dispute.artisanId
                ? { ...art, earningsPending: Math.max(0, art.earningsPending - total) }
                : art
            )
          }))
        }

        // Payout/Refund to Customer
        if (refundCustomerAmount > 0) {
          set((state) => ({
            customers: state.customers.map((c) =>
              c.id === dispute.customerId
                ? { ...c, walletBalance: c.walletBalance + refundCustomerAmount }
                : c
            ),
            transactions: [
              ...state.transactions,
              {
                id: `tx_${Date.now()}_cust`,
                date: new Date().toISOString(),
                type: 'refund',
                amount: refundCustomerAmount,
                bookingReference: dispute.bookingReference,
                description: `Dispute refund: ${reason}`,
                status: 'completed',
                userId: dispute.customerId
              }
            ]
          }))
        }

        get().addMessage(
          dispute.bookingId,
          'system',
          'system',
          `Dispute resolved: ${decision === 'refund_customer' ? 'Refunded to customer' : decision === 'release_artisan' ? 'Released to artisan' : 'Partial split'}. Reason: ${reason}`
        )
      },

      addMessage: (bookingId, senderId, senderType, text) => {
        const newMessage: Message = {
          id: `msg_${Date.now()}`,
          bookingId,
          senderId,
          senderType,
          text,
          timestamp: new Date().toISOString()
        }
        set((state) => ({
          messages: [...state.messages, newMessage]
        }))
      },

      withdrawArtisanEarnings: (artisanId, amount) => {
        const artisan = get().artisans.find((a) => a.id === artisanId)
        if (!artisan) return { success: false, message: 'Artisan not found' }
        if (artisan.earningsAvailable < amount) {
          return { success: false, message: 'Insufficient available earnings' }
        }

        set((state) => ({
          artisans: state.artisans.map((a) =>
            a.id === artisanId
              ? { ...a, earningsAvailable: a.earningsAvailable - amount }
              : a
          ),
          transactions: [
            ...state.transactions,
            {
              id: `tx_${Date.now()}`,
              date: new Date().toISOString(),
              type: 'withdrawal',
              amount,
              description: `Withdrawal to ${artisan.bankName} (${artisan.accountNumber?.slice(-4)})`,
              status: 'completed',
              userId: artisanId
            }
          ]
        }))

        return { success: true, message: 'Withdrawal completed successfully' }
      }
    }),
    {
      name: 'nexplumb-db-storage'
    }
  )
)
