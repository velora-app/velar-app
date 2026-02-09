'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'

const textareaBaseClass =
  'w-full px-3 py-2 border border-[var(--border)] rounded-md font-mono text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string
  error?: string
  className?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId =
      id ?? (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
    return (
      <div className={className}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${textareaBaseClass} ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={textareaId ? `${textareaId}-error` : undefined}
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

Textarea.displayName = 'Textarea'
export default Textarea
