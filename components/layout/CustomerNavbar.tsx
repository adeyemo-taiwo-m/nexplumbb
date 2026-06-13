import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import Button from '../ui/Button'
import { Menu, X, LogOut, User, LayoutDashboard, Settings } from 'lucide-react'

export const CustomerNavbar: React.FC = () => {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setIsProfileDropdownOpen(false)
    router.push('/')
  }

  return (
    <header
      className={`sticky top-0 w-full h-16 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-nav border-b border-border' : 'bg-navy text-white'
      }`}
    >
      <div className="max-w-[1200px] mx-auto h-full px-6 tablet:px-10 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1.5 focus-visible:outline-none select-none">
          <span className="font-display font-bold text-[22px] tracking-tight">
            <span className={isScrolled ? 'text-navy' : 'text-white'}>Nex</span>
            <span className="text-orange">Plumb</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden tablet:flex items-center gap-8">
          <Link
            href="/#how-it-works"
            className={`font-display text-[14px] font-semibold hover:text-orange transition-colors ${
              isScrolled ? 'text-navy' : 'text-white/80'
            }`}
          >
            How it works
          </Link>
          <Link
            href="/search"
            className={`font-display text-[14px] font-semibold hover:text-orange transition-colors ${
              isScrolled ? 'text-navy' : 'text-white/80'
            }`}
          >
            Find an artisan
          </Link>
          <Link
            href="/join-as-artisan"
            className="font-display text-[14px] font-semibold text-nxblue hover:text-nxblue-light hover:underline transition-all"
          >
            For artisans
          </Link>
          <Link
            href="/#pricing"
            className={`font-display text-[14px] font-semibold hover:text-orange transition-colors ${
              isScrolled ? 'text-navy' : 'text-white/80'
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* RIGHT GROUP (AUTH) */}
        <div className="hidden tablet:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 text-left focus:outline-none"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                />
                <div className="hidden desktop:block leading-none">
                  <p className={`text-[13px] font-bold ${isScrolled ? 'text-navy' : 'text-white'}`}>
                    {user.firstName}
                  </p>
                  <p className="text-[10px] font-mono text-slate uppercase mt-0.5">{user.type}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-48 bg-white border border-border rounded-card shadow-modal py-2 z-20 font-display text-[14px]">
                    <div className="px-4 py-2 border-b border-border text-left">
                      <p className="font-bold text-navy">{user.name}</p>
                      <p className="text-[11px] font-mono text-slate mt-0.5">{user.phone}</p>
                    </div>

                    <Link
                      href={
                        user.type === 'admin'
                          ? '/admin/dashboard'
                          : user.type === 'artisan'
                          ? '/artisan/dashboard'
                          : '/dashboard'
                      }
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-navy hover:bg-lgray transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-slate" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href={user.type === 'artisan' ? '/artisan/profile' : '/dashboard'}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-navy hover:bg-lgray transition-colors"
                    >
                      <User size={16} className="text-slate" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors border-t border-border mt-1 text-left"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`font-display text-[14px] font-bold hover:underline ${
                  isScrolled ? 'text-navy' : 'text-white'
                }`}
              >
                Log in
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE TRIGGER */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="tablet:hidden p-1 rounded-btn hover:bg-white/10 transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <X size={24} className={isScrolled ? 'text-navy' : 'text-white'} />
          ) : (
            <Menu size={24} className={isScrolled ? 'text-navy' : 'text-white'} />
          )}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-navy/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-modal z-50 p-6 flex flex-col gap-6 text-navy animate-slide-in">
            <nav className="flex flex-col gap-4 font-display font-semibold text-[15px]">
              <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange">
                How it works
              </Link>
              <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange">
                Find an artisan
              </Link>
              <Link href="/join-as-artisan" onClick={() => setIsMobileMenuOpen(false)} className="text-nxblue">
                For artisans
              </Link>
              <Link href="/#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange">
                Pricing
              </Link>
            </nav>

            <div className="border-t border-border pt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-bold text-navy leading-tight">{user.name}</p>
                      <p className="text-[11px] font-mono text-slate mt-0.5">{user.phone}</p>
                    </div>
                  </div>
                  <Link
                    href={user.type === 'artisan' ? '/artisan/dashboard' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button variant="secondary" size="sm" className="w-full text-center">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={handleLogout} className="w-full">
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full text-center">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button variant="primary" size="sm" className="w-full">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
export default CustomerNavbar
