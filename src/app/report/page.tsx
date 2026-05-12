'use client'

import { useEffect, useState, useRef } from 'react'
import { getRecentIncidents, getRecentHealthLogs } from '@/lib/db'
import type { Incident, HealthLog } from '@/types'
import { formatDateTime, WHAT_HAPPENED_LABELS, LOCATION_LABELS, WITNESS_LABELS, CATEGORY_LABELS, riskLabel } from '@/lib/utils'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'

export default function ReportPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [generating, setGenerating] = useState(false)
  const [outputType, setOutputType] = useState<'sosyal' | 'lawyer' | 'hr'>('sosyal')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getRecentIncidents(100).then(d => setIncidents([...d].reverse()))
    getRecentHealthLogs(30).then(d => setHealthLogs([...d].reverse()))
  }, [])

  async function generatePDF() {
    setGenerating(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      if (!printRef.current) return
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      let y = 0
      const pageH = pdf.internal.pageSize.getHeight()
      while (y < pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight)
        y += pageH
        if (y < pdfHeight) pdf.addPage()
      }
      pdf.save(`パワハラ撲滅_相談資料_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  const OUTPUT_TYPES = [
    { key: 'sosyal', label: '社内相談窓口用' },
    { key: 'lawyer', label: '弁護士相談用' },
    { key: 'hr',     label: '人事部申立用' },
  ] as const

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">相談資料を作る</h1>
          <p className="text-xs text-gray-500">記録からPDFを生成</p>
        </div>
      </div>

      {/* 出力先選択 */}
      <Card className="mb-4">
        <CardHeader><p className="text-sm font-bold text-gray-800">出力先を選択</p></CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-2">
            {OUTPUT_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setOutputType(t.key)}
                className={`rounded-xl p-3 text-xs font-medium border-2 transition-all ${outputType === t.key ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Button className="w-full mb-6" size="lg" onClick={generatePDF} disabled={generating || incidents.length === 0}>
        {generating
          ? <><Loader2 size={16} className="animate-spin mr-2" />PDF生成中...</>
          : <><Download size={16} className="mr-2" />PDF出力</>
        }
      </Button>

      {/* プレビュー（PDF変換対象） */}
      <div ref={printRef} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 text-gray-800">
        {/* タイトル */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-black">ハラスメント相談資料</h2>
          <p className="text-sm text-gray-500 mt-1">
            {OUTPUT_TYPES.find(t => t.key === outputType)?.label} / 作成日: {new Date().toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* 概要 */}
        <div>
          <h3 className="text-sm font-black border-l-4 border-indigo-600 pl-2 mb-2">事案概要</h3>
          <p className="text-sm leading-relaxed">
            本資料は、職場における不適切な言動・行為について、{incidents.length}件の記録を整理したものです。
            記録期間は{incidents.length > 0 ? `${formatDateTime(incidents[0].occurredAt)} ～ ${formatDateTime(incidents[incidents.length-1].occurredAt)}` : '—'}です。
            以下の内容は事実を記録したものであり、パワーハラスメントに該当する可能性があると考え、相談します。
          </p>
        </div>

        {/* 時系列 */}
        {incidents.length > 0 && (
          <div>
            <h3 className="text-sm font-black border-l-4 border-indigo-600 pl-2 mb-3">時系列記録</h3>
            <div className="space-y-4">
              {incidents.map((inc, i) => {
                const risk = riskLabel(inc.riskScore ?? 0)
                return (
                  <div key={inc.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500">第{i+1}件</span>
                      <span className={`text-xs font-bold ${risk.color}`}>記録上リスク {inc.riskScore ?? '未算定'}点</span>
                    </div>
                    <table className="w-full text-sm">
                      <tbody className="space-y-1">
                        <TRow label="日時" value={formatDateTime(inc.occurredAt)} />
                        <TRow label="場所" value={LOCATION_LABELS[inc.location]} />
                        <TRow label="行為" value={inc.whatHappened.map(w => WHAT_HAPPENED_LABELS[w]).join('、')} />
                        <TRow label="証拠" value={WITNESS_LABELS[inc.witnessStatus]} />
                        {inc.category && inc.category.length > 0 && (
                          <TRow label="類型" value={inc.category.map(c => CATEGORY_LABELS[c]).join('、')} />
                        )}
                        {inc.factSummary && <TRow label="事実" value={inc.factSummary} />}
                        {inc.feelingSummary && <TRow label="影響" value={inc.feelingSummary} />}
                      </tbody>
                    </table>
                    {inc.formalText && (
                      <div className="mt-3 bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-indigo-700 mb-1">相談資料用文章</p>
                        <p className="text-xs leading-relaxed text-gray-800">{inc.formalText}</p>
                      </div>
                    )}
                    {inc.aiComment && (
                      <p className="mt-2 text-xs text-gray-500 italic">{inc.aiComment}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 心身影響サマリー */}
        {healthLogs.length > 0 && (
          <div>
            <h3 className="text-sm font-black border-l-4 border-pink-500 pl-2 mb-2">心身への影響（記録より）</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              心身チェックの記録（{healthLogs.length}日分）において、平均ストレス{Math.round(healthLogs.reduce((s, h) => s + h.stressScore, 0) / healthLogs.length * 10)}点、
              平均不安{Math.round(healthLogs.reduce((s, h) => s + h.anxietyScore, 0) / healthLogs.length * 10)}点、
              平均睡眠悪化{Math.round(healthLogs.reduce((s, h) => s + h.sleepScore, 0) / healthLogs.length * 10)}点が記録されています（いずれも100点満点）。
              {healthLogs.some(h => h.heartPounding) && ' 動悸の症状が記録されています。'}
              {healthLogs.some(h => h.commuteFear) && ' 出勤困難感が記録されています。'}
            </p>
          </div>
        )}

        {/* 注意書き */}
        <div className="border-t pt-4 text-xs text-gray-400 leading-relaxed">
          本資料はパワハラ撲滅アプリにより作成されました。AI判定は参考情報であり法的結論ではありません。
          提出前には専門家へご相談ください。
        </div>
      </div>
    </main>
  )
}

function TRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="text-xs text-gray-500 font-medium pr-3 py-0.5 w-16 align-top whitespace-nowrap">{label}</td>
      <td className="text-xs text-gray-800 py-0.5">{value}</td>
    </tr>
  )
}
