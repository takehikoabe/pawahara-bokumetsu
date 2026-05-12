import type { Incident, EvidenceFile } from '@/types'

export type EvidenceLevel = 1 | 2 | 3 | 4 | 5

export interface EvidenceStrength {
  level: EvidenceLevel
  label: string
  description: string
  color: string
  bgColor: string
}

export function calcEvidenceLevel(incident: Incident, evidenceFiles: EvidenceFile[] = []): EvidenceLevel {
  // レベル5: 録音・診断書・客観資料
  const hasAudioOrMedical = evidenceFiles.some(f => f.fileType === 'audio' || f.fileType === 'medical')
  if (hasAudioOrMedical || incident.witnessStatus === 'recording') return 5

  // レベル4: メール・チャット・議事録
  const hasDocEvidence = evidenceFiles.some(f => ['email', 'chat', 'minutes', 'doc', 'screenshot'].includes(f.fileType))
  if (hasDocEvidence || ['email', 'chat', 'minutes'].includes(incident.witnessStatus)) return 4

  // レベル3: 目撃者あり
  if (incident.witnessStatus === 'yes') return 3

  // レベル2: 当日メモ（発生日と記録日が同日）
  const occurredDate = new Date(incident.occurredAt).toDateString()
  const createdDate = new Date(incident.createdAt).toDateString()
  if (occurredDate === createdDate && incident.rawNote.trim().length > 0) return 2

  // レベル1: 本人メモのみ
  return 1
}

export function getEvidenceStrength(level: EvidenceLevel): EvidenceStrength {
  const map: Record<EvidenceLevel, EvidenceStrength> = {
    1: { level: 1, label: 'Lv.1 本人メモ', description: '本人記録のみ',           color: 'text-gray-600',   bgColor: 'bg-gray-100 border-gray-300' },
    2: { level: 2, label: 'Lv.2 当日記録', description: '当日中に記録済み',        color: 'text-blue-600',   bgColor: 'bg-blue-50 border-blue-300' },
    3: { level: 3, label: 'Lv.3 目撃者',   description: '目撃者あり',              color: 'text-teal-600',   bgColor: 'bg-teal-50 border-teal-300' },
    4: { level: 4, label: 'Lv.4 書面証拠', description: 'メール/チャット/議事録',  color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-300' },
    5: { level: 5, label: 'Lv.5 客観資料', description: '録音/診断書あり',         color: 'text-emerald-700',bgColor: 'bg-emerald-50 border-emerald-300' },
  }
  return map[level]
}
