'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

const selectBaseClass =
  'w-full px-3 py-2 bg-white border border-[var(--border)] rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string
  options: SelectOption[]
  error?: string
  className?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId =
      id ?? (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
    return (
      <div className={className}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${selectBaseClass} ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={selectId ? `${selectId}-error` : undefined}
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

Select.displayName = 'Select'
export default Select
