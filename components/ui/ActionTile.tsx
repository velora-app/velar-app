'use client'

import Button from './Button'

interface ActionTileProps {
  title: string
  hint: string
  disabled?: boolean
  onClick: () => void
  badge?: string
  disabledHint?: string
}

export default function ActionTile({
  title,
  hint,
  disabled,
  onClick,
  badge,
  disabledHint,
}: ActionTileProps) {
  return (
    <Button variant="tile" disabled={disabled} onClick={onClick} className="w-full">
      {badge && (
        <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
          {badge}
        </span>
      )}
      <div className="text-sm font-semibold text-slate-900 leading-tight">{title}</div>
      <div className="text-sm text-slate-600 mt-1 leading-snug text-balance">
        {disabled && disabledHint ? disabledHint : hint}
      </div>
    </Button>
  )
}
