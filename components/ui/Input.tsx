'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

const inputBaseClass =
  'w-full px-3 py-2 bg-white border border-[var(--border)] rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string
  error?: string
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${inputBaseClass} ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
