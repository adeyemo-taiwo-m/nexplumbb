'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ShieldCheck, Lock, Star, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Button from '@/components/ui/Button'
import OtpInput from '@/components/ui/OtpInput'
import Logo from '@/components/ui/Logo'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import { toast } from 'sonner'
import { normalizePhone } from '@/lib/validation'

const signUpSchema = z.object({
  firstName: z.string().min(2, 'Enter your first name (minimum 2 characters)'),
  phone: z.string()
    .regex(/^(0[7-9][01]\d{8}|(\+234)[7-9][01]\d{8})$/, 'Enter a valid Nigerian phone number (e.g. 08012345678)'),
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

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function CustomerSignUp() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const { addCustomer, customers } = useMockDb()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0) // 0-3
  
  // Registration flow states
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [registeredPhone, setRegisteredPhone] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [isVerifying, setIsVerifying] = useState(false)
  const [registeredData, setRegisteredData] = useState<SignUpFormValues | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  })

  const passwordVal = watch('password')

  // Password strength calculation
  useEffect(() => {
    if (!passwordVal) {
      setPasswordStrength(0)
      return
    }
    let strength = 0
    if (passwordVal.length >= 8) strength++
    if (/[A-Z]/.test(passwordVal)) strength++
    if (/[0-9]/.test(passwordVal)) strength++
    setPasswordStrength(strength)
  }, [passwordVal])

  // Resend code countdown
  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [step, resendTimer])

  const onSubmitForm = async (data: SignUpFormValues) => {
    // Check if phone number is already registered in mockDb
    const formattedPhone = normalizePhone(data.phone)
    const exists = customers.some(c => c.phone === formattedPhone)
    
    if (exists) {
      toast.error('Phone number already exists. Please login instead.')
      return
    }

    setRegisteredPhone(formattedPhone)
    setRegisteredData(data)
    
    // Simulate sending SMS
    toast.success('verification SMS sent! Use code 123456 to verify.')
    setStep('otp')
    setResendTimer(60)
  }

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      setOtpError('Enter the complete 6-digit code')
      return
    }

    setIsVerifying(true)
    setOtpError('')

    // Mock API delay
    setTimeout(() => {
      if (otpValue === '123456') {
        toast.success('Account verified successfully!')
        
        // Save to mock database
        if (registeredData) {
          addCustomer({
            id: `cust_${Date.now()}`,
            name: `${registeredData.firstName} User`,
            phone: registeredPhone,
            email: `${registeredData.firstName.toLowerCase()}@nexplumb.com`
          })

          // Save session
          setUser({
            id: `cust_${Date.now()}`,
            type: 'customer',
            firstName: registeredData.firstName,
            name: `${registeredData.firstName} User`,
            phone: registeredPhone,
            isVerified: true
          })
          setToken('mock-jwt-token')
        }

        router.push('/dashboard')
      } else {
        setOtpError('Incorrect verification code. Try "123456"')
        setIsVerifying(false)
      }
    }, 1200)
  }

  const handleResendOtp = () => {
    setResendTimer(60)
    setOtpValue('')
    setOtpError('')
    toast.success('SMS code resent! Use code "123456"')
  }

  return (
    <div className="w-full flex-grow flex min-h-[calc(100vh-64px)] select-none">
      
      {/* LEFT PANEL: TRUST COLLATERAL */}
      <div className="hidden md:flex md:w-[45%] relative bg-navy text-white flex-col justify-between p-12 overflow-hidden border-r border-white/10">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal/20 via-navy to-orange/20 mix-blend-multiply opacity-80" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-teal/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-orange/20 rounded-full blur-[120px]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <Logo size={28} variant="light" showText={true} />
            <h2 className="font-display font-bold text-[32px] text-white leading-tight mt-20 max-w-[340px]">
              Join thousands of Lagos residents who book trusted artisans securely.
            </h2>
          </div>

          <div className="flex flex-col gap-8 my-12">
            <div className="flex gap-5 items-start">
              <span className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-teal border border-white/20 shadow-lg">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-display font-bold text-[16px] text-white leading-none tracking-wide">NIN-Verified Artisans Only</p>
                <p className="font-body text-[14px] text-white/70 mt-2 max-w-[260px] leading-relaxed">
                  Every plumber, electrician, and carpenter is identity-vetted for your safety.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <span className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-orange border border-white/20 shadow-lg">
                <Lock size={24} strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-display font-bold text-[16px] text-white leading-none tracking-wide">Escrow-Protected Payments</p>
                <p className="font-body text-[14px] text-white/70 mt-2 max-w-[260px] leading-relaxed">
                  Artisans get paid ONLY after you confirm the job is 100% complete.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <span className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-amber border border-white/20 shadow-lg">
                <Star size={24} strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-display font-bold text-[16px] text-white leading-none tracking-wide">4.8/5 Average Rating</p>
                <p className="font-body text-[14px] text-white/70 mt-2 max-w-[260px] leading-relaxed">
                  Based on real, verified reviews from completed Lagos bookings.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[12px] font-mono text-white/50 tracking-wider">
            🔒 Secure and encrypted • NexPlumb © 2026
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: SIGN UP FORM (60%) */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 tablet:p-12">
        <div className="w-full max-w-[440px] flex flex-col justify-center">
          
          {step === 'form' ? (
            <>
              <div className="mb-6">
                <h1 className="text-h1 text-navy">Create your account</h1>
                <p className="font-body text-[14px] text-slate mt-1.5">
                  Start booking verified artisans with escrow protection.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-4">
                
                {/* First Name */}
                <Input
                  label="First Name"
                  placeholder="e.g. Chisom"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />

                {/* Phone */}
                <PhoneInput
                  label="Phone Number"
                  placeholder="e.g. 08012345678"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                {/* Password */}
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    error={errors.password?.message}
                    suffixIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate hover:text-navy transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    {...register('password')}
                  />
                  
                  {/* Strength Bar */}
                  {passwordVal && (
                    <div className="mt-1.5 flex gap-1 items-center font-mono text-[11px]">
                      <div className="flex-1 flex gap-1 h-1.5">
                        <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-border'}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-amber' : 'bg-border'}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-teal' : 'bg-border'}`} />
                      </div>
                      <span className="text-slate ml-1 shrink-0 font-semibold select-none">
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Moderate'}
                        {passwordStrength >= 3 && 'Strong!'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  error={errors.confirmPassword?.message}
                  suffixIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate hover:text-navy transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  {...register('confirmPassword')}
                />

                {/* Terms checkbox */}
                <div className="flex items-start gap-2.5 mt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 rounded-btn border-border text-teal focus:ring-teal cursor-pointer"
                    {...register('terms')}
                  />
                  <label htmlFor="terms" className="font-body text-[13px] text-body select-none cursor-pointer leading-tight">
                    I agree to NexPlumb\'s{' '}
                    <a href="#" className="text-nxblue hover:underline font-semibold">Terms of Service</a> and{' '}
                    <a href="#" className="text-nxblue hover:underline font-semibold">Privacy Policy</a>.
                  </label>
                </div>
                {errors.terms && (
                  <p className="font-mono text-[11px] text-red-600">
                    {errors.terms.message}
                  </p>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  className="w-full mt-4"
                >
                  Create account
                </Button>
              </form>

              <p className="font-body text-[14px] text-slate mt-6 text-center select-none">
                Already have an account?{' '}
                <Link href="/login" className="text-nxblue hover:underline font-bold">
                  Log in
                </Link>
              </p>
            </>
          ) : (
            // OTP verification step
            <div className="flex flex-col">
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-teal/15 rounded-full flex items-center justify-center text-teal mx-auto mb-4 select-none">
                  <CheckCircle size={28} />
                </div>
                <h1 className="text-h1 text-navy">Verify phone number</h1>
                <p className="font-body text-[14px] text-slate mt-2 px-4 leading-normal">
                  We sent a 6-digit verification code to <span className="font-mono font-bold text-navy">{registeredPhone}</span>.
                </p>
              </div>

              <div className="my-6">
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  error={otpError}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleVerifyOtp}
                loading={isVerifying}
                className="w-full"
              >
                Verify code
              </Button>

              <div className="mt-8 text-center select-none font-mono text-[13px]">
                {resendTimer > 0 ? (
                  <span className="text-slate">
                    Resend code in <span className="font-bold">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-nxblue hover:underline font-bold"
                  >
                    Resend SMS code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
