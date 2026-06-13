import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'full'
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  // Styles based on style guide specifications
  const baseClasses = 'inline-flex items-center justify-center font-display font-bold rounded-btn transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-orange text-white hover:bg-orange-dark shadow-card hover:shadow-card-hover border border-transparent',
    secondary: 'border-[1.5px] border-navy text-navy bg-transparent hover:bg-navy hover:text-white',
    ghost: 'text-nxblue hover:bg-nxblue/10 bg-transparent border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
    success: 'bg-teal text-white hover:bg-teal-dark border border-transparent',
  }

  const sizes = {
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-12 px-6 text-[14px]', // Default 48px height
    lg: 'h-14 px-8 text-[15px]', // 56px height
    full: 'h-12 w-full text-[14px]',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          {/* SVG loading spinner */}
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
export default Button
