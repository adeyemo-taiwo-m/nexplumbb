import React, { useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  prefixText?: string
  suffixIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefixText, suffixIcon, className = '', type = 'text', id, ...props }, ref) => {
    const defaultId = useId()
    const inputId = id || defaultId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    return (
      <div className="w-full">
        {/* Label ABOVE input */}
        <label
          htmlFor={inputId}
          className="font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide"
        >
          {label}
        </label>

        {/* Input container */}
        <div className="relative flex items-center">
          {prefixText && (
            <div className="absolute left-4 font-mono text-[14px] text-slate border-r border-border pr-2 flex items-center h-full pointer-events-none select-none">
              {prefixText}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`h-12 w-full rounded-btn border bg-white font-mono text-[14px] text-body placeholder:text-slate placeholder:font-mono focus:outline-none transition-colors duration-150
              ${prefixText ? 'pl-[70px]' : 'px-4'}
              ${suffixIcon ? 'pr-12' : 'pr-4'}
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                : 'border-border focus:border-teal focus:ring-2 focus:ring-teal/20'
              } ${className}`}
            {...props}
          />

          {suffixIcon && (
            <div className="absolute right-4 flex items-center pointer-events-auto">
              {suffixIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} className="font-mono role-alert text-[12px] text-red-600 mt-1">
            {error}
          </p>
        )}

        {/* Helper Hint */}
        {!error && hint && (
          <p id={hintId} className="font-mono text-[12px] text-slate mt-1">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
