import React from 'react'
import { ShieldCheck } from 'lucide-react'

interface EscrowBadgeProps {
  variant?: 'banner' | 'inline'
  amount?: number
}

export const EscrowBadge: React.FC<EscrowBadgeProps> = ({ variant = 'inline', amount }) => {
  if (variant === 'banner') {
    return (
      <div className="bg-teal/10 border border-teal rounded-card p-6 flex gap-4 items-start shadow-card">
        <div className="p-2 bg-teal/20 rounded-full text-teal flex-shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold text-[15px] text-navy">
            Your payment is held safely by Nexplumb Escrow
          </h4>
          <p className="font-body text-[14px] text-slate mt-1 leading-normal">
            {amount 
              ? `₦${amount.toLocaleString()} is released to the artisan ONLY after you confirm the job is done.`
              : 'Payment is released to the artisan ONLY after you confirm the job is done.'}
          </p>
          <p className="font-body text-[12px] text-teal font-semibold mt-1.5">
            ✓ Full refund if the artisan does not show up.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <ShieldCheck size={18} className="text-teal flex-shrink-0" />
      <span className="font-mono text-[12px] text-slate">
        Payment protected until job done
      </span>
    </div>
  )
}
export default EscrowBadge
