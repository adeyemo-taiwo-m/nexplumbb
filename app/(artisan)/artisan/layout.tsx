'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import ArtisanSidebar from '@/components/layout/ArtisanSidebar'
import { toast } from 'sonner'

export default function ArtisanLayout({
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
    if (user.type !== 'artisan') {
      toast.error('Access denied. Artisan portal only.')
      router.push('/')
    }
  }, [user])

  if (!user || user.type !== 'artisan') {
    return (
      <div className="w-full h-screen bg-lgray flex items-center justify-center font-mono">
        Verifying permissions...
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-lgray flex">
      {/* Fixed Artisan Sidebar */}
      <ArtisanSidebar />
      
      {/* Main Artisan Content (Offset left margin for sidebar) */}
      <main className="ml-60 flex-grow p-6 tablet:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
