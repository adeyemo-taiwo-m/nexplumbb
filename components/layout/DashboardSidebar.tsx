import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import Button from '../ui/Button'
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  PlusCircle, 
  LogOut,
  MapPin
} from 'lucide-react'

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'My Bookings', icon: Calendar, href: '/dashboard?tab=bookings' },
    { label: 'Saved Artisans', icon: Heart, href: '/dashboard?tab=saved' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard?tab=messages' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard?tab=payments' }
  ]

  return (
    <aside className="w-60 h-screen fixed left-0 top-16 bottom-0 bg-white border-r border-border text-body flex flex-col z-30 select-none">
      
      {/* Customer profile card */}
      <div className="p-5 border-b border-border flex flex-col items-center">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
          alt={user?.name}
          className="w-14 h-14 rounded-full object-cover border border-border bg-lgray"
        />
        <h4 className="font-display font-semibold text-[15px] text-navy mt-2 text-center">
          {user?.name}
        </h4>
        <p className="font-mono text-[11px] text-slate mt-1 flex items-center gap-0.5">
          <MapPin size={10} className="text-slate" /> Lagos, Nigeria
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`h-10 px-4 rounded-btn font-display text-[14px] flex items-center transition-all ${
                isActive 
                  ? 'border-l-[3px] border-teal bg-teal/5 text-teal font-semibold pl-[13px]' 
                  : 'text-slate hover:bg-lgray hover:text-navy'
              }`}
            >
              <Icon size={18} className={`mr-3 ${isActive ? 'text-teal' : 'text-slate'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Book CTA at Bottom */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <Link href="/search" className="w-full">
          <Button variant="primary" size="sm" className="w-full">
            <PlusCircle size={16} className="mr-1.5" />
            Book an artisan
          </Button>
        </Link>
        <button
          onClick={handleLogout}
          className="h-10 px-4 rounded-btn font-display text-[14px] text-red-600 hover:bg-red-50 flex items-center text-left"
        >
          <LogOut size={18} className="mr-3" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
export default DashboardSidebar
