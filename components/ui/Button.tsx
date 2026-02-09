'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

const PRIMARY_GRADIENT =
  'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:brightness-110'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'icon'
  | 'iconPrimary'
  | 'iconDanger'
  | 'tile'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `flex items-center gap-2 px-4 py-1.5 ${PRIMARY_GRADIENT} disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-md transition-colors text-sm shadow-sm`,
  secondary:
    'flex items-center gap-2 px-3 py-1.5 text-sm border border-[var(--border)] text-slate-700 hover:border-slate-400 rounded-md bg-white shadow-sm disabled:opacity-50',
  ghost:
    'flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50',
  icon: 'p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 inline-flex items-center justify-center',
  iconPrimary: `p-1.5 rounded-md ${PRIMARY_GRADIENT} text-white inline-flex items-center justify-center`,
  iconDanger:
    'p-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 inline-flex items-center justify-center',
  tile: 'relative h-full min-h-[120px] text-left rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-sm flex flex-col items-stretch',
}

export default function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
