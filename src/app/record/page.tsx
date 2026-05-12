'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveIncident } from '@/lib/db'
import { WHAT_HAPPENED_LABELS, ACTOR_LABELS, LOCATION_LABELS, WITNESS_LABELS } from '@/lib/utils'
import type { WhatHappened, ActorRelation, Location, WitnessStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Step = 'what' | 'who' | 'where' | 'witness' | 'stress' | 'note' | 'done'

const WHAT_OPTIONS = Object.entries(WHAT_HAPPENED_LABELS) as [WhatHappened, string][]
const ACTOR_OPTIONS = Object.entries(ACTOR_LABELS) as [ActorRelation, string][]
const LOCATION_OPTIONS = Object.entries(LOCATION_LABELS) as [Location, string][]
const WITNESS_OPTIONS = Object.entries(WITNESS_LABELS) as [WitnessStatus, string][]

export default function RecordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('what')
  const [loading, setLoading] = useState(false)

  const [whatHappened, setWhatHappened] = useState<WhatHappened[]>([])
  const [actorRelation, setActorRelation] = useState<ActorRelation>('direct_boss')
  const [location, setLocation] = useState<Location>('office')
  const [witnessStatus, setWitnessStatus] = useState<WitnessStatus>('unknown')
  const [stressScore, setStressScore] = useState(7)
  const [rawNote, setRawNote] = useState('')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16))

  const toggleWhat = (w: WhatHappened) => {
    setWhatHappened(prev =>
      prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]
    )
  }

  async function handleSave() {
    setLoading(true)
    const now = new Date().toISOString()
    try {
      let aiResult = null
      const textForAI = [
        ...whatHappened.map(w => WHAT_HAPPENED_LABELS[w]),
        rawNote,
      ].filter(Boolean).join('\n')

      if (textForAI) {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textForAI, mode: 'analyze' }),
        })
        if (res.ok) aiResult = await res.json()
      }

      await saveIncident({
        occurredAt: new Date(occurredAt).toISOString(),
        location,
        actorRelation,
        whatHappened,
        rawNote,
        witnessStatus,
        stressScore,
        factSummary:      aiResult?.fact,
        feelingSummary:   aiResult?.feeling,
        inferenceSummary: aiResult?.inference,
        formalText:       aiResult?.formalText,
        missingInfo:      aiResult?.missingInfo,
        aiComment:        aiResult?.riskComment,
        category:         aiResult?.categories,
        powerScore:       aiResult?.powerScore,
        necessityScore:   aiResult?.necessityScore,
        envScore:         aiResult?.envScore,
        riskScore:        aiResult?.riskScore,
        createdAt: now,
        updatedAt: now,
      })
      router.push('/')
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-black text-indigo-900">今すぐ記録</h1>
      </div>

      {/* ステップインジケーター */}
      <StepIndicator current={step} />

      <div className="mt-6 space-y-4">
        {step === 'what' && (
          <StepCard title="何があったか？" subtitle="当てはまるものをすべて選択">
            <div className="grid grid-cols-2 gap-2 mt-3">
              {WHAT_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => toggleWhat(key)}
                  className={`rounded-xl p-3 text-sm font-medium text-left transition-all border-2 ${
                    whatHappened.includes(key)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs text-gray-500 font-medium">発生日時</label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={e => setOccurredAt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
              />
            </div>
            <Button className="w-full mt-4" onClick={() => setStep('who')} disabled={whatHappened.length === 0}>
              次へ
            </Button>
          </StepCard>
        )}

        {step === 'who' && (
          <StepCard title="誰からか？">
            <div className="grid grid-cols-2 gap-2 mt-3">
              {ACTOR_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActorRelation(key)}
                  className={`rounded-xl p-3 text-sm font-medium text-left border-2 transition-all ${
                    actorRelation === key
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('what')}>戻る</Button>
              <Button className="flex-1" onClick={() => setStep('where')}>次へ</Button>
            </div>
          </StepCard>
        )}

        {step === 'where' && (
          <StepCard title="どこでか？">
            <div className="grid grid-cols-2 gap-2 mt-3">
              {LOCATION_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setLocation(key)}
                  className={`rounded-xl p-3 text-sm font-medium text-left border-2 transition-all ${
                    location === key
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('who')}>戻る</Button>
              <Button className="flex-1" onClick={() => setStep('witness')}>次へ</Button>
            </div>
          </StepCard>
        )}

        {step === 'witness' && (
          <StepCard title="証拠・目撃者は？">
            <div className="grid grid-cols-2 gap-2 mt-3">
              {WITNESS_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setWitnessStatus(key)}
                  className={`rounded-xl p-3 text-sm font-medium text-left border-2 transition-all ${
                    witnessStatus === key
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('where')}>戻る</Button>
              <Button className="flex-1" onClick={() => setStep('stress')}>次へ</Button>
            </div>
          </StepCard>
        )}

        {step === 'stress' && (
          <StepCard title="どれくらいつらかったか？" subtitle={`${stressScore} / 10`}>
            <input
              type="range"
              min={0}
              max={10}
              value={stressScore}
              onChange={e => setStressScore(Number(e.target.value))}
              className="w-full mt-4 accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>まあまあ</span>
              <span>非常につらい</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('witness')}>戻る</Button>
              <Button className="flex-1" onClick={() => setStep('note')}>次へ</Button>
            </div>
          </StepCard>
        )}

        {step === 'note' && (
          <StepCard title="一言メモ" subtitle="任意・感情のままに書いてOK（AIが整理します）">
            <textarea
              value={rawNote}
              onChange={e => setRawNote(e.target.value)}
              placeholder="何があったか、どう感じたか、自由に書いてください..."
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('stress')}>戻る</Button>
              <Button className="flex-1" onClick={handleSave} disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" />AI整理中...</> : '保存する'}
              </Button>
            </div>
          </StepCard>
        )}
      </div>
    </main>
  )
}

function StepCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      {children}
    </div>
  )
}

const STEPS: Step[] = ['what', 'who', 'where', 'witness', 'stress', 'note', 'done']
function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex gap-1.5 justify-center">
      {STEPS.slice(0, -1).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i <= idx ? 'bg-indigo-600 w-8' : 'bg-gray-200 w-4'
          }`}
        />
      ))}
    </div>
  )
}
