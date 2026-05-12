import Dexie, { type Table } from 'dexie'
import type { Incident, EvidenceFile, HealthLog, MedicationLog } from '@/types'

class AppDB extends Dexie {
  incidents!: Table<Incident>
  evidenceFiles!: Table<EvidenceFile>
  healthLogs!: Table<HealthLog>
  medicationLogs!: Table<MedicationLog>

  constructor() {
    super('PawaharaBokumetsuDB')
    this.version(1).stores({
      incidents:      '++id, occurredAt, riskScore, createdAt',
      evidenceFiles:  '++id, incidentId, fileType, createdAt',
      healthLogs:     '++id, recordedAt',
      medicationLogs: '++id, takenAt, linkedIncidentId',
    })
  }
}

export const db = new AppDB()

export async function getRecentIncidents(limit = 50): Promise<Incident[]> {
  return db.incidents.orderBy('occurredAt').reverse().limit(limit).toArray()
}

export async function getIncidentById(id: number): Promise<Incident | undefined> {
  return db.incidents.get(id)
}

export async function saveIncident(incident: Omit<Incident, 'id'>): Promise<number> {
  return db.incidents.add(incident)
}

export async function updateIncident(id: number, changes: Partial<Incident>): Promise<void> {
  await db.incidents.update(id, { ...changes, updatedAt: new Date().toISOString() })
}

export async function getRecentHealthLogs(limit = 30): Promise<HealthLog[]> {
  return db.healthLogs.orderBy('recordedAt').reverse().limit(limit).toArray()
}

export async function saveHealthLog(log: Omit<HealthLog, 'id'>): Promise<number> {
  return db.healthLogs.add(log)
}

export async function getEvidenceByIncident(incidentId: number): Promise<EvidenceFile[]> {
  return db.evidenceFiles.where('incidentId').equals(incidentId).toArray()
}

export async function saveEvidenceFile(file: Omit<EvidenceFile, 'id'>): Promise<number> {
  return db.evidenceFiles.add(file)
}
