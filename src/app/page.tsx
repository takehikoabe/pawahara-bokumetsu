'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { getRecentIncidents, getRecentHealthLogs } from '@/lib/db'
import type { Incident, HealthLog } from '@/types'
import { formatDate, riskLabel, riskBg, WHAT_HAPPENED_LABELS } from '@/lib/utils'
import {
  Mic, FilePlus, MessageSquare, Heart, Shield,
  BarChart2, FileText, ChevronRight, AlertTriangle, Pill, Crown
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/voice',      icon: Mic,           label: '録音する',       color: 'bg-red-500' },
  { href: '/record',     icon: FilePlus,       label: '今すぐ記録',     color: 'bg-indigo-600' },
  { href: '/vent',       icon: MessageSquare,  label: 'ぼやきを書く',   color: 'bg-violet-500' },
  { href: '/health',     icon: Heart,          label: '心身チェック',   color: 'bg-pink-500' },
  { href: '/medication', icon: Pill,           label: '服薬・通院',     color: 'bg-rose-600' },
  { href: '/evidence',   icon: Shield,         label: '証拠を見る',     color: 'bg-teal-600' },
  { href: '/graph',      icon: BarChart2,      label: 'リスクグラフ',   color: 'bg-amber-500' },
  { href: '/report',     icon: FileText,       label: '相談資料を作る', color: 'bg-emerald-600' },
]

export default function HomePage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [latestHealth, setLatestHealth] = useState<HealthLog | null>(null)
  const { user } = useUser()
  const plan = (user?.publicMetadata?.plan as string) ?? 'free'

  useEffect(() => {
    getRecentIncidents(5).then(setIncidents)
    getRecentHealthLogs(1).then(logs => setLatestHealth(logs[0] ?? null))
  }, [])

  const avgRisk = incidents.length
    ? Math.round(incidents.reduce((s, i) => s + (i.riskScore ?? 0), 0) / incidents.length)
    : 0

  return (
    <main className="max-w-md mx-auto px-4 pb-20">
      {/* ヘッダー */}
      <header className="pt-8 pb-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/pricing" className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${plan === 'premium' ? 'bg-violet-100 text-violet-700' : plan === 'standard' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
            {plan !== 'free' && <Crown size={11} />}
            {plan === 'premium' ? 'プレミアム' : plan === 'standard' ? 'スタンダード' : '無料プラン'}
          </Link>
          <UserButton />
        </div>
        <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold mb-3 shadow">
          <AlertTriangle size={13} />
          証拠化・相談資料作成支援
        </div>
        <h1 className="text-3xl font-black text-indigo-900 tracking-tight">パワハラ撲滅</h1>
        <p className="text-sm text-gray-500 mt-1">感情を整理し、事実を資料に変える</p>
        </div>
      </header>

      {/* サマリーカード */}
      {incidents.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SummaryCard label="記録件数" value={`${incidents.length}件`} color="text-indigo-700" />
          <SummaryCard label="平均リスク" value={`${avgRisk}点`} color={riskLabel(avgRisk).color} />
          <SummaryCard label="今日の状態" value={latestHealth ? `${latestHealth.stressScore}/10` : '未記録'} color="text-pink-600" />
        </div>
      )}

      {/* メインナビ */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-5 shadow-md active:scale-95 transition-transform ${item.color} text-white`}
          >
            <item.icon size={28} strokeWidth={2.2} />
            <span className="text-sm font-bold">{item.label}</span>
          </Link>
        ))}
      </section>

      {/* 最近の記録 */}
      {incidents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">最近の記録</h2>
            <Link href="/evidence" className="text-sm text-indigo-600 flex items-center gap-0.5">
              すべて見る <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {incidents.map(inc => {
              const risk = riskLabel(inc.riskScore ?? 0)
              return (
                <Link
                  key={inc.id}
                  href={`/record/${inc.id}`}
                  className={`block rounded-2xl border p-4 ${riskBg(inc.riskScore ?? 0)} active:scale-[0.98] transition-transform`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500">{formatDate(inc.occurredAt)}</span>
                    <span className={`text-xs font-bold ${risk.color}`}>リスク {inc.riskScore ?? '—'}点</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-800 line-clamp-1">
                    {inc.whatHappened.map(w => WHAT_HAPPENED_LABELS[w]).join('、')}
                  </p>
                  {inc.formalText && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{inc.formalText}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* 初回ガイド */}
      {incidents.length === 0 && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5 text-center space-y-2">
          <p className="text-indigo-800 font-bold">まずは記録を始めましょう</p>
          <p className="text-sm text-indigo-600">「今すぐ記録」または「録音する」から<br />10秒で記録を残せます。</p>
          <Link href="/record" className="inline-block mt-2 bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow">
            最初の記録を作る
          </Link>
        </div>
      )}

      {/* 法的注意 */}
      <p className="mt-8 text-[10px] text-gray-400 text-center leading-relaxed">
        本アプリはAI参考情報を提供するものであり、法律相談を代替しません。<br />
        AI判定は参考情報であり、法的結論ではありません。<br />
        録音・撮影・提出前には専門家へのご相談をお勧めします。
      </p>
    </main>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3 text-center shadow-sm">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
