'use client'

import Image from 'next/image'
import { ActionTile, Button } from '@/components'

interface HomeHeroProps {
  connectionsCount: number
  savedCount: number
  hasConnections: boolean
  onNewQuery: () => void
  onNewConnection: () => void
  onImportConfig: () => void
  onViewConnections: () => void
  onSavedQueries: () => void
}

export default function HomeHero({
  connectionsCount,
  savedCount,
  hasConnections,
  onNewQuery,
  onNewConnection,
  onImportConfig,
  onViewConnections,
  onSavedQueries,
}: HomeHeroProps) {
  return (
    <div className="relative bg-white/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-lg p-10 max-w-5xl w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-blob bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.25),transparent_55%)]" />
        <div className="hero-blob hero-blob-delay bg-[radial-gradient(circle_at_80%_30%,rgba(251,191,36,0.22),transparent_55%)]" />
        <div className="hero-blob hero-blob-small bg-[radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.2),transparent_50%)]" />
      </div>
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Image src="/assets/logo-box.svg" alt="Velora" width={140} height={40} />
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100 shadow-sm">
              ⚡ Quick start
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Connect and run your data fast
            </h2>
            <p className="text-slate-600 leading-relaxed text-balance">
              Paste a config, pick a saved profile, or jump straight into a new query. Everything stays on your device.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <Badge label={`${connectionsCount} connections`} active={hasConnections} />
            <Badge label={`${savedCount} saved queries`} active={savedCount > 0} />
            <Badge label="Local-only" active />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CTAButton label="New query" onClick={onNewQuery} />
            <CTAButton label="Add connection" onClick={onNewConnection} />
            <CTAButton label="Import config" onClick={onImportConfig} altPalette />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionTile
            title="View connections"
            hint="Pick from saved profiles."
            disabled={!hasConnections}
            disabledHint="Add one to enable."
            badge={`${connectionsCount}`}
            onClick={onViewConnections}
          />
          <ActionTile
            title="Saved queries"
            hint="Reopen and run quickly."
            disabled={!hasConnections && savedCount === 0}
            disabledHint="Save a query or add a connection."
            badge={`${savedCount}`}
            onClick={onSavedQueries}
          />
        </div>
      </div>
    </div>
  )
}
function Badge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${
        active
          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
          : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}
    >
      {label}
    </span>
  )
}
function CTAButton({
  label,
  onClick,
  altPalette,
}: {
  label: string
  onClick: () => void
  altPalette?: boolean
}) {
  const gradientClass = altPalette
    ? 'from-amber-400 via-pink-500 to-rose-500'
    : 'from-rose-500 via-pink-500 to-amber-400'
  return (
    <Button
      variant="primary"
      onClick={onClick}
      className={`flex-1 min-w-[220px] justify-center py-3 rounded-xl text-base font-semibold bg-gradient-to-r ${gradientClass} shadow-md`}
    >
      <span className="text-lg leading-none">＋</span> {label}
    </Button>
  )
}
