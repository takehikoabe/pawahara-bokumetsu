'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, ShieldCheck, Delete } from 'lucide-react'
import { isPinSet, setPin, verifyPin } from '@/lib/pin'
import { Button } from './button'

interface Props {
  children: React.ReactNode
}

type Mode = 'loading' | 'setup' | 'verify' | 'unlocked'

export function PinLock({ children }: Props) {
  const [mode, setMode] = useState<Mode>('loading')
  const [pin, setCurrentPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    setMode(isPinSet() ? 'verify' : 'setup')
  }, [])

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  function appendDigit(d: string) {
    setError('')
    if (mode === 'setup') {
      if (step === 'enter') {
        if (pin.length < 4) setCurrentPin(p => p + d)
      } else {
        if (confirmPin.length < 4) setConfirmPin(p => p + d)
      }
    } else {
      if (pin.length < 4) setCurrentPin(p => p + d)
    }
  }

  function deleteDigit() {
    if (mode === 'setup') {
      if (step === 'enter') setCurrentPin(p => p.slice(0, -1))
      else setConfirmPin(p => p.slice(0, -1))
    } else {
      setCurrentPin(p => p.slice(0, -1))
    }
  }

  async function handleSetup() {
    if (step === 'enter') {
      if (pin.length < 4) { setError('4桁入力してください'); return }
      setStep('confirm')
    } else {
      if (confirmPin !== pin) {
        setError('PINが一致しません')
        setConfirmPin('')
        triggerShake()
        return
      }
      await setPin(pin)
      setMode('unlocked')
    }
  }

  async function handleVerify() {
    if (pin.length < 4) return
    const ok = await verifyPin(pin)
    if (ok) {
      setMode('unlocked')
    } else {
      setError('PINが違います')
      setCurrentPin('')
      triggerShake()
    }
  }

  // 4桁揃ったら自動送信
  useEffect(() => {
    if (mode === 'verify' && pin.length === 4) handleVerify()
    if (mode === 'setup' && step === 'enter' && pin.length === 4) handleSetup()
    if (mode === 'setup' && step === 'confirm' && confirmPin.length === 4) handleSetup()
  }, [pin, confirmPin])

  if (mode === 'loading') return null
  if (mode === 'unlocked') return <>{children}</>

  const displayPin = mode === 'setup' && step === 'confirm' ? confirmPin : pin
  const title = mode === 'setup'
    ? (step === 'enter' ? '医療情報保護PINを設定' : 'PINを再入力して確認')
    : '医療情報 — PIN認証'
  const subtitle = mode === 'setup'
    ? '医療情報エリアは二重ロックで保護されます'
    : '医療情報は二重ロックで保護されています'

  return (
    <div className="min-h-screen bg-[#f5f4ff] flex items-center justify-center px-4">
      <div className={`w-full max-w-xs bg-white rounded-3xl shadow-xl p-7 transition-all ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-3">
            {mode === 'setup' && step === 'confirm' ? <ShieldCheck size={28} className="text-indigo-600" /> : <Lock size={28} className="text-indigo-600" />}
          </div>
          <h2 className="text-base font-black text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* PIN表示 */}
        <div className="flex justify-center gap-3 mb-2">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
              displayPin.length > i
                ? 'bg-indigo-600 border-indigo-600'
                : 'bg-gray-50 border-gray-200'
            }`}>
              {displayPin.length > i && <div className="w-3 h-3 rounded-full bg-white" />}
            </div>
          ))}
        </div>
        {error && <p className="text-center text-xs text-red-500 mb-3 font-medium">{error}</p>}
        {!error && <div className="h-5 mb-3" />}

        {/* テンキー */}
        <div className="grid grid-cols-3 gap-2">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => {
            if (d === '') return <div key={i} />
            if (d === '⌫') return (
              <button key={i} onClick={deleteDigit}
                className="h-14 rounded-2xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                <Delete size={18} className="text-gray-600" />
              </button>
            )
            return (
              <button key={i} onClick={() => appendDigit(d)}
                className="h-14 rounded-2xl bg-gray-50 border border-gray-200 text-xl font-bold text-gray-800 active:bg-indigo-50 active:border-indigo-300 transition-colors">
                {d}
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes wiggle {
          0%,100% { transform: translateX(0) }
          20% { transform: translateX(-8px) }
          40% { transform: translateX(8px) }
          60% { transform: translateX(-6px) }
          80% { transform: translateX(6px) }
        }
      `}</style>
    </div>
  )
}
