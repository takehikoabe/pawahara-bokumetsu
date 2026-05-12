'use client'
import { cn } from '@/lib/utils'

interface ScoreBarProps {
  label: string
  value: number
  max?: number
  color?: string
}

export function ScoreBar({ label, value, max = 10, color }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100)
  const barColor = color ?? (pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-orange-400' : pct >= 30 ? 'bg-yellow-400' : 'bg-green-400')

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
