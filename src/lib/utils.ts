import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })
}

export function riskLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '早期相談推奨', color: 'text-red-600' }
  if (score >= 60) return { label: '高', color: 'text-orange-500' }
  if (score >= 30) return { label: '注意', color: 'text-yellow-500' }
  return { label: '低', color: 'text-green-600' }
}

export function riskBg(score: number): string {
  if (score >= 80) return 'bg-red-100 border-red-300'
  if (score >= 60) return 'bg-orange-100 border-orange-300'
  if (score >= 30) return 'bg-yellow-100 border-yellow-300'
  return 'bg-green-100 border-green-300'
}

export async function hashFile(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const WHAT_HAPPENED_LABELS: Record<string, string> = {
  shouted:       '大声で叱責された',
  personality:   '人格を否定された',
  ability:       '能力を否定された',
  public_denial: 'みんなの前で否定された',
  ignored:       '無視された',
  exclusion:     '仲間外しにされた',
  overloaded:    '過大な仕事を押し付けられた',
  underloaded:   '仕事を外された',
  sarcasm:       '嫌味を言われた',
  resign_hint:   '退職を示唆された',
  private:       '私生活に踏み込まれた',
  other:         'その他',
}

export const ACTOR_LABELS: Record<string, string> = {
  direct_boss: '直属上司',
  manager:     '部長',
  executive:   '役員',
  colleague:   '同僚',
  subordinate: '部下',
  other_dept:  '他部署',
  client:      '取引先',
  other:       'その他',
}

export const LOCATION_LABELS: Record<string, string> = {
  meeting_room: '会議室',
  office:       '執務室',
  hallway:      '廊下',
  phone:        '電話',
  email:        'メール',
  chat:         'チャット',
  online:       'オンライン会議',
  drinking:     '飲み会',
  other:        'その他',
}

export const WITNESS_LABELS: Record<string, string> = {
  yes:       '目撃者あり',
  no:        '目撃者なし',
  unknown:   '不明',
  recording: '録音あり',
  minutes:   '議事録あり',
  email:     'メールあり',
  chat:      'チャットあり',
}

export const CATEGORY_LABELS: Record<string, string> = {
  physical:  '身体的な攻撃',
  mental:    '精神的な攻撃',
  isolation: '人間関係からの切り離し',
  overwork:  '過大な要求',
  underwork: '過小な要求',
  privacy:   '個の侵害',
  other:     'その他・要確認',
}
