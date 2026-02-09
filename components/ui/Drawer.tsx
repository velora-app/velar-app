'use client'

import { ReactNode } from 'react'
import Button from './Button'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Which side the panel slides from */
  side?: 'left' | 'right'
  /** Panel width in pixels */
  width?: number
  children: ReactNode
  /** Accessible label for the overlay (close control) */
  overlayLabel?: string
}

export default function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  width = 420,
  children,
  overlayLabel = 'Close',
}: DrawerProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Drawer'}
    >
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label={overlayLabel}
        tabIndex={0}
      />
      <aside
        className="bg-white shadow-xl border-[var(--border)] h-full overflow-hidden flex flex-col"
        style={{
          width: width,
          maxWidth: '100vw',
          borderLeftWidth: side === 'right' ? 1 : 0,
          borderRightWidth: side === 'left' ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <Button type="button" variant="icon" onClick={onClose} aria-label="Close">
              ×
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </aside>
    </div>
  )
}
