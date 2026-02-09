'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { DatabaseConnection } from '@/types'
import { Modal, Textarea, Button } from '@/components'
import { parseConnectionConfig } from '@/lib'

interface ConfigImportModalProps {
  onClose: () => void
  onImport: (connection: DatabaseConnection) => void
}

export default function ConfigImportModal({ onClose, onImport }: ConfigImportModalProps) {
  const [raw, setRaw] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    setError(null)
    const trimmed = raw.trim()
    if (!trimmed) {
      setError('Paste an .env or JSON config first')
      return
    }
    const parsed = parseConnectionConfig(trimmed)
    if (!parsed?.host || !parsed?.database) {
      setError('Host and database are required; paste a config that includes them')
      return
    }
    const type = parsed.type || 'postgresql'
    const connection: DatabaseConnection = {
      id: `conn-${Date.now()}`,
      name: parsed.name || parsed.database || parsed.host,
      type: type as DatabaseConnection['type'],
      host: parsed.host,
      port: parsed.port ?? (type === 'mysql' ? 3306 : 5432),
      database: parsed.database,
      username: parsed.username ?? '',
      password: parsed.password ?? '',
      ssl: true,
    }
    onImport(connection)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Import from config"
      icon={<Upload className="text-fuchsia-500" size={20} />}
      size="md"
    >
      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-600">
          Paste either an .env snippet (DB_HOST=…) or a JSON block (Sequelize-style). Passwords stay
          in-memory; they are not saved to local storage.
        </p>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={10}
          placeholder={`DB_USERNAME=postgres\nDB_PASSWORD=secret\nDB_NAME=mydb\nDB_HOST=localhost\nDB_PORT=5432`}
        />
        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleImport}>
            Import & Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
