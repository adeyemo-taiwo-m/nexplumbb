'use client'

import React, { useEffect } from 'react'
import { useMockDb } from '@/lib/store/mockDb'
import { Toaster } from 'sonner'

export const AppInitializer: React.FC = () => {
  const seedDb = useMockDb((state) => state.seedDb)

  useEffect(() => {
    // Seed the mock database with initial values
    seedDb()
  }, [seedDb])

  return (
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        className: 'font-mono text-[13px]',
        style: {
          borderLeft: '4px solid var(--color-teal)',
          borderRadius: 'var(--radius-btn)',
          boxShadow: 'var(--shadow-modal)'
        }
      }}
    />
  )
}
export default AppInitializer
