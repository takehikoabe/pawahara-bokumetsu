'use client'

import { useState } from 'react'
import { Loader2, ArrowLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { ScoreBar } from '@/components/ui/score-bar'
import type { AiAnalysis } from '@/types'
import { CATEGORY_LABELS } from '@/lib/utils'
import { saveIncident } from '@/lib/db'
import { useRouter } from 'next/navigation'

export default function VentPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiAnalysis | null>(null)
  const [saved, setSaved] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  async function analyze() {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: 'analyze' }),
      })
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch {
      alert('AI整理に失敗しました。APIキーを確認してください。')
    } finally {
      setLoading(false)
    }
  }

  async function saveAsIncident() {
    if (!result) return
    const now = new Date().toISOString()
    await saveIncident({
      occurredAt: now,
      location: 'other',
      actorRelation: 'other',
      whatHappened: ['other'],
      rawNote: text,
      witnessStatus: 'unknown',
      stressScore: 7,
      factSummary:      result.fact,
      feelingSummary:   result.feeling,
      inferenceSummary: result.inference,
      formalText:       result.formalText,
      missingInfo:      result.missingInfo,
      aiComment:        result.riskComment,
      category:         result.categories,
      powerScore:       result.powerScore,
      necessityScore:   result.necessityScore,
      envScore:         result.envScore,
      riskScore:        result.riskScore,
      createdAt: now,
      updatedAt: now,
    })
    setSaved(true)
  }

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">ぼやきを書く</h1>
          <p className="text-xs text-gray-500">感情のままに書いて → AIが相談資料に整理</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardBody>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="もう無理。会議でまた遠回しに私のことを否定された。みんなの前で不要な人間みたいに言われた..."
            className="w-full min-h-[160px] resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed"
          />
          <Button
            className="w-full mt-3"
            onClick={analyze}
            disabled={loading || !text.trim()}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin mr-2" />AI整理中...</>
              : <><Sparkles size={16} className="mr-2" />AIで整理する</>
            }
          </Button>
        </CardBody>
      </Card>

      {result && (
        <div className="space-y-4">
          {/* 提出用文章 */}
          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader>
              <p className="text-sm font-bold text-indigo-800">相談窓口・弁護士向け文章</p>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-800 leading-relaxed">{result.formalText}</p>
            </CardBody>
          </Card>

          {/* 分析結果 */}
          <Card>
            <CardHeader>
              <p className="text-sm font-bold text-gray-800">AI分析結果</p>
            </CardHeader>
            <CardBody className="space-y-4">
              <AnalysisRow label="事実" color="blue" text={result.fact} />
              <AnalysisRow label="感情・受け止め" color="pink" text={result.feeling} />
              <AnalysisRow label="推測（確定ではありません）" color="orange" text={result.inference} />
              <AnalysisRow label="心身・業務への影響" color="red" text={result.impact} />
            </CardBody>
          </Card>

          {/* リスクスコア */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-800">記録上のリスク</p>
                <span className={`text-2xl font-black ${result.riskScore >= 60 ? 'text-red-600' : result.riskScore >= 30 ? 'text-orange-500' : 'text-green-600'}`}>
                  {result.riskScore}点
                </span>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <ScoreBar label="優越的関係の強さ" value={result.powerScore} />
              <ScoreBar label="業務必要性の逸脱度" value={result.necessityScore} />
              <ScoreBar label="就業環境への影響" value={result.envScore} />
              {result.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.categories.map(c => (
                    <span key={c} className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {CATEGORY_LABELS[c] ?? c}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 leading-relaxed">{result.riskComment}</p>
            </CardBody>
          </Card>

          {/* 不足情報 */}
          {result.missingInfo.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <p className="text-sm font-bold text-amber-800">不足している情報</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-1">
                  {result.missingInfo.map((info, i) => (
                    <li key={i} className="text-sm text-amber-800 flex gap-2">
                      <span>•</span><span>{info}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* 元テキスト表示 */}
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1 text-xs text-gray-400 mx-auto"
          >
            元のテキスト {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showRaw && (
            <Card className="bg-gray-50">
              <CardBody>
                <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">{text}</p>
              </CardBody>
            </Card>
          )}

          {/* 保存 */}
          {!saved
            ? <Button className="w-full" onClick={saveAsIncident}>この内容を記録として保存する</Button>
            : (
              <div className="text-center space-y-2">
                <p className="text-sm text-green-700 font-bold">保存しました</p>
                <Button variant="outline" className="w-full" onClick={() => router.push('/')}>ホームに戻る</Button>
              </div>
            )
          }
        </div>
      )}
    </main>
  )
}

function AnalysisRow({ label, color, text }: { label: string; color: 'blue' | 'pink' | 'orange' | 'red'; text: string }) {
  const styles = {
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
    pink:   'bg-pink-50 border-pink-200 text-pink-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    red:    'bg-red-50 border-red-200 text-red-800',
  }
  const labelStyles = {
    blue:   'text-blue-600',
    pink:   'text-pink-600',
    orange: 'text-orange-600',
    red:    'text-red-600',
  }
  return (
    <div className={`rounded-xl border p-3 ${styles[color]}`}>
      <p className={`text-xs font-bold mb-1 ${labelStyles[color]}`}>{label}</p>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  )
}
