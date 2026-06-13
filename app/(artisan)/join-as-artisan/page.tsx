'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import { LAGOS_LGAS, NIGERIAN_BANKS } from '@/lib/validation'
import StarRating from '@/components/ui/StarRating'
import { 
  ShieldCheck, 
  ArrowLeft, 
  Plus, 
  X, 
  Building, 
  Lock, 
  Camera, 
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { useMockDb } from '@/lib/store/mockDb'

export default function ArtisanRegistrationWizard() {
  const router = useRouter()
  const { addArtisan } = useMockDb()

  const [step, setStep] = useState(1) // 1 to 5

  // Form Field State Values (manually tracked to sync right-side preview)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedLga, setSelectedLga] = useState('Surulere')
  const [trade, setTrade] = useState('Plumbing')
  const [experience, setExperience] = useState('1-3 years')
  const [bio, setBio] = useState('Licensed tradesperson serving mainland Lagos. Clean work, prompt response.')
  
  // Step 2: Photo States
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Step 3: Portfolio States
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([])
  
  // Step 4: Financial States
  const [bankName, setBankName] = useState('Access Bank')
  const [accountNum, setAccountNum] = useState('')
  const [bvnVal, setBvnVal] = useState('')
  const [ninVal, setNinVal] = useState('')
  const [isVerifyingNin, setIsVerifyingNin] = useState(false)
  const [isNinVerified, setIsNinVerified] = useState(false)

  // Guarantors
  const [guarName1, setGuarName1] = useState('')
  const [guarPhone1, setGuarPhone1] = useState('')
  const [guarName2, setGuarName2] = useState('')
  const [guarPhone2, setGuarPhone2] = useState('')

  // Verification step thresholds
  const isStep1Valid = fullName.length >= 3 && phone.length >= 10
  const isStep2Valid = profilePhoto !== ''
  const isStep3Valid = true // optional but encouraged
  const isStep4Valid = bankName && accountNum.length === 10 && bvnVal.length === 11 && ninVal.length === 11 && guarName1 && guarPhone1

  // Handle NIN Verification Simulation
  const handleVerifyNin = () => {
    if (ninVal.length !== 11) {
      toast.error('NIN must be exactly 11 digits.')
      return
    }
    setIsVerifyingNin(true)
    setTimeout(() => {
      setIsNinVerified(true)
      setIsVerifyingNin(false)
      toast.success('NIMC Database matched. NIN verified ✓')
    }, 1800)
  }

  // Camera Simulation
  const handleSimulateSnapshot = () => {
    setIsCameraActive(true)
    setTimeout(() => {
      setCapturedImage('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200')
      setProfilePhoto('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200')
      setIsCameraActive(false)
      toast.success('Webcam snapshot captured successfully!')
    }, 1500)
  }

  // Portfolio photo upload
  const handleAddPortfolio = () => {
    if (portfolioPhotos.length >= 5) {
      toast.error('Maximum 5 portfolio photos for registration.')
      return
    }
    const sampleUrls = [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300'
    ]
    const nextPhoto = sampleUrls[portfolioPhotos.length % sampleUrls.length]
    setPortfolioPhotos([...portfolioPhotos, nextPhoto])
    toast.success('Portfolio item uploaded.')
  }

  const handleRemovePortfolio = (idx: number) => {
    setPortfolioPhotos(portfolioPhotos.filter((_, i) => i !== idx))
  }

  const handleCompleteRegistration = () => {
    // Add artisan to mockDb
    addArtisan({
      name: fullName,
      phone,
      email: `${fullName.toLowerCase().replace(/[^a-z]+/g, '')}@nexplumb.com`,
      trade,
      area: selectedLga,
      lat: 6.5022,
      lng: 3.3582,
      priceMin: 8000,
      priceMax: 15000,
      badges: ['id_verified'],
      isAvailable: true,
      isOnline: true,
      bio,
      skills: [trade, 'Repair work', 'Troubleshooting'],
      portfolio: portfolioPhotos.map(url => ({ url, caption: 'Recent project' })),
      experience,
      bankName,
      accountNumber: accountNum,
      bvn: bvnVal,
      nin: ninVal
    })

    setStep(5) // show success screen
  }

  return (
    <div className="w-full min-h-screen bg-lgray flex flex-col select-none">
      
      {/* Header */}
      <header className="h-16 bg-navy text-white px-6 tablet:px-10 flex items-center justify-between border-b border-white/5 select-none">
        <Link href="/" className="font-display font-bold text-[20px]">
          Nex<span className="text-orange">Plumb</span> <span className="text-[11px] font-mono text-slate bg-white/10 px-1.5 py-0.5 rounded ml-1 uppercase">Vetting Portal</span>
        </Link>
        <span className="font-mono text-[12px] text-white/70">
          WhatsApp fallback helper: <a href="https://wa.me/2348080908908" target="_blank" className="text-orange underline">08080908908</a>
        </span>
      </header>

      {/* Main Form content split */}
      <div className="flex-1 max-w-[1200px] mx-auto w-full p-6 tablet:p-10 grid grid-cols-1 desktop:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: WIZARD FORM (60% or 7 cols) */}
        {step < 5 ? (
          <main className="desktop:col-span-7 bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-6">
            
            {/* Header / Step Progress */}
            <div className="border-b border-border pb-4 flex justify-between items-center select-none">
              <div>
                <span className="font-mono text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded uppercase">
                  Step {step} of 4
                </span>
                <h1 className="text-h2 text-navy mt-1.5">
                  {step === 1 && 'Personal Information'}
                  {step === 2 && 'Upload Profile Photo'}
                  {step === 3 && 'Portfolio Showcase'}
                  {step === 4 && 'Identity & Banking setup'}
                </h1>
              </div>
              
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="font-mono text-[12px] text-slate hover:text-navy font-bold flex items-center gap-1 focus:outline-none"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Chukwuemeka Okonkwo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                
                <PhoneInput
                  label="Registered Phone Number"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Primary LGA Coverage</label>
                    <select
                      value={selectedLga}
                      onChange={(e) => setSelectedLga(e.target.value)}
                      className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                    >
                      {LAGOS_LGAS.map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Trade Category</label>
                    <select
                      value={trade}
                      onChange={(e) => setTrade(e.target.value)}
                      className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Painting">Painting</option>
                      <option value="Tiling">Tiling</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Years of Experience</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                    >
                      <option value="<1 year">Less than 1 year</option>
                      <option value="1-3 years">1 - 3 years</option>
                      <option value="3-5 years">3 - 5 years</option>
                      <option value="5-10 years">5 - 10 years</option>
                      <option value="10+ years">More than 10 years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Short Public Bio (Describe your service)</label>
                  <textarea
                    placeholder="Write details about your training and what makes you reliable..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-btn border border-border bg-white px-4 py-3 font-mono text-[13px] focus:outline-none focus:border-teal resize-y"
                  />
                </div>

                <div className="border-t border-border pt-4 flex justify-end">
                  <Button
                    variant="primary"
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto"
                  >
                    Continue <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: PROFILE PHOTO */}
            {step === 2 && (
              <div className="flex flex-col gap-5 items-center text-center">
                <p className="font-body text-[14px] text-slate leading-relaxed">
                  A professional profile photo increases booking response by 3×. Face must be clear with good lighting.
                </p>

                {/* Simulated webcam output viewport */}
                <div className="w-44 h-44 rounded-full border-4 border-dashed border-border bg-lgray relative overflow-hidden flex items-center justify-center shadow-card select-none">
                  {isCameraActive ? (
                    <div className="absolute inset-0 bg-navy/20 flex flex-col items-center justify-center">
                      <span className="w-8 h-8 border-4 border-t-teal border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                      <span className="font-mono text-[9px] text-navy font-bold mt-2">Adjusting lens...</span>
                    </div>
                  ) : (
                    <img src={profilePhoto} alt="artisan placeholder" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex gap-3 mt-2 select-none">
                  <button
                    onClick={handleSimulateSnapshot}
                    className="h-10 border border-border hover:border-slate px-4 rounded-btn font-display font-bold text-[13px] text-navy flex items-center gap-1.5 focus:outline-none"
                  >
                    <Camera size={16} /> Take Selfie Snapshot
                  </button>
                  
                  <label className="h-10 bg-lgray border border-border px-4 rounded-btn font-display font-bold text-[13px] text-slate hover:text-navy cursor-pointer flex items-center justify-center">
                    Upload file
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={() => toast.success('Mock photo selected!')}
                    />
                  </label>
                </div>

                <div className="w-full border-t border-border pt-4 flex justify-between gap-4 mt-4 select-none">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!isStep2Valid}
                    onClick={() => setStep(3)}
                  >
                    Continue <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PORTFOLIO SHOWCASE */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="bg-teal/5 border border-teal/10 rounded-card p-4 leading-relaxed font-body text-[13px] text-slate-dark select-none mb-2 flex gap-3">
                  <Award className="text-teal shrink-0 mt-0.5" size={20} />
                  <p>
                    **Portfolio Proofs:** Showcase your previous completed projects. High quality pictures prove experience to potential customers.
                  </p>
                </div>

                <div className="border-2 border-dashed border-border rounded-card p-8 text-center flex flex-col items-center justify-center">
                  <Button variant="secondary" size="sm" onClick={handleAddPortfolio}>
                    + Add completed job photo
                  </Button>
                  <span className="font-mono text-[10px] text-slate mt-2 select-none">Max 5 photos allowed.</span>
                </div>

                {/* portfolio preview row */}
                {portfolioPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {portfolioPhotos.map((url, idx) => (
                      <div key={idx} className="relative h-24 rounded-card border overflow-hidden">
                        <img src={url} alt="portfolio file" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePortfolio(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full focus:outline-none"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-4 flex justify-between gap-4 mt-4 select-none">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setStep(4)}
                  >
                    Continue <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: IDENTITY & BANKING */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                
                {/* Bank account details */}
                <div>
                  <h3 className="font-display font-bold text-[14px] text-navy mb-3">1. Payout Bank Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Select Bank</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBvnVal(e.target.value)}
                        className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                      >
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="10-Digit Account Number"
                      placeholder="e.g. 0123456789"
                      value={accountNum}
                      onChange={(e) => setAccountNum(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </div>

                {/* BVN and NIN fields */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-display font-bold text-[14px] text-navy mb-3">2. Identity Verification (NIN & BVN)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        label="National Identification Number (NIN)"
                        placeholder="11 digits"
                        value={ninVal}
                        onChange={(e) => setNinVal(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        hint={isNinVerified ? '✓ Identity Verified NIMC' : 'Click check to verify NIN database'}
                      />
                      
                      {ninVal.length === 11 && !isNinVerified && (
                        <button
                          type="button"
                          onClick={handleVerifyNin}
                          disabled={isVerifyingNin}
                          className="absolute right-3 top-8 bg-nxblue text-white text-[11px] px-2.5 py-1 rounded font-mono font-bold hover:bg-nxblue-dark focus:outline-none"
                        >
                          {isVerifyingNin ? 'Checking...' : 'Check'}
                        </button>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Bank Verification Number (BVN)"
                        placeholder="11 digits"
                        value={bvnVal}
                        onChange={(e) => setBvnVal(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        hint="Protected by CBN security encryption."
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                {/* Guarantors */}
                <div className="border-t border-border pt-4">
                  <div className="mb-3">
                    <h3 className="font-display font-bold text-[14px] text-navy">3. Character Guarantor Reference</h3>
                    <p className="font-body text-[12px] text-slate mt-0.5">
                      Guarantors will only be contacted in the event of unresolved escrow disputes.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Guarantor Name"
                      placeholder="e.g. Chief Alao"
                      value={guarName1}
                      onChange={(e) => setGuarName1(e.target.value)}
                    />
                    <PhoneInput
                      label="Guarantor Phone"
                      placeholder="e.g. 08031234567"
                      value={guarPhone1}
                      onChange={(e) => setGuarPhone1(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between gap-4 select-none">
                  <Button variant="secondary" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!isStep4Valid}
                    onClick={handleCompleteRegistration}
                  >
                    Submit Vetting Profile
                  </Button>
                </div>
              </div>
            )}

          </main>
        ) : (
          /* STEP 5: REGISTRATION COMPLETE SUCCESS */
          <main className="desktop:col-span-12 max-w-[500px] mx-auto bg-white rounded-card border border-border p-8 shadow-card text-center animate-fade-in">
            <div className="w-14 h-14 bg-teal/15 rounded-full flex items-center justify-center text-teal mx-auto mb-4 select-none animate-pulse">
              <ShieldCheck size={36} />
            </div>

            <h1 className="text-h1 text-teal">Application submitted!</h1>
            <p className="font-body text-[14px] text-slate mt-2 leading-relaxed">
              Congratulations {fullName}. Our vetting operators will review your credentials, verify your NIN identity check, and activate your profile within 24 hours.
            </p>

            <div className="w-full bg-lgray rounded border border-border p-4 mt-6 text-left leading-normal font-mono text-[12px] text-navy">
              <p className="font-bold border-b border-border/50 pb-1.5 uppercase tracking-wide text-teal">Next Steps Checklist:</p>
              <p className="mt-2">1. Identity Verification Queue: **Pending**</p>
              <p className="mt-1">2. Character Reference call: **Pending**</p>
              <p className="mt-1">3. Status SMS Activation alert: **Pending**</p>
            </div>

            <div className="flex flex-col gap-2 mt-8 select-none">
              <Link href="/">
                <Button variant="primary" size="md" className="w-full">
                  Return to home page
                </Button>
              </Link>
            </div>
          </main>
        )}

        {/* RIGHT COLUMN: STICKY PROFILE PREVIEW (40% or 5 cols) */}
        {step < 5 && (
          <aside className="desktop:col-span-5 bg-white rounded-card border border-border p-5 shadow-card sticky top-[80px] self-start flex flex-col gap-4">
            <div className="border-b border-border pb-2 flex justify-between items-center select-none">
              <span className="font-mono text-[10px] font-bold text-slate uppercase">Live Public Preview</span>
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            </div>

            {/* Profile mockup */}
            <div className="flex flex-col items-center text-center p-3">
              <img
                src={profilePhoto}
                alt="artisan profile preview"
                className="w-20 h-20 rounded-full object-cover border bg-lgray"
              />
              <h3 className="font-display font-bold text-navy text-[16px] mt-3">{fullName || 'Your Name'}</h3>
              <p className="font-mono text-[11px] text-slate mt-1">{trade} Professional · {selectedLga}</p>
              <div className="mt-1.5 select-none">
                <StarRating rating={5.0} reviewCount={0} />
              </div>
            </div>

            <div className="bg-lgray/30 p-3.5 rounded border border-border text-[12px] font-mono leading-relaxed text-slate">
              <p className="font-bold text-navy mb-1 uppercase text-[10px]">Public Bio:</p>
              <p className="font-body italic font-normal">"{bio}"</p>
              <p className="mt-3 font-bold text-navy uppercase text-[10px]">Experience Level:</p>
              <p>{experience}</p>
            </div>

            {portfolioPhotos.length > 0 && (
              <div>
                <p className="font-mono text-[10px] font-bold text-slate uppercase mb-2">Portfolio showcase ({portfolioPhotos.length}):</p>
                <div className="grid grid-cols-4 gap-2 select-none">
                  {portfolioPhotos.map((url, idx) => (
                    <img key={idx} src={url} alt="sample work" className="h-10 w-full object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

      </div>
    </div>
  )
}
