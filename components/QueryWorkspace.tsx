'use client'

import { ReactNode } from 'react'
import { DatabaseConnection, QueryResult } from '@/types'
import { QueryEditor, DataTable, EditorToolbar } from '@/components'

interface QueryWorkspaceProps {
  toolbarLeft?: ReactNode
  toolbarClassName?: string
  toolbarVariant?: 'main' | 'saved'
  connections?: DatabaseConnection[]
  onConnectionChange?: (id: string) => void
  currentSavedName?: string | null
  queryText: string
  setQueryText: (value: string) => void
  queryResult: QueryResult | null
  activeConnection: DatabaseConnection | null
  isExecuting: boolean
  onExecute: (query: string) => void
  onSave: () => void
}

const canRun = (isExecuting: boolean, hasConnection: boolean, hasQuery: boolean) =>
  !isExecuting && hasConnection && hasQuery

export default function QueryWorkspace({
  toolbarLeft,
  toolbarClassName = 'px-4 py-2 bg-slate-50 border-b border-[var(--border)]',
  toolbarVariant = 'main',
  connections = [],
  onConnectionChange,
  currentSavedName,
  queryText,
  setQueryText,
  queryResult,
  activeConnection,
  isExecuting,
  onExecute,
  onSave,
}: QueryWorkspaceProps) {
  const runDisabled = !canRun(isExecuting, !!activeConnection, !!queryText.trim())
  const useSavedToolbar = toolbarVariant === 'saved'

  return (
    <div className="flex-1 flex flex-col">
      <EditorToolbar
        variant={toolbarVariant}
        title="Query Editor"
        currentSavedName={currentSavedName}
        connections={connections}
        activeConnection={activeConnection}
        onConnectionChange={onConnectionChange}
        onSave={onSave}
        onRun={() => onExecute(queryText)}
        isExecuting={isExecuting}
        canSave={!!queryText.trim()}
        canRun={!runDisabled}
        toolbarClassName={toolbarClassName}
        leftContent={useSavedToolbar ? undefined : toolbarLeft}
      />
      <QueryEditor
        onExecute={onExecute}
        isExecuting={isExecuting}
        connection={activeConnection}
        value={queryText}
        onChange={setQueryText}
        onSave={onSave}
        showToolbar={false}
      />
      <div className="border-t border-gray-200">
        <DataTable result={queryResult} />
      </div>
    </div>
  )
}
