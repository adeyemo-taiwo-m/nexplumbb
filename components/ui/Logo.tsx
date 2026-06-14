'use client'

import React from 'react'

interface LogoProps {
  size?: number
  variant?: 'light' | 'dark' | 'orange'
  showText?: boolean
  textClass?: string
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  variant = 'light',
  showText = false,
  textClass = '',
  className = '',
}) => {
  // Determine icon color based on variant
  const iconColorClass = 
    variant === 'light' 
      ? 'text-white' 
      : variant === 'orange'
      ? 'text-orange'
      : 'text-navy'

  // Determine text color for "Nex"
  const nexColorClass = variant === 'light' ? 'text-white' : 'text-navy'

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Custom SVG Interlocking 'N' Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`flex-shrink-0 transition-colors duration-200 ${iconColorClass}`}
      >
        {/* Left Hook (Shape 1) */}
        <path
          d="M 25 80 L 25 43 A 18 18 0 0 1 43 25 L 55 25 A 18 18 0 0 1 67.728 55.728 L 53.728 69.728 A 6 6 0 0 1 45.242 61.242 L 59.242 47.242 A 6 6 0 0 1 55 37 L 43 37 A 6 6 0 0 1 37 43 L 37 68 L 25 80 Z"
          fill="currentColor"
        />
        {/* Right Hook (Shape 2) - Rotated 180 degrees around center (50, 50) */}
        <path
          d="M 25 80 L 25 43 A 18 18 0 0 1 43 25 L 55 25 A 18 18 0 0 1 67.728 55.728 L 53.728 69.728 A 6 6 0 0 1 45.242 61.242 L 59.242 47.242 A 6 6 0 0 1 55 37 L 43 37 A 6 6 0 0 1 37 43 L 37 68 L 25 80 Z"
          fill="currentColor"
          transform="rotate(180 50 50)"
        />
      </svg>

      {showText && (
        <span className={`font-display font-bold tracking-tight text-[22px] transition-colors duration-200 ${textClass}`}>
          <span className={nexColorClass}>Nex</span>
          <span className="text-orange">Plumb</span>
        </span>
      )}
    </div>
  )
}

export default Logo
