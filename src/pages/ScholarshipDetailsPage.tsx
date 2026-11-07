import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Building2,
  ExternalLink,
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Award,
  AlertTriangle,
  Check,
  UserCheck,
} from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { scholarships } from '@/data/scholarships'
import { calculateMatch, getMatchSummary } from '@/lib/matching'
import { cn, formatDate, getDaysUntilDeadline, generateId } from '@/lib/utils'
import { MATCH_STATUS_CONFIG, APPLICATION_STATUSES } from '@/lib/constants'
import { StatusBadge, DeadlineIndicator, MatchScoreIndicator, EmptyState } from '@/components/ui'
import type { TrackedApplication, MatchStatus, MatchResult } from '@/types'

const CATEGORY_STYLES: Record<string, string> = {
  'merit-based': 'bg-primary-50 text-primary-700 border-primary-200',
  'need-based': 'bg-teal-50 text-teal border-teal-200',
  'women': 'bg-pink-50 text-pink-700 border-pink-200',
  'stem': 'bg-blue-50 text-blue-700 border-blue-200',
  'sports': 'bg-orange-50 text-orange-700 border-orange-200',
  'minority': 'bg-purple-50 text-purple-700 border-purple-200',
  'government': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'private': 'bg-gray-100 text-gray-700 border-gray-200',
  'research': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'arts': 'bg-rose-50 text-rose-700 border-rose-200',
  'disability': 'bg-amber-50 text-amber-700 border-amber-200',
  'international': 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

function formatCategoryLabel(cat: string): string {
  return cat
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatEducationLevel(level: string): string {
  switch (level) {
    case 'undergraduate':
      return 'Undergraduate (UG)'
    case 'postgraduate':
      return 'Postgraduate (PG)'
    case 'doctoral':
      return 'Doctoral (PhD)'
    case 'diploma':
      return 'Diploma'
    case 'professional':
      return 'Professional Degree'
    default:
      return level.charAt(0).toUpperCase() + level.slice(1)
  }
}

export default function ScholarshipDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, dispatch, isScholarshipSaved, isScholarshipTracked, getApplication } = useApp()

  const [copiedLink, setCopiedLink] = useState(false)
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({})
  const [trackerSuccessNotice, setTrackerSuccessNotice] = useState(false)

  // Find scholarship
  const scholarship = scholarships.find(s => s.id === id)

  // Track recently viewed scholarship on mount
  useEffect(() => {
    if (scholarship) {
      dispatch({ type: 'ADD_RECENTLY_VIEWED', payload: scholarship.id })
    }
  }, [scholarship?.id, dispatch])

  // Handle document checklist toggle
  const toggleDoc = (index: number) => {
    setCheckedDocs(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Handle share link
  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2500)
      }
    } catch {
      // Fallback
    }
  }

  // Handle Save / Unsave
  const handleToggleSave = () => {
    if (!scholarship) return
    if (isScholarshipSaved(scholarship.id)) {
      dispatch({ type: 'UNSAVE_SCHOLARSHIP', payload: scholarship.id })
    } else {
      dispatch({
        type: 'SAVE_SCHOLARSHIP',
        payload: {
          scholarshipId: scholarship.id,
          savedAt: new Date().toISOString(),
        },
      })
    }
  }

  // Handle Add to Application Tracker
  const handleAddToTracker = () => {
    if (!scholarship || isScholarshipTracked(scholarship.id)) return

    const newApplication: TrackedApplication = {
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
    }

    dispatch({ type: 'ADD_APPLICATION', payload: newApplication })
    setTrackerSuccessNotice(true)
    setTimeout(() => setTrackerSuccessNotice(false), 4000)
  }

  // If scholarship not found, show a clean 404 empty state
  if (!scholarship) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <EmptyState
          icon={<AlertCircle className="size-12 text-text-muted" />}
          title="Scholarship Not Found"
          description="The scholarship you are looking for does not exist, may have expired, or was removed from the database."
          action={
            <Link
              to="/explore"
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Explore
            </Link>
          }
        />
      </main>
    )
  }

  const isSaved = isScholarshipSaved(scholarship.id)
  const isTracked = isScholarshipTracked(scholarship.id)
  const trackedApp = getApplication(scholarship.id)
  const trackedStatusConfig = trackedApp
    ? APPLICATION_STATUSES.find(s => s.value === trackedApp.status)
    : null

  // Calculate match if profile exists
  const hasProfile = Boolean(state.profile)
  const match = calculateMatch(scholarship, state.profile)
  const matchSummaryText = getMatchSummary(match)

  const daysRemaining = getDaysUntilDeadline(scholarship.deadline)
  const isDeadlinePassed = daysRemaining < 0
  const isDemoUrl = scholarship.applicationUrl === '#demo'

  const totalDocs = scholarship.requiredDocuments?.length || 0
  const completedDocsCount = Object.values(checkedDocs).filter(Boolean).length

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Banner Notice for Tracker Action */}
      {trackerSuccessNotice && (
        <div className="sticky top-16 z-30 bg-teal text-white shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="size-5 shrink-0" />
              <span>Added to your Application Tracker with status "Interested"!</span>
            </div>
            <Link
              to="/applications"
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-white transition-colors"
            >
              View Tracker →
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 1. Back Navigation & Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Explore</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link to="/explore" className="hover:text-text-secondary">Scholarships</Link>
            <span>/</span>
            <span className="text-text-primary font-medium truncate max-w-xs sm:max-w-md">
              {scholarship.title}
            </span>
          </div>
        </nav>

        {/* 2. Header Section */}
        <header className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 space-y-4">
              {/* Category Badges, Demo Badge, Verification */}
              <div className="flex flex-wrap items-center gap-2">
                {scholarship.category.map(cat => (
                  <span
                    key={cat}
                    className={cn(
                      'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold',
                      CATEGORY_STYLES[cat] || 'bg-gray-100 text-gray-700 border-gray-200'
                    )}
                  >
                    {formatCategoryLabel(cat)}
                  </span>
                ))}

                {scholarship.isDemo && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    <Sparkles className="size-3 text-amber-600" />
                    Demo Scholarship
                  </span>
                )}

                {scholarship.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal">
                    <ShieldCheck className="size-3.5 text-teal" />
                    Verified Sponsoring Provider
                  </span>
                )}

                {scholarship.lastVerified && (
                  <span className="text-xs text-text-muted">
                    Last verified: {formatDate(scholarship.lastVerified)}
                  </span>
                )}
              </div>

              {/* Title & Provider */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy font-heading leading-tight tracking-tight">
                  {scholarship.title}
                </h1>
                <div className="mt-2 flex items-center gap-2 text-base sm:text-lg text-text-secondary">
                  <Building2 className="size-5 shrink-0 text-text-muted" />
                  <span className="font-medium text-navy">{scholarship.provider}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="btn-secondary text-sm"
                title="Copy link to scholarship"
                aria-label="Share scholarship"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-4 text-teal" />
                    <span className="text-teal">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Save / Unsave Button */}
              <button
                type="button"
                onClick={handleToggleSave}
                className={cn(
                  'text-sm transition-all',
                  isSaved
                    ? 'btn-secondary border-primary/40 text-primary bg-primary-50/60 hover:bg-primary-50'
                    : 'btn-secondary text-text-secondary hover:text-primary hover:border-primary-200'
                )}
                aria-label={isSaved ? 'Remove from saved' : 'Save scholarship'}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="size-4 text-primary" />
                    <span className="font-semibold text-primary">Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4" />
                    <span>Save</span>
                  </>
                )}
              </button>

              {/* Add to Tracker / Already Tracking Button */}
              {isTracked ? (
                <Link
                  to="/applications"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal-50 text-teal border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Tracking ({trackedStatusConfig?.label || 'Interested'})</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToTracker}
                  className="btn-primary text-sm shadow-sm"
                >
                  <Sparkles className="size-4" />
                  <span>Add to Tracker</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 3. Key Info Cards */}
        <section aria-label="Key Scholarship Information" className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Benefit Amount */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs transition-hover hover:border-primary-200">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                  <IndianRupee className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Benefit Amount</p>
                  <p className="text-lg font-bold text-navy mt-0.5">{scholarship.benefitAmount}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Award Type</span>
                <span className="font-semibold text-navy capitalize">
                  {scholarship.benefitType.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Education Level */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs transition-hover hover:border-primary-200">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal">
                  <GraduationCap className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Education Level</p>
                  <p className="text-sm font-bold text-navy mt-0.5 line-clamp-1">
                    {scholarship.educationLevel.map(l => (l === 'undergraduate' ? 'UG' : l === 'postgraduate' ? 'PG' : l === 'doctoral' ? 'PhD' : l)).join(', ')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Study Levels</span>
                <span className="font-medium text-navy">
                  {scholarship.educationLevel.length} Level{scholarship.educationLevel.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs transition-hover hover:border-primary-200">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Calendar className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Application Deadline</p>
                  <p className="text-sm font-bold text-navy mt-0.5">
                    {formatDate(scholarship.deadline)}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary">Status</span>
                <DeadlineIndicator deadline={scholarship.deadline} />
              </div>
            </div>

            {/* Location / State */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs transition-hover hover:border-primary-200">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Eligible Region</p>
                  <p className="text-lg font-bold text-navy mt-0.5">{scholarship.state}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Domicile Requirement</span>
                <span className="font-semibold text-navy">
                  {scholarship.state === 'All India' ? 'Pan-India Open' : 'State Specific'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Main Content + Sticky Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2 spans) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 4. Overview Section */}
            <section aria-labelledby="section-overview" className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Award className="size-5 text-primary" />
                <h2 id="section-overview" className="text-xl font-bold text-navy font-heading">
                  Scholarship Overview
                </h2>
              </div>

              {/* Short summary highlighted lead */}
              {scholarship.shortDescription && (
                <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 mb-6 text-sm sm:text-base font-medium text-navy leading-relaxed">
                  {scholarship.shortDescription}
                </div>
              )}

              {/* Full Description */}
              <div className="prose prose-slate max-w-none text-text-primary text-sm sm:text-base leading-relaxed space-y-4">
                <p className="whitespace-pre-line">{scholarship.description}</p>
              </div>

              {/* Key Highlights Table / Metadata */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-background p-3.5 border border-border">
                  <span className="text-xs text-text-secondary block font-medium">Gender Eligibility</span>
                  <span className="text-sm font-semibold text-navy capitalize mt-0.5 block">
                    {scholarship.gender === 'all' || !scholarship.gender
                      ? 'Open to All Genders'
                      : scholarship.gender === 'female'
                      ? 'Female Students Only'
                      : 'Male Students Only'}
                  </span>
                </div>

                {scholarship.minAcademicScore !== undefined && (
                  <div className="rounded-lg bg-background p-3.5 border border-border">
                    <span className="text-xs text-text-secondary block font-medium">Minimum Academic Score</span>
                    <span className="text-sm font-semibold text-navy mt-0.5 block">
                      {scholarship.minAcademicScore}% in qualifying examination
                    </span>
                  </div>
                )}

                {scholarship.maxFamilyIncome !== undefined && (
                  <div className="rounded-lg bg-background p-3.5 border border-border">
                    <span className="text-xs text-text-secondary block font-medium">Family Income Limit</span>
                    <span className="text-sm font-semibold text-navy mt-0.5 block">
                      Up to ₹{scholarship.maxFamilyIncome.toLocaleString('en-IN')} per annum
                    </span>
                  </div>
                )}

                <div className="rounded-lg bg-background p-3.5 border border-border">
                  <span className="text-xs text-text-secondary block font-medium">Eligible Study Levels</span>
                  <span className="text-sm font-semibold text-navy mt-0.5 block">
                    {scholarship.educationLevel.map(formatEducationLevel).join(', ')}
                  </span>
                </div>
              </div>

              {/* Tags Cloud */}
              {scholarship.tags && scholarship.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Related Tags & Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 6. Match Summary Card (if profile exists) */}
            {hasProfile && (
              <section aria-labelledby="section-match-summary" className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-teal" />
                    <div>
                      <h2 id="section-match-summary" className="text-xl font-bold text-navy font-heading">
                        Eligibility Match Analysis
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Evaluated against your student profile ({state.profile?.fullName})
                      </p>
                    </div>
                  </div>

                  <MatchScoreIndicator score={match.overallScore} size="lg" />
                </div>

                {/* Score bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-xs font-medium text-text-secondary">
                    <span>Overall Match Alignment</span>
                    <span className="font-bold text-navy">{match.overallScore}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500 rounded-full',
                        match.overallScore >= 75
                          ? 'bg-teal'
                          : match.overallScore >= 50
                          ? 'bg-amber-500'
                          : match.overallScore >= 25
                          ? 'bg-orange-500'
                          : 'bg-danger'
                      )}
                      style={{ width: `${Math.max(match.overallScore, 4)}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-teal font-bold text-lg">
                      <CheckCircle2 className="size-4" />
                      <span>{match.metCount}</span>
                    </div>
                    <span className="text-xs text-teal-800 font-medium mt-0.5 block">Criteria Met</span>
                  </div>

                  <div className="rounded-xl bg-danger-50 border border-danger-100 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-danger font-bold text-lg">
                      <XCircle className="size-4" />
                      <span>{match.notMetCount}</span>
                    </div>
                    <span className="text-xs text-red-800 font-medium mt-0.5 block">Not Met</span>
                  </div>

                  <div className="rounded-xl bg-warning-50 border border-warning-100 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-amber-600 font-bold text-lg">
                      <AlertCircle className="size-4" />
                      <span>{match.missingInfoCount}</span>
                    </div>
                    <span className="text-xs text-amber-800 font-medium mt-0.5 block">Missing Info</span>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-text-secondary font-bold text-lg">
                      <Layers className="size-4" />
                      <span>{match.totalCriteria}</span>
                    </div>
                    <span className="text-xs text-text-secondary font-medium mt-0.5 block">Total Criteria</span>
                  </div>
                </div>

                {/* Match Summary Text */}
                <div className="p-4 rounded-xl bg-background border border-border flex items-start gap-3">
                  <Info className="size-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-text-primary leading-relaxed">
                    <p className="font-semibold text-navy mb-0.5">Assessment Summary</p>
                    <p>{matchSummaryText}</p>
                    {match.missingInfoCount > 0 && (
                      <Link
                        to="/profile"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline mt-2"
                      >
                        Update your profile to resolve missing information →
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* 5. Eligibility Requirements Section */}
            <section aria-labelledby="section-eligibility" className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-5 text-primary" />
                  <h2 id="section-eligibility" className="text-xl font-bold text-navy font-heading">
                    Eligibility Requirements
                  </h2>
                </div>
                <span className="text-xs text-text-secondary font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                  {scholarship.eligibilityCriteria.length} Criteria Listed
                </span>
              </div>

              {/* Notice if user has no profile */}
              {!hasProfile && (
                <div className="mb-6 p-4 rounded-xl bg-primary-50/70 border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        Want personalized eligibility verification?
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Complete your student profile to automatically match your grades, location, and background against these criteria.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/onboarding"
                    className="btn-primary text-xs shrink-0 py-2 px-3 whitespace-nowrap"
                  >
                    Complete Profile
                  </Link>
                </div>
              )}

              {/* Criteria List */}
              <div className="space-y-4">
                {scholarship.eligibilityCriteria.map((criterion, idx) => {
                  const matchResult: MatchResult | undefined = match?.results?.find(
                    r => r.criterionId === criterion.id
                  )
                  const status: MatchStatus = matchResult?.status || 'not-assessed'
                  const statusConfig = MATCH_STATUS_CONFIG[status] || MATCH_STATUS_CONFIG['not-assessed']

                  return (
                    <div
                      key={criterion.id || idx}
                      className={cn(
                        'rounded-xl border p-4 sm:p-5 transition-all',
                        hasProfile && status === 'met' && 'bg-teal-50/20 border-teal-200',
                        hasProfile && status === 'not-met' && 'bg-danger-50/20 border-red-200',
                        hasProfile && status === 'missing-info' && 'bg-warning-50/20 border-amber-200',
                        (!hasProfile || status === 'not-assessed') && 'bg-surface border-border hover:border-border-dark'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Status Icon */}
                          <div className="mt-0.5 shrink-0">
                            {hasProfile ? (
                              status === 'met' ? (
                                <CheckCircle2 className="size-5 text-teal" />
                              ) : status === 'not-met' ? (
                                <XCircle className="size-5 text-danger" />
                              ) : status === 'missing-info' ? (
                                <AlertCircle className="size-5 text-amber-500" />
                              ) : (
                                <HelpCircle className="size-5 text-text-muted" />
                              )
                            ) : (
                              <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-text-secondary">
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          {/* Criterion Info */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-semibold text-navy">
                                {criterion.label}
                              </h3>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted bg-gray-100 px-2 py-0.5 rounded">
                                {criterion.type}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                              {criterion.description}
                            </p>
                          </div>
                        </div>

                        {/* Status badge when profile exists */}
                        {hasProfile && (
                          <div className="sm:text-right shrink-0">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                color: statusConfig.color,
                                backgroundColor: statusConfig.bgColor,
                              }}
                            >
                              <span
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: statusConfig.color }}
                              />
                              {statusConfig.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Explanation note when profile assessed */}
                      {hasProfile && matchResult && (
                        <div className="mt-3 pt-3 border-t border-border/60 text-xs flex items-start gap-2">
                          <span className="font-semibold text-navy">Assessment:</span>
                          <span className="text-text-secondary">{matchResult.explanation}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* IMPORTANT DISCLAIMER */}
              <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <p className="font-bold">Important Eligibility Disclaimer</p>
                  <p className="mt-0.5">
                    Matching is an initial guidance tool. The scholarship provider makes the final eligibility decision.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Required Documents Checklist */}
            <section aria-labelledby="section-documents" className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <h2 id="section-documents" className="text-xl font-bold text-navy font-heading">
                    Required Documents Checklist
                  </h2>
                </div>
                {totalDocs > 0 && (
                  <span className="text-xs font-medium text-text-secondary">
                    {completedDocsCount} of {totalDocs} prepared
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-text-secondary mb-4">
                Have verified digital copies (PDF/JPEG) ready before starting your formal application. You can check off items as you gather them:
              </p>

              {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 ? (
                <div className="space-y-2.5">
                  {scholarship.requiredDocuments.map((doc, idx) => {
                    const isChecked = Boolean(checkedDocs[idx])
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDoc(idx)}
                        className={cn(
                          'flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                          isChecked
                            ? 'bg-teal-50/40 border-teal-200 text-teal-900'
                            : 'bg-background border-border hover:border-primary-200 hover:bg-surface'
                        )}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault()
                            toggleDoc(idx)
                          }
                        }}
                      >
                        <div className="mt-0.5 text-primary">
                          {isChecked ? (
                            <CheckSquare className="size-5 text-teal" />
                          ) : (
                            <Square className="size-5 text-text-muted" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={cn('text-sm font-medium', isChecked ? 'line-through text-text-secondary' : 'text-navy')}>
                            {doc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-muted italic">No specific documents specified for this grant.</p>
              )}
            </section>

            {/* 8. Application Process - Numbered Steps */}
            <section aria-labelledby="section-process" className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="size-5 text-primary" />
                <h2 id="section-process" className="text-xl font-bold text-navy font-heading">
                  Application Process
                </h2>
              </div>

              {scholarship.applicationProcess && scholarship.applicationProcess.length > 0 ? (
                <ol className="relative border-l-2 border-primary/20 ml-3.5 space-y-6 my-2">
                  {scholarship.applicationProcess.map((step, idx) => (
                    <li key={idx} className="relative pl-6 sm:pl-8">
                      {/* Step Number Circle */}
                      <span className="absolute -left-3.5 top-0 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                        {idx + 1}
                      </span>
                      <div className="rounded-xl border border-border bg-background p-4 hover:border-primary-200 transition-colors">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                          Step {idx + 1}
                        </p>
                        <p className="text-sm text-navy font-medium leading-relaxed">
                          {step}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-text-muted italic">
                  Direct submission instructions are provided on the official provider portal.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar Column (1 span) - Apply, Tracker, Dates */}
          <div className="lg:col-span-1 space-y-6">
            {/* 10. Apply & Tracker Action Card */}
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border-2 border-primary/20 bg-surface p-6 shadow-md">
                <h3 className="text-lg font-bold text-navy font-heading mb-1">
                  Ready to Apply?
                </h3>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Review requirements and submit directly via the scholarship provider's authorized portal.
                </p>

                {/* Demo Scholarship notice if #demo */}
                {isDemoUrl ? (
                  <div className="mb-4 rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Sparkles className="size-4 text-amber-700" />
                      <span>Demonstration Scholarship</span>
                    </div>
                    <p>
                      This is a demo scholarship. In a live version, this would link to the official application.
                    </p>
                  </div>
                ) : null}

                {/* Primary Apply CTA */}
                <div className="space-y-3">
                  {isDemoUrl ? (
                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
                    >
                      <span>Official Portal (Demo Mode)</span>
                      <ExternalLink className="size-4" />
                    </button>
                  ) : (
                    <a
                      href={scholarship.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Apply on Official Website</span>
                      <ExternalLink className="size-4" />
                    </a>
                  )}

                  {/* Add to Tracker / Already Tracking CTA */}
                  {isTracked ? (
                    <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-teal-800">Tracking Status</span>
                        <span className="font-bold uppercase text-teal">
                          {trackedStatusConfig?.label || 'Interested'}
                        </span>
                      </div>
                      <Link
                        to="/applications"
                        className="btn-secondary w-full text-xs py-2 text-teal hover:bg-teal-100/50"
                      >
                        Manage in Application Tracker
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToTracker}
                      className="btn-secondary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Sparkles className="size-4 text-primary" />
                      <span>Add to Application Tracker</span>
                    </button>
                  )}

                  {/* Save toggle */}
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-text-secondary hover:text-navy transition-colors"
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="size-4 text-primary" />
                        <span>Saved to My Scholarships</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="size-4" />
                        <span>Save for Later</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 9. Important Dates Card */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="size-5 text-primary" />
                  <h3 className="text-base font-bold text-navy font-heading">
                    Important Dates
                  </h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="rounded-xl bg-background p-3.5 border border-border">
                    <span className="text-xs text-text-secondary block font-medium">Application Deadline</span>
                    <span className="font-bold text-navy text-sm block mt-0.5">
                      {formatDate(scholarship.deadline)}
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <DeadlineIndicator deadline={scholarship.deadline} />
                      <span className="text-xs text-text-secondary">
                        {isDeadlinePassed
                          ? 'Applications closed'
                          : daysRemaining === 0
                          ? 'Ends today'
                          : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`}
                      </span>
                    </div>
                  </div>

                  {scholarship.lastVerified && (
                    <div className="rounded-xl bg-background p-3.5 border border-border">
                      <span className="text-xs text-text-secondary block font-medium">Verification Status</span>
                      <div className="flex items-center gap-1.5 text-xs text-teal font-semibold mt-1">
                        <ShieldCheck className="size-4" />
                        <span>Verified on {formatDate(scholarship.lastVerified)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    💡 Tip: Server traffic spikes in the last 48 hours of deadlines. Submit early to prevent technical delays.
                  </p>
                </div>
              </div>

              {/* Provider Information Card */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                  Sponsoring Organization
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary font-bold">
                    {scholarship.provider.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy truncate">
                      {scholarship.provider}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {scholarship.state === 'All India' ? 'National Provider' : `${scholarship.state} State Sponsor`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to="/explore"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Browse more from this provider</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
