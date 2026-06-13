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
        {...props}
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
export default PhoneInput
