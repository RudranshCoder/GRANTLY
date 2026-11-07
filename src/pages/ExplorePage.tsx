import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  RotateCcw,
  Calendar,
  Sparkles,
  Check,
  Filter,
} from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { scholarships } from '@/data/scholarships'
import { calculateMatch } from '@/lib/matching'
import { cn, parseAmountFromString } from '@/lib/utils'
import { EDUCATION_LEVELS, SCHOLARSHIP_CATEGORIES, INDIAN_STATES } from '@/lib/constants'
import { SearchInput, EmptyState } from '@/components/ui'
import { ScholarshipGrid } from '@/components/scholarship/ScholarshipCard'
import type { ScholarshipFilters, EducationLevel, ScholarshipCategory } from '@/types'

const initialFilterState: ScholarshipFilters = {
  search: '',
  educationLevel: [],
  category: [],
  state: [],
  minAmount: '',
  maxAmount: '',
  deadlineBefore: '',
  deadlineAfter: '',
  verificationStatus: [],
  sortBy: 'relevance',
}

export function ExplorePage() {
  const { state } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize filters from URL params if present
  const [filters, setFilters] = useState<ScholarshipFilters>(() => {
    const q = searchParams.get('search') || searchParams.get('q') || ''
    const cat = searchParams.get('category')
    const level = searchParams.get('level') || searchParams.get('educationLevel')
    const stateParam = searchParams.get('state')
    const sortParam = searchParams.get('sortBy') as ScholarshipFilters['sortBy']

    const initialCategories: ScholarshipCategory[] = cat ? [cat as ScholarshipCategory] : []
    const initialLevels: EducationLevel[] = level ? [level as EducationLevel] : []
    const initialStates: string[] = stateParam ? [stateParam] : []

    return {
      search: q,
      educationLevel: initialLevels,
      category: initialCategories,
      state: initialStates,
      minAmount: searchParams.get('minAmount') || '',
      maxAmount: searchParams.get('maxAmount') || '',
      deadlineBefore: searchParams.get('deadlineBefore') || '',
      deadlineAfter: '',
      verificationStatus: [],
      sortBy: sortParam || 'relevance',
    }
  })

  // Mobile drawer open state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Internal state search for Location filter
  const [stateSearchQuery, setStateSearchQuery] = useState('')

  // Collapsible section state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    educationLevel: false,
    category: false,
    state: false,
    amount: false,
    deadline: false,
  })

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Handle escape key and body scroll lock for mobile filter drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFilterOpen) {
        setIsMobileFilterOpen(false)
      }
    }

    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileFilterOpen])

  // Optional: keep URL search param synchronized with basic search query
  useEffect(() => {
    const currentQ = searchParams.get('search') || ''
    if (filters.search && filters.search !== currentQ) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('search', filters.search)
      setSearchParams(nextParams, { replace: true })
    } else if (!filters.search && currentQ) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('search')
      nextParams.delete('q')
      setSearchParams(nextParams, { replace: true })
    }
  }, [filters.search, searchParams, setSearchParams])

  // Pre-calculate scholarship match scores for student profile (if logged in/created)
  const matchScores = useMemo(() => {
    if (!state.profile) return null
    const scores = new Map<string, number>()
    for (const s of scholarships) {
      scores.set(s.id, calculateMatch(s, state.profile).overallScore)
    }
    return scores
  }, [state.profile])

  // Count distribution per education level across all scholarships
  const educationLevelCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of scholarships) {
      for (const lvl of s.educationLevel) {
        counts[lvl] = (counts[lvl] || 0) + 1
      }
    }
    return counts
  }, [])

  // Count distribution per category across all scholarships
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of scholarships) {
      for (const cat of s.category) {
        counts[cat] = (counts[cat] || 0) + 1
      }
    }
    return counts
  }, [])

  // Filtered Indian states based on internal search within state filter section
  const filteredStates = useMemo(() => {
    const query = stateSearchQuery.trim().toLowerCase()
    if (!query) return INDIAN_STATES
    return INDIAN_STATES.filter(st => st.toLowerCase().includes(query))
  }, [stateSearchQuery])

  // Toggle handlers for multi-select filters
  const handleToggleEducationLevel = useCallback((level: EducationLevel) => {
    setFilters(prev => {
      const exists = prev.educationLevel.includes(level)
      return {
        ...prev,
        educationLevel: exists
          ? prev.educationLevel.filter(l => l !== level)
          : [...prev.educationLevel, level],
      }
    })
  }, [])

  const handleToggleCategory = useCallback((cat: ScholarshipCategory) => {
    setFilters(prev => {
      const exists = prev.category.includes(cat)
      return {
        ...prev,
        category: exists
          ? prev.category.filter(c => c !== cat)
          : [...prev.category, cat],
      }
    })
  }, [])

  const handleToggleState = useCallback((stateName: string) => {
    setFilters(prev => {
      const exists = prev.state.includes(stateName)
      return {
        ...prev,
        state: exists
          ? prev.state.filter(s => s !== stateName)
          : [...prev.state, stateName],
      }
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      ...initialFilterState,
      sortBy: filters.sortBy, // preserve user's sort preference
    })
    setStateSearchQuery('')
  }, [filters.sortBy])

  // Quick preset helpers
  const handleSetAmountPreset = (min: string, max: string) => {
    setFilters(prev => ({
      ...prev,
      minAmount: min,
      maxAmount: max,
    }))
  }

  const handleSetDeadlineDays = (days: number) => {
    const target = new Date()
    target.setDate(target.getDate() + days)
    const formatted = target.toISOString().split('T')[0]
    setFilters(prev => ({
      ...prev,
      deadlineBefore: formatted,
    }))
  }

  // Active filter count for badge indicators
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count += 1
    count += filters.educationLevel.length
    count += filters.category.length
    count += filters.state.length
    if (filters.minAmount) count += 1
    if (filters.maxAmount) count += 1
    if (filters.deadlineBefore) count += 1
    return count
  }, [filters])

  // Filter & Sort scholarship results
  const filteredAndSortedScholarships = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    const minAmt = filters.minAmount ? Number(filters.minAmount) : null
    const maxAmt = filters.maxAmount ? Number(filters.maxAmount) : null

    // Date boundary comparison
    let deadlineBoundary = 0
    if (filters.deadlineBefore) {
      deadlineBoundary = new Date(`${filters.deadlineBefore}T23:59:59.999Z`).getTime()
    }

    const filtered = scholarships.filter(scholarship => {
      // 1. Search Query filter (title, provider, description, shortDescription, state, tags)
      if (query) {
        const titleMatch = scholarship.title.toLowerCase().includes(query)
        const providerMatch = scholarship.provider.toLowerCase().includes(query)
        const descMatch = (scholarship.description || '').toLowerCase().includes(query)
        const shortDescMatch = (scholarship.shortDescription || '').toLowerCase().includes(query)
        const stateMatch = (scholarship.state || '').toLowerCase().includes(query)
        const tagMatch = scholarship.tags?.some(tag => tag.toLowerCase().includes(query))

        if (!titleMatch && !providerMatch && !descMatch && !shortDescMatch && !stateMatch && !tagMatch) {
          return false
        }
      }

      // 2. Education Level filter (scholarship includes ANY of selected)
      if (filters.educationLevel.length > 0) {
        const matchesLevel = scholarship.educationLevel.some(lvl =>
          filters.educationLevel.includes(lvl)
        )
        if (!matchesLevel) return false
      }

      // 3. Category filter (scholarship includes ANY of selected)
      if (filters.category.length > 0) {
        const matchesCat = scholarship.category.some(cat =>
          filters.category.includes(cat)
        )
        if (!matchesCat) return false
      }

      // 4. State / Location filter (matches or is 'All India')
      if (filters.state.length > 0) {
        const matchesState =
          scholarship.state === 'All India' || filters.state.includes(scholarship.state)
        if (!matchesState) return false
      }

      // 5. Benefit Amount filter (parsed min / max)
      const parsedAmount = parseAmountFromString(scholarship.benefitAmount)
      if (minAmt !== null && !isNaN(minAmt) && minAmt > 0) {
        if (parsedAmount < minAmt) return false
      }
      if (maxAmt !== null && !isNaN(maxAmt) && maxAmt > 0) {
        if (parsedAmount > maxAmt) return false
      }

      // 6. Deadline before date filter
      if (deadlineBoundary > 0) {
        const deadlineTime = new Date(scholarship.deadline).getTime()
        if (deadlineTime > deadlineBoundary) return false
      }

      return true
    })

    // Sort logic
    return [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'relevance': {
          if (matchScores && state.profile) {
            const scoreA = matchScores.get(a.id) ?? 0
            const scoreB = matchScores.get(b.id) ?? 0
            if (scoreB !== scoreA) {
              return scoreB - scoreA
            }
          }
          // Fallback to nearest deadline ascending
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }

        case 'deadline': {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        }

        case 'amount-high': {
          const amtA = parseAmountFromString(a.benefitAmount)
          const amtB = parseAmountFromString(b.benefitAmount)
          return amtB - amtA
        }

        case 'amount-low': {
          const amtA = parseAmountFromString(a.benefitAmount)
          const amtB = parseAmountFromString(b.benefitAmount)
          return amtA - amtB
        }

        case 'newest': {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }

        default:
          return 0
      }
    })
  }, [scholarships, filters, matchScores, state.profile])

  // Reusable Filter Sidebar Content component (used in both desktop sidebar and mobile slide-over)
  const renderFilterContent = () => (
    <div className="space-y-5 text-sm">
      {/* Education Level Section */}
      <div className="border-b border-border pb-4">
        <button
          type="button"
          onClick={() => toggleSection('educationLevel')}
          className="flex w-full items-center justify-between text-left font-semibold text-navy hover:text-primary transition-colors focus-visible:outline-none"
          aria-expanded={!collapsedSections.educationLevel}
        >
          <div className="flex items-center gap-2">
            <span>Education Level</span>
            {filters.educationLevel.length > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary">
                {filters.educationLevel.length}
              </span>
            )}
          </div>
          {collapsedSections.educationLevel ? (
            <ChevronDown className="size-4 text-text-muted" />
          ) : (
            <ChevronUp className="size-4 text-text-muted" />
          )}
        </button>

        {!collapsedSections.educationLevel && (
          <div className="mt-3 space-y-2">
            {EDUCATION_LEVELS.map(item => {
              const checked = filters.educationLevel.includes(item.value)
              const count = educationLevelCounts[item.value] || 0
              return (
                <label
                  key={item.value}
                  className="flex items-center justify-between text-text-secondary hover:text-text-primary cursor-pointer select-none group text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleEducationLevel(item.value)}
                      className="size-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                    />
                    <span className={cn('transition-colors', checked && 'font-medium text-navy')}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted group-hover:text-text-secondary">
                    {count}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Category Section */}
      <div className="border-b border-border pb-4">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="flex w-full items-center justify-between text-left font-semibold text-navy hover:text-primary transition-colors focus-visible:outline-none"
          aria-expanded={!collapsedSections.category}
        >
          <div className="flex items-center gap-2">
            <span>Category</span>
            {filters.category.length > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-teal-50 text-[11px] font-bold text-teal">
                {filters.category.length}
              </span>
            )}
          </div>
          {collapsedSections.category ? (
            <ChevronDown className="size-4 text-text-muted" />
          ) : (
            <ChevronUp className="size-4 text-text-muted" />
          )}
        </button>

        {!collapsedSections.category && (
          <div className="mt-3 max-h-56 overflow-y-auto pr-1 space-y-2">
            {SCHOLARSHIP_CATEGORIES.map(item => {
              const checked = filters.category.includes(item.value)
              const count = categoryCounts[item.value] || 0
              return (
                <label
                  key={item.value}
                  className="flex items-center justify-between text-text-secondary hover:text-text-primary cursor-pointer select-none group text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCategory(item.value)}
                      className="size-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                    />
                    <span className={cn('transition-colors', checked && 'font-medium text-navy')}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted group-hover:text-text-secondary">
                    {count}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* State / Location Section with Search */}
      <div className="border-b border-border pb-4">
        <button
          type="button"
          onClick={() => toggleSection('state')}
          className="flex w-full items-center justify-between text-left font-semibold text-navy hover:text-primary transition-colors focus-visible:outline-none"
          aria-expanded={!collapsedSections.state}
        >
          <div className="flex items-center gap-2">
            <span>State / Location</span>
            {filters.state.length > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary">
                {filters.state.length}
              </span>
            )}
          </div>
          {collapsedSections.state ? (
            <ChevronDown className="size-4 text-text-muted" />
          ) : (
            <ChevronUp className="size-4 text-text-muted" />
          )}
        </button>

        {!collapsedSections.state && (
          <div className="mt-3 space-y-2">
            {/* Search inside state filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-muted" />
              <input
                type="text"
                value={stateSearchQuery}
                onChange={e => setStateSearchQuery(e.target.value)}
                placeholder="Search state..."
                className="input pl-8 py-1.5 text-xs bg-background"
                aria-label="Filter states"
              />
              {stateSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStateSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  aria-label="Clear state search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Scrollable state list */}
            <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
              {filteredStates.length > 0 ? (
                filteredStates.map(st => {
                  const checked = filters.state.includes(st)
                  return (
                    <label
                      key={st}
                      className="flex items-center gap-2.5 text-text-secondary hover:text-text-primary cursor-pointer select-none text-xs py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleState(st)}
                        className="size-4 rounded border-border text-primary focus:ring-primary/20 transition-colors"
                      />
                      <span className={cn('transition-colors', checked && 'font-medium text-navy')}>
                        {st}
                      </span>
                    </label>
                  )
                })
              ) : (
                <p className="text-xs text-text-muted py-2 text-center">
                  No state matching "{stateSearchQuery}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Benefit Amount Range Section */}
      <div className="border-b border-border pb-4">
        <button
          type="button"
          onClick={() => toggleSection('amount')}
          className="flex w-full items-center justify-between text-left font-semibold text-navy hover:text-primary transition-colors focus-visible:outline-none"
          aria-expanded={!collapsedSections.amount}
        >
          <div className="flex items-center gap-2">
            <span>Benefit Amount</span>
            {(filters.minAmount || filters.maxAmount) && (
              <span className="inline-flex size-2 rounded-full bg-primary" />
            )}
          </div>
          {collapsedSections.amount ? (
            <ChevronDown className="size-4 text-text-muted" />
          ) : (
            <ChevronUp className="size-4 text-text-muted" />
          )}
        </button>

        {!collapsedSections.amount && (
          <div className="mt-3 space-y-3">
            {/* Quick amount presets */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAmountPreset('', '50000')}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium border text-center transition-colors',
                  filters.maxAmount === '50000' && !filters.minAmount
                    ? 'bg-primary-50 border-primary text-primary font-semibold'
                    : 'border-border text-text-secondary hover:bg-background'
                )}
              >
                Up to ₹50K
              </button>
              <button
                type="button"
                onClick={() => handleSetAmountPreset('50000', '150000')}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium border text-center transition-colors',
                  filters.minAmount === '50000' && filters.maxAmount === '150000'
                    ? 'bg-primary-50 border-primary text-primary font-semibold'
                    : 'border-border text-text-secondary hover:bg-background'
                )}
              >
                ₹50K - ₹1.5L
              </button>
              <button
                type="button"
                onClick={() => handleSetAmountPreset('150000', '')}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium border text-center transition-colors',
                  filters.minAmount === '150000' && !filters.maxAmount
                    ? 'bg-primary-50 border-primary text-primary font-semibold'
                    : 'border-border text-text-secondary hover:bg-background'
                )}
              >
                ₹1.5 Lakhs+
              </button>
              <button
                type="button"
                onClick={() => handleSetAmountPreset('', '')}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium border text-center transition-colors',
                  !filters.minAmount && !filters.maxAmount
                    ? 'bg-gray-100 border-border-dark text-navy font-semibold'
                    : 'border-border text-text-secondary hover:bg-background'
                )}
              >
                Any Amount
              </button>
            </div>

            {/* Custom Min / Max Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={e => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  className="input py-1.5 px-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="Any"
                  value={filters.maxAmount}
                  onChange={e => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  className="input py-1.5 px-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deadline Section */}
      <div className="border-b border-border pb-4">
        <button
          type="button"
          onClick={() => toggleSection('deadline')}
          className="flex w-full items-center justify-between text-left font-semibold text-navy hover:text-primary transition-colors focus-visible:outline-none"
          aria-expanded={!collapsedSections.deadline}
        >
          <div className="flex items-center gap-2">
            <span>Deadline</span>
            {filters.deadlineBefore && (
              <span className="inline-flex size-2 rounded-full bg-purple-600" />
            )}
          </div>
          {collapsedSections.deadline ? (
            <ChevronDown className="size-4 text-text-muted" />
          ) : (
            <ChevronUp className="size-4 text-text-muted" />
          )}
        </button>

        {!collapsedSections.deadline && (
          <div className="mt-3 space-y-3">
            {/* Quick deadline presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSetDeadlineDays(7)}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-background hover:text-navy transition-colors"
              >
                Next 7 days
              </button>
              <button
                type="button"
                onClick={() => handleSetDeadlineDays(30)}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-background hover:text-navy transition-colors"
              >
                Next 30 days
              </button>
              <button
                type="button"
                onClick={() => handleSetDeadlineDays(90)}
                className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-background hover:text-navy transition-colors"
              >
                Next 90 days
              </button>
            </div>

            {/* Custom Before Date input */}
            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">
                Closing Before
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.deadlineBefore || ''}
                  onChange={e => setFilters(prev => ({ ...prev, deadlineBefore: e.target.value }))}
                  className="input py-1.5 text-xs w-full"
                />
                {filters.deadlineBefore && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, deadlineBefore: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    aria-label="Clear deadline"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear All Filters Button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={handleClearAllFilters}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-danger/30 bg-danger-50 py-2 text-xs font-semibold text-danger hover:bg-danger hover:text-white transition-colors"
        >
          <RotateCcw className="size-3.5" />
          <span>Clear All Filters ({activeFilterCount})</span>
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              Scholarship Explorer
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Search, filter, and discover eligible national, state, and private scholarships across India.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border border-border bg-surface px-3 py-1.5 shadow-xs text-xs font-medium text-navy">
            <span className="size-2 rounded-full bg-teal animate-pulse" />
            <span>{scholarships.length} scholarships cataloged</span>
          </div>
        </div>

        {/* Personalized Matching Status Banner */}
        {state.profile ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-teal/20 bg-teal-50 px-4 py-3 text-xs sm:text-sm text-teal-dark">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="size-4 shrink-0 text-teal" />
              <p className="truncate">
                Personalized match enabled for <strong>{state.profile.fullName}</strong> ({state.profile.educationLevel}, {state.profile.state}).
              </p>
            </div>
            <Link
              to="/profile"
              className="shrink-0 font-semibold text-teal hover:underline"
            >
              Update Profile
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-xs sm:text-sm text-primary-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <p className="truncate">
                <strong>Want automated eligibility scores?</strong> Complete your profile to match against every criterion.
              </p>
            </div>
            <Link
              to="/onboarding"
              className="shrink-0 font-semibold text-primary hover:underline"
            >
              Set Up Profile &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Top Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <SearchInput
            value={filters.search}
            onChange={val => setFilters(prev => ({ ...prev, search: val }))}
            placeholder="Search by name, provider, course, tags, state..."
            className="w-full"
          />
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-navy shadow-xs hover:bg-background transition-colors"
          aria-label="Open filter sidebar"
        >
          <SlidersHorizontal className="size-4 text-text-secondary" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="relative shrink-0 min-w-[200px]">
          <div className="relative inline-flex items-center w-full">
            <ArrowUpDown className="absolute left-3 size-4 text-text-muted pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  sortBy: e.target.value as ScholarshipFilters['sortBy'],
                }))
              }
              className="input pl-9 pr-8 py-2 text-sm bg-surface appearance-none cursor-pointer w-full"
              aria-label="Sort scholarships"
            >
              <option value="relevance">
                Relevance {state.profile ? '(Profile Match)' : ''}
              </option>
              <option value="deadline">Deadline (Nearest first)</option>
              <option value="amount-high">Amount (Highest first)</option>
              <option value="amount-low">Amount (Lowest first)</option>
              <option value="newest">Recently Added</option>
            </select>
            <ChevronDown className="absolute right-3 size-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex items-start gap-8">
        {/* Desktop Filter Sidebar (280px) */}
        <aside
          className="hidden lg:block w-[280px] shrink-0 sticky top-24 rounded-xl border border-border bg-surface p-5 shadow-xs"
          aria-label="Filters sidebar"
        >
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 font-semibold text-navy">
              <Filter className="size-4 text-primary" />
              <span>Filter Scholarships</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {renderFilterContent()}
        </aside>

        {/* Mobile Slide-Over Filter Panel & Backdrop */}
        {isMobileFilterOpen && (
          <div
            className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-surface border-r border-border shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out',
            isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Mobile filter drawer"
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              <h2 className="font-heading font-bold text-base text-navy">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="rounded-lg p-1.5 text-text-secondary hover:text-navy hover:bg-background transition-colors"
              aria-label="Close filters"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {renderFilterContent()}
          </div>

          {/* Drawer Footer Actions */}
          <div className="flex items-center gap-3 border-t border-border p-4 bg-background/50">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="btn-secondary text-xs flex-1 py-2"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="btn-primary text-xs flex-1 py-2 font-semibold"
            >
              Show {filteredAndSortedScholarships.length} Results
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <span className="text-xs font-medium text-text-secondary mr-1">Active filters:</span>

              {/* Search query chip */}
              {filters.search.trim() && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                  <span>Search: "{filters.search}"</span>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="hover:opacity-75 focus-visible:outline-none"
                    aria-label="Remove search term"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* Education levels chips */}
              {filters.educationLevel.map(level => {
                const item = EDUCATION_LEVELS.find(l => l.value === level)
                return (
                  <span
                    key={level}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                  >
                    <span>{item?.label || level}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleEducationLevel(level)}
                      className="hover:opacity-75 focus-visible:outline-none"
                      aria-label={`Remove ${item?.label || level} filter`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )
              })}

              {/* Category chips */}
              {filters.category.map(cat => {
                const item = SCHOLARSHIP_CATEGORIES.find(c => c.value === cat)
                return (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal"
                  >
                    <span>{item?.label || cat}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className="hover:opacity-75 focus-visible:outline-none"
                      aria-label={`Remove ${item?.label || cat} filter`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )
              })}

              {/* State location chips */}
              {filters.state.map(st => (
                <span
                  key={st}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-gray-100 px-2.5 py-1 text-xs font-medium text-navy"
                >
                  <span>{st}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleState(st)}
                    className="hover:opacity-75 focus-visible:outline-none"
                    aria-label={`Remove ${st} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {/* Amount range chip */}
              {(filters.minAmount || filters.maxAmount) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                  <span>
                    {filters.minAmount && filters.maxAmount
                      ? `₹${Number(filters.minAmount).toLocaleString('en-IN')} - ₹${Number(filters.maxAmount).toLocaleString('en-IN')}`
                      : filters.minAmount
                      ? `Min ₹${Number(filters.minAmount).toLocaleString('en-IN')}`
                      : `Max ₹${Number(filters.maxAmount).toLocaleString('en-IN')}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, minAmount: '', maxAmount: '' }))}
                    className="hover:opacity-75 focus-visible:outline-none"
                    aria-label="Remove amount range filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* Deadline chip */}
              {filters.deadlineBefore && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  <Calendar className="size-3" />
                  <span>
                    Before {new Date(filters.deadlineBefore).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, deadlineBefore: '' }))}
                    className="hover:opacity-75 focus-visible:outline-none"
                    aria-label="Remove deadline filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* Reset all button */}
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger-50 transition-colors"
              >
                <RotateCcw className="size-3" />
                <span>Clear all ({activeFilterCount})</span>
              </button>
            </div>
          )}

          {/* Results Header Count & Sort indicator */}
          <div className="flex items-center justify-between text-sm text-text-secondary pb-1">
            <p>
              Showing{' '}
              <span className="font-semibold text-navy">
                {filteredAndSortedScholarships.length}
              </span>{' '}
              {filteredAndSortedScholarships.length === 1 ? 'scholarship' : 'scholarships'} found
            </p>
            {filteredAndSortedScholarships.length > 0 && (
              <span className="hidden sm:inline-block text-xs text-text-muted">
                {filters.sortBy === 'relevance' && 'Sorted by profile match relevance'}
                {filters.sortBy === 'deadline' && 'Sorted by nearest application deadline'}
                {filters.sortBy === 'amount-high' && 'Sorted by highest financial benefit'}
                {filters.sortBy === 'amount-low' && 'Sorted by lowest financial benefit'}
                {filters.sortBy === 'newest' && 'Sorted by newest additions'}
              </span>
            )}
          </div>

          {/* Results Grid or Empty State */}
          {filteredAndSortedScholarships.length > 0 ? (
            <ScholarshipGrid
              scholarships={filteredAndSortedScholarships}
              showMatch={true}
              className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            />
          ) : (
            <div className="rounded-xl border border-border bg-surface shadow-xs">
              <EmptyState
                icon={<Search className="size-8" />}
                title="No scholarships found"
                description="We couldn't find any scholarships matching your active search and filter criteria. Try adjusting keywords, widening the date or amount ranges, or clearing some filters."
                action={
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="btn-primary text-sm inline-flex items-center gap-2"
                  >
                    <RotateCcw className="size-4" />
                    <span>Reset All Filters</span>
                  </button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExplorePage
