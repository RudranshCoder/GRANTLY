import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  IndianRupee,
  Kanban,
  LayoutList,
  Plus,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { scholarships } from '@/data/scholarships'
import { cn, formatShortDate, generateId } from '@/lib/utils'
import { APPLICATION_STATUSES } from '@/lib/constants'
import {
  StatusBadge,
  EmptyState,
  SearchInput,
  ConfirmDialog,
  DeadlineIndicator,
} from '@/components/ui'
import type { TrackedApplication, ApplicationStatus } from '@/types'

type SortOption = 'deadline' | 'date-added' | 'status' | 'title'
type ViewMode = 'list' | 'compact'

const SUBMITTED_STATUSES: ApplicationStatus[] = [
  'submitted',
  'under-review',
  'approved',
  'rejected',
]

// Status color helper for custom styled badges
const STATUS_CONFIG_MAP: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string }> = {
  interested: { label: 'Interested', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
  preparing: { label: 'Preparing', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  'ready-to-apply': { label: 'Ready to Apply', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
  submitted: { label: 'Submitted', color: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
  'under-review': { label: 'Under Review', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' },
  approved: { label: 'Approved', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', color: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200' },
}

export default function ApplicationsPage() {
  const { state, dispatch } = useApp()
  const applications = state.trackedApplications

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('deadline')
  const [applicationToDelete, setApplicationToDelete] = useState<TrackedApplication | null>(null)

  // Status transition handler
  const handleStatusChange = (app: TrackedApplication, newStatus: ApplicationStatus) => {
    const updates: Partial<TrackedApplication> = { status: newStatus }
    // If advancing to submitted stage and submissionDate is not set, set to today
    if (SUBMITTED_STATUSES.includes(newStatus) && !app.submissionDate) {
      updates.submissionDate = new Date().toISOString().split('T')[0]
    }
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: { id: app.id, updates },
    })
  }

  // Notes update handler
  const handleNotesChange = (appId: string, notes: string) => {
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: { id: appId, updates: { notes } },
    })
  }

  // Submission date update handler
  const handleSubmissionDateChange = (appId: string, submissionDate: string) => {
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: { id: appId, updates: { submissionDate } },
    })
  }

  // Remove handler
  const confirmDeleteApplication = () => {
    if (applicationToDelete) {
      dispatch({
        type: 'REMOVE_APPLICATION',
        payload: applicationToDelete.id,
      })
      setApplicationToDelete(null)
    }
  }

  // Seed sample demo applications if tracker is empty
  const handleSeedDemoApplications = () => {
    if (scholarships.length === 0) return
    const demoItems: Array<{ scholarshipId: string; status: ApplicationStatus; notes: string; submissionDate?: string }> = [
      {
        scholarshipId: scholarships[0]?.id || 'rel-ug-2025',
        status: 'preparing',
        notes: 'Gathering 12th marksheets and income certificate from tahsildar.',
      },
      {
        scholarshipId: scholarships[1]?.id || 'hdfc-ecss-2025',
        status: 'submitted',
        notes: 'Submitted online application on portal. Reference ID: HDFC-98213.',
        submissionDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      },
      {
        scholarshipId: scholarships[2]?.id || 'tata-trust-ug-2025',
        status: 'interested',
        notes: 'Need to check recommendation letter requirement with college dean.',
      },
    ]

    demoItems.forEach((demo) => {
      const sch = scholarships.find((s) => s.id === demo.scholarshipId)
      if (sch && !state.trackedApplications.some((a) => a.scholarshipId === sch.id)) {
        dispatch({
          type: 'ADD_APPLICATION',
          payload: {
            id: generateId(),
            scholarshipId: sch.id,
            scholarshipTitle: sch.title,
            scholarshipProvider: sch.provider,
            scholarshipDeadline: sch.deadline,
            scholarshipAmount: sch.benefitAmount,
            status: demo.status,
            notes: demo.notes,
            submissionDate: demo.submissionDate,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
      }
    })
  }

  // Filtered & sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.scholarshipProvider.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return new Date(a.scholarshipDeadline).getTime() - new Date(b.scholarshipDeadline).getTime()
        }
        if (sortBy === 'date-added') {
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        }
        if (sortBy === 'status') {
          const statusOrder = APPLICATION_STATUSES.map((s) => s.value)
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        }
        if (sortBy === 'title') {
          return a.scholarshipTitle.localeCompare(b.scholarshipTitle)
        }
        return 0
      })
  }, [applications, searchQuery, statusFilter, sortBy])

  // Count summaries
  const stats = useMemo(() => {
    const total = applications.length
    const preparing = applications.filter((a) => a.status === 'preparing' || a.status === 'ready-to-apply').length
    const submitted = applications.filter((a) => a.status === 'submitted' || a.status === 'under-review').length
    const approved = applications.filter((a) => a.status === 'approved').length
    return { total, preparing, submitted, approved }
  }, [applications])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-navy">
              Application Tracker
            </h1>
            <span className="inline-flex items-center justify-center rounded-full bg-primary-50 px-3 py-0.5 text-sm font-semibold text-primary">
              {applications.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your scholarship journey, track submission deadlines, and organize documents.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-navy hover:bg-background'
              )}
              aria-label="List view"
            >
              <LayoutList className="size-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                viewMode === 'compact'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-navy hover:bg-background'
              )}
              aria-label="Compact board view"
            >
              <Kanban className="size-3.5" />
              Board
            </button>
          </div>

          <Link
            to="/explore"
            className="btn-primary text-xs py-2 px-3 inline-flex items-center gap-1"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Add Scholarship</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* Summary Stats Row */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <p className="text-xs font-medium text-text-secondary">Total Tracked</p>
            <p className="mt-1 text-2xl font-bold font-heading text-navy">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-amber-700">In Preparation</p>
            <p className="mt-1 text-2xl font-bold font-heading text-amber-900">{stats.preparing}</p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-purple-700">Submitted & In Review</p>
            <p className="mt-1 text-2xl font-bold font-heading text-purple-900">{stats.submitted}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-emerald-700">Approved & Awarded</p>
            <p className="mt-1 text-2xl font-bold font-heading text-emerald-900">{stats.approved}</p>
          </div>
        </div>
      )}

      {/* Empty Tracker State */}
      {applications.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface shadow-xs">
          <EmptyState
            icon={<FileText className="size-10" />}
            title="No applications yet"
            description="Start exploring scholarships to find opportunities and add them to your personalized tracker to manage your deadlines."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/explore" className="btn-primary">
                  Explore Scholarships
                </Link>
                <button
                  type="button"
                  onClick={handleSeedDemoApplications}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  Load Demo Applications
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {/* Controls Bar: Search, Status Filter, Sort */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by scholarship or provider..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="status-filter" className="text-xs font-medium text-text-secondary">
                  Status:
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input py-1.5 px-2.5 text-xs w-auto font-medium"
                >
                  <option value="all">All Statuses ({applications.length})</option>
                  {APPLICATION_STATUSES.map((status) => {
                    const count = applications.filter((a) => a.status === status.value).length
                    return (
                      <option key={status.value} value={status.value}>
                        {status.label} ({count})
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="sort-by" className="text-xs font-medium text-text-secondary">
                  Sort:
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="input py-1.5 px-2.5 text-xs w-auto font-medium"
                >
                  <option value="deadline">Deadline (Earliest)</option>
                  <option value="date-added">Date Added (Newest)</option>
                  <option value="status">Status Stage</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>

              {(searchQuery || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  className="text-xs font-medium text-primary hover:underline px-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Results count & active view */}
          {filteredApplications.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-xs">
              <p className="text-base font-semibold text-navy">No applications match your criteria</p>
              <p className="mt-1 text-sm text-text-secondary">
                Try adjusting your search query or status filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
                className="btn-secondary mt-4 text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <ApplicationListCard
                  key={app.id}
                  application={app}
                  onStatusChange={(newStatus) => handleStatusChange(app, newStatus)}
                  onNotesChange={(notes) => handleNotesChange(app.id, notes)}
                  onSubmissionDateChange={(date) => handleSubmissionDateChange(app.id, date)}
                  onDelete={() => setApplicationToDelete(app)}
                />
              ))}
            </div>
          ) : (
            /* COMPACT / BOARD VIEW */
            <ApplicationBoardView
              applications={filteredApplications}
              onStatusChange={handleStatusChange}
              onDelete={(app) => setApplicationToDelete(app)}
            />
          )}
        </>
      )}

      {/* Confirmation Dialog for Removal */}
      <ConfirmDialog
        open={Boolean(applicationToDelete)}
        onClose={() => setApplicationToDelete(null)}
        onConfirm={confirmDeleteApplication}
        title="Remove Application?"
        description={`Are you sure you want to remove "${applicationToDelete?.scholarshipTitle}" from your application tracker? Notes and submission history will be removed.`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  )
}

// ============================================================================
// Sub-component: ApplicationListCard
// ============================================================================
interface ApplicationListCardProps {
  application: TrackedApplication
  onStatusChange: (status: ApplicationStatus) => void
  onNotesChange: (notes: string) => void
  onSubmissionDateChange: (date: string) => void
  onDelete: () => void
}

function ApplicationListCard({
  application,
  onStatusChange,
  onNotesChange,
  onSubmissionDateChange,
  onDelete,
}: ApplicationListCardProps) {
  const [isNotesOpen, setIsNotesOpen] = useState(Boolean(application.notes))
  const [localNotes, setLocalNotes] = useState(application.notes)
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false)

  const isSubmittedOrBeyond = SUBMITTED_STATUSES.includes(application.status)
  const statusCfg = STATUS_CONFIG_MAP[application.status] || STATUS_CONFIG_MAP.interested

  // Keep local notes updated when prop changes
  const handleBlurNotes = () => {
    if (localNotes !== application.notes) {
      onNotesChange(localNotes)
      setNoteSavedFeedback(true)
      setTimeout(() => setNoteSavedFeedback(false), 2000)
    }
  }

  return (
    <article className="group relative rounded-xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-primary-200 hover:shadow-sm">
      {/* Top Header: Title, Provider, Status Badge, Remove Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 pr-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/scholarships/${application.scholarshipId}`}
              className="group/link inline-flex items-center gap-1.5 text-base sm:text-lg font-semibold text-navy hover:text-primary transition-colors"
            >
              <span>{application.scholarshipTitle}</span>
              <ExternalLink className="size-3.5 opacity-60 transition-opacity group-hover/link:opacity-100" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3.5 text-text-muted" />
              {application.scholarshipProvider}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-navy">
              <IndianRupee className="size-3.5 text-text-muted" />
              {application.scholarshipAmount}
            </span>
          </div>
        </div>

        {/* Status Dropdown & Delete Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Status selector dropdown */}
          <div className="relative">
            <select
              value={application.status}
              onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
              className={cn(
                'input py-1.5 pl-3 pr-8 text-xs font-semibold rounded-lg appearance-none cursor-pointer',
                statusCfg.bg,
                statusCfg.color,
                statusCfg.border
              )}
              aria-label="Application status"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value} className="bg-surface text-navy">
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown className={cn('pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5', statusCfg.color)} />
          </div>

          {/* Delete application button */}
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-text-muted hover:text-danger hover:bg-danger-50 transition-colors"
            title="Remove from tracker"
            aria-label="Remove application"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Meta Grid: Deadline, Submission Date, Added Date */}
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-background p-3.5 text-xs sm:grid-cols-3">
        {/* Deadline */}
        <div>
          <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider mb-1">
            Deadline
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-text-muted" />
            <DeadlineIndicator deadline={application.scholarshipDeadline} />
          </div>
        </div>

        {/* Submission Date */}
        <div>
          <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider mb-1">
            Submission Date
          </span>
          {isSubmittedOrBeyond ? (
            <input
              type="date"
              value={application.submissionDate || ''}
              onChange={(e) => onSubmissionDateChange(e.target.value)}
              className="input py-0.5 px-2 text-xs bg-surface max-w-[150px]"
              aria-label="Submission date"
            />
          ) : (
            <span className="text-text-secondary italic">Not submitted yet</span>
          )}
        </div>

        {/* Added to tracker date */}
        <div>
          <span className="text-text-muted block text-[11px] font-medium uppercase tracking-wider mb-1">
            Tracked Since
          </span>
          <span className="text-text-secondary font-medium">
            {formatShortDate(application.addedAt)}
          </span>
        </div>
      </div>

      {/* Notes Section: Expandable & Auto-saves on blur */}
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-navy transition-colors"
          >
            <FileText className="size-3.5 text-text-muted" />
            <span>Application Notes</span>
            {application.notes && !isNotesOpen && (
              <span className="size-1.5 rounded-full bg-primary" />
            )}
            {isNotesOpen ? (
              <ChevronUp className="size-3.5 text-text-muted" />
            ) : (
              <ChevronDown className="size-3.5 text-text-muted" />
            )}
          </button>

          {noteSavedFeedback && (
            <span className="text-[11px] text-teal font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Auto-saved
            </span>
          )}
        </div>

        {isNotesOpen && (
          <div className="mt-2 space-y-2">
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleBlurNotes}
              placeholder="Add personal notes, essay drafts, document checklists, or portal credentials..."
              rows={2}
              className="input text-xs leading-relaxed resize-y w-full font-normal"
            />
            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span>Auto-saves when you click outside</span>
              {localNotes !== application.notes && (
                <button
                  type="button"
                  onClick={handleBlurNotes}
                  className="text-primary font-semibold hover:underline"
                >
                  Save now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

// ============================================================================
// Sub-component: ApplicationBoardView (Compact Kanban / Column View)
// ============================================================================
interface ApplicationBoardViewProps {
  applications: TrackedApplication[]
  onStatusChange: (app: TrackedApplication, newStatus: ApplicationStatus) => void
  onDelete: (app: TrackedApplication) => void
}

function ApplicationBoardView({
  applications,
  onStatusChange,
  onDelete,
}: ApplicationBoardViewProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1050px]">
        {APPLICATION_STATUSES.map((status) => {
          const colApps = applications.filter((a) => a.status === status.value)
          const cfg = STATUS_CONFIG_MAP[status.value as ApplicationStatus] || STATUS_CONFIG_MAP.interested

          return (
            <div
              key={status.value}
              className="flex-1 rounded-xl border border-border bg-background/50 p-3 flex flex-col min-w-[200px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <h3 className="text-xs font-bold font-heading text-navy">
                    {status.label}
                  </h3>
                </div>
                <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-secondary border border-border">
                  {colApps.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 flex-1">
                {colApps.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-text-muted">
                    No applications
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-lg border border-border bg-surface p-3 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          to={`/scholarships/${app.scholarshipId}`}
                          className="text-xs font-bold text-navy hover:text-primary line-clamp-2"
                        >
                          {app.scholarshipTitle}
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(app)}
                          className="text-text-muted hover:text-danger p-0.5 -mt-0.5"
                          title="Remove"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>

                      <p className="mt-1 text-[11px] text-text-secondary line-clamp-1">
                        {app.scholarshipProvider}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-navy">
                          {app.scholarshipAmount}
                        </span>
                        <DeadlineIndicator deadline={app.scholarshipDeadline} className="text-[10px] py-0 px-1.5" />
                      </div>

                      {app.notes && (
                        <p className="mt-2 text-[11px] text-text-secondary bg-background rounded p-1.5 line-clamp-2 italic">
                          "{app.notes}"
                        </p>
                      )}

                      {/* Quick Move Dropdown */}
                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between gap-1">
                        <span className="text-[10px] text-text-muted">Move to:</span>
                        <select
                          value={app.status}
                          onChange={(e) => onStatusChange(app, e.target.value as ApplicationStatus)}
                          className="text-[11px] font-medium bg-transparent border-0 text-primary cursor-pointer p-0 focus:ring-0"
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
