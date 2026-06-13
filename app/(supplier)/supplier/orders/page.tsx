'use client'

import React, { useState } from 'react'
import { formatNaira } from '@/lib/format'
import Button from '@/components/ui/Button'
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  Calendar,
  Truck,
  CheckCircle2,
  PackageCheck
} from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  artisan: string
  trade: string
  items: string
  amount: number
  area: string
  status: 'pending_packaging' | 'en_route' | 'delivered'
  date: string
}

export default function SupplierOrders() {
  
  // Mock orders list
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-8948', artisan: 'Chukwuemeka Okonkwo', trade: 'Plumbing', items: '2x 3/4-inch PVC Pressure Pipe (6m), 4x Copper Couplings', amount: 18500, area: 'Surulere', status: 'pending_packaging', date: '2026-06-13' },
    { id: 'ORD-8932', artisan: 'Babatunde Folorunsho', trade: 'Electrical', items: '1x Coleman 2.5mm Single Core Wire Blue (100m)', amount: 35000, area: 'Yaba', status: 'en_route', date: '2026-06-12' },
    { id: 'ORD-8911', artisan: 'Nura Mohammed', trade: 'Carpentry', items: '10x Galvanized Roofing Nails 3-inch (Box)', amount: 12000, area: 'Ikeja', status: 'delivered', date: '2026-06-10' }
  ])

  // Shift status transitions
  const handleTransitionStatus = (id: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'pending_packaging'
    let msg = ''

    if (currentStatus === 'pending_packaging') {
      nextStatus = 'en_route'
      msg = 'Order packaged and handed to NexPlumb dispatch logistics!'
    } else if (currentStatus === 'en_route') {
      nextStatus = 'delivered'
      msg = 'Order marked as successfully delivered to building site.'
    } else {
      return
    }

    setOrders(orders.map(o => 
      o.id === id ? { ...o, status: nextStatus } : o
    ))

    toast.success(msg)
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none text-left">
      
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-h1 text-navy font-display font-semibold">Materials Orders Received</h1>
        <p className="font-body text-[14px] text-slate mt-0.5">
          Process material requisitions ordered by vetted NexPlumb artisans for site construction jobs.
        </p>
      </div>

      {/* Orders queue */}
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white border border-border rounded-card p-5 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            
            {/* Left summary */}
            <div className="flex-1 flex gap-4 text-left font-mono text-[12px] text-navy">
              <div className="w-10 h-10 bg-lgray rounded-full flex items-center justify-center text-slate shrink-0 border">
                <ShoppingBag size={20} />
              </div>
              
              <div className="leading-tight">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-[15px] text-navy">{order.id}</span>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    order.status === 'delivered'
                      ? 'bg-teal/15 text-teal border border-teal/20'
                      : order.status === 'en_route'
                      ? 'bg-nxblue/15 text-nxblue border border-nxblue/20'
                      : 'bg-amber/20 text-amber-dark border border-amber/25'
                  }`}>
                    {order.status === 'delivered' && <CheckCircle2 size={10} />}
                    {order.status === 'en_route' && <Truck size={10} />}
                    {order.status === 'pending_packaging' && <PackageCheck size={10} />}
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="mt-2 text-body font-display font-semibold">{order.items}</p>
                <p className="mt-1.5 flex items-center gap-1"><User size={12} className="text-slate" /> Artisan: {order.artisan} ({order.trade})</p>
                <p className="mt-1 flex items-center gap-1"><MapPin size={12} className="text-slate" /> Delivery Location: {order.area} LGA coverage area</p>
                <p className="mt-1 flex items-center gap-1"><Calendar size={12} className="text-slate" /> Order Date: {order.date}</p>
              </div>
            </div>

            {/* Right action & amount */}
            <div className="flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-border pt-3 md:pt-0 shrink-0">
              <div className="text-right">
                <span className="font-mono text-[10px] text-slate block uppercase">Settled Order Value</span>
                <span className="font-mono font-bold text-[18px] text-navy">₦{order.amount.toLocaleString()}</span>
              </div>

              {order.status !== 'delivered' && (
                <Button 
                  variant={order.status === 'pending_packaging' ? 'primary' : 'success'} 
                  size="sm"
                  onClick={() => handleTransitionStatus(order.id, order.status)}
                  className="w-full md:w-auto"
                >
                  {order.status === 'pending_packaging' && 'Dispatch Material Package'}
                  {order.status === 'en_route' && 'Confirm Delivery Completed'}
                </Button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
