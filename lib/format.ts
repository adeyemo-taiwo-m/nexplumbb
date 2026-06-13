/**
 * Format a number as Nigerian Naira
 * Usage: formatNaira(12500) => "₦12,500"
 * Usage: formatNaira(1500000) => "₦1,500,000"
 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

/**
 * Format a range of prices
 * Usage: formatNairaRange(8000, 15000) => "₦8,000 – ₦15,000"
 */
export function formatNairaRange(min: number, max: number): string {
  return `${formatNaira(min)} – ${formatNaira(max)}`
}

/**
 * Format date for Nigerian context
 * Usage: formatDate(new Date()) => "14 Feb 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time as 12-hour
 * Usage: formatTime(new Date()) => "2:30 PM"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format phone number for Nigerian display
 * Usage: formatPhone("08012345678") => "+234 801 234 5678"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234') && digits.length === 13) {
    const local = digits.slice(3)
    return `+234 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  if (digits.startsWith('0') && digits.length === 11) {
    const local = digits.slice(1)
    return `+234 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  if (digits.length === 10) {
    return `+234 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone
}

/**
 * Mask phone number for privacy
 * Usage: maskPhone("+2348012345678") => "+234 *** **** 678"
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 3) return phone
  return `+234 *** **** ${digits.slice(-3)}`
}

/**
 * Apply emergency 30% premium to a base price
 */
export function applyEmergencyPremium(amount: number): number {
  return Math.round(amount * 1.3)
}

/**
 * Calculate platform commission (10-15%)
 */
export function calculateCommission(amount: number, rate: number = 0.12): number {
  return Math.round(amount * rate)
}

/**
 * Format relative time (for timestamps)
 * Usage: timeAgo(new Date(Date.now() - 3600000)) => "1 hour ago"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return `Just now`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
