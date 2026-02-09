'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className = '', ...props }, ref) => {
    const inputId = id ?? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="w-4 h-4 text-emerald-500 bg-white border-[var(--border)] rounded focus:ring-emerald-400"
          {...props}
        />
        <label htmlFor={inputId} className="text-sm text-slate-700 cursor-pointer select-none">
          {label}
        </label>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
export default Checkbox
