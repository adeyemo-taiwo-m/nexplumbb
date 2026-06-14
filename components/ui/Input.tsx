import React, { useId, useState } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label above the input */
  label?: string
  /** Error message – turns border red */
  error?: string
  /** Helper text below the input */
  hint?: string
  /** Static prefix text inside the field (e.g. ₦, +234) */
  prefixText?: string
  /** Icon or button rendered inside the right side of the field */
  suffixIcon?: React.ReactNode
  /** Icon rendered inside the left side of the field */
  prefixIcon?: React.ReactNode
  /** Visual size variant */
  inputSize?: 'sm' | 'md' | 'lg'
  /** Full-width override */
  fullWidth?: boolean
  /** Optional wrapper className */
  wrapperClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefixText,
      suffixIcon,
      prefixIcon,
      inputSize = 'md',
      fullWidth = true,
      wrapperClassName = '',
      className = '',
      type = 'text',
      id,
      disabled,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const defaultId = useId()
    const inputId = id || defaultId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`
    const [focused, setFocused] = useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      onBlur?.(e)
    }

    /* ── Size tokens ── */
    const sizes = {
      sm: 'h-9 text-[12px]',
      md: 'h-12 text-[14px]',
      lg: 'h-14 text-[15px]',
    }

    /* ── Border state ── */
    const borderState = error
      ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
      : focused
        ? 'border-teal shadow-[0_0_0_3px_rgba(42,157,143,0.12)]'
        : 'border-border hover:border-slate/50'

    /* ── Disabled state ── */
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-lgray' : 'bg-white'

    /* ── Padding calculation (only used when no prefixText) ── */
    const leftPad = prefixIcon ? 'pl-11' : prefixText ? 'pl-3' : 'pl-4'
    const rightPad = suffixIcon ? 'pr-11' : 'pr-4'

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 transition-colors duration-150 select-none ${
              error ? 'text-red-600' : focused ? 'text-teal' : 'text-slate'
            }`}
          >
            {label}
          </label>
        )}

        {/* Input container */}
        <div className={`relative flex items-center group rounded-btn border transition-all duration-200 ease-out overflow-hidden ${borderState} ${disabledStyles}`}>

          {/* Left prefix text — flex sibling, not absolute */}
          {prefixText && (
            <div className="flex items-center flex-shrink-0 pl-3.5 pr-2.5 border-r border-border h-full font-mono text-[13px] text-slate select-none pointer-events-none whitespace-nowrap">
              {prefixText}
            </div>
          )}

          {/* Left prefix icon — absolute only when no prefixText */}
          {prefixIcon && !prefixText && (
            <div className={`absolute left-3.5 flex items-center pointer-events-none transition-colors duration-150 z-[1] ${
              error ? 'text-red-400' : focused ? 'text-teal' : 'text-slate/60'
            }`}>
              {prefixIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={[
              // Base — no border/bg here; the wrapper div owns them
              'flex-1 min-w-0 bg-transparent font-mono text-body transition-colors duration-200',
              'placeholder:text-slate/40 placeholder:font-mono',
              'focus:outline-none',
              // Size (height via wrapper, font via here)
              sizes[inputSize],
              // Padding (left only when no prefix text)
              prefixText ? 'pl-3 pr-3' : `${leftPad} ${rightPad}`,
              // Remove border/bg — wrapper owns them
              'border-0',
              // Custom overrides
              className,
            ].join(' ')}
            {...props}
          />

          {/* Right suffix icon */}
          {suffixIcon && (
            <div className={`flex items-center pr-3.5 flex-shrink-0 pointer-events-auto transition-colors duration-150 ${
              error ? 'text-red-400' : focused ? 'text-teal' : 'text-slate/60'
            }`}>
              {suffixIcon}
            </div>
          )}

          {/* Animated bottom highlight bar */}
          <span
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ease-out pointer-events-none ${
              error
                ? 'w-full bg-red-500'
                : focused
                  ? 'w-full bg-teal'
                  : 'w-0 bg-teal'
            }`}
          />
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} role="alert" className="font-mono text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
              <path d="M6 3v3.5M6 8.5v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        )}

        {/* Helper hint */}
        {!error && hint && (
          <p id={hintId} className="font-mono text-[11px] text-slate/70 mt-1">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
