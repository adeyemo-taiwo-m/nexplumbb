import React from 'react'
import { Input, InputProps } from './Input'

export interface PhoneInputProps extends Omit<InputProps, 'prefixText'> {}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label = 'Phone Number', placeholder = 'e.g. 08012345678', ...props }, ref) => {
    return (
      <Input
        label={label}
        placeholder={placeholder}
        prefixText="🇳🇬 +234 |"
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        onInput={(e) => {
          // Prevent typing or pasting letters/emails
          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
        }}
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
export default PhoneInput
