'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveHealthLog } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { ArrowLeft, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'

interface SliderFieldProps {
  label: string
  value: number
  onChange: (v: number) => void
  leftLabel?: string
  rightLabel?: string
}

function SliderField({ label, value, onChange, leftLabel = '良好', rightLabel = '最悪' }: SliderFieldProps) {
  const pct = value * 10
  const color = pct >= 70 ? 'accent-red-500' : pct >= 40 ? 'accent-orange-400' : 'accent-green-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`font-bold ${pct >= 70 ? 'text-red-500' : pct >= 40 ? 'text-orange-500' : 'text-green-600'}`}>{value}/10</span>
      </div>
      <input type="range" min={0} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
        className={`w-full ${color}`} />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  )
}

interface ToggleProps { label: string; value: boolean; onChange: (v: boolean) => void }
function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <button onClick={() => onChange(!value)} className={`flex items-center gap-2 rounded-xl p-3 border-2 text-sm font-medium transition-all ${value ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-gray-200 text-gray-600'}`}>
      {value ? <CheckSquare size={16} className="text-red-500" /> : <Square size={16} className="text-gray-400" />}
      {label}
    </button>
  )
}

export default function HealthPage() {
  const router = useRouter()
  const [stressScore, setStressScore] = useState(5)
  const [anxietyScore, setAnxietyScore] = useState(5)
  const [angerScore, setAngerScore] = useState(5)
  const [sleepScore, setSleepScore] = useState(5)
  const [appetiteScore, setAppetiteScore] = useState(5)
  const [workImpact, setWorkImpact] = useState(5)
  const [heartPounding, setHeartPounding] = useState(false)
  const [nausea, setNausea] = useState(false)
  const [headache, setHeadache] = useState(false)
  const [tearful, setTearful] = useState(false)
  const [commuteFear, setCommuteFear] = useState(false)
  const [memo, setMemo] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await saveHealthLog({
      recordedAt: new Date().toISOString(),
      stressScore, anxietyScore, angerScore,
      sleepScore, appetiteScore, workImpact,
      heartPounding, nausea, headache, tearful, commuteFear,
      memo,
    })
    router.push('/')
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">心身チェック</h1>
          <p className="text-xs text-gray-500">今日の状態を記録する</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader><p className="font-bold text-gray-800 text-sm">心理的な状態</p></CardHeader>
          <CardBody className="space-y-5">
            <SliderField label="つらさ・ストレス" value={stressScore} onChange={setStressScore} leftLabel="普通" rightLabel="非常につらい" />
            <SliderField label="不安感" value={anxietyScore} onChange={setAnxietyScore} leftLabel="落ち着いている" rightLabel="強い不安" />
            <SliderField label="怒り" value={angerScore} onChange={setAngerScore} leftLabel="穏やか" rightLabel="強い怒り" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-bold text-gray-800 text-sm">身体・生活の状態</p></CardHeader>
          <CardBody className="space-y-5">
            <SliderField label="睡眠の質" value={sleepScore} onChange={setSleepScore} leftLabel="ぐっすり" rightLabel="眠れなかった" />
            <SliderField label="食欲" value={appetiteScore} onChange={setAppetiteScore} leftLabel="普通" rightLabel="食欲なし" />
            <SliderField label="仕事への支障" value={workImpact} onChange={setWorkImpact} leftLabel="支障なし" rightLabel="大きな支障" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><p className="font-bold text-gray-800 text-sm">症状（当てはまるものを選択）</p></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <Toggle label="動悸" value={heartPounding} onChange={setHeartPounding} />
              <Toggle label="吐き気" value={nausea} onChange={setNausea} />
              <Toggle label="頭痛" value={headache} onChange={setHeadache} />
              <Toggle label="涙が出る" value={tearful} onChange={setTearful} />
              <Toggle label="出勤が怖い" value={commuteFear} onChange={setCommuteFear} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-gray-700 mb-2">一言メモ（任意）</p>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="今日感じたこと..."
              className="w-full min-h-[80px] resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl border border-gray-200 p-3"
            />
          </CardBody>
        </Card>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '今日の状態を記録する'}
        </Button>
      </div>
    </main>
  )
}
