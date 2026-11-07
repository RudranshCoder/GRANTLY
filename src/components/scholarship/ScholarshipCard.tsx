import { Link } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Calendar, MapPin, GraduationCap, IndianRupee, ArrowRight, Check, Plus } from 'lucide-react'
import type { Scholarship } from '@/types'
import { useApp } from '@/store/AppContext'
import { cn, generateId } from '@/lib/utils'
import { DeadlineIndicator, MatchScoreIndicator } from '@/components/ui'
import { calculateMatch } from '@/lib/matching'

interface ScholarshipCardProps {
  scholarship: Scholarship
  showMatch?: boolean
  className?: string
  showTrackButton?: boolean
  footerAction?: React.ReactNode
}

export function ScholarshipCard({ scholarship, showMatch = true, className, showTrackButton = false, footerAction }: ScholarshipCardProps) {
  const { state, dispatch, isScholarshipSaved, isScholarshipTracked } = useApp()
  const saved = isScholarshipSaved(scholarship.id)
  const tracked = isScholarshipTracked(scholarship.id)

  const match = showMatch && state.profile ? calculateMatch(scholarship, state.profile) : null

  const handleTrack = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!tracked) {
      dispatch({
        type: 'ADD_APPLICATION',
        payload: {
          id: generateId(),
          scholarshipId: scholarship.id,
          scholarshipTitle: scholarship.title,
          scholarshipProvider: scholarship.provider,
          scholarshipDeadline: scholarship.deadline,
          scholarshipAmount: scholarship.benefitAmount,
          status: 'interested',
          notes: '',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    }
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (saved) {
      dispatch({ type: 'UNSAVE_SCHOLARSHIP', payload: scholarship.id })
    } else {
      dispatch({ type: 'SAVE_SCHOLARSHIP', payload: { scholarshipId: scholarship.id, savedAt: new Date().toISOString() } })
    }
  }

  const categoryColors: Record<string, string> = {
    'merit-based': 'bg-primary-50 text-primary-700',
    'need-based': 'bg-teal-50 text-teal',
    'women': 'bg-pink-50 text-pink-700',
    'stem': 'bg-blue-50 text-blue-700',
    'sports': 'bg-orange-50 text-orange-700',
    'minority': 'bg-purple-50 text-purple-700',
    'government': 'bg-emerald-50 text-emerald-700',
    'private': 'bg-gray-50 text-gray-700',
    'research': 'bg-indigo-50 text-indigo-700',
    'arts': 'bg-rose-50 text-rose-700',
    'disability': 'bg-amber-50 text-amber-700',
    'international': 'bg-cyan-50 text-cyan-700',
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:shadow-md hover:border-primary-200',
        className
      )}
    >
      {/* Top row: Categories + Save */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {scholarship.category.slice(0, 2).map(cat => (
            <span
              key={cat}
              className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', categoryColors[cat] || 'bg-gray-100 text-gray-700')}
            >
              {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          ))}
          {scholarship.isDemo && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Demo
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'shrink-0 rounded-lg p-1.5 transition-colors',
            saved ? 'text-primary bg-primary-50' : 'text-text-muted hover:text-primary hover:bg-primary-50'
          )}
          aria-label={saved ? 'Remove from saved' : 'Save scholarship'}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
        </button>
      </div>

      {/* Title + Provider */}
      <h3 className="text-base font-semibold text-navy leading-snug line-clamp-2 mb-1">
        {scholarship.title}
      </h3>
      <p className="text-sm text-text-secondary mb-3">{scholarship.provider}</p>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-4">
        {scholarship.shortDescription}
      </p>

      {/* Meta info */}
      <div className="mt-auto flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <IndianRupee className="size-3.5" />
            <span className="font-semibold text-navy">{scholarship.benefitAmount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="size-3.5" />
            {scholarship.educationLevel.map(l => l === 'undergraduate' ? 'UG' : l === 'postgraduate' ? 'PG' : l === 'doctoral' ? 'PhD' : l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}
          </span>
          {scholarship.state !== 'All India' && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {scholarship.state}
            </span>
          )}
        </div>

        {/* Deadline + Match */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-text-muted" />
            <DeadlineIndicator deadline={scholarship.deadline} />
          </div>
          {match && match.overallScore > 0 && (
            <MatchScoreIndicator score={match.overallScore} size="sm" />
          )}
        </div>

        {/* CTA */}
        <div className="mt-2 flex items-center gap-2">
          <Link
            to={`/scholarships/${scholarship.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-primary hover:text-white hover:border-primary"
          >
            View details
            <ArrowRight className="size-3.5" />
          </Link>
          {showTrackButton && (
            tracked ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-2 text-xs font-semibold text-teal border border-teal-200">
                <Check className="size-3.5" />
                Tracked
              </span>
            ) : (
              <button
                type="button"
                onClick={handleTrack}
                className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                title="Add to application tracker"
              >
                <Plus className="size-3.5" />
                Track
              </button>
            )
          )}
          {footerAction}
        </div>
      </div>
    </article>
  )
}

// Grid wrapper
interface ScholarshipGridProps {
  scholarships: Scholarship[]
  showMatch?: boolean
  className?: string
}

export function ScholarshipGrid({ scholarships, showMatch = true, className }: ScholarshipGridProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {scholarships.map(s => (
        <ScholarshipCard key={s.id} scholarship={s} showMatch={showMatch} />
      ))}
    </div>
  )
}
