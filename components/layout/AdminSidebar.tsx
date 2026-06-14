import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import Logo from '../ui/Logo'
import { 
  LayoutDashboard, 
  Briefcase, 
  AlertTriangle, 
  UserCheck, 
  Users, 
  BarChart2, 
  Settings, 
  LogOut 
} from 'lucide-react'

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const { disputes, artisans } = useMockDb()

  // Calculate live badge counts
  const openDisputesCount = disputes.filter(d => d.status !== 'resolved').length
  const pendingVerificationsCount = artisans.filter(a => a.verificationStatus === 'under_review' || a.verificationStatus === 'pending').length

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Jobs Table', icon: Briefcase, href: '/admin/jobs' },
    { 
      label: 'Disputes', 
      icon: AlertTriangle, 
      href: '/admin/disputes', 
      badgeCount: openDisputesCount, 
      badgeColor: 'bg-red-600' 
    },
    { 
      label: 'Verification', 
      icon: UserCheck, 
      href: '/admin/verification', 
      badgeCount: pendingVerificationsCount, 
      badgeColor: 'bg-amber' 
    },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'Analytics', icon: BarChart2, href: '/admin/analytics' }
  ]

  return (
    <aside className="w-[220px] h-screen fixed left-0 top-0 bottom-0 bg-navy text-white flex flex-col z-30 border-r border-white/5 select-none">
      
      {/* Admin Title */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center">
        <Link href="/" className="flex items-center">
          <Logo size={24} variant="light" showText={true} />
          <span className="text-[10px] font-mono text-slate bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 rounded ml-2 uppercase font-bold">Admin</span>
        </Link>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
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
              <Icon size={18} className={`mr-3 ${isActive ? 'text-teal' : 'text-slate-light'}`} />
              <span>{item.label}</span>
              
              {/* Badge alert */}
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className={`ml-auto font-mono text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badgeCount}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Log out */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className="h-10 px-4 rounded-btn font-display text-[14px] text-red-400 hover:bg-red-950/20 flex items-center text-left"
        >
          <LogOut size={18} className="mr-3 text-red-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
export default AdminSidebar
