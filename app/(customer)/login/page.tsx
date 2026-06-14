'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ShieldCheck,
  Lock,
  Star,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Fingerprint,
  Smartphone,
} from 'lucide-react'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Button from '@/components/ui/Button'
import OtpInput from '@/components/ui/OtpInput'
import Logo from '@/components/ui/Logo'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import { toast } from 'sonner'
import { normalizePhone } from '@/lib/validation'

const loginSchema = z.object({
  phone: z.string().min(1, 'Enter your phone number'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

type FlowStep = 'login' | 'reset-phone' | 'reset-otp' | 'reset-new'

// Trust points shown on the left panel
const trustPoints = [
  {
    icon: ShieldCheck,
    color: 'text-teal',
    bg: 'bg-teal/10 border-teal/20',
    title: 'NIN-Verified Artisans Only',
    desc: 'Every plumber, electrician, and carpenter is identity-vetted for your safety.',
  },
  {
    icon: Lock,
    color: 'text-orange',
    bg: 'bg-orange/10 border-orange/20',
    title: 'Escrow-Protected Payments',
    desc: 'Artisans get paid ONLY after you confirm the job is 100% complete.',
  },
  {
    icon: Star,
    color: 'text-amber',
    bg: 'bg-amber/10 border-amber/20',
    title: '4.8/5 Average Rating',
    desc: 'Based on real, verified reviews from completed Lagos bookings.',
  },
]

// Flow step indicator dots
function FlowDots({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 h-2 bg-orange'
              : i < current
              ? 'w-2 h-2 bg-teal'
              : 'w-2 h-2 bg-border'
          }`}
        />
      ))}
    </div>
  )
}

export default function CustomerLogin() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const { artisans, customers } = useMockDb()

  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTimer, setLockoutTimer] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Reset flow
  const [flow, setFlow] = useState<FlowStep>('login')
  const [resetPhone, setResetPhone] = useState('')
  const [resetOtpVal, setResetOtpVal] = useState('')
  const [resetNewPass, setResetNewPass] = useState('')
  const [resetConfirmPass, setResetConfirmPass] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [resetError, setResetError] = useState('')
  const [otpResendTimer, setOtpResendTimer] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  })

  // Lockout countdown
  useEffect(() => {
    if (isLocked && lockoutTimer > 0) {
      const interval = setInterval(() => setLockoutTimer((p) => p - 1), 1000)
      return () => clearInterval(interval)
    } else if (isLocked && lockoutTimer === 0) {
      setIsLocked(false)
      setLoginAttempts(0)
      setErrorMessage('')
    }
  }, [isLocked, lockoutTimer])

  // OTP resend countdown
  useEffect(() => {
    if (otpResendTimer > 0) {
      const t = setTimeout(() => setOtpResendTimer((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [otpResendTimer])

  const switchFlow = (next: FlowStep) => {
    setIsAnimating(true)
    setTimeout(() => {
      setFlow(next)
      setIsAnimating(false)
    }, 180)
  }

  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) {
      setErrorMessage(`Account locked. Try again in ${Math.ceil(lockoutTimer / 60)}m.`)
      return
    }
    setErrorMessage('')
    const formattedPhone = normalizePhone(data.phone)

    await new Promise((r) => setTimeout(r, 900))

    // Admin
    if (formattedPhone === '+2348000000000' && data.password === 'Password123') {
      setUser({ id: 'admin_1', type: 'admin', firstName: 'Support', name: 'Nexplumb Administrator', phone: formattedPhone, isVerified: true })
      setToken('mock-admin-token')
      toast.success('Admin login successful!')
      router.push('/admin/dashboard')
      return
    }

    // Artisan
    const artisan = artisans.find((a) => normalizePhone(a.phone) === formattedPhone)
    if (artisan && data.password === 'Password123') {
      setUser({ id: artisan.id, type: 'artisan', firstName: artisan.name.split(' ')[0], name: artisan.name, phone: formattedPhone, avatar: artisan.portfolio[0]?.url, isVerified: artisan.isVerified, isOnline: artisan.isOnline })
      setToken('mock-artisan-token')
      toast.success('Welcome back!')
      router.push('/artisan/dashboard')
      return
    }

    // Customer
    const customer = customers.find((c) => normalizePhone(c.phone) === formattedPhone)
    if (customer && data.password === 'Password123') {
      setUser({ id: customer.id, type: 'customer', firstName: customer.name.split(' ')[0], name: customer.name, phone: formattedPhone, isVerified: true })
      setToken('mock-customer-token')
      toast.success('Welcome back!')
      router.push('/dashboard')
      return
    }

    // Seed fallback
    if (formattedPhone === '+2348080908908' && data.password === 'Password123') {
      setUser({ id: 'cust_1', type: 'customer', firstName: 'Chisom', name: 'Chisom Alabi', phone: formattedPhone, isVerified: true })
      setToken('mock-customer-token')
      toast.success('Login successful!')
      router.push('/dashboard')
      return
    }

    // Failed
    const attempts = loginAttempts + 1
    setLoginAttempts(attempts)
    if (attempts >= 5) {
      setIsLocked(true)
      setLockoutTimer(600)
      setErrorMessage('Account temporarily locked. Try again in 10 minutes.')
    } else {
      setErrorMessage('Incorrect phone number or password. Please try again.')
    }
  }

  // Reset flow handlers
  const handleSendResetOtp = () => {
    if (!resetPhone) { setResetError('Enter your registered phone number'); return }
    setResetError('')
    toast.success('Reset code sent! Use code 123456.')
    setOtpResendTimer(60)
    switchFlow('reset-otp')
  }

  const handleVerifyResetOtp = () => {
    if (resetOtpVal !== '123456') { setResetError('Incorrect code. Hint: use 123456'); return }
    setResetError('')
    switchFlow('reset-new')
  }

  const handleUpdatePassword = () => {
    if (resetNewPass.length < 8) { setResetError('Password must be at least 8 characters'); return }
    if (resetNewPass !== resetConfirmPass) { setResetError("Passwords don't match"); return }
    setResetError('')
    setUser({ id: 'cust_1', type: 'customer', firstName: 'Chisom', name: 'Chisom Alabi', phone: resetPhone || '+2348080908908', isVerified: true })
    setToken('mock-customer-token')
    toast.success('Password reset! Logging you in…')
    router.push('/dashboard')
  }

  const handleAutofillDemo = (type: 'customer' | 'artisan' | 'admin') => {
    const creds = { customer: '08080908908', artisan: '08031234567', admin: '08000000000' }
    setValue('phone', creds[type])
    setValue('password', 'Password123')
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} credentials filled!`)
  }

  // Password strength meter
  const newPass = resetNewPass
  const passStrength = newPass.length === 0 ? 0 : newPass.length < 6 ? 1 : newPass.length < 10 ? 2 : /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) ? 4 : 3
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'bg-red-500', 'bg-amber', 'bg-teal/70', 'bg-teal']

  const flowIndex = flow === 'login' ? -1 : flow === 'reset-phone' ? 0 : flow === 'reset-otp' ? 1 : 2

  return (
    <div className="w-full flex-grow flex min-h-[calc(100vh-64px)] select-none">

      {/* ═══ LEFT PANEL — TRUST COLLATERAL ═══ */}
      <div className="hidden md:flex md:w-[42%] relative bg-navy text-white flex-col justify-between p-10 overflow-hidden border-r border-white/10 flex-shrink-0">

        {/* Animated background blobs */}
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-teal/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] bg-orange/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-nxblue/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s' }} />

        {/* Dot grid decorative */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-auto">
            <Logo size={28} variant="light" showText={true} />

            <div className="mt-16">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] font-mono text-white/70 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                1,200+ artisans available in Lagos right now
              </div>
              <h2 className="font-display font-bold text-[30px] text-white leading-tight max-w-[320px]">
                Book trusted artisans in minutes.
              </h2>
              <p className="text-white/60 text-[15px] mt-3 max-w-[300px] leading-relaxed font-body">
                Join thousands of Lagos residents who already book verified tradespeople securely.
              </p>
            </div>
          </div>

          {/* Trust points */}
          <div className="flex flex-col gap-5 my-10">
            {trustPoints.map((tp) => {
              const Icon = tp.icon
              return (
                <div key={tp.title} className={`flex gap-4 items-start p-3.5 rounded-xl border backdrop-blur-sm ${tp.bg}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10`}>
                    <Icon size={20} className={tp.color} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[14px] text-white leading-none">{tp.title}</p>
                    <p className="font-body text-[12px] text-white/60 mt-1.5 leading-relaxed">{tp.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-[11px] font-mono text-white/40 tracking-wider">
            🔒 256-bit encrypted • NexPlumb © 2026
          </p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — FORM ═══ */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 tablet:p-12 overflow-y-auto">
        <div
          className={`w-full max-w-[400px] transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
        >

          {/* ── LOGIN ── */}
          {flow === 'login' && (
            <>
              <div className="mb-8">
                <h1 className="font-display font-bold text-[28px] text-navy leading-tight">
                  Welcome back 👋
                </h1>
                <p className="font-body text-[14px] text-slate mt-1.5">
                  Sign in to manage your bookings or artisan jobs.
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 font-body text-[13px] flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Lockout progress indicator */}
              {isLocked && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex justify-between text-[12px] font-mono text-red-600 mb-2">
                    <span>Account locked</span>
                    <span>{Math.floor(lockoutTimer / 60)}:{String(lockoutTimer % 60).padStart(2, '0')}</span>
                  </div>
                  <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all duration-1000"
                      style={{ width: `${(lockoutTimer / 600) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <PhoneInput
                  label="Phone Number"
                  placeholder="e.g. 08012345678"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => switchFlow('reset-phone')}
                      className="font-mono text-[12px] text-nxblue hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  disabled={isLocked}
                  className="w-full mt-1 h-12 text-[15px]"
                >
                  {isLocked ? `Locked (${Math.ceil(lockoutTimer / 60)}m)` : 'Log in'}
                </Button>
              </form>

              {/* Demo accounts */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="font-mono text-[10px] text-slate font-bold uppercase tracking-widest">Demo accounts</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['customer', 'artisan', 'admin'] as const).map((type) => {
                    const styles = {
                      customer: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100',
                      artisan: 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100',
                      admin: 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100',
                    }
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleAutofillDemo(type)}
                        className={`py-2.5 rounded-xl text-[12px] font-display font-bold border transition-colors focus:outline-none ${styles[type]}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <p className="font-body text-[14px] text-slate mt-8 text-center">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-nxblue hover:underline font-bold">
                  Register free
                </Link>
              </p>
            </>
          )}

          {/* ── RESET: STEP 1 — Phone ── */}
          {flow === 'reset-phone' && (
            <div className="flex flex-col">
              <FlowDots current={0} />
              <div className="w-12 h-12 rounded-2xl bg-nxblue/10 flex items-center justify-center mb-5">
                <Smartphone size={24} className="text-nxblue" />
              </div>
              <h2 className="font-display font-bold text-[24px] text-navy">Reset password</h2>
              <p className="font-body text-[14px] text-slate mt-2 mb-6 leading-relaxed">
                Enter the phone number linked to your Nexplumb account and we&apos;ll send you a verification code.
              </p>

              {resetError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] flex gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {resetError}
                </div>
              )}

              <PhoneInput
                label="Phone Number"
                placeholder="08012345678"
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
              />

              <div className="mt-6 flex flex-col gap-2.5">
                <Button variant="primary" onClick={handleSendResetOtp} className="w-full h-12">
                  Send verification code
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
                <Button variant="secondary" onClick={() => switchFlow('login')} className="w-full">
                  Back to login
                </Button>
              </div>
            </div>
          )}

          {/* ── RESET: STEP 2 — OTP ── */}
          {flow === 'reset-otp' && (
            <div className="flex flex-col">
              <FlowDots current={1} />
              <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center mb-5">
                <Fingerprint size={24} className="text-teal" />
              </div>
              <h2 className="font-display font-bold text-[24px] text-navy">Verify your code</h2>
              <p className="font-body text-[14px] text-slate mt-2 mb-6 leading-relaxed">
                Enter the 6-digit code sent to{' '}
                <span className="font-mono font-bold text-navy">
                  +234 *** **** {resetPhone.slice(-3)}
                </span>
              </p>

              {resetError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] flex gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {resetError}
                </div>
              )}

              <OtpInput value={resetOtpVal} onChange={setResetOtpVal} />

              {/* Resend countdown */}
              <div className="mt-4 text-center">
                {otpResendTimer > 0 ? (
                  <p className="text-[12px] font-mono text-slate">
                    Resend code in <span className="text-navy font-bold">{otpResendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { toast.success('Code resent!'); setOtpResendTimer(60) }}
                    className="text-[12px] font-mono text-nxblue font-bold hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Button variant="primary" onClick={handleVerifyResetOtp} className="w-full h-12">
                  Verify code
                </Button>
                <Button variant="secondary" onClick={() => switchFlow('reset-phone')} className="w-full">
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* ── RESET: STEP 3 — New password ── */}
          {flow === 'reset-new' && (
            <div className="flex flex-col gap-4">
              <FlowDots current={2} />
              <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center mb-1">
                <Lock size={24} className="text-orange" />
              </div>
              <div>
                <h2 className="font-display font-bold text-[24px] text-navy">Create new password</h2>
                <p className="font-body text-[14px] text-slate mt-1.5 leading-relaxed">
                  Choose a strong password. Minimum 8 characters.
                </p>
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] flex gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {resetError}
                </div>
              )}

              <div>
                <Input
                  label="New Password"
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  suffixIcon={
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="text-slate hover:text-navy focus:outline-none">
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                {/* Strength meter */}
                {resetNewPass.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passStrength ? strengthColor[passStrength] : 'bg-border'}`} />
                      ))}
                    </div>
                    <p className={`text-[11px] font-mono font-bold ${passStrength >= 3 ? 'text-teal' : passStrength === 2 ? 'text-amber-dark' : 'text-red-500'}`}>
                      {strengthLabel[passStrength]}
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password"
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={resetConfirmPass}
                onChange={(e) => setResetConfirmPass(e.target.value)}
                suffixIcon={
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-slate hover:text-navy focus:outline-none">
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {/* Password match indicator */}
              {resetConfirmPass.length > 0 && (
                <div className={`flex items-center gap-1.5 text-[12px] font-mono ${resetNewPass === resetConfirmPass ? 'text-teal' : 'text-red-500'}`}>
                  <CheckCircle size={13} />
                  {resetNewPass === resetConfirmPass ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              <Button variant="primary" onClick={handleUpdatePassword} className="w-full h-12 mt-1">
                Set new password
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
