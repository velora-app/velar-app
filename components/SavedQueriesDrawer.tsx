'use client'

import { useMemo, useState } from 'react'
import { Pencil, Trash2, Filter, Clock3, Database } from 'lucide-react'
import { SavedQuery, DatabaseConnection } from '@/types'
import { Drawer, Select, Input, Button, type SelectOption } from '@/components'

interface SavedQueriesDrawerProps {
  open: boolean
  onClose: () => void
  queries: SavedQuery[]
  connections: DatabaseConnection[]
  activeConnection: DatabaseConnection | null
  onLoad: (query: SavedQuery, run?: boolean) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onNewBlank: () => void
}

export default function SavedQueriesDrawer({
  open,
  onClose,
  queries,
  connections,
  activeConnection,
  onLoad,
  onDelete,
  onRename,
  onNewBlank,
}: SavedQueriesDrawerProps) {
  const [filter, setFilter] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const filtered = useMemo(() => {
    if (filter === 'all') return queries
    return queries.filter((q) => !q.connectionId || q.connectionId === filter)
  }, [queries, filter])

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.createdAt - a.createdAt), [filtered])

  const scopeOptions: SelectOption[] = [
    { value: 'all', label: 'All connections' },
    ...connections.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Saved Queries"
      side="right"
      width={420}
      overlayLabel="Close saved queries"
    >
      <div className="px-4 py-3 border-b border-[var(--border)] space-y-3 bg-slate-50/60">
        <div className="space-y-2 w-full">
          <label className="text-xs text-slate-500 flex items-center gap-2">
            <Filter size={14} /> Scope
          </label>
          <Select
            options={scopeOptions}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="[&_select]:bg-slate-100 [&_select]:text-sm"
          />
          {activeConnection && filter === 'all' && (
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-transparent"
              onClick={() => setFilter(activeConnection.id)}
            >
              Filter to {activeConnection.name}
            </Button>
          )}
        </div>
      </div>
      <div className="px-4 py-3 border-b border-[var(--border)] bg-white/90">
        <Button
          variant="primary"
          onClick={onNewBlank}
          className="w-full justify-center py-3"
          title="Open empty editor"
        >
          <span className="text-lg leading-none">＋</span>
          <span className="font-semibold">New Query</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sorted.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">
            Nothing saved yet. Run a query, click Save, pick scope, done.
          </div>
        ) : (
          sorted.map((q) => {
            const connLabel = q.connectionId
              ? connections.find((c) => c.id === q.connectionId)?.name || 'Specific connection'
              : 'All connections'
            return (
              <div
                key={q.id}
                className="rounded-xl border border-[var(--border)] p-3 bg-white shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {editingId === q.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="[&_input]:py-1 [&_input]:text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onRename(q.id, editingName.trim() || q.name)
                              setEditingId(null)
                            } else if (e.key === 'Escape') {
                              setEditingId(null)
                            }
                          }}
                        />
                      ) : (
                        q.name
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <Database size={12} /> {connLabel}
                      <span className="text-slate-400">•</span>
                      <Clock3 size={12} /> {new Date(q.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {editingId === q.id ? (
                      <>
                        <Button
                          type="button"
                          variant="iconPrimary"
                          onClick={() => {
                            onRename(q.id, editingName.trim() || q.name)
                            setEditingId(null)
                          }}
                          title="Save name"
                          aria-label="Save name"
                        >
                          ✓
                        </Button>
                        <Button
                          type="button"
                          variant="icon"
                          onClick={() => setEditingId(null)}
                          className="bg-slate-600 text-white hover:bg-slate-700 hover:text-white"
                          title="Cancel"
                          aria-label="Cancel"
                        >
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="iconPrimary"
                          onClick={() => {
                            setEditingId(q.id)
                            setEditingName(q.name)
                            onLoad(q, false)
                          }}
                          title="Load in editor"
                          aria-label="Load in editor"
                        >
                          <Pencil size={14} aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="iconDanger"
                          onClick={() => onDelete(q.id)}
                          title="Delete"
                          aria-label="Delete query"
                        >
                          <Trash2 size={14} aria-hidden />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap max-h-28 overflow-hidden border border-[var(--border)] bg-slate-50 rounded-md p-2">
                  {q.query}
                </pre>
              </div>
            )
          })
        )}
      </div>
    </Drawer>
  )
}
