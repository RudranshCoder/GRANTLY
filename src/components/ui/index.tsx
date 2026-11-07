import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// StatusBadge
interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-primary-50 text-primary-700',
  success: 'bg-teal-50 text-teal',
  warning: 'bg-warning-50 text-amber-700',
  danger: 'bg-danger-50 text-danger',
  info: 'bg-info-50 text-primary',
  neutral: 'bg-gray-100 text-text-secondary',
}

export function StatusBadge({ status, variant = 'default', size = 'sm', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[variant],
        className
      )}
    >
      <span className={cn(
        'rounded-full',
        size === 'sm' ? 'size-1.5' : 'size-2',
        variant === 'success' && 'bg-teal',
        variant === 'warning' && 'bg-amber-500',
        variant === 'danger' && 'bg-danger',
        variant === 'info' && 'bg-primary',
        variant === 'neutral' && 'bg-text-secondary',
        variant === 'default' && 'bg-primary',
      )} />
      {status}
    </span>
  )
}

// EmptyState
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 rounded-xl bg-primary-50 p-4 text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-navy">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-text-secondary leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// LoadingState
interface LoadingStateProps {
  text?: string
  className?: string
}

export function LoadingState({ text = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <div className="size-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary" />
      <p className="mt-4 text-sm text-text-secondary">{text}</p>
    </div>
  )
}

// DeadlineIndicator
interface DeadlineIndicatorProps {
  deadline: string
  className?: string
}

export function DeadlineIndicator({ deadline, className }: DeadlineIndicatorProps) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let urgency: 'passed' | 'urgent' | 'soon' | 'normal'
  if (diffDays < 0) urgency = 'passed'
  else if (diffDays <= 7) urgency = 'urgent'
  else if (diffDays <= 30) urgency = 'soon'
  else urgency = 'normal'

  const labels = {
    passed: 'Deadline passed',
    urgent: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`,
    soon: `${diffDays} days left`,
    normal: deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
  }

  const styles = {
    passed: 'text-danger bg-danger-50',
    urgent: 'text-danger bg-danger-50',
    soon: 'text-amber-700 bg-warning-50',
    normal: 'text-text-secondary bg-gray-50',
  }

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', styles[urgency], className)}>
      {labels[urgency]}
    </span>
  )
}

// MatchScoreIndicator
interface MatchScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MatchScoreIndicator({ score, size = 'md', className }: MatchScoreProps) {
  const color = score >= 75 ? 'text-teal' : score >= 50 ? 'text-amber-500' : score >= 25 ? 'text-orange-500' : 'text-danger'
  const bgColor = score >= 75 ? 'bg-teal-50' : score >= 50 ? 'bg-warning-50' : score >= 25 ? 'bg-orange-50' : 'bg-danger-50'
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-lg font-semibold', color, bgColor, sizeClasses[size], className)}>
      {score}% match
    </span>
  )
}

// ConfirmDialog
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default' }: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
        <h3 id="confirm-title" className="text-lg font-semibold text-navy">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              'btn-primary text-sm',
              variant === 'danger' && 'bg-danger hover:bg-red-600'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// SearchInput
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          aria-label="Clear search"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
