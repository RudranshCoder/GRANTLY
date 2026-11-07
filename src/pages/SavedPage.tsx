import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { scholarships } from '@/data/scholarships'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { EmptyState, SearchInput } from '@/components/ui'
import { parseAmountFromString } from '@/lib/utils'
import type { Scholarship } from '@/types'

type SortOption = 'saved-date' | 'deadline' | 'alphabetical' | 'amount'

interface SavedWithData {
  savedAt: string
  scholarship: Scholarship
}

export default function SavedPage() {
  const { state, dispatch } = useApp()
  const savedItems = state.savedScholarships

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('saved-date')

  // Find full scholarship objects from data source
  const fullSavedScholarships: SavedWithData[] = useMemo(() => {
    return savedItems
      .map((item) => {
        const found = scholarships.find((s) => s.id === item.scholarshipId)
        if (!found) return null
        return {
          savedAt: item.savedAt,
          scholarship: found,
        }
      })
      .filter((item): item is SavedWithData => item !== null)
  }, [savedItems])

  // Filter and sort saved scholarships
  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return fullSavedScholarships
      .filter(({ scholarship }) => {
        if (!q) return true
        return (
          scholarship.title.toLowerCase().includes(q) ||
          scholarship.provider.toLowerCase().includes(q) ||
          scholarship.shortDescription.toLowerCase().includes(q) ||
          scholarship.category.some((c) => c.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'saved-date') {
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        }
        if (sortBy === 'deadline') {
          return new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime()
        }
        if (sortBy === 'alphabetical') {
          return a.scholarship.title.localeCompare(b.scholarship.title)
        }
        if (sortBy === 'amount') {
          return (
            parseAmountFromString(b.scholarship.benefitAmount) -
            parseAmountFromString(a.scholarship.benefitAmount)
          )
        }
        return 0
      })
  }, [fullSavedScholarships, searchQuery, sortBy])

  // Seed sample saved scholarships if user has none
  const handleSeedDemoSaved = () => {
    if (scholarships.length === 0) return
    const demoToSave = scholarships.slice(0, 3)
    demoToSave.forEach((sch, idx) => {
      if (!state.savedScholarships.some((s) => s.scholarshipId === sch.id)) {
        dispatch({
          type: 'SAVE_SCHOLARSHIP',
          payload: {
            scholarshipId: sch.id,
            savedAt: new Date(Date.now() - idx * 3600000).toISOString(),
          },
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-navy">
              Saved Scholarships
            </h1>
            <span className="inline-flex items-center justify-center rounded-full bg-primary-50 px-3 py-0.5 text-sm font-semibold text-primary">
              {fullSavedScholarships.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Keep track of promising scholarship opportunities and add them directly to your application tracker.
          </p>
        </div>

        <Link
          to="/explore"
          className="btn-secondary text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Browse all scholarships</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Main Content */}
      {fullSavedScholarships.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface shadow-xs">
          <EmptyState
            icon={<Bookmark className="size-10" />}
            title="No saved scholarships yet"
            description="As you explore scholarships, click the bookmark icon on any card to save it here for fast comparison and tracking."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/explore" className="btn-primary">
                  Explore Scholarships
                </Link>
                <button
                  type="button"
                  onClick={handleSeedDemoSaved}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  Save Sample Scholarships
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {/* Controls: Search and Sort */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search saved by name, provider, or category..."
              />
            </div>

            <div className="flex items-center gap-2.5">
              <label htmlFor="saved-sort" className="text-xs font-medium text-text-secondary whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="saved-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input py-1.5 px-2.5 text-xs w-auto font-medium"
              >
                <option value="saved-date">Recently Saved</option>
                <option value="deadline">Deadline (Earliest)</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="amount">Amount (Highest)</option>
              </select>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-primary hover:underline px-1"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {filteredAndSorted.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-xs">
              <p className="text-base font-semibold text-navy">No saved scholarships found</p>
              <p className="mt-1 text-sm text-text-secondary">
                No saved items match "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-secondary mt-4 text-xs"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSorted.map(({ scholarship }) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  showTrackButton={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
