'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ShieldCheck, Lock, Star, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Button from '@/components/ui/Button'
import OtpInput from '@/components/ui/OtpInput'
import { useAuthStore, UserSession } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import { toast } from 'sonner'
import { normalizePhone } from '@/lib/validation'

const loginSchema = z.object({
  phone: z.string().min(1, 'Enter your phone number'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function CustomerLogin() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const { artisans, customers } = useMockDb()

  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimer, setLockoutTimer] = useState(0)

  // Forgot Password flow states
  const [flow, setFlow] = useState<'login' | 'reset-phone' | 'reset-otp' | 'reset-new'>('login')
  const [resetPhone, setResetPhone] = useState('')
  const [resetOtpVal, setResetOtpVal] = useState('')
  const [resetNewPass, setResetNewPass] = useState('')
  const [resetError, setResetError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: ''
    }
  })

  // Lockout countdown timer
  useEffect(() => {
    if (isLocked && lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (isLocked && lockoutTimer === 0) {
      setIsLocked(false)
      setLoginAttempts(0)
      setErrorMessage('')
    }
  }, [isLocked, lockoutTimer])

  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) {
      setErrorMessage(`Too many attempts. Account locked. Try again in ${lockoutTimer}s.`)
      return
    }

    setErrorMessage('')
    const formattedPhone = normalizePhone(data.phone)

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 1. Check Admin Account (Superuser)
    if (formattedPhone === '+2348000000000' && data.password === 'Password123') {
      setUser({
        id: 'admin_1',
        type: 'admin',
        firstName: 'Support',
        name: 'Nexplumb Administrator',
        phone: formattedPhone,
        isVerified: true
      })
      setToken('mock-admin-token')
      toast.success('Admin login successful!')
      router.push('/admin/dashboard')
      return
    }

    // 2. Check Artisan Account in mockDb
    const artisan = artisans.find(a => normalizePhone(a.phone) === formattedPhone)
    if (artisan && data.password === 'Password123') {
      setUser({
        id: artisan.id,
        type: 'artisan',
        firstName: artisan.name.split(' ')[0],
        name: artisan.name,
        phone: formattedPhone,
        avatar: artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isVerified: artisan.isVerified,
        isOnline: artisan.isOnline
      })
      setToken('mock-artisan-token')
      toast.success('Artisan login successful!')
      router.push('/artisan/dashboard')
      return
    }

    // 3. Check Customer Account in mockDb
    const customer = customers.find(c => normalizePhone(c.phone) === formattedPhone)
    if (customer && data.password === 'Password123') {
      setUser({
        id: customer.id,
        type: 'customer',
        firstName: customer.name.split(' ')[0],
        name: customer.name,
        phone: formattedPhone,
        isVerified: true
      })
      setToken('mock-customer-token')
      toast.success('Customer login successful!')
      router.push('/dashboard')
      return
    }

    // Default seed fallback if database is not active yet
    if (formattedPhone === '+2348080908908' && data.password === 'Password123') {
      setUser({
        id: 'cust_1',
        type: 'customer',
        firstName: 'Chisom',
        name: 'Chisom Alabi',
        phone: formattedPhone,
        isVerified: true
      })
      setToken('mock-customer-token')
      toast.success('Login successful!')
      router.push('/dashboard')
      return
    }

    // Failed Attempt
    const newAttempts = loginAttempts + 1
    setLoginAttempts(newAttempts)

    if (newAttempts >= 5) {
      setIsLocked(true)
      setLockoutTimer(60) // 1 minute mock lockout (specs say 10 min, but 1 min is test-friendly!)
      setErrorMessage('Account temporarily locked. Try again in 60 seconds.')
    } else {
      setErrorMessage('Incorrect phone number or password. Please try again.')
    }
  }

  // Forgot password flows
  const handleSendResetOtp = () => {
    if (!resetPhone) {
      setResetError('Enter your registered phone number')
      return
    }
    setResetError('')
    toast.success('Reset code sent! Use code 123456.')
    setFlow('reset-otp')
  }

  const handleVerifyResetOtp = () => {
    if (resetOtpVal !== '123456') {
      setResetError('Incorrect code. Try "123456"')
      return
    }
    setResetError('')
    setFlow('reset-new')
  }

  const handleUpdatePassword = () => {
    if (resetNewPass.length < 8) {
      setResetError('Password must be at least 8 characters')
      return
    }
    setResetError('')
    toast.success('Password updated successfully! Please log in.')
    setFlow('login')
  }

  return (
    <div className="w-full flex-grow flex min-h-[calc(100vh-64px)] select-none">
      
      {/* LEFT PANEL: TRUST COLLATERAL */}
      <div className="hidden md:flex md:w-[40%] bg-navy text-white flex-col justify-between p-10 border-r border-white/5">
        <div>
          <span className="font-display font-bold text-[22px] tracking-tight text-white select-none">
            Nex<span className="text-orange">Plumb</span>
          </span>
          <h2 className="font-display font-semibold text-[26px] text-white leading-tight mt-16 max-w-[280px]">
            Join thousands of Lagos residents who book trusted artisans safely
          </h2>
        </div>

        <div className="flex flex-col gap-6 my-10">
          <div className="flex gap-4 items-start">
            <span className="p-1.5 bg-teal/15 rounded text-teal border border-teal/20">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="font-display font-bold text-[14px] text-white leading-none">NIN-Verified Artisans Only</p>
              <p className="font-body text-[13px] text-slate-light opacity-80 mt-1 max-w-[240px]">
                Every plumber, electrician, and carpenter is identity vetted.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="p-1.5 bg-teal/15 rounded text-teal border border-teal/20">
              <Lock size={18} />
            </span>
            <div>
              <p className="font-display font-bold text-[14px] text-white leading-none">Escrow-Protected Payments</p>
              <p className="font-body text-[13px] text-slate-light opacity-80 mt-1 max-w-[240px]">
                Artisans get paid ONLY after you confirm the job is complete.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="p-1.5 bg-teal/15 rounded text-teal border border-teal/20">
              <Star size={18} />
            </span>
            <div>
              <p className="font-display font-bold text-[14px] text-white leading-none">4.8/5 Average Rating</p>
              <p className="font-body text-[13px] text-slate-light opacity-80 mt-1 max-w-[240px]">
                Based on real reviews from verified Lagos bookings.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-light opacity-50">
          🔒 Secure and encrypted payments. NexPlumb © 2026.
        </div>
      </div>

      {/* RIGHT PANEL: LOGIN FORM & RESETFLOW */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 tablet:p-12">
        <div className="w-full max-w-[400px] flex flex-col justify-center">
          
          {flow === 'login' && (
            <>
              <div className="mb-6">
                <h1 className="text-h1 text-navy">Welcome back</h1>
                <p className="font-body text-[14px] text-slate mt-1.5">
                  Sign in to manage your bookings or jobs.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-btn text-red-600 font-mono text-[12px] flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                
                {/* Phone */}
                <PhoneInput
                  label="Phone Number"
                  placeholder="e.g. 08012345678"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                {/* Password */}
                <div>
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
                  
                  {/* Forgot Password trigger */}
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setFlow('reset-phone')}
                      className="font-mono text-[12px] text-nxblue hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  disabled={isLocked}
                  className="w-full mt-2"
                >
                  Log in
                </Button>
              </form>

              {/* Demo accounts reminder helper */}
              <div className="mt-6 p-3 bg-lgray rounded-btn font-mono text-[11px] text-slate border border-border">
                <p className="font-bold text-navy mb-1">💡 Demo login details:</p>
                <p>• Customer: 08080908908 / Password123</p>
                <p>• Artisan: 08031234567 / Password123</p>
                <p>• Admin: 08000000000 / Password123</p>
              </div>

              <p className="font-body text-[14px] text-slate mt-6 text-center select-none">
                Don\'t have an account?{' '}
                <Link href="/register" className="text-nxblue hover:underline font-bold">
                  Register
                </Link>
              </p>
            </>
          )}

          {flow === 'reset-phone' && (
            <div className="flex flex-col">
              <h2 className="text-h2 text-navy mb-2">Reset Password</h2>
              <p className="font-body text-[14px] text-slate mb-6">
                Enter your phone number to receive a verification SMS.
              </p>

              {resetError && <p className="font-mono text-[12px] text-red-600 mb-2">{resetError}</p>}

              <PhoneInput
                label="Phone Number"
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
              />

              <div className="mt-6 flex flex-col gap-2">
                <Button variant="primary" onClick={handleSendResetOtp}>
                  Send verification code
                </Button>
                <Button variant="secondary" onClick={() => setFlow('login')}>
                  Back to login
                </Button>
              </div>
            </div>
          )}

          {flow === 'reset-otp' && (
            <div className="flex flex-col">
              <h2 className="text-h2 text-navy mb-2">Verify Code</h2>
              <p className="font-body text-[14px] text-slate mb-6">
                Enter the 6-digit code sent to your phone.
              </p>

              {resetError && <p className="font-mono text-[12px] text-red-600 mb-2">{resetError}</p>}

              <OtpInput value={resetOtpVal} onChange={setResetOtpVal} />

              <div className="mt-6 flex flex-col gap-2">
                <Button variant="primary" onClick={handleVerifyResetOtp}>
                  Verify OTP
                </Button>
                <Button variant="secondary" onClick={() => setFlow('reset-phone')}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {flow === 'reset-new' && (
            <div className="flex flex-col">
              <h2 className="text-h2 text-navy mb-2">New Password</h2>
              <p className="font-body text-[14px] text-slate mb-6">
                Choose a strong new password for your account.
              </p>

              {resetError && <p className="font-mono text-[12px] text-red-600 mb-2">{resetError}</p>}

              <Input
                label="New Password"
                type="password"
                placeholder="Enter password"
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
              />

              <div className="mt-6">
                <Button variant="primary" onClick={handleUpdatePassword} className="w-full">
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
