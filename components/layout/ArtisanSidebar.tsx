import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import Logo from '../ui/Logo'
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  User, 
  Star, 
  HelpCircle, 
  LogOut, 
  Settings,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'

export const ArtisanSidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, setUser } = useAuthStore()
  const { updateArtisan, artisans } = useMockDb()

  // Find actual db status for online toggle
  const dbArtisan = artisans.find(a => a.id === user?.id)
  const isOnline = dbArtisan?.isOnline ?? false

  const handleToggleOnline = () => {
    if (user?.id) {
      const newOnline = !isOnline
      updateArtisan(user.id, { isOnline: newOnline })
      // Update session store as well
      setUser({ ...user, isOnline: newOnline })
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/artisan/dashboard' },
    { label: 'My Jobs', icon: Briefcase, href: '/artisan/jobs' },
    { label: 'Earnings', icon: Wallet, href: '/artisan/earnings' },
    { label: 'My Profile', icon: User, href: '/artisan/profile' },
    { label: 'Reviews', icon: Star, href: '/artisan/reviews' },
    { label: 'Finance', icon: TrendingUp, href: '/artisan/finance' }
  ]

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bottom-0 bg-navy text-white flex flex-col z-30 border-r border-white/5 select-none">
      
      {/* Brand Logo */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center">
        <Link href="/" className="flex items-center">
          <Logo size={24} variant="light" showText={true} />
          <span className="text-[11px] font-mono text-slate bg-white/10 px-1.5 py-0.5 rounded ml-2 uppercase">Artisan</span>
        </Link>
      </div>

      {/* Profile summary & Online switch */}
      <div className="p-5 border-b border-white/10 flex flex-col items-center">
        
        {/* Toggle Switch */}
        <div className="w-full flex justify-between items-center bg-white/5 px-3 py-2 rounded-btn mb-4 border border-white/10">
          <span className="text-[12px] font-mono font-semibold">
            {isOnline ? (
              <span className="text-teal flex items-center gap-1.5">
                <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
                Online
              </span>
            ) : (
              <span className="text-slate flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate rounded-full" />
                Offline
              </span>
            )}
          </span>
          <button
            onClick={handleToggleOnline}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
              isOnline ? 'bg-teal' : 'bg-slate/40'
            }`}
            aria-label="Toggle availability status"
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-card transform duration-200 ${
              isOnline ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Avatar */}
        <div className="relative">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={user?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
          />
          {user?.isVerified && (
            <span className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-card">
              <ShieldCheck size={14} className="text-nxblue fill-current" />
            </span>
          )}
        </div>

        <h4 className="font-display font-semibold text-[14px] text-center mt-2.5 leading-tight">
          {user?.name}
        </h4>
        <p className="font-mono text-[10px] text-slate mt-0.5 uppercase tracking-wide">
          {dbArtisan?.trade || 'Artisan'} Pro
        </p>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`h-10 px-4 rounded-btn font-display text-[14px] flex items-center transition-all ${
                isActive 
                  ? 'border-l-[3px] border-teal bg-teal/20 text-teal font-semibold pl-[13px]' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} className={`mr-3 ${isActive ? 'text-teal' : 'text-slate-light'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1">
        <Link
          href="/join-as-artisan#help"
          className="h-10 px-4 rounded-btn font-display text-[14px] text-white/70 hover:bg-white/10 hover:text-white flex items-center"
        >
          <HelpCircle size={20} className="mr-3 text-slate-light" />
          <span>Get Help</span>
        </Link>
        <button
          onClick={handleLogout}
          className="h-10 px-4 rounded-btn font-display text-[14px] text-red-400 hover:bg-red-950/20 flex items-center text-left"
        >
          <LogOut size={20} className="mr-3 text-red-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
export default ArtisanSidebar
