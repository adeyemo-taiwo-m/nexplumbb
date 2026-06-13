// lib/validation.ts
export const nigerianPhoneRegex = /^(0[7-9][01]\d{8}|(\+234)[7-9][01]\d{8})$/

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('234') && digits.length === 13) {
    return `+${digits}`
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.slice(1)}`
  }
  if (digits.length === 10) {
    return `+234${digits}`
  }
  return phone
}

export const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank',
  'First Bank', 'FCMB', 'GT Bank', 'Heritage Bank',
  'Keystone Bank', 'Kuda Bank', 'Opay', 'Palmpay',
  'Polaris Bank', 'Stanbic IBTC', 'Sterling Bank',
  'UBA', 'Union Bank', 'Unity Bank', 'Wema Bank', 'Zenith Bank',
]

export const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa (Lekki)', 'Ibeju-Lekki', 'Ifako-Ijaye',
  'Ikeja', 'Ikorodu', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere', 'Yaba',
]
