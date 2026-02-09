'use client'

import Image from 'next/image'
import { DatabaseConnection } from '@/types'
import { Select, Button } from '@/components'

type ButtonVariant = 'primary' | 'secondary'

interface AppHeaderProps {
  activeConnection: DatabaseConnection | null
  connections: DatabaseConnection[]
  hasConnectionsList: boolean
  onSelectConnection: (connectionId: string) => void
  onGoHome: () => void
  onOpenConnections: () => void
  onOpenSaved: () => void
  onNewQuery: () => void
  onNewConnection: () => void
  onImportConfig: () => void
}

type HeaderActionId = 'connections' | 'saved' | 'newQuery' | 'newConnection' | 'importConfig'

const HEADER_ACTIONS: { id: HeaderActionId; label: string; variant: ButtonVariant }[] = [
  { id: 'connections', label: 'Connections', variant: 'secondary' },
  { id: 'saved', label: 'Saved queries', variant: 'secondary' },
  { id: 'newQuery', label: 'New query', variant: 'primary' },
  { id: 'newConnection', label: 'New Connection', variant: 'primary' },
  { id: 'importConfig', label: 'Import config', variant: 'secondary' },
]

export default function AppHeader({
  activeConnection,
  connections,
  hasConnectionsList,
  onSelectConnection,
  onGoHome,
  onOpenConnections,
  onOpenSaved,
  onNewQuery,
  onNewConnection,
  onImportConfig,
}: AppHeaderProps) {
  const handlers: Record<HeaderActionId, () => void> = {
    connections: onOpenConnections,
    saved: onOpenSaved,
    newQuery: onNewQuery,
    newConnection: onNewConnection,
    importConfig: onImportConfig,
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Button
          variant="ghost"
          onClick={onGoHome}
          className="text-slate-900 font-semibold hover:text-rose-600 hover:bg-transparent"
          title="Go to home"
        >
          <Image src="/assets/main-logo-icon.svg" alt="Velora" width={24} height={24} />
          Velora
        </Button>
        {/* {activeConnection ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span className="text-slate-800 font-medium">{activeConnection.name}</span>
            <span className="text-slate-500">
              {activeConnection.host}:{activeConnection.port}
            </span>
          </div>
        ) : (
          <span className="text-slate-500">No connection selected</span>
        )}
        {hasConnectionsList && (
          <div className="ml-2 min-w-[140px] [&_select]:py-1 [&_select]:text-sm">
            <Select
              options={[
                { value: '', label: 'Switch connection...' },
                ...connections.map((c) => ({ value: c.id, label: `${c.name} (${c.type})` })),
              ]}
              value={activeConnection?.id ?? ''}
              onChange={(e) => onSelectConnection(e.target.value)}
            />
          </div>
        )} */}
      </div>

      <div className="flex items-center gap-3">
        {HEADER_ACTIONS.map(({ id, label, variant }) => (
          <Button key={id} variant={variant} onClick={handlers[id]}>
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
