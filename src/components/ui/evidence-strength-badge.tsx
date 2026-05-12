import { getEvidenceStrength, type EvidenceLevel } from '@/lib/evidence-strength'
import { cn } from '@/lib/utils'

interface Props {
  level: EvidenceLevel
  showDescription?: boolean
  className?: string
}

export function EvidenceStrengthBadge({ level, showDescription = false, className }: Props) {
  const s = getEvidenceStrength(level)
  return (
    <div className={cn(`inline-flex flex-col items-start rounded-xl border px-3 py-1.5 ${s.bgColor}`, className)}>
      <span className={`text-xs font-black ${s.color}`}>{s.label}</span>
      {showDescription && (
        <span className={`text-[10px] ${s.color} opacity-80`}>{s.description}</span>
      )}
    </div>
  )
}

interface BarProps {
  level: EvidenceLevel
  className?: string
}

export function EvidenceStrengthBar({ level, className }: BarProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-[10px] text-gray-500 shrink-0">証拠強度</span>
      <div className="flex gap-0.5">
        {([1, 2, 3, 4, 5] as EvidenceLevel[]).map(l => {
          const s = getEvidenceStrength(l)
          const active = l <= level
          return (
            <div
              key={l}
              className={cn(
                'w-4 h-2 rounded-sm transition-all',
                active ? (l <= 2 ? 'bg-blue-400' : l <= 3 ? 'bg-teal-400' : l <= 4 ? 'bg-indigo-500' : 'bg-emerald-500') : 'bg-gray-200'
              )}
            />
          )
        })}
      </div>
      <span className={`text-[10px] font-bold ${getEvidenceStrength(level).color}`}>
        {getEvidenceStrength(level).label}
      </span>
    </div>
  )
}
