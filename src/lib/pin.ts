const PIN_STORAGE_KEY = 'medical_pin_hash'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function isPinSet(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem(PIN_STORAGE_KEY)
}

export async function setPin(pin: string): Promise<void> {
  localStorage.setItem(PIN_STORAGE_KEY, await sha256(pin))
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_STORAGE_KEY)
  if (!stored) return false
  return stored === await sha256(pin)
}

export function clearPin(): void {
  localStorage.removeItem(PIN_STORAGE_KEY)
}
