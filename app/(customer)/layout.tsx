import React from 'react'
import CustomerNavbar from '@/components/layout/CustomerNavbar'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CustomerNavbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
