'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      toast.error('Authentication required. Redirecting to login.')
      router.push('/login')
      return
    }
    if (user.type !== 'admin') {
      toast.error('Access denied. Admin portal only.')
      router.push('/')
    }
  }, [user])

  if (!user || user.type !== 'admin') {
    return (
      <div className="w-full h-screen bg-lgray flex items-center justify-center font-mono text-navy">
        Verifying admin session credentials...
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-lgray flex">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />
      
      {/* Main Admin Content (Offset left margin for sidebar) */}
      <main className="ml-[220px] flex-grow p-6 tablet:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
