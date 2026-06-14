import React, { useId, useState } from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label above the textarea */
  label?: string
  /** Error message – turns border red */
  error?: string
  /** Helper text below the textarea */
  hint?: string
  /** Full-width override */
  fullWidth?: boolean
  /** Optional wrapper className */
  wrapperClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      wrapperClassName = '',
      className = '',
      id,
      disabled,
      onFocus,
      onBlur,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const defaultId = useId()
    const textareaId = id || defaultId
    const errorId = `${textareaId}-error`
    const hintId = `${textareaId}-hint`
    const [focused, setFocused] = useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false)
      onBlur?.(e)
    }

    /* ── Border state ── */
    const borderState = error
      ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
      : focused
        ? 'border-teal shadow-[0_0_0_3px_rgba(42,157,143,0.12)]'
        : 'border-border hover:border-slate/50'

    /* ── Disabled state ── */
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-lgray' : 'bg-white'

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={`block font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5 transition-colors duration-150 select-none ${
              error ? 'text-red-600' : focused ? 'text-teal' : 'text-slate'
            }`}
          >
            {label}
          </label>
        )}

        {/* Textarea container */}
        <div className="relative group">
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={[
              // Base
              'w-full rounded-btn border font-mono text-[14px] text-body transition-all duration-200 ease-out',
              'placeholder:text-slate/50 placeholder:font-mono',
              'focus:outline-none resize-y p-4',
              // Border state
              borderState,
              // Disabled
              disabledStyles,
              // Custom
              className,
            ].join(' ')}
            {...props}
          />

          {/* Animated bottom highlight bar */}
          <span
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ease-out ${
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

Textarea.displayName = 'Textarea'
export default Textarea
