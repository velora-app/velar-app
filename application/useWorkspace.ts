/**
 * Application layer: workspace use case.
 * Encapsulates all workspace state and handlers so the page only composes UI.
 * Depends on domain (types) and infrastructure (lib).
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DatabaseConnection, DatabaseTable, QueryResult, SavedQuery } from '@/types'
import {
  loadConnections,
  saveConnections,
  loadSavedQueries,
  saveSavedQueries,
  loadActiveConnectionId,
  saveActiveConnectionId,
  saveTextFile,
  runQuery,
  fetchSchemaRemote,
  logger,
  SAVED_QUERIES_LIMIT,
} from '@/lib'

export function useWorkspace() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(null)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [isConnectionsDrawerOpen, setIsConnectionsDrawerOpen] = useState(false)
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [editingFromSaved, setEditingFromSaved] = useState(false)
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null)
  const [currentSavedName, setCurrentSavedName] = useState<string | null>(null)
  const [schemaTables, setSchemaTables] = useState<DatabaseTable[]>([])
  const [isSchemaLoading, setIsSchemaLoading] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  const updateActiveConnection = useCallback((conn: DatabaseConnection | null) => {
    setActiveConnection(conn)
    saveActiveConnectionId(conn ? conn.id : null)
  }, [])

  const handleNewConnection = useCallback((connection: DatabaseConnection) => {
    setConnections((prev) => {
      const updated = [...prev, connection]
      saveConnections(updated)
      return updated
    })
    setActiveConnection(connection)
    saveActiveConnectionId(connection.id)
    setIsConnectionModalOpen(false)
    setIsConnectionsDrawerOpen(false)
  }, [])

  const handleSaveCurrentQuery = useCallback(() => {
    if (!queryText.trim()) return
    const base: SavedQuery = {
      id: `sq-${Date.now()}`,
      name: queryText.split('\n')[0].slice(0, 40).trim() || 'Query',
      query: queryText,
      connectionId: activeConnection?.id,
      connectionName: activeConnection?.name,
      createdAt: Date.now(),
    }

    setSavedQueries((prev) => {
      // Update in place when editing a saved query (match by id – safe for duplicate names)
      if (editingFromSaved && currentSavedId) {
        const existing = prev.find((q) => q.id === currentSavedId)
        if (existing) {
          const updated = prev
            .map((q) =>
              q.id === currentSavedId
                ? {
                    ...existing,
                    name: base.name,
                    query: base.query,
                    connectionId: base.connectionId,
                    connectionName: base.connectionName,
                  }
                : q
            )
            .slice(0, SAVED_QUERIES_LIMIT)
          saveSavedQueries(updated)
          setCurrentSavedName(base.name)
          return updated
        }
      }
      const updated = [base, ...prev].slice(0, SAVED_QUERIES_LIMIT)
      saveSavedQueries(updated)
      return updated
    })
  }, [queryText, activeConnection, editingFromSaved, currentSavedId])

  const handleDeleteSaved = useCallback((id: string) => {
    setSavedQueries((prev) => {
      const updated = prev.filter((q) => q.id !== id)
      saveSavedQueries(updated)
      return updated
    })
    if (currentSavedId === id) {
      setCurrentSavedId(null)
      setCurrentSavedName(null)
    }
  }, [currentSavedId])

  const loadSchema = useCallback(async (connection: DatabaseConnection) => {
    setIsSchemaLoading(true)
    setSchemaError(null)
    try {
      const { tables } = await fetchSchemaRemote(connection)
      setSchemaTables(tables)
    } catch (error) {
      setSchemaTables([])
      setSchemaError(error instanceof Error ? error.message : 'Failed to load schema')
    } finally {
      setIsSchemaLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadedConns = loadConnections()
    setConnections(loadedConns)
    setSavedQueries(loadSavedQueries())
    const lastId = loadActiveConnectionId()
    if (lastId) {
      const found = loadedConns.find((c) => c.id === lastId)
      if (found) setActiveConnection(found)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (activeConnection) loadSchema(activeConnection)
    else {
      setSchemaTables([])
      setSchemaError(null)
    }
  }, [activeConnection, loadSchema])

  const handleExecuteQuery = useCallback(
    async (query: string) => {
      if (!activeConnection || !query.trim()) return
      setIsExecuting(true)
      try {
        const result = await runQuery(activeConnection, query)
        setQueryResult(result)
      } catch (error) {
        logger.error('Query execution error', error)
        setQueryResult({
          columns: [],
          rows: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setIsExecuting(false)
      }
    },
    [activeConnection]
  )

  const formatIdentifier = useCallback((value: string, type: DatabaseConnection['type']) => {
    if (!value) return ''
    switch (type) {
      case 'mysql':
        return `\`${value}\``
      case 'postgresql':
      case 'sqlite':
        return `"${value}"`
      default:
        return value
    }
  }, [])

  const buildSelectStatement = useCallback(
    (table: DatabaseTable): string => {
      if (!activeConnection) return ''
      if (activeConnection.type === 'mongodb') {
        return JSON.stringify(
          { collection: table.name, filter: {}, limit: 100, projection: {} },
          null,
          2
        )
      }
      if (activeConnection.type === 'redis') return `GET ${table.name}`
      const name = formatIdentifier(table.name, activeConnection.type)
      const schema = table.schema ? `${formatIdentifier(table.schema, activeConnection.type)}.` : ''
      return `SELECT * FROM ${schema}${name} LIMIT 100;`
    },
    [activeConnection, formatIdentifier]
  )

  const handleSelectTable = useCallback(
    (table: DatabaseTable) => {
      if (!activeConnection) return
      const statement = buildSelectStatement(table)
      if (!statement) return
      setQueryText(statement)
      handleExecuteQuery(statement)
    },
    [activeConnection, buildSelectStatement, handleExecuteQuery]
  )

  const handleLoadSaved = useCallback(
    (query: SavedQuery, run?: boolean) => {
      setQueryText(query.query)
      setIsSavedDrawerOpen(false)
      setEditingFromSaved(true)
      setCurrentSavedId(query.id)
      setCurrentSavedName(query.name)
      if (query.connectionId) {
        const conn = connections.find((c) => c.id === query.connectionId) ?? null
        updateActiveConnection(conn)
      }
      if (run) handleExecuteQuery(query.query)
    },
    [connections, handleExecuteQuery, updateActiveConnection]
  )

  const handleNewBlankQuery = useCallback(() => {
    setQueryText('')
    setQueryResult(null)
    setEditingFromSaved(true)
    setCurrentSavedId(null)
    setCurrentSavedName(null)
    setIsSavedDrawerOpen(false)
  }, [])

  const handleExportSaved = useCallback(async (query: SavedQuery) => {
    await saveTextFile(query.query, `${query.name || 'query'}.sql`, {
      title: 'Export query',
      filters: [{ name: 'SQL Files', extensions: ['sql'] }],
    })
  }, [])

  const handleGoHome = useCallback(() => {
    updateActiveConnection(null)
    setQueryResult(null)
    setSchemaTables([])
    setQueryText('')
    setEditingFromSaved(false)
    setCurrentSavedId(null)
    setCurrentSavedName(null)
  }, [updateActiveConnection])

  const handleRenameSaved = useCallback(
    (id: string, name: string) => {
      const renamed = savedQueries.find((q) => q.id === id)
      setSavedQueries((prev) => {
        const updated = prev.map((q) => (q.id === id ? { ...q, name } : q))
        saveSavedQueries(updated)
        return updated
      })
      if (renamed?.id === currentSavedId) setCurrentSavedName(name)
    },
    [savedQueries, currentSavedId]
  )

  const hasConnection = useMemo(() => Boolean(activeConnection), [activeConnection])
  const hasConnectionsList = useMemo(
    () => isHydrated && connections.length > 0,
    [connections.length, isHydrated]
  )
  const showWorkspace = useMemo(
    () => hasConnection || editingFromSaved,
    [hasConnection, editingFromSaved]
  )

  const selectConnectionById = useCallback(
    (id: string) => {
      const conn = connections.find((c) => c.id === id) ?? null
      updateActiveConnection(conn)
    },
    [connections, updateActiveConnection]
  )

  return {
    // state
    connections,
    activeConnection,
    queryResult,
    queryText,
    setQueryText,
    schemaTables,
    isSchemaLoading,
    schemaError,
    savedQueries,
    isExecuting,
    editingFromSaved,
    currentSavedName,
    hasConnection,
    hasConnectionsList,
    showWorkspace,
    // UI state
    isConnectionModalOpen,
    setIsConnectionModalOpen,
    isConfigModalOpen,
    setIsConfigModalOpen,
    isConnectionsDrawerOpen,
    setIsConnectionsDrawerOpen,
    isSavedDrawerOpen,
    setIsSavedDrawerOpen,
    // convenience (so page avoids inline lambdas)
    closeConnectionModal: () => setIsConnectionModalOpen(false),
    closeConfigModal: () => setIsConfigModalOpen(false),
    openConnectionModal: () => setIsConnectionModalOpen(true),
    openConfigModal: () => setIsConfigModalOpen(true),
    closeConnectionsDrawer: () => setIsConnectionsDrawerOpen(false),
    openConnectionsDrawer: () => setIsConnectionsDrawerOpen(true),
    closeSavedDrawer: () => setIsSavedDrawerOpen(false),
    openSavedDrawer: () => setIsSavedDrawerOpen(true),
    selectConnectionById,
    // actions
    updateActiveConnection,
    handleNewConnection,
    handleSaveCurrentQuery,
    handleDeleteSaved,
    handleLoadSaved,
    handleNewBlankQuery,
    handleExportSaved,
    handleExecuteQuery,
    loadSchema,
    handleSelectTable,
    handleGoHome,
    handleRenameSaved,
  }
}
