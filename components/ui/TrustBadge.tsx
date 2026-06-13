import React, { useState } from 'react'
import { ShieldCheck, Star, UserCheck, Award } from 'lucide-react'

export type TrustBadgeType = 'id_verified' | 'certified' | 'guarantor' | 'trade_tested'

interface TrustBadgeProps {
  type: TrustBadgeType
  showLabel?: boolean
  size?: 'sm' | 'md'
}

const badgeDetails = {
  id_verified: {
    icon: ShieldCheck,
    label: 'ID Verified',
    desc: 'Identity verified with National Identification Number (NIN) check.',
    color: 'text-nxblue bg-nxblue/10 border-nxblue/20',
    iconColor: '#2E86AB'
  },
  certified: {
    icon: Star,
    label: 'Nexplumb Certified',
    desc: 'Passed Nexplumb\'s vetting process, background checks, and trade assessments.',
    color: 'text-teal bg-teal/10 border-teal/20',
    iconColor: '#2A9D8F'
  },
  guarantor: {
    icon: UserCheck,
    label: 'Guarantor Verified',
    desc: 'Has verified professional/personal guarantors on file.',
    color: 'text-green-600 bg-green-50 border-green-200',
    iconColor: '#16a34a'
  },
  trade_tested: {
    icon: Award,
    label: 'Trade Tested',
    desc: 'Possesses official Trade Test certification from Ministry of Labour.',
    color: 'text-orange bg-orange/10 border-orange/20',
    iconColor: '#E76F51'
  }
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ type, showLabel = false, size = 'sm' }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const details = badgeDetails[type]
  const Icon = details.icon
  const iconSize = size === 'sm' ? 16 : 20

  return (
    <div
      className="relative inline-flex items-center cursor-pointer select-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      {showLabel ? (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[12px] font-semibold ${details.color}`}>
          <Icon size={iconSize} style={{ color: details.iconColor }} />
          <span>{details.label}</span>
        </span>
      ) : (
        <span className={`p-1.5 rounded-full border flex items-center justify-center ${details.color}`}>
          <Icon size={iconSize} style={{ color: details.iconColor }} />
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-navy text-white text-[11px] font-mono rounded shadow-modal z-50 text-center leading-normal">
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
          <p className="font-bold mb-1">{details.label}</p>
          <p className="opacity-95">{details.desc}</p>
        </div>
      )}
    </div>
  )
}
export default TrustBadge
