import React from 'react'

export type StatusType =
  | 'active'
  | 'available'
  | 'pending'
  | 'confirmed'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'job_complete'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'verified'
  | 'suspended'
  | 'urgent'

interface StatusBadgeProps {
  status: StatusType
  showDot?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = false }) => {
  const styles: Record<StatusType, { class: string; label: string }> = {
    active: { class: 'badge-active', label: 'Active' },
    available: { class: 'badge-available', label: 'Available Now' },
    pending: { class: 'badge-pending', label: 'Pending Verification' },
    confirmed: { class: 'badge-pending', label: 'Confirmed' },
    en_route: { class: 'badge-en-route', label: 'En Route' },
    on_site: { class: 'badge-on-site', label: 'On Site' },
    in_progress: { class: 'badge-active', label: 'In Progress' },
    job_complete: { class: 'badge-available', label: 'Done - Unconfirmed' },
    completed: { class: 'badge-completed', label: 'Completed' },
    disputed: { class: 'badge-disputed', label: 'Disputed' },
    cancelled: { class: 'badge-cancelled', label: 'Cancelled' },
    verified: { class: 'badge-verified', label: 'NIN Verified ✓' },
    suspended: { class: 'badge-suspended', label: 'Suspended' },
    urgent: { class: 'badge-urgent', label: 'Urgent 🔥' },
  }

  const current = styles[status] || { class: 'bg-gray-100 text-gray-700', label: status }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-semibold select-none ${current.class}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'en_route' || status === 'in_progress' ? 'animate-pulse' : ''}`} />
      )}
      <span>{current.label}</span>
    </span>
  )
}
export default StatusBadge
