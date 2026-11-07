import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  GraduationCap,
  MapPin,
  Sparkles,
  Bell,
  Check,
  AlertCircle,
  Edit2,
  X,
  Save,
  CheckCircle2,
  Calendar,
  Mail,
  Building,
  Heart,
  Award,
  ShieldCheck,
  Phone,
  ArrowRight,
  TrendingUp,
  Sliders,
} from 'lucide-react'
import { useApp } from '@/store/AppContext'
import {
  EDUCATION_LEVELS,
  INDIAN_STATES,
  INCOME_RANGES,
  ACADEMIC_YEARS,
  SOCIAL_CATEGORIES,
  INTEREST_AREAS,
  SCHOLARSHIP_CATEGORIES,
} from '@/lib/constants'
import {
  cn,
  formatDate,
  formatShortDate,
  formatCurrency,
  generateId,
  calculateProfileCompletion,
} from '@/lib/utils'
import type {
  StudentProfile,
  EducationLevel,
  ScholarshipCategory,
  NotificationPreferences,
} from '@/types'

type ActiveTab = 'personal' | 'academic' | 'location' | 'interests' | 'notifications'

export default function ProfilePage() {
  const { state, dispatch } = useApp()
  const profile = state.profile
  const notifications = state.notifications

  const [activeTab, setActiveTab] = useState<ActiveTab>('personal')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Track editing state for each section independently
  const [editingSection, setEditingSection] = useState<ActiveTab | null>(null)

  // Form states
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    email: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dateOfBirth: '',
  })

  const [academicForm, setAcademicForm] = useState({
    educationLevel: 'undergraduate' as EducationLevel,
    currentCourse: '',
    institution: '',
    academicYear: '1st Year',
    academicScore: 85,
  })

  const [locationForm, setLocationForm] = useState({
    state: 'All India',
    city: '',
    category: 'General',
    familyIncome: 500000,
    hasDisability: false,
    isSportsQuota: false,
  })

  const [interestsForm, setInterestsForm] = useState<{
    areasOfInterest: string[]
    scholarshipPreferences: ScholarshipCategory[]
  }>({
    areasOfInterest: [],
    scholarshipPreferences: [],
  })

  const [notificationsForm, setNotificationsForm] = useState<NotificationPreferences>({
    deadlineReminders: true,
    newScholarships: true,
    applicationUpdates: true,
    emailNotifications: false,
    reminderDaysBefore: 7,
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Synchronize local form states with profile & notification context
  useEffect(() => {
    if (profile) {
      setPersonalForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        gender: profile.gender || 'male',
        dateOfBirth: profile.dateOfBirth || '',
      })

      setAcademicForm({
        educationLevel: profile.educationLevel || 'undergraduate',
        currentCourse: profile.currentCourse || '',
        institution: profile.institution || '',
        academicYear: profile.academicYear || '1st Year',
        academicScore: profile.academicScore ?? 80,
      })

      setLocationForm({
        state: profile.state || 'All India',
        city: profile.city || '',
        category: profile.category || 'General',
        familyIncome: profile.familyIncome ?? 500000,
        hasDisability: Boolean(profile.hasDisability),
        isSportsQuota: Boolean(profile.isSportsQuota),
      })

      setInterestsForm({
        areasOfInterest: profile.areasOfInterest || [],
        scholarshipPreferences: profile.scholarshipPreferences || [],
      })
    }
  }, [profile])

  useEffect(() => {
    if (notifications) {
      setNotificationsForm(notifications)
    }
  }, [notifications])

  // Show temporary toast feedback
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Handle Demo Profile Creation if user starts without a profile
  const handleLoadDemoProfile = () => {
    const demoProfile: StudentProfile = {
      id: generateId(),
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.edu.in',
      educationLevel: 'undergraduate',
      currentCourse: 'B.Tech in Computer Science & Engineering',
      institution: 'Indian Institute of Technology, Bombay',
      academicYear: '2nd Year',
      state: 'Maharashtra',
      city: 'Mumbai',
      academicScore: 88.5,
      familyIncome: 450000,
      gender: 'male',
      dateOfBirth: '2004-05-14',
      category: 'General',
      areasOfInterest: ['Engineering', 'Technology', 'Research', 'Science'],
      scholarshipPreferences: ['merit-based', 'need-based', 'stem', 'research'],
      hasDisability: false,
      isSportsQuota: false,
      profileCompletion: 95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    demoProfile.profileCompletion = calculateProfileCompletion(demoProfile)
    dispatch({ type: 'SET_PROFILE', payload: demoProfile })
    triggerSuccess('Demo profile loaded successfully!')
  }

  // Save Personal Info
  const handleSavePersonal = () => {
    const newErrors: Record<string, string> = {}
    if (!personalForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!personalForm.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^\S+@\S+\.\S+$/.test(personalForm.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    if (!profile) return

    const updated = {
      fullName: personalForm.fullName.trim(),
      email: personalForm.email.trim(),
      gender: personalForm.gender,
      dateOfBirth: personalForm.dateOfBirth || undefined,
    }

    const newProfile = { ...profile, ...updated }
    newProfile.profileCompletion = calculateProfileCompletion(newProfile)

    dispatch({ type: 'UPDATE_PROFILE', payload: newProfile })
    setEditingSection(null)
    triggerSuccess('Personal information updated')
  }

  // Save Academic Info
  const handleSaveAcademic = () => {
    const newErrors: Record<string, string> = {}
    if (!academicForm.educationLevel) {
      newErrors.educationLevel = 'Education level is required'
    }
    if (!academicForm.currentCourse.trim()) {
      newErrors.currentCourse = 'Current course / degree is required'
    }
    if (!academicForm.institution.trim()) {
      newErrors.institution = 'Institution / University is required'
    }
    const score = Number(academicForm.academicScore)
    if (isNaN(score) || score < 0 || score > 100) {
      newErrors.academicScore = 'Score must be a number between 0 and 100'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    if (!profile) return

    const updated = {
      educationLevel: academicForm.educationLevel,
      currentCourse: academicForm.currentCourse.trim(),
      institution: academicForm.institution.trim(),
      academicYear: academicForm.academicYear,
      academicScore: score,
    }

    const newProfile = { ...profile, ...updated }
    newProfile.profileCompletion = calculateProfileCompletion(newProfile)

    dispatch({ type: 'UPDATE_PROFILE', payload: newProfile })
    setEditingSection(null)
    triggerSuccess('Academic information updated')
  }

  // Save Location & Background
  const handleSaveLocation = () => {
    setErrors({})
    if (!profile) return

    const updated = {
      state: locationForm.state,
      city: locationForm.city.trim() || undefined,
      category: locationForm.category,
      familyIncome: Number(locationForm.familyIncome) || undefined,
      hasDisability: locationForm.hasDisability,
      isSportsQuota: locationForm.isSportsQuota,
    }

    const newProfile = { ...profile, ...updated }
    newProfile.profileCompletion = calculateProfileCompletion(newProfile)

    dispatch({ type: 'UPDATE_PROFILE', payload: newProfile })
    setEditingSection(null)
    triggerSuccess('Location & background updated')
  }

  // Save Interests
  const handleSaveInterests = () => {
    setErrors({})
    if (!profile) return

    const updated = {
      areasOfInterest: interestsForm.areasOfInterest,
      scholarshipPreferences: interestsForm.scholarshipPreferences,
    }

    const newProfile = { ...profile, ...updated }
    newProfile.profileCompletion = calculateProfileCompletion(newProfile)

    dispatch({ type: 'UPDATE_PROFILE', payload: newProfile })
    setEditingSection(null)
    triggerSuccess('Interests & preferences updated')
  }

  // Save Notifications
  const handleSaveNotifications = () => {
    dispatch({
      type: 'SET_NOTIFICATIONS',
      payload: notificationsForm,
    })
    setEditingSection(null)
    triggerSuccess('Notification preferences saved')
  }

  // Cancel edit mode
  const handleCancel = (section: ActiveTab) => {
    setEditingSection(null)
    setErrors({})
    if (!profile) return

    if (section === 'personal') {
      setPersonalForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        gender: profile.gender || 'male',
        dateOfBirth: profile.dateOfBirth || '',
      })
    } else if (section === 'academic') {
      setAcademicForm({
        educationLevel: profile.educationLevel || 'undergraduate',
        currentCourse: profile.currentCourse || '',
        institution: profile.institution || '',
        academicYear: profile.academicYear || '1st Year',
        academicScore: profile.academicScore ?? 80,
      })
    } else if (section === 'location') {
      setLocationForm({
        state: profile.state || 'All India',
        city: profile.city || '',
        category: profile.category || 'General',
        familyIncome: profile.familyIncome ?? 500000,
        hasDisability: Boolean(profile.hasDisability),
        isSportsQuota: Boolean(profile.isSportsQuota),
      })
    } else if (section === 'interests') {
      setInterestsForm({
        areasOfInterest: profile.areasOfInterest || [],
        scholarshipPreferences: profile.scholarshipPreferences || [],
      })
    } else if (section === 'notifications') {
      setNotificationsForm(notifications)
    }
  }

  // Toggle interest area
  const toggleAreaOfInterest = (area: string) => {
    setInterestsForm((prev) => {
      const exists = prev.areasOfInterest.includes(area)
      return {
        ...prev,
        areasOfInterest: exists
          ? prev.areasOfInterest.filter((a) => a !== area)
          : [...prev.areasOfInterest, area],
      }
    })
  }

  // Toggle scholarship preference
  const toggleScholarshipPreference = (cat: ScholarshipCategory) => {
    setInterestsForm((prev) => {
      const exists = prev.scholarshipPreferences.includes(cat)
      return {
        ...prev,
        scholarshipPreferences: exists
          ? prev.scholarshipPreferences.filter((c) => c !== cat)
          : [...prev.scholarshipPreferences, cat],
      }
    })
  }

  // ==========================================================================
  // Render: No Profile Case
  // ==========================================================================
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-50 text-primary">
            <User className="size-8" />
          </div>

          <h1 className="text-2xl font-bold font-heading text-navy">
            Complete Your Student Profile
          </h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            You haven't set up your profile yet. Your academic records, financial background, and interests allow GRANTLY to calculate precise scholarship eligibility and send custom deadline reminders.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/onboarding" className="btn-primary w-full sm:w-auto inline-flex items-center gap-2">
              <span>Start Profile Onboarding</span>
              <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={handleLoadDemoProfile}
              className="btn-secondary w-full sm:w-auto inline-flex items-center gap-2 text-xs"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Load Demo Student Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate live completion score
  const completionPercentage = calculateProfileCompletion(profile)
  const eduLevelLabel =
    EDUCATION_LEVELS.find((l) => l.value === profile.educationLevel)?.label || profile.educationLevel

  const tabs: Array<{ id: ActiveTab; label: string; icon: typeof User }> = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'academic', label: 'Academic Details', icon: GraduationCap },
    { id: 'location', label: 'Location & Background', icon: MapPin },
    { id: 'interests', label: 'Interests & Preferences', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-navy text-white px-4 py-3 shadow-lg border border-navy-light text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="size-4 text-teal" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header Profile Summary Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-xl font-bold font-heading text-white shadow-sm">
              {profile.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'ST'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-navy">
                  {profile.fullName}
                </h1>
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {eduLevelLabel}
                </span>
              </div>
              <p className="text-sm text-text-secondary flex items-center gap-1.5 flex-wrap">
                <span>{profile.currentCourse}</span>
                <span className="text-text-muted">•</span>
                <span>{profile.institution}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/explore"
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
            >
              <TrendingUp className="size-3.5 text-primary" />
              <span>Matching Scholarships</span>
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-navy">
              <ShieldCheck className="size-4 text-teal" />
              <span>Profile Strength</span>
            </div>
            <span className="font-bold text-teal">{completionPercentage}% Completed</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-teal transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-text-secondary">
            {completionPercentage >= 90
              ? 'Excellent! Your profile contains all the details needed for high-accuracy scholarship matching.'
              : 'Add more academic and background details to increase the accuracy of your scholarship recommendations.'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 border-b border-border min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-navy hover:border-gray-300'
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* ================================================================ */}
        {/* TAB 1: PERSONAL INFORMATION */}
        {/* ================================================================ */}
        {activeTab === 'personal' && (
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy">
                  Personal Information
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Basic identifying information used across application portals.
                </p>
              </div>

              {editingSection !== 'personal' ? (
                <button
                  type="button"
                  onClick={() => setEditingSection('personal')}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Edit2 className="size-3.5 text-primary" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancel('personal')}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePersonal}
                    className="btn-primary text-xs inline-flex items-center gap-1"
                  >
                    <Save className="size-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {editingSection === 'personal' ? (
              /* EDIT MODE */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSavePersonal()
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalForm.fullName}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className={cn('input', errors.fullName && 'border-danger focus:border-danger')}
                    placeholder="e.g. Aarav Sharma"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-danger flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    value={personalForm.email}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className={cn('input', errors.email && 'border-danger focus:border-danger')}
                    placeholder="student@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-danger flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Gender</label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({
                        ...prev,
                        gender: e.target.value as 'male' | 'female' | 'other',
                      }))
                    }
                    className="input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                    }
                    className="input"
                  />
                </div>
              </form>
            ) : (
              /* READ MODE */
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-text-muted">Full Name</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{profile.fullName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Email Address</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{profile.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Gender</p>
                  <p className="mt-1 text-sm font-semibold text-navy capitalize">
                    {profile.gender || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Date of Birth</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================================================================ */}
        {/* TAB 2: ACADEMIC DETAILS */}
        {/* ================================================================ */}
        {activeTab === 'academic' && (
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy">
                  Academic Information
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Educational background and academic score eligibility.
                </p>
              </div>

              {editingSection !== 'academic' ? (
                <button
                  type="button"
                  onClick={() => setEditingSection('academic')}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Edit2 className="size-3.5 text-primary" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancel('academic')}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAcademic}
                    className="btn-primary text-xs inline-flex items-center gap-1"
                  >
                    <Save className="size-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {editingSection === 'academic' ? (
              /* EDIT MODE */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveAcademic()
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="label">
                    Education Level <span className="text-danger">*</span>
                  </label>
                  <select
                    value={academicForm.educationLevel}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({
                        ...prev,
                        educationLevel: e.target.value as EducationLevel,
                      }))
                    }
                    className={cn('input', errors.educationLevel && 'border-danger')}
                  >
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    Current Course / Degree <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={academicForm.currentCourse}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({ ...prev, currentCourse: e.target.value }))
                    }
                    className={cn('input', errors.currentCourse && 'border-danger')}
                    placeholder="e.g. B.Tech Computer Science"
                  />
                  {errors.currentCourse && (
                    <p className="mt-1 text-xs text-danger">{errors.currentCourse}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    Institution / University <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={academicForm.institution}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({ ...prev, institution: e.target.value }))
                    }
                    className={cn('input', errors.institution && 'border-danger')}
                    placeholder="e.g. IIT Bombay"
                  />
                  {errors.institution && (
                    <p className="mt-1 text-xs text-danger">{errors.institution}</p>
                  )}
                </div>

                <div>
                  <label className="label">Academic Year</label>
                  <select
                    value={academicForm.academicYear}
                    onChange={(e) =>
                      setAcademicForm((prev) => ({ ...prev, academicYear: e.target.value }))
                    }
                    className="input"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    Academic Score / Percentage (0-100) <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={academicForm.academicScore}
                      onChange={(e) =>
                        setAcademicForm((prev) => ({
                          ...prev,
                          academicScore: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className={cn('input pr-8', errors.academicScore && 'border-danger')}
                      placeholder="85"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                      %
                    </span>
                  </div>
                  {errors.academicScore && (
                    <p className="mt-1 text-xs text-danger">{errors.academicScore}</p>
                  )}
                </div>
              </form>
            ) : (
              /* READ MODE */
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-text-muted">Education Level</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{eduLevelLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Current Course / Degree</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.currentCourse || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Institution / University</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.institution || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Current Academic Year</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.academicYear || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Academic Score</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-base font-bold text-navy">
                      {profile.academicScore}%
                    </span>
                    <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal">
                      {profile.academicScore >= 75 ? 'Distinction' : 'First Class'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================================================================ */}
        {/* TAB 3: LOCATION & BACKGROUND */}
        {/* ================================================================ */}
        {activeTab === 'location' && (
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy">
                  Location & Background
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  State domicile, household income brackets, and special eligibility categories.
                </p>
              </div>

              {editingSection !== 'location' ? (
                <button
                  type="button"
                  onClick={() => setEditingSection('location')}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Edit2 className="size-3.5 text-primary" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancel('location')}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLocation}
                    className="btn-primary text-xs inline-flex items-center gap-1"
                  >
                    <Save className="size-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {editingSection === 'location' ? (
              /* EDIT MODE */
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSaveLocation()
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="label">Domicile State</label>
                  <select
                    value={locationForm.state}
                    onChange={(e) =>
                      setLocationForm((prev) => ({ ...prev, state: e.target.value }))
                    }
                    className="input"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">City / District</label>
                  <input
                    type="text"
                    value={locationForm.city}
                    onChange={(e) =>
                      setLocationForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="input"
                    placeholder="e.g. Pune, Jaipur"
                  />
                </div>

                <div>
                  <label className="label">Social Category</label>
                  <select
                    value={locationForm.category}
                    onChange={(e) =>
                      setLocationForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="input"
                  >
                    {SOCIAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Annual Family Income</label>
                  <select
                    value={String(locationForm.familyIncome)}
                    onChange={(e) =>
                      setLocationForm((prev) => ({
                        ...prev,
                        familyIncome: parseInt(e.target.value, 10),
                      }))
                    }
                    className="input"
                  >
                    {INCOME_RANGES.map((inc) => (
                      <option key={inc.value} value={inc.value}>
                        {inc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disability Toggle */}
                <div className="sm:col-span-2 pt-2 flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={locationForm.hasDisability}
                      onClick={() =>
                        setLocationForm((prev) => ({
                          ...prev,
                          hasDisability: !prev.hasDisability,
                        }))
                      }
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                        locationForm.hasDisability ? 'bg-primary' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          locationForm.hasDisability ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                    <div>
                      <span className="text-sm font-semibold text-navy">
                        Person with Benchmark Disability (PwD)
                      </span>
                      <p className="text-xs text-text-secondary">
                        Eligible for specialized government and corporate disability grants.
                      </p>
                    </div>
                  </label>

                  {/* Sports Quota Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={locationForm.isSportsQuota}
                      onClick={() =>
                        setLocationForm((prev) => ({
                          ...prev,
                          isSportsQuota: !prev.isSportsQuota,
                        }))
                      }
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                        locationForm.isSportsQuota ? 'bg-primary' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          locationForm.isSportsQuota ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                    <div>
                      <span className="text-sm font-semibold text-navy">
                        Sports Achievement / National Athlete Quota
                      </span>
                      <p className="text-xs text-text-secondary">
                        Eligible for athletic foundation scholarships and sports fellowships.
                      </p>
                    </div>
                  </label>
                </div>
              </form>
            ) : (
              /* READ MODE */
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-text-muted">Domicile State</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{profile.state || 'All India'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">City / District</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{profile.city || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Social Category</p>
                  <p className="mt-1 text-sm font-semibold text-navy">{profile.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Annual Family Income</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.familyIncome ? formatCurrency(profile.familyIncome) : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Person with Disability (PwD)</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.hasDisability ? (
                      <span className="text-teal font-semibold">Yes (PwD Eligible)</span>
                    ) : (
                      'No'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted">Sports Quota</p>
                  <p className="mt-1 text-sm font-semibold text-navy">
                    {profile.isSportsQuota ? (
                      <span className="text-teal font-semibold">Yes (Sports Eligible)</span>
                    ) : (
                      'No'
                    )}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================================================================ */}
        {/* TAB 4: INTERESTS & PREFERENCES */}
        {/* ================================================================ */}
        {activeTab === 'interests' && (
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy">
                  Interests & Preferences
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Academic subject domains and preferred types of scholarship schemes.
                </p>
              </div>

              {editingSection !== 'interests' ? (
                <button
                  type="button"
                  onClick={() => setEditingSection('interests')}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Edit2 className="size-3.5 text-primary" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancel('interests')}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInterests}
                    className="btn-primary text-xs inline-flex items-center gap-1"
                  >
                    <Save className="size-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {editingSection === 'interests' ? (
              /* EDIT MODE */
              <div className="space-y-6">
                <div>
                  <label className="label mb-2">
                    Areas of Study & Research Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_AREAS.map((area) => {
                      const selected = interestsForm.areasOfInterest.includes(area)
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleAreaOfInterest(area)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                            selected
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-background text-text-secondary border border-border hover:border-primary-200'
                          )}
                        >
                          {selected && <Check className="size-3.5" />}
                          <span>{area}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="label mb-2">
                    Scholarship Categories of Interest
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SCHOLARSHIP_CATEGORIES.map((cat) => {
                      const selected = interestsForm.scholarshipPreferences.includes(cat.value)
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => toggleScholarshipPreference(cat.value)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                            selected
                              ? 'bg-teal text-white shadow-xs'
                              : 'bg-background text-text-secondary border border-border hover:border-teal-200'
                          )}
                        >
                          {selected && <Check className="size-3.5" />}
                          <span>{cat.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* READ MODE */
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium text-text-muted mb-2">
                    Areas of Interest
                  </p>
                  {profile.areasOfInterest && profile.areasOfInterest.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.areasOfInterest.map((area) => (
                        <span
                          key={area}
                          className="rounded-lg bg-primary-50 px-3 py-1 text-xs font-medium text-primary border border-primary-100"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">None selected yet</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-text-muted mb-2">
                    Scholarship Preferences
                  </p>
                  {profile.scholarshipPreferences && profile.scholarshipPreferences.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.scholarshipPreferences.map((pref) => {
                        const label =
                          SCHOLARSHIP_CATEGORIES.find((c) => c.value === pref)?.label || pref
                        return (
                          <span
                            key={pref}
                            className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-medium text-teal border border-teal-100"
                          >
                            {label}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">None selected yet</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================================================================ */}
        {/* TAB 5: NOTIFICATION PREFERENCES */}
        {/* ================================================================ */}
        {activeTab === 'notifications' && (
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold font-heading text-navy">
                  Notification Preferences
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Configure alerts for upcoming deadlines, new matching scholarships, and email digests.
                </p>
              </div>

              {editingSection !== 'notifications' ? (
                <button
                  type="button"
                  onClick={() => setEditingSection('notifications')}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Edit2 className="size-3.5 text-primary" />
                  <span>Configure</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancel('notifications')}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotifications}
                    className="btn-primary text-xs inline-flex items-center gap-1"
                  >
                    <Save className="size-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {editingSection === 'notifications' ? (
              /* EDIT MODE */
              <div className="space-y-5">
                {/* Deadline reminders toggle */}
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border bg-background/50">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Deadline Reminders
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Receive notifications before application deadlines expire for your tracked scholarships.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsForm.deadlineReminders}
                    onClick={() =>
                      setNotificationsForm((prev) => ({
                        ...prev,
                        deadlineReminders: !prev.deadlineReminders,
                      }))
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                      notificationsForm.deadlineReminders ? 'bg-primary' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationsForm.deadlineReminders ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Reminder days before input */}
                {notificationsForm.deadlineReminders && (
                  <div className="ml-4 pl-4 border-l-2 border-primary-200 space-y-1">
                    <label className="label text-xs">
                      Send initial reminder:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={notificationsForm.reminderDaysBefore}
                        onChange={(e) =>
                          setNotificationsForm((prev) => ({
                            ...prev,
                            reminderDaysBefore: parseInt(e.target.value, 10) || 7,
                          }))
                        }
                        className="input max-w-[100px] text-xs py-1"
                      />
                      <span className="text-xs text-text-secondary">days before deadline</span>
                    </div>
                  </div>
                )}

                {/* New scholarships toggle */}
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border bg-background/50">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      New Scholarship Alerts
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Alert me when new grants or fellowships match my education level and state.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsForm.newScholarships}
                    onClick={() =>
                      setNotificationsForm((prev) => ({
                        ...prev,
                        newScholarships: !prev.newScholarships,
                      }))
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                      notificationsForm.newScholarships ? 'bg-primary' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationsForm.newScholarships ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Application updates toggle */}
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border bg-background/50">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Application Updates
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Notify me of changes to tracked scholarship status and portal announcements.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsForm.applicationUpdates}
                    onClick={() =>
                      setNotificationsForm((prev) => ({
                        ...prev,
                        applicationUpdates: !prev.applicationUpdates,
                      }))
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                      notificationsForm.applicationUpdates ? 'bg-primary' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationsForm.applicationUpdates ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Email notifications toggle */}
                <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border bg-background/50">
                  <div>
                    <h3 className="text-sm font-semibold text-navy">
                      Email Notifications
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Receive weekly matching digests and high-priority deadline notifications via email ({profile.email}).
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsForm.emailNotifications}
                    onClick={() =>
                      setNotificationsForm((prev) => ({
                        ...prev,
                        emailNotifications: !prev.emailNotifications,
                      }))
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                      notificationsForm.emailNotifications ? 'bg-primary' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationsForm.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              </div>
            ) : (
              /* READ MODE */
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-navy">Deadline Reminders</p>
                    <p className="text-xs text-text-secondary">
                      Alert {notifications.reminderDaysBefore} days before scholarship deadlines
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      notifications.deadlineReminders
                        ? 'bg-teal-50 text-teal'
                        : 'bg-gray-100 text-text-muted'
                    )}
                  >
                    {notifications.deadlineReminders ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-navy">New Scholarship Recommendations</p>
                    <p className="text-xs text-text-secondary">
                      Weekly alerts when new grants match your eligibility criteria
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      notifications.newScholarships
                        ? 'bg-teal-50 text-teal'
                        : 'bg-gray-100 text-text-muted'
                    )}
                  >
                    {notifications.newScholarships ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-navy">Application Status Tracking</p>
                    <p className="text-xs text-text-secondary">
                      Alerts on milestone changes and submission dates
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      notifications.applicationUpdates
                        ? 'bg-teal-50 text-teal'
                        : 'bg-gray-100 text-text-muted'
                    )}
                  >
                    {notifications.applicationUpdates ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-navy">Email Notifications</p>
                    <p className="text-xs text-text-secondary">
                      Send digests to {profile.email}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      notifications.emailNotifications
                        ? 'bg-teal-50 text-teal'
                        : 'bg-gray-100 text-text-muted'
                    )}
                  >
                    {notifications.emailNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
