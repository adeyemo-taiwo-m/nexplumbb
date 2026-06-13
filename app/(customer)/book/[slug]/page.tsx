'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockDb } from '@/lib/store/mockDb'
import { useAuthStore } from '@/lib/store/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import EscrowBadge from '@/components/ui/EscrowBadge'
import StarRating from '@/components/ui/StarRating'
import { 
  ShieldCheck, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ArrowLeft,
  CheckCircle,
  FileText,
  CreditCard,
  Building,
  Hash,
  Wallet,
  Copy,
  Plus,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { formatNaira } from '@/lib/format'
import { LAGOS_LGAS } from '@/lib/validation'

export default function BookingFlow() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { artisans, addBooking } = useMockDb()
  const { user } = useAuthStore()

  // Find artisan
  const artisan = useMemo(() => {
    return artisans.find((a) => a.slug === slug)
  }, [artisans, slug])

  // Stepper states: 0=Details, 1=Schedule, 2=Pay, 3=Confirmed
  const [currentStep, setCurrentStep] = useState(0)

  // Step A: Details States
  const [jobCategory, setJobCategory] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetails, setAddressDetails] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])

  // Step B: Schedule States
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isFlexible, setIsFlexible] = useState(false)

  // Step C: Payment States
  const [paymentTab, setPaymentTab] = useState<'card' | 'transfer' | 'ussd' | 'wallet'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [generatedRef, setGeneratedRef] = useState('')
  const [pollingStatus, setPollingStatus] = useState('waiting')

  // Validation
  const isDetailsValid = jobCategory && description.length >= 30 && address
  const isScheduleValid = isFlexible || (selectedDate && selectedTime)

  // Mock Calendar Dates: next 7 days
  const calendarDates = useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dateString = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })
      // Seed availability: make Sunday unavailable
      const isAvailable = d.getDay() !== 0 
      dates.push({ dateString, label, isAvailable })
    }
    return dates
  }, [])

  // Mock Time Slots
  const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM']

  // Price calculations
  const basePrice = artisan ? artisan.priceMin : 10000
  const fee = 500
  const premium = isUrgent ? Math.round(basePrice * 0.3) : 0
  const totalPrice = basePrice + fee + premium

  if (!artisan) {
    return <div className="p-10 text-center font-mono">Loading artisan details...</div>
  }

  // Redirect to login if user is not authenticated
  const handleProceedToPayment = () => {
    if (!user) {
      toast.error('Please log in to proceed to payment.')
      router.push('/login')
      return
    }
    setCurrentStep(2)
  }

  // Image Upload Simulation
  const handleSimulatePhotoUpload = () => {
    if (uploadedPhotos.length >= 3) {
      toast.error('Maximum 3 photos allowed for booking.')
      return
    }
    const urls = [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300'
    ]
    const nextPhoto = urls[uploadedPhotos.length]
    setUploadedPhotos([...uploadedPhotos, nextPhoto])
    toast.success('Photo uploaded successfully!')
  }

  const handleRemovePhoto = (idx: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))
  }

  // Payment Confirmation
  const handleProcessPayment = () => {
    setIsPaying(true)
    
    // Simulate Paystack transaction delay
    setTimeout(() => {
      if (paymentTab === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
        toast.error('Please enter card details.')
        setIsPaying(false)
        return
      }

      // Create booking in Mock DB
      const bookingId = addBooking({
        customerId: user?.id || 'cust_1',
        customerName: user?.name || 'Chisom Alabi',
        customerPhone: user?.phone || '08080908908',
        customerAddress: address,
        customerAddressDetails: addressDetails,
        artisanId: artisan.id,
        artisanName: artisan.name,
        artisanTrade: artisan.trade,
        artisanPhoto: artisan.portfolio[0]?.url || '',
        jobType: jobCategory,
        description,
        photos: uploadedPhotos,
        isUrgent,
        date: isFlexible ? new Date().toISOString().split('T')[0] : selectedDate,
        timeSlot: isFlexible ? 'Flexible' : selectedTime,
        amount: totalPrice,
        paymentMethod: paymentTab,
        paymentStatus: 'paid'
      })

      // Get generated booking reference from state
      const db = useMockDb.getState()
      const createdBooking = db.bookings.find(b => b.id === bookingId)
      if (createdBooking) {
        setGeneratedRef(createdBooking.reference)
      }

      toast.success('Payment authorized. Booking confirmed!')
      setIsPaying(false)
      setCurrentStep(3)
    }, 2000)
  }

  const handleCopyRef = () => {
    navigator.clipboard.writeText(generatedRef)
    toast.success('Reference copied to clipboard!')
  }

  return (
    <div className="w-full bg-lgray flex-grow py-8 select-none">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Step Indicator Stepper (Top) */}
        <div className="bg-white border border-border rounded-card p-5 mb-6 shadow-card flex items-center justify-between overflow-x-auto select-none">
          {['Job details', 'Schedule', 'Review & pay', 'Confirmed'].map((stepName, idx) => {
            const isActive = currentStep === idx
            const isCompleted = currentStep > idx
            
            return (
              <div key={stepName} className="flex items-center gap-2 flex-shrink-0">
                <button
                  disabled={!isCompleted}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-7 h-7 rounded-full font-mono text-[13px] font-bold flex items-center justify-center border focus:outline-none transition-all
                    ${isActive ? 'bg-teal border-teal text-white' : ''}
                    ${isCompleted ? 'bg-navy border-navy text-white hover:bg-teal hover:border-teal' : ''}
                    ${!isActive && !isCompleted ? 'border-border text-slate cursor-not-allowed' : ''}
                  `}
                >
                  {isCompleted ? '✓' : idx + 1}
                </button>
                <span className={`font-display text-[13px] font-semibold ${isActive ? 'text-teal font-bold' : isCompleted ? 'text-navy' : 'text-slate'}`}>
                  {stepName}
                </span>
                {idx < 3 && <ChevronRight size={14} className="text-slate mx-1" />}
              </div>
            )
          })}
        </div>

        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 desktop:grid-cols-12 gap-8 items-start">
          
          {/* === LEFT COLUMN: persistent artisan context card (except step D) === */}
          {currentStep < 3 && (
            <aside className="desktop:col-span-4 bg-white rounded-card border border-border p-5 shadow-card flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <img
                  src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={artisan.name}
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-display font-bold text-[15px] text-navy leading-none">{artisan.name}</h4>
                  <p className="font-mono text-[11px] text-slate mt-1">{artisan.trade} · {artisan.area}</p>
                  <div className="mt-1.5">
                    <StarRating rating={artisan.rating} />
                  </div>
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] text-slate uppercase">Est. Base Price</p>
                <p className="font-mono text-[16px] font-bold text-navy mt-0.5">
                  ₦{artisan.priceMin.toLocaleString()} – ₦{artisan.priceMax.toLocaleString()}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <EscrowBadge variant="banner" amount={totalPrice} />
              </div>
            </aside>
          )}

          {/* === RIGHT COLUMN: DYNAMIC PANEL CONTENTS === */}
          <main className={currentStep < 3 ? 'desktop:col-span-8 flex flex-col gap-6 w-full' : 'desktop:col-span-12 w-full max-w-[500px] mx-auto'}>
            
            <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-6">
              
              {/* STEP A: JOB DETAILS */}
              {currentStep === 0 && (
                <div className="flex flex-col gap-5">
                  <div className="border-b border-border pb-2">
                    <h2 className="text-h2 text-navy">Describe the issue</h2>
                    <p className="font-body text-[14px] text-slate mt-1">Provide specifications to ensure Emeka brings correct tools.</p>
                  </div>

                  {/* Job Type Dropdown */}
                  <div>
                    <label className="font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide">
                      Job Type / Category
                    </label>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value)}
                      className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                    >
                      <option value="">-- Select job type --</option>
                      <option value="Pipe repair">Pipe repair / burst pipe</option>
                      <option value="Drain unblocking">Drain unblocking</option>
                      <option value="Tap replacement">Tap / mixer replacement</option>
                      <option value="Water heater repair">Water heater repair / installation</option>
                      <option value="Burnt socket">Burnt wall sockets</option>
                      <option value="Generator switch">Generator changeover switch</option>
                      <option value="Other">Other repair work</option>
                    </select>
                  </div>

                  {/* Description text with minimum character requirements */}
                  <div>
                    <label className="font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide">
                      Details / Problem Description
                    </label>
                    <textarea
                      placeholder="Describe the issue in detail (minimum 30 characters)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-btn border border-border bg-white px-4 py-3 font-mono text-[13px] text-body focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 resize-y"
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px] font-mono select-none">
                      <span className={description.length >= 30 ? 'text-teal font-bold' : 'text-slate'}>
                        {description.length >= 30 ? '✓ Requirements met' : `Min 30 characters required`}
                      </span>
                      <span className={description.length >= 30 ? 'text-teal font-bold' : 'text-slate'}>
                        {description.length} / 30
                      </span>
                    </div>
                  </div>

                  {/* Photos upload box */}
                  <div>
                    <label className="font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide">
                      Job Photos (Optional, max 3)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-card p-6 text-center hover:border-teal transition-colors flex flex-col items-center">
                      <button 
                        type="button"
                        onClick={handleSimulatePhotoUpload}
                        className="px-4 py-2 border border-border text-slate font-display font-semibold text-[13px] rounded-btn hover:bg-lgray hover:text-navy flex items-center gap-1.5 focus:outline-none active:scale-95 transition-transform"
                      >
                        <Plus size={16} /> Add Photo
                      </button>
                      <span className="font-mono text-[10px] text-slate mt-2">
                        Upload raw JPG/PNG from your mobile camera.
                      </span>
                    </div>

                    {/* Previews grid */}
                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {uploadedPhotos.map((url, idx) => (
                          <div key={idx} className="relative h-20 rounded-btn border border-border overflow-hidden">
                            <img src={url} alt="job spec preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full focus:outline-none hover:bg-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Urgency toggle */}
                  <div className="p-4 bg-lgray/30 rounded-card border border-border">
                    <label className="flex items-center justify-between cursor-pointer w-full">
                      <div className="leading-tight">
                        <span className="font-display font-bold text-[14px] text-navy block">This is an urgent job</span>
                        <span className="font-mono text-[11px] text-slate">Adds +30% surcharge emergency fee</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={() => setIsUrgent(!isUrgent)}
                        className="h-5 w-5 text-orange focus:ring-orange rounded-btn border-border cursor-pointer"
                      />
                    </label>
                    
                    {isUrgent && (
                      <div className="mt-3 p-3 bg-amber/10 border border-amber/20 rounded text-[12px] font-body text-amber-dark leading-normal animate-fade-in">
                        🔥 **Emergency priority:** Emeka is notified to drop current queues and head directly to your address. The 30% surcharge is added to your payment.
                      </div>
                    )}
                  </div>

                  {/* Location Address */}
                  <div>
                    <label className="font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide">
                      Service Address in Lagos
                    </label>
                    <select
                      value={address.split(';')[0]}
                      onChange={(e) => setAddress(e.target.value ? `${e.target.value}; Surulere, Lagos` : '')}
                      className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                    >
                      <option value="">-- Select LGA area --</option>
                      {LAGOS_LGAS.map((lga) => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                    <Input
                      label="Street Address / Flat details"
                      placeholder="e.g. 15, Bode Thomas Street, Flat 2B"
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      className="mt-3"
                    />
                  </div>

                  {/* Actions */}
                  <div className="border-t border-border pt-4 flex justify-end">
                    <Button
                      variant="primary"
                      disabled={!isDetailsValid}
                      onClick={() => setCurrentStep(1)}
                      className="w-full sm:w-auto"
                    >
                      Continue to schedule
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP B: SCHEDULING CALENDAR */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-5">
                  <div className="border-b border-border pb-2 flex items-center gap-2">
                    <button onClick={() => setCurrentStep(0)} className="p-1 hover:bg-lgray rounded-btn text-slate">
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h2 className="text-h2 text-navy">Schedule appointment</h2>
                      <p className="font-body text-[14px] text-slate mt-0.5">Select a suitable date and hour for dispatch.</p>
                    </div>
                  </div>

                  {/* Priority Flexible Shortcut */}
                  <button
                    onClick={() => {
                      setIsFlexible(!isFlexible)
                      if (!isFlexible) {
                        setSelectedDate('')
                        setSelectedTime('')
                      }
                    }}
                    className={`p-4 border rounded-card text-left transition-all duration-200 focus:outline-none w-full
                      ${isFlexible 
                        ? 'border-teal bg-teal/5 ring-2 ring-teal/10' 
                        : 'border-border hover:border-slate hover:bg-lgray/5'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-bold text-[14px] text-navy">⚡ Flexible — any time today or tomorrow</h4>
                        <p className="font-body text-[12px] text-slate mt-1 max-w-[280px]">
                          (Priority Matching) seen by more artisans in Lagos. Best if you need standard fixes today.
                        </p>
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5
                        ${isFlexible ? 'border-teal bg-teal text-white text-[9px] font-bold' : 'border-border bg-white'}`}>
                        {isFlexible && '✓'}
                      </span>
                    </div>
                  </button>

                  {/* Manual date grid selection */}
                  {!isFlexible && (
                    <div className="flex flex-col gap-4 animate-fade-in">
                      <div>
                        <label className="font-mono text-[12px] font-semibold text-slate mb-2.5 block uppercase tracking-wide">
                          Select Date
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {calendarDates.map((d) => (
                            <button
                              key={d.dateString}
                              type="button"
                              disabled={!d.isAvailable}
                              onClick={() => setSelectedDate(d.dateString)}
                              className={`p-2.5 rounded-btn border font-mono text-[12px] text-center transition-all focus:outline-none
                                ${!d.isAvailable ? 'bg-lgray text-slate/40 border-border cursor-not-allowed' : ''}
                                ${selectedDate === d.dateString 
                                  ? 'border-teal bg-teal text-white font-bold' 
                                  : d.isAvailable ? 'border-border bg-white text-navy hover:border-teal hover:text-teal' : ''
                                }`}
                            >
                              {d.label}
                              {!d.isAvailable && <span className="block text-[8px] opacity-75 mt-0.5">(Fully Booked)</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time slot grids */}
                      {selectedDate && (
                        <div className="animate-fade-in mt-2">
                          <label className="font-mono text-[12px] font-semibold text-slate mb-2.5 block uppercase tracking-wide">
                            Select Arrival Time Slot
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={`px-2 py-2.5 rounded-btn border font-mono text-[11px] text-center transition-all focus:outline-none
                                  ${selectedTime === slot 
                                    ? 'border-teal bg-teal text-white font-bold' 
                                    : 'border-border bg-white text-navy hover:border-teal hover:text-teal'
                                  }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-border pt-4 flex justify-between gap-4">
                    <Button variant="secondary" onClick={() => setCurrentStep(0)}>
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!isScheduleValid}
                      onClick={handleProceedToPayment}
                    >
                      Review & pay
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP C: REVIEW & PAY */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="border-b border-border pb-2 flex items-center gap-2">
                    <button onClick={() => setCurrentStep(1)} className="p-1 hover:bg-lgray rounded-btn text-slate">
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h2 className="text-h2 text-navy">Review & Pay Escrow</h2>
                      <p className="font-body text-[14px] text-slate mt-0.5">Authorization and escrow locking.</p>
                    </div>
                  </div>

                  {/* Job specifications summary check */}
                  <div className="border border-border rounded-card p-4 bg-lgray/20 flex flex-col gap-2 font-body text-[13px] text-slate leading-relaxed">
                    <h4 className="font-display font-bold text-navy text-[14px] mb-1">Appointment Summary:</h4>
                    <p>• **Service:** {jobCategory}</p>
                    <p>• **Description:** "{description.slice(0, 80)}..."</p>
                    <p>• **Schedule:** {isFlexible ? 'Flexible (Today/Tomorrow)' : `${selectedDate} at ${selectedTime}`}</p>
                    <p>• **Address:** {address} {addressDetails ? `(${addressDetails})` : ''}</p>
                  </div>

                  {/* Price Ledger */}
                  <div>
                    <h4 className="font-display font-bold text-navy text-[14px] mb-2">Price Details:</h4>
                    <div className="border border-border rounded-card overflow-hidden">
                      <table className="w-full text-[13px] font-mono leading-normal">
                        <tbody>
                          <tr className="border-b border-border">
                            <td className="p-3 text-slate text-left">Service estimate</td>
                            <td className="p-3 text-navy text-right font-bold">₦{basePrice.toLocaleString()}</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="p-3 text-slate text-left">Platform booking fee</td>
                            <td className="p-3 text-navy text-right font-bold">₦{fee.toLocaleString()}</td>
                          </tr>
                          {isUrgent && (
                            <tr className="border-b border-border">
                              <td className="p-3 text-slate text-left">Urgent emergency surcharge (+30%)</td>
                              <td className="p-3 text-orange text-right font-bold">₦{premium.toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="bg-lgray/50 font-bold">
                            <td className="p-3 text-navy text-left text-[14px]">Total Escrow Payment</td>
                            <td className="p-3 text-navy text-right text-[15px]">₦{totalPrice.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Tabs Selection */}
                  <div>
                    <h4 className="font-display font-bold text-navy text-[14px] mb-2.5">Select Payment Method:</h4>
                    <div className="flex border-b border-border select-none">
                      {[
                        { id: 'card', label: 'Debit Card', icon: CreditCard },
                        { id: 'transfer', label: 'Bank Transfer', icon: Building },
                        { id: 'ussd', label: 'USSD Code', icon: Hash },
                        { id: 'wallet', label: 'Wallet Balance', icon: Wallet }
                      ].map((t) => {
                        const Icon = t.icon
                        const isSel = paymentTab === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPaymentTab(t.id as any)}
                            className={`flex-1 pb-3 text-center border-b-2 text-[12px] font-display font-bold flex items-center justify-center gap-1.5 focus:outline-none transition-colors
                              ${isSel ? 'border-orange text-orange font-bold' : 'border-transparent text-slate hover:text-navy'}`}
                          >
                            <Icon size={14} />
                            <span className="hidden sm:inline">{t.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-5 p-4 bg-lgray/25 border border-border rounded-card">
                      
                      {/* Debit Card (Mock Paystack panel) */}
                      {paymentTab === 'card' && (
                        <div className="flex flex-col gap-3.5 animate-fade-in">
                          <Input
                            label="Card Number"
                            placeholder="4012 3456 7890 1234"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="Expiry Date"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                            />
                            <Input
                              label="CVV"
                              type="password"
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            />
                          </div>
                          <p className="font-mono text-[10px] text-slate text-center mt-1 select-none">
                            🔒 Secured by Paystack and NexPlumb Escrow.
                          </p>
                        </div>
                      )}

                      {/* Bank Transfer */}
                      {paymentTab === 'transfer' && (
                        <div className="flex flex-col gap-3 animate-fade-in font-mono text-[12px] text-navy">
                          <div className="bg-white p-4 rounded border border-border text-center leading-loose">
                            <p className="text-slate">Transfer the exact total to Nexplumb Vault Account:</p>
                            <p className="font-bold text-[18px] text-navy mt-1 select-all">0123456789</p>
                            <p className="font-semibold">Access Bank PLC</p>
                            <p className="text-slate text-[11px] mt-1.5">Reference: <span className="font-bold text-navy select-all">NX-2026-MOCKREF</span></p>
                          </div>
                          
                          <div className="flex flex-col items-center mt-2.5">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => {
                                setPollingStatus('confirmed')
                                handleProcessPayment()
                              }}
                            >
                              I have completed the transfer
                            </Button>
                            <span className="text-[10px] text-slate animate-pulse mt-2 select-none">
                              ⏳ Waiting for bank network authorization signal...
                            </span>
                          </div>
                        </div>
                      )}

                      {/* USSD Codes */}
                      {paymentTab === 'ussd' && (
                        <div className="flex flex-col gap-2 animate-fade-in font-mono text-[12px] text-navy">
                          <p className="text-slate text-center mb-2">Dial your bank USSD code on registered line:</p>
                          <div className="flex flex-col gap-2">
                            <p className="p-2.5 bg-white rounded border border-border flex justify-between font-bold">
                              <span>GTBank:</span> <span>*737*1*9*0123#</span>
                            </p>
                            <p className="p-2.5 bg-white rounded border border-border flex justify-between font-bold">
                              <span>Zenith:</span> <span>*966*3*0123#</span>
                            </p>
                            <p className="p-2.5 bg-white rounded border border-border flex justify-between font-bold">
                              <span>UBA:</span> <span>*919*10*0123#</span>
                            </p>
                          </div>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="mt-4"
                            onClick={() => handleProcessPayment()}
                          >
                            Verify USSD Payment
                          </Button>
                        </div>
                      )}

                      {/* Wallet Balance */}
                      {paymentTab === 'wallet' && (
                        <div className="flex flex-col gap-2.5 animate-fade-in font-mono text-[12px] text-navy text-center p-3">
                          <p className="text-slate">Your NexPlumb secure balance:</p>
                          <p className="font-bold text-[22px] text-teal">₦20,000</p>
                          <p className="text-slate text-[11px]">Deducting ₦{totalPrice.toLocaleString()} total fee.</p>
                          
                          <Button 
                            variant="primary" 
                            size="sm"
                            className="mt-3 w-full"
                            onClick={handleProcessPayment}
                          >
                            Authorize Wallet Deduction
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment checkout primary button */}
                  {paymentTab === 'card' && (
                    <div className="mt-4 flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleProcessPayment}
                        loading={isPaying}
                        className="w-full text-[15px]"
                      >
                        Confirm & Pay ₦{totalPrice.toLocaleString()}
                      </Button>
                      <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                        Back
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP D: CONFIRMED TICKET */}
              {currentStep === 3 && (
                <div className="flex flex-col items-center text-center p-4 animate-fade-in">
                  <div className="w-14 h-14 bg-teal/15 rounded-full flex items-center justify-center text-teal mb-4 select-none">
                    <CheckCircle size={36} />
                  </div>
                  
                  <h1 className="text-h1 text-teal">Booking confirmed!</h1>
                  <p className="font-body text-[14px] text-slate mt-2 max-w-xs leading-normal">
                    Payment is secured in escrow. Emeka has been notified of your appointment request.
                  </p>

                  {/* Reference card */}
                  <div className="w-full bg-lgray rounded border border-border p-3.5 mt-6 flex justify-between items-center max-w-xs select-none">
                    <div className="text-left font-mono text-navy font-bold leading-none">
                      <span className="text-[10px] text-slate block mb-1">Booking Ref</span>
                      <span className="text-[16px]">{generatedRef || 'NX-2026-00847'}</span>
                    </div>
                    <button
                      onClick={handleCopyRef}
                      className="p-2 hover:bg-white text-slate hover:text-navy rounded transition-colors focus:outline-none"
                      title="Copy Reference"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  {/* Quick details */}
                  <div className="w-full border border-border rounded-card p-4 mt-6 text-left flex gap-3 max-w-sm">
                    <img
                      src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={artisan.name}
                      className="w-11 h-11 rounded-full object-cover border"
                    />
                    <div className="font-mono text-[12px] text-slate leading-tight flex-1">
                      <p className="font-display font-bold text-navy text-[13px]">{artisan.name}</p>
                      <p className="mt-1">{artisan.trade}</p>
                      <p className="mt-1 text-teal font-semibold">
                        {isFlexible ? 'Flexible Schedule' : `${selectedDate} at ${selectedTime}`}
                      </p>
                    </div>
                  </div>

                  {/* Confirmation navigation CTAs */}
                  <div className="w-full flex flex-col gap-2 mt-8 select-none max-w-sm">
                    <Link href={`/dashboard`} className="w-full">
                      <Button variant="primary" size="md" className="w-full">
                        Track your artisan
                      </Button>
                    </Link>
                    <Link href="/" className="w-full">
                      <Button variant="secondary" size="md" className="w-full text-center">
                        Return to home page
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
