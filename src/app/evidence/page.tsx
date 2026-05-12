'use client'

import { useEffect, useState } from 'react'
import { getRecentIncidents } from '@/lib/db'
import type { Incident } from '@/types'
import { formatDate, riskLabel, riskBg, WHAT_HAPPENED_LABELS, LOCATION_LABELS, CATEGORY_LABELS } from '@/lib/utils'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/card'
import { ScoreBar } from '@/components/ui/score-bar'

export default function EvidencePage() {
  const [incidents, setIncidents] = useState<Incident[]>([])

  useEffect(() => {
    getRecentIncidents(100).then(setIncidents)
  }, [])

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">証拠・記録一覧</h1>
          <p className="text-xs text-gray-500">{incidents.length}件の記録</p>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>まだ記録がありません</p>
          <Link href="/record" className="mt-4 inline-block text-sm text-indigo-600 font-medium">
            最初の記録を作る →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(inc => {
            const risk = riskLabel(inc.riskScore ?? 0)
            return (
              <div key={inc.id} className={`rounded-2xl border p-4 ${riskBg(inc.riskScore ?? 0)}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500">{formatDate(inc.occurredAt)}</span>
                  <span className={`text-xs font-black ${risk.color}`}>リスク {inc.riskScore ?? '未分析'}点</span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  {inc.whatHappened.map(w => WHAT_HAPPENED_LABELS[w]).join('、')}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {LOCATION_LABELS[inc.location]} / つらさ {inc.stressScore}/10
                </p>
                {inc.category && inc.category.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inc.category.map(c => (
                      <span key={c} className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY_LABELS[c]}
                      </span>
                    ))}
                  </div>
                )}
                {inc.riskScore !== undefined && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <ScoreBar label="優越的関係" value={inc.powerScore ?? 0} />
                    <ScoreBar label="相当性逸脱" value={inc.necessityScore ?? 0} />
                    <ScoreBar label="就業環境" value={inc.envScore ?? 0} />
                  </div>
                )}
                {inc.formalText && (
                  <div className="mt-3 bg-white/70 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-indigo-700 mb-1">提出用文章</p>
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{inc.formalText}</p>
                  </div>
                )}
                {inc.missingInfo && inc.missingInfo.length > 0 && (
                  <div className="mt-2 text-[10px] text-amber-700">
                    不足情報: {inc.missingInfo.join('、')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
