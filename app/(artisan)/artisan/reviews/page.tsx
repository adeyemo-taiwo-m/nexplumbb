'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb, Review } from '@/lib/store/mockDb'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { 
  Star, 
  MessageSquare, 
  Flag, 
  Send, 
  CornerDownRight, 
  Check, 
  AlertTriangle, 
  X,
  User
} from 'lucide-react'
import { toast } from 'sonner'

export default function ArtisanReviewsPage() {
  const { user } = useAuthStore()
  const { artisans, updateArtisan } = useMockDb()

  // Find DB record
  const dbArtisan = useMemo(() => {
    return artisans.find(a => a.id === user?.id)
  }, [artisans, user])

  const reviews = dbArtisan?.reviews || []

  // Rating filter
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all')

  // Reply states
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [replyInput, setReplyInput] = useState<string>('')

  // Flag states
  const [flaggingReview, setFlaggingReview] = useState<Review | null>(null)
  const [flagReason, setFlagReason] = useState<string>('spam')
  const [flagExplanation, setFlagExplanation] = useState<string>('')

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (selectedRatingFilter === 'all') return true
      if (selectedRatingFilter === 'critical') return r.rating <= 3
      return r.rating === parseInt(selectedRatingFilter)
    })
  }, [reviews, selectedRatingFilter])

  // Count rating distributions
  const distributions = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const rate = Math.round(r.rating) as 5 | 4 | 3 | 2 | 1
      if (counts[rate] !== undefined) {
        counts[rate]++
      }
    })
    const total = reviews.length || 1
    return {
      5: { count: counts[5], pct: Math.round((counts[5] / total) * 100) },
      4: { count: counts[4], pct: Math.round((counts[4] / total) * 100) },
      3: { count: counts[3], pct: Math.round((counts[3] / total) * 100) },
      2: { count: counts[2], pct: Math.round((counts[2] / total) * 100) },
      1: { count: counts[1], pct: Math.round((counts[1] / total) * 100) }
    }
  }, [reviews])

  const handleStartReply = (reviewId: string, currentReply?: string) => {
    setEditingReplyId(reviewId)
    setReplyInput(currentReply || '')
  }

  const handleCancelReply = () => {
    setEditingReplyId(null)
    setReplyInput('')
  }

  const handleSaveReply = (reviewId: string) => {
    if (!dbArtisan) return
    if (!replyInput.trim()) {
      toast.error('Reply content cannot be empty.')
      return
    }

    const updatedReviews = reviews.map(r => 
      r.id === reviewId ? { ...r, reply: replyInput.trim() } : r
    )

    updateArtisan(dbArtisan.id, { reviews: updatedReviews })
    setEditingReplyId(null)
    setReplyInput('')
    toast.success('Reply submitted and shown on your public profile ✓')
  }

  const handleDeleteReply = (reviewId: string) => {
    if (!dbArtisan) return
    
    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        const { reply, ...rest } = r
        return rest as Review
      }
      return r
    })

    updateArtisan(dbArtisan.id, { reviews: updatedReviews })
    toast.success('Reply deleted.')
  }

  const handleOpenFlagModal = (review: Review) => {
    setFlaggingReview(review)
    setFlagReason('spam')
    setFlagExplanation('')
  }

  const handleCloseFlagModal = () => {
    setFlaggingReview(null)
  }

  const handleSubmitFlag = () => {
    if (!flaggingReview) return
    
    const ticketId = `NX-FLG-${Math.floor(10000 + Math.random() * 90000)}`
    toast.success(`Review flagged for admin arbitration. Support Ticket: ${ticketId}`)
    setFlaggingReview(null)
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-h1 text-navy font-display font-semibold">Customer Reviews & Ratings</h1>
        <p className="font-body text-[14px] text-slate mt-0.5">
          Read reviews from past jobs, post replies to answer concerns, or flag reviews for arbitration.
        </p>
      </div>

      {/* Overview Card */}
      <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6 bg-white rounded-card border border-border p-6 shadow-card">
        
        {/* Average Rating Block */}
        <div className="flex flex-col items-center justify-center border-b desktop:border-b-0 desktop:border-r border-border pb-6 desktop:pb-0 desktop:pr-6 text-center">
          <p className="font-mono text-[10px] text-slate uppercase tracking-wider mb-2">Average Score</p>
          <p className="font-mono text-[56px] font-bold text-navy leading-none mb-2">
            {dbArtisan?.rating.toFixed(1) || '0.0'}
          </p>
          <div className="mb-2">
            <StarRating rating={dbArtisan?.rating || 0} reviewCount={0} />
          </div>
          <p className="font-mono text-[12px] text-slate font-bold">
            Based on {reviews.length} total review{reviews.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Distributions Block */}
        <div className="desktop:col-span-2 flex flex-col justify-center gap-2">
          <p className="font-mono text-[10px] text-slate uppercase tracking-wider mb-2">Rating Distribution</p>
          
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const dist = distributions[star]
            return (
              <div key={star} className="flex items-center gap-3 font-mono text-[12px] text-navy">
                <span className="w-12 text-left">{star} Star</span>
                <div className="flex-1 h-3 bg-lgray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber rounded-full" 
                    style={{ width: `${dist.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right">{dist.count} ({dist.pct}%)</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter and Reviews Section */}
      <section className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-6">
        
        {/* Filter bar */}
        <div className="border-b border-border pb-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 select-none">
            <button
              onClick={() => setSelectedRatingFilter('all')}
              className={`h-9 px-4 rounded-btn font-mono text-[12px] font-bold border transition-colors ${
                selectedRatingFilter === 'all' 
                  ? 'bg-navy border-navy text-white' 
                  : 'bg-white border-border text-slate hover:text-navy hover:border-slate'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setSelectedRatingFilter('5')}
              className={`h-9 px-4 rounded-btn font-mono text-[12px] font-bold border transition-colors ${
                selectedRatingFilter === '5' 
                  ? 'bg-navy border-navy text-white' 
                  : 'bg-white border-border text-slate hover:text-navy hover:border-slate'
              }`}
            >
              5 Star ({distributions[5].count})
            </button>
            <button
              onClick={() => setSelectedRatingFilter('4')}
              className={`h-9 px-4 rounded-btn font-mono text-[12px] font-bold border transition-colors ${
                selectedRatingFilter === '4' 
                  ? 'bg-navy border-navy text-white' 
                  : 'bg-white border-border text-slate hover:text-navy hover:border-slate'
              }`}
            >
              4 Star ({distributions[4].count})
            </button>
            <button
              onClick={() => setSelectedRatingFilter('critical')}
              className={`h-9 px-4 rounded-btn font-mono text-[12px] font-bold border border-red-200 transition-colors ${
                selectedRatingFilter === 'critical' 
                  ? 'bg-red-600 border-red-600 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Critical (1-3 Star) ({distributions[3].count + distributions[2].count + distributions[1].count})
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 font-body text-[14px] text-slate">
            No reviews match the selected filter.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredReviews.map((rev) => (
              <div 
                key={rev.id} 
                className="border-b border-border last:border-b-0 pb-6 last:pb-0 flex flex-col gap-3 text-left"
              >
                
                {/* Reviewer Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-lgray rounded-full flex items-center justify-center text-slate shrink-0 border border-border">
                      <User size={20} />
                    </div>
                    <div className="leading-tight">
                      <h4 className="font-display font-bold text-[14px] text-navy">{rev.customerName}</h4>
                      <p className="font-mono text-[11px] text-slate mt-0.5">
                        LGA Location: <span className="font-bold text-navy">{rev.customerArea}</span> · {new Date(rev.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < rev.rating ? 'fill-amber text-amber' : 'text-border'} 
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleOpenFlagModal(rev)}
                      className="font-mono text-[11px] text-slate hover:text-red-600 font-bold flex items-center gap-1 focus:outline-none"
                      title="Flag review to admin for dispute resolution"
                    >
                      <Flag size={12} /> Flag Review
                    </button>
                  </div>
                </div>

                {/* Review Text */}
                <p className="font-body text-[14px] text-body leading-relaxed pl-13 pl-0 sm:pl-13 italic">
                  "{rev.text}"
                </p>

                {/* Reply section */}
                <div className="pl-0 sm:pl-13">
                  {rev.reply ? (
                    <div className="bg-lgray/60 rounded-btn p-4 border border-border/50 flex flex-col gap-2 mt-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-teal">
                          <CornerDownRight size={14} />
                          Your Reply
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartReply(rev.id, rev.reply)}
                            className="font-mono text-[11px] text-nxblue hover:underline focus:outline-none font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReply(rev.id)}
                            className="font-mono text-[11px] text-red-600 hover:underline focus:outline-none font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {editingReplyId === rev.id ? (
                        <div className="flex flex-col gap-2 mt-1">
                          <textarea
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            rows={3}
                            placeholder="Type response to customer..."
                            className="w-full border border-border focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none rounded-btn px-3 py-2 font-mono text-[13px] resize-y"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={handleCancelReply}>Cancel</Button>
                            <Button size="sm" variant="success" onClick={() => handleSaveReply(rev.id)}>Save Reply</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="font-body text-[13px] text-body leading-relaxed italic">
                          "{rev.reply}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {editingReplyId === rev.id ? (
                        <div className="bg-lgray/60 rounded-btn p-4 border border-border/50 flex flex-col gap-2 mt-2">
                          <label className="font-mono text-[11px] font-bold text-slate uppercase block">Your Response Reply</label>
                          <textarea
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            rows={3}
                            placeholder="Respond professionally. Explain resolution details if there was an issue..."
                            className="w-full border border-border focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none rounded-btn px-3 py-2 font-mono text-[13px] resize-y"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={handleCancelReply}>Cancel</Button>
                            <Button size="sm" variant="success" onClick={() => handleSaveReply(rev.id)}>Submit Reply</Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartReply(rev.id)}
                          className="mt-1 font-mono text-[12px] text-teal hover:text-teal/80 font-bold flex items-center gap-1.5 focus:outline-none"
                        >
                          <MessageSquare size={14} /> Write a response reply
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Flag / Report Modal */}
      {flaggingReview && (
        <Modal
          isOpen={!!flaggingReview}
          onClose={handleCloseFlagModal}
          title="Flag Review for Arbitration"
          footerActions={
            <>
              <Button variant="secondary" onClick={handleCloseFlagModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleSubmitFlag}>
                Flag Review
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[13px] text-navy text-left">
            <p className="text-slate leading-relaxed">
              If a review violates community guidelines (e.g. false statements, offensive language, spam), flag it. NexPlumb Support will investigate and moderate.
            </p>

            <div className="p-3 bg-red-50 border border-red-100 rounded leading-relaxed">
              <span className="text-[11px] font-bold text-red-700 block uppercase">Review by {flaggingReview.customerName}:</span>
              <p className="font-body italic text-[12px] text-red-900 mt-1">"{flaggingReview.text}"</p>
            </div>

            <div>
              <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Reason for Flagging</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] focus:outline-none focus:border-teal"
              >
                <option value="spam">Spam, ads, or irrelevant content</option>
                <option value="inappropriate">Abusive or inappropriate language</option>
                <option value="falsehood">False claims or incorrect transaction details</option>
                <option value="extortion">Customer extortion attempt</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Detailed Explanation</label>
              <textarea
                value={flagExplanation}
                onChange={(e) => setFlagExplanation(e.target.value)}
                rows={3}
                placeholder="Explain why this review should be moderated or removed..."
                className="w-full border border-border focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none rounded-btn px-3 py-2 font-mono text-[13px] resize-y"
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
