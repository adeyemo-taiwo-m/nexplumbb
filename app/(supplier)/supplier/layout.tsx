'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, Package, ShoppingBag, UserCheck } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', icon: Store, href: '/supplier/dashboard' },
    { label: 'Products', icon: Package, href: '/supplier/products' },
    { label: 'Orders Received', icon: ShoppingBag, href: '/supplier/orders' },
  ]

  return (
    <div className="w-full min-h-screen bg-lgray flex flex-col select-none">
      
      {/* Supplier Top Navigation */}
      <header className="h-16 bg-navy text-white px-6 tablet:px-10 flex items-center justify-between border-b border-white/5 sticky top-0 z-30 select-none">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo size={24} variant="light" showText={true} />
            <span className="text-[11px] font-mono text-slate bg-teal/20 text-teal px-1.5 py-0.5 rounded ml-2 uppercase font-bold">Materials Merchant</span>
          </Link>
          
          {/* Main Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-[12px] font-bold">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`h-10 px-4 rounded flex items-center gap-2 hover:text-white transition-colors ${
                    isActive ? 'text-teal' : 'text-white/70'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/supplier/register">
            <span className="font-mono text-[11px] text-white/80 hover:text-white hover:underline cursor-pointer">
              Register Store
            </span>
          </Link>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-grow max-w-[1200px] mx-auto w-full p-6 tablet:p-8">
        {children}
      </main>

    </div>
  )
}
