'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Play, Loader2 } from 'lucide-react'
import { DatabaseConnection } from '@/types'
import { Button } from '@/components'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

/** Shape we need from Monaco editor for getModel().getValueInRange(getSelection()). */
interface MonacoEditorLike {
  getModel(): { getValueInRange(range: unknown): string } | null
  getSelection(): unknown
}

interface QueryEditorProps {
  onExecute: (query: string) => void
  isExecuting: boolean
  connection: DatabaseConnection | null
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  showToolbar?: boolean
}

export default function QueryEditor({
  onExecute,
  isExecuting,
  connection,
  value,
  onChange,
  onSave,
  showToolbar = true,
}: QueryEditorProps) {
  const editorRef = useRef<MonacoEditorLike | null>(null)

  const handleEditorDidMount = (editor: MonacoEditorLike) => {
    editorRef.current = editor
  }

  const handleExecute = () => {
    const editor = editorRef.current
    if (editor) {
      const model = editor.getModel()
      const selectedText = model ? model.getValueInRange(editor.getSelection()) : ''
      onExecute(selectedText || value)
    } else {
      onExecute(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleExecute()
    }
  }

  return (
    <div className="relative flex flex-col h-1/2 border-b border-[var(--border)] bg-white">
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Query Editor</span>
            {connection && (
              <span className="text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded border border-rose-100">
                {connection.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <Button variant="secondary" onClick={onSave} disabled={!connection && !value.trim()}>
                Save query
              </Button>
            )}
            <Button variant="primary" onClick={handleExecute} disabled={isExecuting || !connection}>
              {isExecuting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Query (⌘+Enter)
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      <div className="flex-1" onKeyDown={handleKeyDown}>
        <MonacoEditor
          height="100%"
          defaultLanguage="sql"
          theme="velora-light"
          value={value}
          onChange={(val) => onChange(val || '')}
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('velora-light', {
              base: 'vs',
              inherit: true,
              colors: {
                'editor.background': '#ffffff',
                'editorCursor.foreground': '#ec4899',
                'editor.lineHighlightBackground': '#fff7ed',
                'editor.selectionBackground': '#fde2f2',
                'editorLineNumber.foreground': '#94a3b8',
                'editorLineNumber.activeForeground': '#ec4899',
                'editorIndentGuide.background': '#e2e8f0',
                'editorIndentGuide.activeBackground': '#f9a8d4',
              },
              rules: [],
            })
          }}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, monospace",
            fontLigatures: true,
            lineHeight: 22,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
          }}
        />
      </div>
      {!connection && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-500 text-sm bg-gradient-to-b from-white via-transparent to-slate-100">
          Connect to a database to run queries
        </div>
      )}
    </div>
  )
}
