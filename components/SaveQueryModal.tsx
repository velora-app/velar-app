'use client'

import { useEffect, useState } from 'react'
import { DatabaseConnection, SavedQuery } from '@/types'
import { Modal, Input, Select, Button, type SelectOption } from '@/components'

interface SaveQueryModalProps {
  open: boolean
  onClose: () => void
  onSave: (query: SavedQuery) => void
  connections: DatabaseConnection[]
  activeConnection: DatabaseConnection | null
  queryText: string
}

export default function SaveQueryModal({
  open,
  onClose,
  onSave,
  connections,
  activeConnection,
  queryText,
}: SaveQueryModalProps) {
  const [name, setName] = useState('')
  const [scope, setScope] = useState<string>('all')

  useEffect(() => {
    if (open) {
      const firstLine = queryText.split('\n').find(Boolean) || 'Saved query'
      setName(firstLine.slice(0, 80))
      setScope(activeConnection ? activeConnection.id : 'all')
    }
  }, [open, queryText, activeConnection])

  const scopeOptions: SelectOption[] = [
    { value: 'all', label: 'All connections' },
    ...connections.map((c) => ({ value: c.id, label: c.name })),
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const connection = scope === 'all' ? undefined : scope
    const newQuery: SavedQuery = {
      id: `sq-${Date.now()}`,
      name: name.trim(),
      query: queryText,
      connectionId: connection,
      connectionName: connection ? connections.find((c) => c.id === connection)?.name : 'All',
      createdAt: Date.now(),
    }
    onSave(newQuery)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Save query" size="sm">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
        />
        <Select
          label="Scope"
          options={scopeOptions}
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        />
        <p className="text-xs text-slate-500 -mt-2">
          Limit to a specific connection if the SQL depends on that database.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
