'use client'

import type { DatabaseConnection } from '@/types'
import {
  Sidebar,
  SchemaPanel,
  ConnectionModal,
  ConfigImportModal,
  SavedQueriesDrawer,
  HomeHero,
  AppHeader,
  Drawer,
  QueryWorkspace,
  ErrorBoundary,
} from '@/components'
import { useWorkspace } from '@/application'
import { DRAWER_WIDTH } from '@/lib'

export default function Home() {
  const w = useWorkspace()

  const queryWorkspaceProps = {
    queryText: w.queryText,
    setQueryText: w.setQueryText,
    queryResult: w.queryResult,
    activeConnection: w.activeConnection,
    isExecuting: w.isExecuting,
    onExecute: w.handleExecuteQuery,
    onSave: w.handleSaveCurrentQuery,
  }

  const mainContent = !w.showWorkspace ? (
    <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden">
      <div className="floating-bg">
        <div className="floating-blob blob-1" />
        <div className="floating-blob blob-2" />
        <div className="floating-blob blob-3" />
      </div>
      <HomeHero
        connectionsCount={w.connections.length}
        savedCount={w.savedQueries.length}
        hasConnections={w.hasConnectionsList}
        onNewQuery={w.handleNewBlankQuery}
        onNewConnection={w.openConnectionModal}
        onImportConfig={w.openConfigModal}
        onViewConnections={w.openConnectionsDrawer}
        onSavedQueries={w.openSavedDrawer}
      />
    </div>
  ) : w.editingFromSaved ? (
    <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
      <QueryWorkspace
        {...queryWorkspaceProps}
        toolbarVariant="saved"
        connections={w.connections}
        onConnectionChange={w.selectConnectionById}
        currentSavedName={w.currentSavedName}
        toolbarClassName="px-4 py-3 border-b border-[var(--border)] bg-white"
      />
    </div>
  ) : (
    <div className="flex-1 flex overflow-hidden">
      <SchemaPanel
        connection={w.activeConnection}
        tables={w.schemaTables}
        isLoading={w.isSchemaLoading}
        error={w.schemaError}
        onRefresh={() => w.activeConnection && w.loadSchema(w.activeConnection)}
        onSelect={w.handleSelectTable}
        onRun={w.handleSelectTable}
      />
      <QueryWorkspace
        {...queryWorkspaceProps}
        toolbarLeft={<span className="text-sm text-slate-700">Query Editor</span>}
      />
    </div>
  )

  return (
    <ErrorBoundary>
      <div className="flex h-screen text-slate-900" style={{ background: 'var(--background)' }}>
        <div className="flex-1 flex flex-col">
          <AppHeader
            activeConnection={w.activeConnection}
            connections={w.connections}
            hasConnectionsList={w.hasConnectionsList}
            onSelectConnection={w.selectConnectionById}
            onGoHome={w.handleGoHome}
            onOpenConnections={w.openConnectionsDrawer}
            onOpenSaved={w.openSavedDrawer}
            onNewQuery={w.handleNewBlankQuery}
            onNewConnection={w.openConnectionModal}
            onImportConfig={w.openConfigModal}
          />

        {mainContent}
      </div>

      <Drawer
        open={w.isConnectionsDrawerOpen}
        onClose={w.closeConnectionsDrawer}
        title="Connections"
        side="right"
        width={DRAWER_WIDTH}
        overlayLabel="Close connections"
      >
        <Sidebar
          connections={w.connections}
          activeConnection={w.activeConnection}
          onSelectConnection={(conn: DatabaseConnection) => {
            w.updateActiveConnection(conn)
            w.closeConnectionsDrawer()
          }}
          onNewConnection={() => {
            w.closeConnectionsDrawer()
            w.openConnectionModal()
          }}
        />
      </Drawer>

      {w.isSavedDrawerOpen && (
        <SavedQueriesDrawer
          open={w.isSavedDrawerOpen}
          onClose={w.closeSavedDrawer}
          queries={w.savedQueries}
          connections={w.connections}
          activeConnection={w.activeConnection}
          onLoad={w.handleLoadSaved}
          onDelete={w.handleDeleteSaved}
          onRename={w.handleRenameSaved}
          onNewBlank={w.handleNewBlankQuery}
        />
      )}

      {w.isConnectionModalOpen && (
        <ConnectionModal onClose={w.closeConnectionModal} onSave={w.handleNewConnection} />
      )}

      {w.isConfigModalOpen && (
        <ConfigImportModal
          onClose={w.closeConfigModal}
          onImport={(connection: DatabaseConnection) => {
            w.handleNewConnection(connection)
            w.closeConfigModal()
          }}
        />
      )}
      </div>
    </ErrorBoundary>
  )
}
