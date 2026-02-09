'use client'

import { DatabaseConnection } from '@/types'
import { Button } from '@/components'

interface EditorToolbarProps {
  variant: 'saved' | 'main'
  title?: string
  currentSavedName?: string | null
  connections: DatabaseConnection[]
  activeConnection: DatabaseConnection | null
  onConnectionChange?: (id: string) => void
  onSave: () => void
  onRun: () => void
  isExecuting: boolean
  canSave: boolean
  canRun: boolean
  toolbarClassName?: string
  leftContent?: React.ReactNode
}

export default function EditorToolbar({
  variant,
  title = 'Query Editor',
  currentSavedName,
  connections,
  activeConnection,
  onConnectionChange,
  onSave,
  onRun,
  isExecuting,
  canSave,
  canRun,
  toolbarClassName = 'px-4 py-3 bg-white border-b border-[var(--border)]',
  leftContent,
}: EditorToolbarProps) {
  const label =
    variant === 'saved'
      ? currentSavedName
        ? `Editing: ${currentSavedName}`
        : 'Saved query'
      : title

  return (
    <div className={`flex items-center justify-between ${toolbarClassName}`}>
      <div className="flex items-center gap-3">
        {leftContent ?? <div className="text-sm text-slate-700">{label}</div>}
        {variant === 'saved' && onConnectionChange && (
          <select
            value={activeConnection?.id || ''}
            onChange={(e) => onConnectionChange(e.target.value)}
            className="px-3 py-2 border border-[var(--border)] rounded-md text-sm text-slate-800"
          >
            <option value="">Select connection to run</option>
            {connections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onSave} disabled={!canSave}>
          Save query
        </Button>
        <Button variant="primary" onClick={onRun} disabled={!canRun}>
          {isExecuting ? 'Executing...' : 'Run'}
        </Button>
      </div>
    </div>
  )
}
