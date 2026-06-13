'use client'

import React from 'react'
import Link from 'next/link'
import { formatNaira } from '@/lib/format'
import Button from '@/components/ui/Button'
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Truck,
  CheckCircle2
} from 'lucide-react'

export default function SupplierDashboard() {
  
  // Mock supplier inventory statistics
  const metrics = [
    { label: 'Settled Material Sales', value: formatNaira(342000), trend: '+14% vs last week', icon: TrendingUp, color: 'text-teal bg-teal/10' },
    { label: 'Pending Material Orders', value: '3 orders', sub: 'Needs packaging dispatch', icon: ShoppingBag, color: 'text-amber bg-amber/10' },
    { label: 'Listed Products Catalog', value: '24 items', sub: 'Inventory categories active', icon: Package, color: 'text-nxblue bg-nxblue/10' },
    { label: 'Out of Stock Items', value: '2 items', sub: 'Pipes & copper fittings', icon: AlertTriangle, color: 'text-red-600 bg-red-50' }
  ]

  // Mock pending orders
  const pendingOrders = [
    { id: 'ORD-8948', artisan: 'Chukwuemeka Okonkwo', trade: 'Plumbing', items: '2x 3/4-inch PVC Pipes, 4x Copper Couplings', amount: 18500, area: 'Surulere', status: 'pending_packaging' },
    { id: 'ORD-8932', artisan: 'Babatunde Folorunsho', trade: 'Electrical', items: '1x 100m 2.5mm Single Core Cable (Blue)', amount: 35000, area: 'Yaba', status: 'en_route' },
    { id: 'ORD-8911', artisan: 'Nura Mohammed', trade: 'Carpentry', items: '10x Galvanized Roofing Screws (Box of 100)', amount: 12000, area: 'Ikeja', status: 'delivered' }
  ]

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none text-left">
      
      {/* Greeting */}
      <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-h1 text-navy font-display font-semibold">Merchant dashboard</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">
            Overview of store sales, product stocks, and pending deliveries to Lagos building sites.
          </p>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-teal bg-teal/10 border border-teal/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          Store Online: Surulere Outlet
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div key={idx} className="bg-white rounded-card p-5 border border-border shadow-card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-slate uppercase tracking-wider block">{m.label}</span>
                <div className={`p-2 rounded ${m.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-mono text-[22px] font-bold text-navy leading-none">{m.value}</p>
                {m.trend && (
                  <span className="inline-block font-mono text-[9px] mt-1.5 font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-600">
                    {m.trend}
                  </span>
                )}
                {m.sub && (
                  <span className="block font-mono text-[10px] text-slate mt-1.5 font-medium">{m.sub}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6 items-start">
        
        {/* Pending Deliveries table */}
        <section className="desktop:col-span-8 bg-white rounded-card border border-border p-5 shadow-card">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-4 flex-wrap gap-2">
            <h3 className="font-display font-bold text-[15px] text-navy flex items-center gap-1.5">
              <ShoppingBag size={18} className="text-teal" />
              Recent Material Orders
            </h3>
            
            <Link href="/supplier/orders" className="font-mono text-[11px] font-bold text-teal hover:underline flex items-center gap-0.5">
              Go to all orders <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-[12px] text-left">
              <thead>
                <tr className="bg-lgray border-b border-border text-[10px] text-slate font-bold uppercase">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Artisan</th>
                  <th className="py-2.5 px-3">Material Specifications</th>
                  <th className="py-2.5 px-3">Delivery Area</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map(order => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-nxblue/5 transition-colors">
                    <td className="py-3 px-3 font-bold">{order.id}</td>
                    <td className="py-3 px-3">
                      <div>{order.artisan}</div>
                      <span className="text-[10px] text-slate">{order.trade}</span>
                    </td>
                    <td className="py-3 px-3 font-normal max-w-xs truncate" title={order.items}>{order.items}</td>
                    <td className="py-3 px-3">{order.area} LGA</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'delivered'
                          ? 'bg-teal/15 text-teal border border-teal/20'
                          : order.status === 'en_route'
                          ? 'bg-nxblue/15 text-nxblue border border-nxblue/20'
                          : 'bg-amber/20 text-amber-dark border border-amber/25'
                      }`}>
                        {order.status === 'delivered' && <CheckCircle2 size={10} />}
                        {order.status === 'en_route' && <Truck size={10} />}
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-navy">₦{order.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Low inventory status checklist */}
        <aside className="desktop:col-span-4 bg-white rounded-card border border-border p-5 shadow-card flex flex-col gap-4">
          <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2.5">
            Inventory Shortlist Alerts
          </h3>
          
          <div className="flex flex-col gap-3">
            <div className="border border-red-200 bg-red-50/20 rounded-btn p-3 text-left font-mono text-[11px] text-navy">
              <div className="flex justify-between items-start font-bold text-red-700">
                <span>1/2-inch Copper Fittings</span>
                <span>Low stock</span>
              </div>
              <p className="mt-1 text-slate">Warehouse Stock remaining: **3 units**</p>
              <Link href="/supplier/products" className="mt-2.5 inline-block text-red-700 font-bold hover:underline">
                Reorder Material Stock →
              </Link>
            </div>

            <div className="border border-amber/30 bg-amber/5 rounded-btn p-3 text-left font-mono text-[11px] text-navy">
              <div className="flex justify-between items-start font-bold text-amber-dark">
                <span>1.5mm Copper Cable Blue</span>
                <span>Approaching restock</span>
              </div>
              <p className="mt-1 text-slate">Warehouse Stock remaining: **12 rolls**</p>
              <Link href="/supplier/products" className="mt-2.5 inline-block text-amber-dark font-bold hover:underline">
                Review Inventory →
              </Link>
            </div>
          </div>
        </aside>

      </div>

    </div>
  )
}
