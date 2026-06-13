'use client'

import React, { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb, Booking, Message } from '@/lib/store/mockDb'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import StatusBadge from '@/components/ui/StatusBadge'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatNaira, formatDate, formatTime, maskPhone } from '@/lib/format'
import { 
  ArrowRight, 
  Search, 
  MessageSquare, 
  CreditCard, 
  Star, 
  Send,
  Download,
  AlertTriangle,
  Heart
} from 'lucide-react'
import { toast } from 'sonner'

function CustomerDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'overview'

  const { user } = useAuthStore()
  const { bookings, transactions, messages, addMessage, updateBookingStatus, artisans } = useMockDb()

  // Authentication guard
  React.useEffect(() => {
    if (!user) {
      toast.error('Session expired. Please log in.')
      router.push('/login')
    }
  }, [user])

  // States
  const [activeBookingFilter, setActiveBookingFilter] = useState<string>('all')
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null)
  const [chatText, setChatText] = useState('')
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null)
  const [reviewStars, setReviewStars] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  // Greeting
  const greeting = useMemo(() => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Filter customer bookings
  const customerBookings = useMemo(() => {
    if (!user) return []
    return bookings.filter((b) => b.customerId === user.id)
  }, [bookings, user])

  // Active Booking
  const activeBooking = useMemo(() => {
    return customerBookings.find(
      (b) => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'job_complete'
    )
  }, [customerBookings])

  // Completed Bookings
  const completedBookings = useMemo(() => {
    return customerBookings.filter((b) => b.status === 'completed')
  }, [customerBookings])

  // Total spent
  const totalSpent = useMemo(() => {
    return transactions
      .filter((t) => t.userId === user?.id && t.type === 'escrow_hold' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, user])

  // Filtered Bookings for My Bookings Tab
  const filteredBookingsList = useMemo(() => {
    if (activeBookingFilter === 'all') return customerBookings
    if (activeBookingFilter === 'active') {
      return customerBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled')
    }
    if (activeBookingFilter === 'completed') {
      return customerBookings.filter(b => b.status === 'completed')
    }
    if (activeBookingFilter === 'disputed') {
      return customerBookings.filter(b => b.status === 'disputed')
    }
    if (activeBookingFilter === 'cancelled') {
      return customerBookings.filter(b => b.status === 'cancelled')
    }
    return customerBookings
  }, [customerBookings, activeBookingFilter])

  // Messages flow: Active conversations list
  const chatConversations = useMemo(() => {
    // Unique list of bookings where user is involved
    return customerBookings.filter(
      (b) => b.status !== 'completed' && b.status !== 'cancelled'
    )
  }, [customerBookings])

  // Active chat messages
  const activeMessages = useMemo(() => {
    if (!activeChatBookingId) return []
    return messages.filter((m) => m.bookingId === activeChatBookingId)
  }, [messages, activeChatBookingId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatText.trim() || !activeChatBookingId || !user) return

    addMessage(activeChatBookingId, user.id, 'customer', chatText)
    setChatText('')

    // Mock Artisan Auto-reply
    const activeBookingObj = bookings.find(b => b.id === activeChatBookingId)
    setTimeout(() => {
      addMessage(
        activeChatBookingId,
        activeBookingObj?.artisanId || 'art_1',
        'artisan',
        `Thanks for the message. I am currently focusing on the ${activeBookingObj?.jobType || 'job'}. I will update you here.`
      )
    }, 1500)
  }

  const handleBookAgain = (prevBooking: Booking) => {
    const artisanObj = artisans.find(a => a.id === prevBooking.artisanId)
    if (artisanObj) {
      toast.success('Pre-filling booking form with previous details!')
      router.push(`/book/${artisanObj.slug}?jobType=${encodeURIComponent(prevBooking.jobType)}`)
    } else {
      toast.error('Artisan profile not found.')
    }
  }

  const handleSaveReview = () => {
    if (!reviewModalBooking) return
    toast.success('Thank you for rating your service! Review saved.')
    setReviewModalBooking(null)
    setReviewComment('')
  }

  return (
    <div className="w-full flex-grow flex min-h-[calc(100vh-64px)] select-none">
      
      {/* PERSISTENT SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT AREA */}
      <main className="ml-60 flex-grow bg-lgray p-6 tablet:p-8 overflow-y-auto">
        <div className="max-w-[960px] mx-auto flex flex-col gap-6">
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {tab === 'overview' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Header Greeting */}
              <div>
                <h1 className="text-h1 text-navy select-none">
                  {greeting}, {user?.firstName || 'User'} 👋
                </h1>
                <p className="font-body text-[14px] text-slate mt-1">
                  Manage your artisan bookings, check escrow balances, or chat with support.
                </p>
              </div>

              {/* Active Booking Hero card (Orange highlight) */}
              {activeBooking ? (
                <div className="bg-orange/10 border border-orange/30 rounded-card p-5 shadow-card flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeBooking.artisanPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={activeBooking.artisanName}
                      className="w-14 h-14 rounded-full object-cover border border-orange/40"
                    />
                    <div className="font-mono text-[12px] text-slate leading-tight">
                      <span className="font-display font-bold text-navy text-[14px] block mb-1">Active Booking dispatch</span>
                      <span>{activeBooking.jobType} · {activeBooking.artisanName}</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                        <span className="font-bold text-orange uppercase tracking-wide text-[10px]">{activeBooking.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/jobs/${activeBooking.id}/track`}>
                    <Button variant="primary" size="sm" className="flex items-center gap-1 shrink-0">
                      Track now <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-border rounded-card p-5 text-center shadow-card flex flex-col items-center">
                  <p className="font-body text-[14px] text-slate">You don\'t have any active bookings at the moment.</p>
                  <Link href="/search" className="mt-3">
                    <Button variant="primary" size="sm">Book an artisan now</Button>
                  </Link>
                </div>
              )}

              {/* Quick stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Jobs', value: customerBookings.length },
                  { label: 'Avg Rating Given', value: completedBookings.length > 0 ? '4.8 ★' : 'N/A' },
                  { label: 'Total Spent', value: formatNaira(totalSpent) },
                  { label: 'NexPoints Reward', value: '350 pts' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-card p-4 border border-border shadow-card text-center">
                    <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{stat.label}</p>
                    <p className="font-mono text-[18px] font-bold text-navy mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Upcoming bookings list */}
              <div className="bg-white rounded-card border border-border p-5 shadow-card select-none">
                <h3 className="font-display font-bold text-[15px] text-navy mb-4 border-b border-border pb-2.5">
                  Upcoming bookings schedule
                </h3>

                {customerBookings.filter(b => b.status === 'confirmed').length === 0 ? (
                  <p className="font-body text-[13px] text-slate text-center py-4">No future scheduled bookings found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {customerBookings
                      .filter(b => b.status === 'confirmed')
                      .slice(0, 3)
                      .map((b) => (
                        <div key={b.id} className="flex justify-between items-center border border-border rounded-btn p-3 text-[13px] font-mono leading-none bg-lgray/10">
                          <div className="flex items-center gap-3">
                            <span className="bg-teal/10 text-teal font-bold px-2 py-1 rounded text-[11px] uppercase shrink-0">
                              {b.date.slice(5)}
                            </span>
                            <span className="font-bold text-navy shrink-0">{b.artisanName}</span>
                            <span className="text-slate hidden sm:inline">({b.jobType})</span>
                          </div>
                          <span className="text-slate font-bold">{b.timeSlot}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: MY BOOKINGS ================= */}
          {tab === 'bookings' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <h1 className="text-h1 text-navy">My Bookings</h1>
                <p className="font-body text-[14px] text-slate mt-0.5">Track, complete, or cancel booking services.</p>
              </div>

              {/* Filters */}
              <div className="flex gap-2 border-b border-border pb-1 overflow-x-auto select-none">
                {['all', 'active', 'completed', 'disputed', 'cancelled'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveBookingFilter(filter)}
                    className={`pb-2 px-3 font-display text-[13px] font-semibold focus:outline-none transition-all uppercase tracking-wide border-b-2
                      ${activeBookingFilter === filter 
                        ? 'border-orange text-orange font-bold' 
                        : 'border-transparent text-slate hover:text-navy'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Bookings cards list */}
              <div className="flex flex-col gap-3.5">
                {filteredBookingsList.length === 0 ? (
                  <div className="bg-white border border-border rounded-card p-12 text-center flex flex-col items-center">
                    <p className="font-body text-slate">No bookings found for filter: {activeBookingFilter}.</p>
                  </div>
                ) : (
                  filteredBookingsList.map((b) => (
                    <div key={b.id} className="bg-white rounded-card p-5 border border-border shadow-card flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <img
                          src={b.artisanPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={b.artisanName}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                        <div className="font-mono text-[12px] text-slate leading-tight">
                          <p className="font-display font-bold text-navy text-[14px] leading-tight mb-1">{b.jobType}</p>
                          <p>Artisan: <span className="font-bold text-navy">{b.artisanName}</span> ({b.artisanTrade})</p>
                          <p className="mt-1">Date: {formatDate(b.date)} at {b.timeSlot}</p>
                          <p className="mt-1.5 flex items-center gap-1.5">
                            <StatusBadge status={b.status} showDot />
                            <span className="font-bold text-navy">₦{b.amount.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons stack */}
                      <div className="flex flex-row sm:flex-col justify-end gap-2.5 shrink-0 select-none">
                        {(b.status === 'confirmed' || b.status === 'en_route' || b.status === 'on_site' || b.status === 'in_progress') && (
                          <Link href={`/jobs/${b.id}/track`}>
                            <Button variant="primary" size="sm" className="w-full text-center">Track Now</Button>
                          </Link>
                        )}
                        {b.status === 'job_complete' && (
                          <Link href={`/jobs/${b.id}/track`}>
                            <Button variant="success" size="sm" className="w-full text-center">Approve completion</Button>
                          </Link>
                        )}
                        {b.status === 'completed' && (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => setReviewModalBooking(b)}>Rate Work</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleBookAgain(b)}>Book Again</Button>
                          </>
                        )}
                        {(b.status === 'disputed' || b.status === 'cancelled') && (
                          <Link href={`/jobs/${b.id}/track`}>
                            <Button variant="secondary" size="sm">View details</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: SAVED ARTISANS ================= */}
          {tab === 'saved' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <h1 className="text-h1 text-navy">Saved Artisans</h1>
                <p className="font-body text-[14px] text-slate mt-0.5">Quickly re-book your favourite local tradespeople.</p>
              </div>

              {/* Pull seeded Surulere artisan as mock saved */}
              <div className="grid grid-cols-1 gap-4">
                {artisans.slice(0, 2).map((a) => (
                  <div key={a.id} className="bg-white border border-border rounded-card p-5 shadow-card flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={a.portfolio[0]?.url} alt={a.name} className="w-14 h-14 rounded-full object-cover border bg-lgray" />
                      <div>
                        <h4 className="font-display font-bold text-[15px] text-navy leading-none">{a.name}</h4>
                        <p className="font-mono text-[11px] text-slate mt-1">{a.trade} · {a.area}</p>
                        <div className="mt-1">
                          <StarRating rating={a.rating} />
                        </div>
                      </div>
                    </div>

                    <Link href={`/book/${a.slug}`}>
                      <Button variant="primary" size="sm">Book Now</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: MESSAGES ================= */}
          {tab === 'messages' && (
            <div className="flex flex-col gap-5 animate-fade-in h-[calc(100vh-160px)]">
              <div>
                <h1 className="text-h1 text-navy">Inbox</h1>
                <p className="font-body text-[14px] text-slate mt-0.5">Chat with artisans on active dispatch orders.</p>
              </div>

              <div className="flex-1 bg-white border border-border rounded-card shadow-card flex overflow-hidden">
                {/* Left Conversations List (40%) */}
                <div className="w-[38%] border-r border-border flex flex-col overflow-y-auto">
                  {chatConversations.length === 0 ? (
                    <p className="text-slate text-center font-mono text-[11px] py-12 px-4">
                      No active jobs conversations. Message channels open upon booking.
                    </p>
                  ) : (
                    chatConversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveChatBookingId(c.id)}
                        className={`p-4 border-b border-border text-left w-full hover:bg-lgray/30 flex items-center gap-3 transition-colors
                          ${activeChatBookingId === c.id ? 'bg-lgray/50' : ''}`}
                      >
                        <img src={c.artisanPhoto} alt={c.artisanName} className="w-10 h-10 rounded-full object-cover border" />
                        <div className="font-mono text-[11px] text-slate leading-tight min-w-0 flex-1">
                          <h4 className="font-display font-bold text-[13px] text-navy truncate">{c.artisanName}</h4>
                          <p className="mt-1 truncate">Job Ref: {c.reference}</p>
                          <span className="text-[9px] bg-teal/10 text-teal px-1 rounded inline-block mt-1 font-bold">{c.status.replace('_', ' ')}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Right Messaging Stream (62%) */}
                <div className="flex-1 flex flex-col justify-between bg-lgray/5">
                  {activeChatBookingId ? (
                    <>
                      {/* Messages loop */}
                      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3.5 max-h-[400px]">
                        {activeMessages.length === 0 && (
                          <p className="text-slate text-center font-mono text-[11px] py-10 opacity-75">
                            🔒 Chat channel established. Send a message to start conversation.
                          </p>
                        )}
                        {activeMessages.map((m) => {
                          const isMe = m.senderType === 'customer'
                          const isSystem = m.senderType === 'system'
                          
                          if (isSystem) {
                            return (
                              <div key={m.id} className="text-center font-mono text-[10px] text-slate bg-lgray px-2 py-1 rounded w-fit mx-auto self-center">
                                {m.text}
                              </div>
                            )
                          }

                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col max-w-[75%] font-mono text-[13px] leading-relaxed
                                ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                            >
                              <div className={`p-3 rounded-btn shadow-card text-left
                                ${isMe ? 'bg-orange text-white rounded-br-none' : 'bg-white text-navy rounded-bl-none border border-border'}`}>
                                {m.text}
                              </div>
                              <span className="text-[9px] text-slate mt-1 font-semibold opacity-75">
                                {formatTime(m.timestamp)}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Chat Input form */}
                      <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-white flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your message to Emeka here..."
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          className="flex-1 border border-border rounded-btn px-4 font-mono text-[13px] focus:outline-none focus:border-teal"
                        />
                        <Button type="submit" variant="primary" size="sm" className="h-10 px-4 shrink-0">
                          <Send size={16} />
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate font-mono text-[12px] p-6 text-center select-none">
                      <MessageSquare size={36} className="text-border mb-2" />
                      <p>Select an active booking conversation from left panel to start messaging.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: PAYMENTS ================= */}
          {tab === 'payments' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div>
                <h1 className="text-h1 text-navy">Payments Ledger</h1>
                <p className="font-body text-[14px] text-slate mt-0.5">Verify escrow hold transactions and receipts.</p>
              </div>

              {/* Spent metrics */}
              <div className="p-5 bg-white border border-border rounded-card shadow-card flex justify-between items-center select-none font-mono text-[13px]">
                <div className="leading-tight text-left">
                  <span className="text-slate block mb-1">ALL-TIME SECURE ESCROW SPENT</span>
                  <span className="text-[24px] font-bold text-navy">₦{totalSpent.toLocaleString()}</span>
                </div>
                
                <div className="px-4 py-2 border-l border-border text-center">
                  <p className="text-slate">NexPoints Balance</p>
                  <p className="font-bold text-teal text-[16px] mt-1">350 pts</p>
                </div>
              </div>

              {/* Transactions list */}
              <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
                <table className="w-full text-left font-mono text-[13px] leading-normal">
                  <thead className="bg-lgray/50 text-[11px] font-bold text-slate uppercase border-b border-border select-none">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Booking Ref</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .filter((t) => t.userId === user?.id)
                      .map((t) => (
                        <tr key={t.id} className="border-b border-border hover:bg-lgray/10">
                          <td className="p-4">{formatDate(t.date)}</td>
                          <td className="p-4">
                            <span className={`font-bold capitalize
                              ${t.type === 'escrow_hold' ? 'text-navy' : t.type === 'refund' ? 'text-red-600' : 'text-teal'}`}>
                              {t.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-navy font-bold">{t.bookingReference || 'N/A'}</td>
                          <td className="p-4 font-bold">₦{t.amount.toLocaleString()}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => toast.success('Mock PDF invoice downloading initiated.')}
                              className="p-1 hover:bg-lgray rounded text-nxblue hover:text-nxblue-dark transition-colors focus:outline-none"
                              title="Download Receipt"
                            >
                              <Download size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {transactions.filter((t) => t.userId === user?.id).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-slate font-body">
                          No transactions found on your account.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* RATING WORK MODAL */}
      {reviewModalBooking && (
        <Modal
          isOpen={!!reviewModalBooking}
          onClose={() => setReviewModalBooking(null)}
          title={`Rate Service with ${reviewModalBooking.artisanName}`}
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setReviewModalBooking(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveReview}>
                Submit review
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[13px] text-navy">
            <div className="flex flex-col items-center select-none py-2 border-b border-border mb-2">
              <p className="text-slate font-body mb-2 text-center">Select rating stars for service completion:</p>
              <div className="flex gap-1.5 text-amber text-[24px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewStars(star)}
                    className="focus:outline-none hover:scale-110 active:scale-95 transition-transform"
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="font-bold mt-2 text-[14px] text-navy">{reviewStars} out of 5 stars</span>
            </div>

            <div>
              <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Review Comments (Optional)</label>
              <textarea
                placeholder="Share your experience working with Emeka on pipe fixes..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full rounded-btn border border-border bg-white px-4 py-3 focus:outline-none focus:border-teal font-mono text-[13px]"
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default function CustomerDashboard() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-lgray flex items-center justify-center font-mono text-navy">Loading dashboard portal...</div>}>
      <CustomerDashboardContent />
    </Suspense>
  )
}
