'use client'

import { useState, useEffect } from 'react'
import { getMedicationLogs, saveMedicationLog, deleteMedicationLog } from '@/lib/db'
import type { MedicationLog } from '@/types'
import { PinLock } from '@/components/ui/pin-lock'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Pill, Hospital, Lock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { clearPin } from '@/lib/pin'

type Tab = 'list' | 'add'
type LogType = 'medication' | 'hospital'

export default function MedicationPage() {
  return (
    <PinLock>
      <MedicationContent />
    </PinLock>
  )
}

function MedicationContent() {
  const [logs, setLogs] = useState<MedicationLog[]>([])
  const [tab, setTab] = useState<Tab>('list')
  const [logType, setLogType] = useState<LogType>('medication')
  const [saving, setSaving] = useState(false)

  // フォーム状態
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 16))
  const [medicineName, setMedicineName] = useState('')
  const [dose, setDose] = useState('')
  const [isPrn, setIsPrn] = useState(false)
  const [reason, setReason] = useState('')
  const [effect, setEffect] = useState('')
  const [institution, setInstitution] = useState('')

  useEffect(() => { loadLogs() }, [])

  async function loadLogs() {
    setLogs(await getMedicationLogs())
  }

  async function handleSave() {
    if (!medicineName.trim() && !institution.trim()) return
    setSaving(true)
    const now = new Date().toISOString()
    await saveMedicationLog({
      takenAt: new Date(takenAt).toISOString(),
      medicineName: medicineName || institution,
      dose,
      isPrn,
      reason,
      effect,
      institution,
      createdAt: now,
    })
    setMedicineName('')
    setDose('')
    setIsPrn(false)
    setReason('')
    setEffect('')
    setInstitution('')
    setTab('list')
    await loadLogs()
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('この記録を削除しますか？')) return
    await deleteMedicationLog(id)
    await loadLogs()
  }

  const medicationLogs = logs.filter(l => !l.institution || l.medicineName)
  const hospitalLogs = logs.filter(l => l.institution)

  return (
    <main className="max-w-md mx-auto px-4 pb-20 pt-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/" className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-indigo-900">服薬・通院記録</h1>
            <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Lock size={10} /> 二重ロック
            </div>
          </div>
          <p className="text-xs text-gray-500">医療情報はこの端末のみに保存されます</p>
        </div>
      </div>

      {/* 医療情報注意書き */}
      <Card className="border-indigo-200 bg-indigo-50 mb-4">
        <CardBody>
          <div className="flex gap-2">
            <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 leading-relaxed">
              医療情報は要配慮個人情報です。レポート出力時は「医療情報を含める」を明示的に選択した場合のみ含まれます。
            </p>
          </div>
        </CardBody>
      </Card>

      {/* タブ */}
      <div className="flex gap-2 mb-4">
        {(['list', 'add'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-indigo-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            {t === 'list' ? '記録一覧' : '追加する'}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {tab === 'list' && (
        <div className="space-y-4">
          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>まだ記録がありません</p>
              <button onClick={() => setTab('add')} className="mt-3 text-sm text-indigo-600 font-medium">
                最初の記録を追加する →
              </button>
            </div>
          )}

          {medicationLogs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Pill size={14} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-gray-800">服薬記録</h2>
              </div>
              <div className="space-y-2">
                {medicationLogs.map(log => (
                  <Card key={log.id} className="border-indigo-100">
                    <CardBody className="py-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-800">{log.medicineName}</span>
                            {log.isPrn && (
                              <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">頓服</span>
                            )}
                            {log.dose && (
                              <span className="text-[10px] text-gray-500">{log.dose}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(log.takenAt)}</p>
                          {log.reason && <p className="text-xs text-gray-600 mt-1">理由: {log.reason}</p>}
                          {log.effect && <p className="text-xs text-gray-600">服用後: {log.effect}</p>}
                        </div>
                        <button onClick={() => log.id && handleDelete(log.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {hospitalLogs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Hospital size={14} className="text-teal-600" />
                <h2 className="text-sm font-bold text-gray-800">通院記録</h2>
              </div>
              <div className="space-y-2">
                {hospitalLogs.map(log => (
                  <Card key={log.id} className="border-teal-100">
                    <CardBody className="py-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-sm font-bold text-gray-800">{log.institution}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(log.takenAt)}</p>
                          {log.reason && <p className="text-xs text-gray-600 mt-1">内容: {log.reason}</p>}
                          {log.effect && <p className="text-xs text-gray-600">状況: {log.effect}</p>}
                        </div>
                        <button onClick={() => log.id && handleDelete(log.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 追加フォーム */}
      {tab === 'add' && (
        <div className="space-y-4">
          {/* 記録種別 */}
          <div className="grid grid-cols-2 gap-2">
            {(['medication', 'hospital'] as LogType[]).map(t => (
              <button
                key={t}
                onClick={() => setLogType(t)}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-bold border-2 transition-all ${logType === t ? (t === 'medication' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-teal-600 border-teal-600 text-white') : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {t === 'medication' ? <><Pill size={16} />服薬記録</> : <><Hospital size={16} />通院記録</>}
              </button>
            ))}
          </div>

          <Card>
            <CardBody className="space-y-4">
              {/* 日時 */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  {logType === 'medication' ? '服薬日時' : '通院日時'}
                </label>
                <input
                  type="datetime-local"
                  value={takenAt}
                  onChange={e => setTakenAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                />
              </div>

              {logType === 'medication' ? (
                <>
                  <Field label="薬名 *" value={medicineName} onChange={setMedicineName} placeholder="例: ロラゼパム 0.5mg" />
                  <Field label="用量" value={dose} onChange={setDose} placeholder="例: 1錠" />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPrn(!isPrn)}
                      className={`flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 border-2 transition-all ${isPrn ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      頓服{isPrn ? ' ✓' : ''}
                    </button>
                    <span className="text-xs text-gray-400">症状が出たときだけ飲む場合</span>
                  </div>
                  <Field label="服薬理由" value={reason} onChange={setReason} placeholder="例: 不安・動悸" />
                  <Field label="服薬後の状態" value={effect} onChange={setEffect} placeholder="例: 少し楽になった" />
                </>
              ) : (
                <>
                  <Field label="医療機関名 *" value={institution} onChange={setInstitution} placeholder="例: ○○心療内科" />
                  <Field label="受診内容・診断" value={reason} onChange={setReason} placeholder="例: 不眠・不安障害の診察" />
                  <Field label="状況・メモ" value={effect} onChange={setEffect} placeholder="例: 診断書を取得した" />
                </>
              )}
            </CardBody>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={saving || (!medicineName.trim() && !institution.trim())}
          >
            {saving ? '保存中...' : '記録を保存する'}
          </Button>
        </div>
      )}

      {/* PINリセット */}
      <div className="mt-10 text-center">
        <button
          onClick={() => { if (confirm('PINをリセットしますか？次回アクセス時に再設定が必要です。')) { clearPin(); window.location.reload() } }}
          className="text-[10px] text-gray-400 underline"
        >
          PINをリセットする
        </button>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  )
}
