import React, { useRef, useState, useEffect } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, error }) => {
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Sync external value
    const arr = value.split('').slice(0, 6)
    while (arr.length < 6) arr.push('')
    setOtpArray(arr)
  }, [value])

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value.replace(/\D/g, '')
    if (!val) return

    const newOtp = [...otpArray]
    newOtp[index] = val.slice(-1) // keep last digit
    setOtpArray(newOtp)
    
    const combinedVal = newOtp.join('')
    onChange(combinedVal)

    // Auto focus next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpArray]
      if (newOtp[index] !== '') {
        newOtp[index] = ''
        setOtpArray(newOtp)
        onChange(newOtp.join(''))
      } else if (index > 0) {
        newOtp[index - 1] = ''
        setOtpArray(newOtp)
        onChange(newOtp.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      onChange(pastedData)
      inputRefs.current[5]?.focus()
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2.5 justify-center">
        {otpArray.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            ref={(el) => { inputRefs.current[idx] = el }}
            className={`w-12 h-14 border-2 font-mono text-[20px] font-semibold text-navy text-center rounded-btn focus:outline-none transition-colors duration-150
              ${error 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-border focus:border-teal'
              }`}
          />
        ))}
      </div>
      {error && (
        <p className="font-mono text-[12px] text-red-600 mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  )
}
export default OtpInput
