import React, { useState, useEffect } from 'react'

interface NairaInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  error?: string
  hint?: string
  placeholder?: string
  id?: string
  max?: number
}

export const NairaInput: React.FC<NairaInputProps> = ({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = '0',
  id,
  max = 10000000 // Max ₦10M per job
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (!isFocused) {
      // Format with commas when not focused
      setInputValue(value > 0 ? value.toLocaleString('en-NG') : '')
    } else {
      // Raw string when focused
      setInputValue(value > 0 ? value.toString() : '')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '') // remove non-digits
    const numVal = rawVal ? parseInt(rawVal, 10) : 0
    if (numVal <= max) {
      setInputValue(rawVal)
      onChange(numVal)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const inputId = id || `naira-input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="font-mono text-[12px] font-semibold text-slate mb-1.5 block uppercase tracking-wide"
      >
        {label}
      </label>
      
      <div className="relative flex items-center">
        <span className="absolute left-4 font-mono text-[14px] text-body select-none pointer-events-none">
          ₦
        </span>
        
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`h-12 w-full rounded-btn border bg-white px-4 pl-9 font-mono text-[14px] text-body placeholder:text-slate focus:outline-none transition-colors duration-150
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
              : 'border-border focus:border-teal focus:ring-2 focus:ring-teal/20'
            }`}
        />
      </div>

      {error && (
        <p className="font-mono text-[12px] text-red-600 mt-1">
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="font-mono text-[12px] text-slate mt-1">
          {hint}
        </p>
      )}
    </div>
  )
}
export default NairaInput
