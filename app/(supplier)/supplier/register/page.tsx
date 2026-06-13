'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Button from '@/components/ui/Button'
import { LAGOS_LGAS, NIGERIAN_BANKS } from '@/lib/validation'
import { 
  Building, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle,
  FileCheck,
  MapPin,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

export default function SupplierRegister() {
  const [step, setStep] = useState(1) // 1: Info, 2: Uploads, 3: Completed

  // State values
  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedLga, setSelectedLga] = useState('Surulere')
  const [materialType, setMaterialType] = useState('plumbing')
  const [bankName, setBankName] = useState('Zenith Bank')
  const [accountNumber, setAccountNumber] = useState('')
  const [cacNumber, setCacNumber] = useState('')

  // Simulated CAC verification
  const [isVerifyingCac, setIsVerifyingCac] = useState(false)
  const [isCacVerified, setIsCacVerified] = useState(false)

  const handleVerifyCac = () => {
    if (!cacNumber.trim()) {
      toast.error('Please enter a valid RC number.')
      return
    }
    setIsVerifyingCac(true)
    setTimeout(() => {
      setIsCacVerified(true)
      setIsVerifyingCac(false)
      toast.success('Corporate Affairs Commission (CAC) match found ✓')
    }, 1500)
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!storeName || !ownerName || !phone) {
        toast.error('Please fill in store name, owner name, and phone number.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!isCacVerified || !accountNumber) {
        toast.error('Please verify CAC records and enter payment account number.')
        return
      }
      setStep(3)
      toast.success('Materials Merchant Application Submitted ✓')
    }
  }

  return (
    <div className="max-w-[640px] mx-auto w-full bg-white rounded-card border border-border p-6 shadow-card select-none text-left animate-fade-in mt-6">
      
      {step < 3 ? (
        <div className="flex flex-col gap-6">
          
          {/* Header */}
          <div className="border-b border-border pb-4 flex justify-between items-center">
            <div>
              <span className="font-mono text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded uppercase">
                Merchant Portal
              </span>
              <h1 className="text-h2 text-navy font-display font-semibold mt-1">Register Material Store</h1>
              <p className="font-body text-[13px] text-slate mt-0.5">
                Supply verified materials to certified NexPlumb artisans and enterprises.
              </p>
            </div>
            
            <span className="font-mono text-[12px] text-slate font-bold">
              Step {step} of 2
            </span>
          </div>

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Input
                label="Registered Store Business Name"
                placeholder="e.g. Alaba Plumbing Materials Ltd"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />

              <Input
                label="Business Representative / Owner Name"
                placeholder="e.g. Obinna Okafor"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />

              <PhoneInput
                label="Store Contact Number"
                placeholder="e.g. 08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Warehouse LGA Location</label>
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
                  <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Main Supply Materials Category</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                  >
                    <option value="plumbing">Plumbing Equipment</option>
                    <option value="electrical">Cables & Electrical Fixtures</option>
                    <option value="tiling">Tiles, Cement & Adhesives</option>
                    <option value="carpentry">Woodwork & Roofing Materials</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-end">
                <Button variant="primary" onClick={handleNextStep} className="w-full sm:w-auto">
                  Next Step: Uploads & Verification <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>

            </div>
          )}

          {/* STEP 2: Compliance & Payout Account */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              
              {/* CAC check */}
              <div className="bg-lgray/50 p-4 border rounded-card flex flex-col gap-4">
                <h3 className="font-display font-bold text-[14px] text-navy flex items-center gap-1">
                  <FileCheck size={18} className="text-teal" />
                  1. Corporate Affairs Commission Registration
                </h3>

                <div className="relative">
                  <Input
                    label="Corporate CAC Registration RC Number"
                    placeholder="e.g. RC-1234567"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    hint={isCacVerified ? '✓ CAC Registration Records Verified' : 'Submit RC number to match CAC database'}
                  />

                  {!isCacVerified && (
                    <button
                      type="button"
                      onClick={handleVerifyCac}
                      disabled={isVerifyingCac}
                      className="absolute right-3 top-8 bg-navy text-white text-[11px] px-2.5 py-1 rounded font-mono font-bold hover:bg-navy/80"
                    >
                      {isVerifyingCac ? 'Verifying...' : 'Match Database'}
                    </button>
                  )}
                </div>
              </div>

              {/* Bank payout setup */}
              <div className="bg-lgray/50 p-4 border rounded-card flex flex-col gap-4">
                <h3 className="font-display font-bold text-[14px] text-navy flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-teal" />
                  2. Settlement Bank Payout Account
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Settlement Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                    >
                      {NIGERIAN_BANKS.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="10-Digit Payout Account Number"
                    placeholder="e.g. 0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </div>

              {/* Nav */}
              <div className="border-t border-border pt-4 flex justify-between gap-4 select-none">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!isCacVerified || accountNumber.length !== 10}>
                  Submit Application
                </Button>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* STEP 3: Completed state */
        <div className="flex flex-col gap-5 items-center text-center animate-fade-in py-6">
          <div className="w-16 h-16 bg-teal/15 rounded-full flex items-center justify-center text-teal mb-2">
            <CheckCircle size={40} />
          </div>

          <h1 className="text-h2 font-display font-bold text-teal">Merchant Account Pending Approval</h1>
          <p className="font-body text-[14px] text-slate leading-relaxed">
            Thank you for registering **{storeName}**. Our verification operators will audit your Corporate Affairs Commission credentials, match your settlement account, and activate your supply dashboard catalog access in 24 hours.
          </p>

          <div className="w-full bg-lgray rounded border p-4 text-left font-mono text-[12px] text-navy mt-4 flex flex-col gap-1.5">
            <p className="font-bold text-teal border-b border-border/50 pb-1 uppercase tracking-wide">Vetting Checklist Status:</p>
            <p>1. Corporate CAC database matched: **Success ✓**</p>
            <p>2. Settlement account validation: **Pending**</p>
            <p>3. Materials catalog permission active: **Pending**</p>
          </div>

          <div className="mt-6 w-full flex flex-col gap-2">
            <Link href="/supplier/dashboard">
              <Button variant="primary" className="w-full">
                Enter Merchant Dashboard (Sandbox)
              </Button>
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}
