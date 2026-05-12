export type IncidentCategory =
  | 'physical'       // 身体的攻撃
  | 'mental'         // 精神的攻撃
  | 'isolation'      // 人間関係からの切り離し
  | 'overwork'       // 過大な要求
  | 'underwork'      // 過小な要求
  | 'privacy'        // 個の侵害
  | 'other'

export type WhatHappened =
  | 'shouted'        // 大声で叱責
  | 'personality'    // 人格否定
  | 'ability'        // 能力否定
  | 'public_denial'  // 公開の場での否定
  | 'ignored'        // 無視
  | 'exclusion'      // 仲間外し
  | 'overloaded'     // 過大な仕事
  | 'underloaded'    // 仕事を外された
  | 'sarcasm'        // 嫌味
  | 'resign_hint'    // 退職示唆
  | 'private'        // 私生活侵害
  | 'other'

export type ActorRelation =
  | 'direct_boss'    // 直属上司
  | 'manager'        // 部長
  | 'executive'      // 役員
  | 'colleague'      // 同僚
  | 'subordinate'    // 部下
  | 'other_dept'     // 他部署
  | 'client'         // 取引先
  | 'other'

export type Location =
  | 'meeting_room'
  | 'office'
  | 'hallway'
  | 'phone'
  | 'email'
  | 'chat'
  | 'online'
  | 'drinking'
  | 'other'

export type WitnessStatus = 'yes' | 'no' | 'unknown' | 'recording' | 'minutes' | 'email' | 'chat'

export interface Incident {
  id?: number
  occurredAt: string        // ISO string
  location: Location
  locationNote?: string
  actorName?: string
  actorRelation: ActorRelation
  whatHappened: WhatHappened[]
  rawNote: string           // 原文メモ
  factSummary?: string      // AI整理: 事実
  feelingSummary?: string   // AI整理: 感情
  inferenceSummary?: string // AI整理: 推測
  formalText?: string       // AI整理: 提出用文章
  witnessStatus: WitnessStatus
  witnessNote?: string
  stressScore: number       // 0-10
  category?: IncidentCategory[]
  powerScore?: number       // 優越的関係 0-10
  necessityScore?: number   // 相当性 0-10
  envScore?: number         // 就業環境 0-10
  riskScore?: number        // 総合リスク 0-100
  aiComment?: string
  missingInfo?: string[]
  createdAt: string
  updatedAt: string
}

export interface EvidenceFile {
  id?: number
  incidentId?: number
  fileType: 'audio' | 'photo' | 'screenshot' | 'email' | 'chat' | 'minutes' | 'doc' | 'medical' | 'other'
  fileName: string
  fileHash?: string
  fileData?: ArrayBuffer   // ローカル保存用
  mimeType?: string
  description?: string
  containsMedical: boolean
  createdAt: string
}

export interface HealthLog {
  id?: number
  recordedAt: string
  stressScore: number    // 0-10
  anxietyScore: number
  angerScore: number
  sleepScore: number     // 0-10 (高=良好)
  appetiteScore: number
  heartPounding: boolean
  nausea: boolean
  headache: boolean
  tearful: boolean
  commuteFear: boolean   // 出勤困難感
  workImpact: number     // 0-10
  memo?: string
  linkedIncidentId?: number
}

export interface MedicationLog {
  id?: number
  takenAt: string
  medicineName: string
  dose?: string
  isPrn: boolean         // 頓服
  reason?: string
  effect?: string
  institution?: string
  linkedIncidentId?: number
  createdAt: string
}

export interface AiAnalysis {
  fact: string
  feeling: string
  inference: string
  impact: string
  formalText: string
  missingInfo: string[]
  riskComment: string
  categories: IncidentCategory[]
  powerScore: number
  necessityScore: number
  envScore: number
  riskScore: number
}
