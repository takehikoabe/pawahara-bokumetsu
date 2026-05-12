'use client'

import { useEffect, useState } from 'react'
import { getRecentIncidents, getRecentHealthLogs } from '@/lib/db'
import type { Incident, HealthLog } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { riskLabel } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function GraphPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])

  useEffect(() => {
    getRecentIncidents(60).then(d => setIncidents([...d].reverse()))
    getRecentHealthLogs(30).then(d => setHealthLogs([...d].reverse()))
  }, [])

  // リスク推移データ
  const riskData = incidents.map(inc => ({
    date: format(new Date(inc.occurredAt), 'M/d', { locale: ja }),
    リスク: inc.riskScore ?? 0,
    つらさ: inc.stressScore * 10,
  }))

  // 心身状態データ
  const healthData = healthLogs.map(h => ({
    date: format(new Date(h.recordedAt), 'M/d', { locale: ja }),
    ストレス: h.stressScore * 10,
    不安: h.anxietyScore * 10,
    睡眠悪化: h.sleepScore * 10,
    仕事への支障: h.workImpact * 10,
  }))

  const avgRisk = incidents.length
    ? Math.round(incidents.reduce((s, i) => s + (i.riskScore ?? 0), 0) / incidents.length)
    : 0
  const maxRisk = incidents.length ? Math.max(...incidents.map(i => i.riskScore ?? 0)) : 0

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-indigo-900">リスクグラフ</h1>
          <p className="text-xs text-gray-500">記録の推移と心身状態を可視化</p>
        </div>
      </div>

      {incidents.length === 0 && healthLogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>まだデータがありません</p>
          <p className="text-sm mt-1">記録・心身チェックを行うとグラフが表示されます</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* サマリー */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard label="記録件数" value={`${incidents.length}件`} color="text-indigo-700" />
            <SummaryCard label="最大リスク" value={`${maxRisk}点`} color={riskLabel(maxRisk).color} />
            <SummaryCard label="平均リスク" value={`${avgRisk}点`} color={riskLabel(avgRisk).color} />
          </div>

          {/* リスク推移 */}
          {riskData.length > 0 && (
            <Card>
              <CardHeader>
                <p className="text-sm font-bold text-gray-800">リスク推移グラフ</p>
                <p className="text-xs text-gray-400 mt-0.5">出来事ごとの記録上リスク（0-100）</p>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="リスク" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="つらさ" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  ※リスクスコアはAI参考値であり、法的判断ではありません
                </p>
              </CardBody>
            </Card>
          )}

          {/* 心身状態推移 */}
          {healthData.length > 0 && (
            <Card>
              <CardHeader>
                <p className="text-sm font-bold text-gray-800">心身状態推移グラフ</p>
                <p className="text-xs text-gray-400 mt-0.5">心身チェック記録（高いほど悪化）</p>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="ストレス" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="不安" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="睡眠悪化" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="仕事への支障" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}

          {/* 出来事件数バーチャート */}
          {incidents.length > 0 && (
            <Card>
              <CardHeader>
                <p className="text-sm font-bold text-gray-800">出来事タイムライン</p>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="リスク" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}
        </div>
      )}
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
