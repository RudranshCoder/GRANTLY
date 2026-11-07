import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  User,
  BookOpen,
  MapPin,
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  Edit2,
  ShieldCheck,
  Trophy,
  Accessibility,
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
import { cn, generateId, calculateProfileCompletion } from '@/lib/utils'
import type { StudentProfile, EducationLevel, ScholarshipCategory } from '@/types'

interface OnboardingFormData {
  // Step 1: Personal Information
  fullName: string
  email: string
  gender: 'male' | 'female' | 'other' | ''
  dateOfBirth: string

  // Step 2: Academic Details
  educationLevel: EducationLevel | ''
  currentCourse: string
  institution: string
  academicYear: string
  academicScore: string

  // Step 3: Location & Background
  state: string
  city: string
  category: string
  familyIncome: string
  hasDisability: boolean
  isSportsQuota: boolean

  // Step 4: Interests & Preferences
  areasOfInterest: string[]
  scholarshipPreferences: ScholarshipCategory[]
}

interface FormErrors {
  [key: string]: string | undefined
}

const STEPS = [
  { id: 1, name: 'Personal', description: 'Personal Information', icon: User },
  { id: 2, name: 'Academic', description: 'Academic Details', icon: BookOpen },
  { id: 3, name: 'Background', description: 'Location & Background', icon: MapPin },
  { id: 4, name: 'Interests', description: 'Interests & Goals', icon: Sparkles },
  { id: 5, name: 'Review', description: 'Review & Confirm', icon: ClipboardCheck },
]

const TODAY_DATE = new Date().toISOString().split('T')[0]

export const OnboardingPage = () => {
  const navigate = useNavigate()
  const { state: appState, dispatch } = useApp()

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [errors, setErrors] = useState<FormErrors>({})

  // Initialize form state, prefilling from existing profile if available
  const [formData, setFormData] = useState<OnboardingFormData>(() => {
    const existing = appState.profile
    if (existing) {
      return {
        fullName: existing.fullName || '',
        email: existing.email || '',
        gender: existing.gender || '',
        dateOfBirth: existing.dateOfBirth || '',
        educationLevel: existing.educationLevel || '',
        currentCourse: existing.currentCourse || '',
        institution: existing.institution || '',
        academicYear: existing.academicYear || '',
        academicScore: existing.academicScore !== undefined ? String(existing.academicScore) : '',
        state: existing.state || '',
        city: existing.city || '',
        category: existing.category || '',
        familyIncome: existing.familyIncome !== undefined ? String(existing.familyIncome) : '',
        hasDisability: Boolean(existing.hasDisability),
        isSportsQuota: Boolean(existing.isSportsQuota),
        areasOfInterest: existing.areasOfInterest || [],
        scholarshipPreferences: existing.scholarshipPreferences || [],
      }
    }
    return {
      fullName: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      educationLevel: '',
      currentCourse: '',
      institution: '',
      academicYear: '',
      academicScore: '',
      state: '',
      city: '',
      category: '',
      familyIncome: '',
      hasDisability: false,
      isSportsQuota: false,
      areasOfInterest: [],
      scholarshipPreferences: [],
    }
  })

  // Update a single form field
  const updateField = <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for field upon edit
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Toggle multi-select interest areas
  const toggleInterest = (interest: string) => {
    const exists = formData.areasOfInterest.includes(interest)
    const updated = exists
      ? formData.areasOfInterest.filter((i) => i !== interest)
      : [...formData.areasOfInterest, interest]
    updateField('areasOfInterest', updated)
  }

  // Toggle multi-select scholarship categories
  const toggleCategoryPreference = (category: ScholarshipCategory) => {
    const exists = formData.scholarshipPreferences.includes(category)
    const updated = exists
      ? formData.scholarshipPreferences.filter((c) => c !== category)
      : [...formData.scholarshipPreferences, category]
    updateField('scholarshipPreferences', updated)
  }

  // Validation function per step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: FormErrors = {}

    if (stepNumber === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = 'Please enter a valid email address'
        }
      }
    }

    if (stepNumber === 2) {
      if (!formData.educationLevel) {
        newErrors.educationLevel = 'Please select your education level'
      }
      if (!formData.currentCourse.trim()) {
        newErrors.currentCourse = 'Current course or degree is required'
      }
      if (!formData.institution.trim()) {
        newErrors.institution = 'Institution name is required'
      }
      if (!formData.academicYear) {
        newErrors.academicYear = 'Please select your academic year'
      }
      if (!formData.academicScore.trim()) {
        newErrors.academicScore = 'Academic score / percentage is required'
      } else {
        const score = Number(formData.academicScore)
        if (isNaN(score) || score < 0 || score > 100) {
          newErrors.academicScore = 'Please enter a valid percentage between 0 and 100'
        }
      }
    }

    if (stepNumber === 3) {
      if (!formData.state) {
        newErrors.state = 'Please select your state'
      }
    }

    if (stepNumber === 4) {
      if (formData.areasOfInterest.length === 0) {
        newErrors.areasOfInterest = 'Please select at least 1 area of interest'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCompleteProfile = () => {
    const profile: StudentProfile = {
      id: generateId(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      educationLevel: (formData.educationLevel as EducationLevel) || 'undergraduate',
      currentCourse: formData.currentCourse.trim(),
      institution: formData.institution.trim(),
      academicYear: formData.academicYear,
      state: formData.state,
      city: formData.city.trim() || undefined,
      academicScore: parseFloat(formData.academicScore) || 0,
      familyIncome: formData.familyIncome ? parseInt(formData.familyIncome, 10) : undefined,
      gender: (formData.gender as 'male' | 'female' | 'other') || 'other',
      dateOfBirth: formData.dateOfBirth || undefined,
      category: formData.category || undefined,
      areasOfInterest: formData.areasOfInterest,
      scholarshipPreferences: formData.scholarshipPreferences,
      hasDisability: formData.hasDisability,
      isSportsQuota: formData.isSportsQuota,
      profileCompletion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    profile.profileCompletion = calculateProfileCompletion(profile)

    dispatch({ type: 'COMPLETE_ONBOARDING', payload: profile })
    navigate('/dashboard')
  }

  // Profile completion estimate for preview
  const estimatedCompletion = calculateProfileCompletion({
    fullName: formData.fullName,
    email: formData.email,
    educationLevel: formData.educationLevel,
    currentCourse: formData.currentCourse,
    institution: formData.institution,
    academicYear: formData.academicYear,
    state: formData.state,
    academicScore: formData.academicScore,
    gender: formData.gender,
    areasOfInterest: formData.areasOfInterest,
  })

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="w-full max-w-2xl mx-auto">
        {/* Brand Header */}
        <header className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group rounded-xl p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform duration-200 hover:scale-105"
            aria-label="GRANTLY - Return to home"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-navy tracking-tight">
              GRANTLY
            </span>
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-heading font-bold text-navy">
            Student Onboarding
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Set up your profile to discover scholarships matching your exact eligibility
          </p>
        </header>

        {/* Stepper Progress Bar */}
        <nav aria-label="Onboarding Progress" className="mb-8">
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
            {/* Number of step badges */}
            <div className="flex items-center justify-between relative">
              {/* Connecting background line */}
              <div
                className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0"
                aria-hidden="true"
              />
              {/* Active progress track */}
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                aria-hidden="true"
              />

              {STEPS.map((step) => {
                const isCompleted = step.id < currentStep
                const isCurrent = step.id === currentStep
                const isClickable = step.id < currentStep

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => isClickable && handleJumpToStep(step.id)}
                    disabled={!isClickable}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${step.id}: ${step.name}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                    className={cn(
                      'relative z-10 flex flex-col items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-transform',
                      isClickable && 'cursor-pointer hover:scale-105'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200',
                        isCompleted && 'bg-teal text-white shadow-xs',
                        isCurrent && 'bg-primary text-white ring-4 ring-primary-100 shadow-xs',
                        !isCompleted && !isCurrent && 'bg-surface border-2 border-border text-text-muted'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    {/* Desktop Step Label */}
                    <span
                      className={cn(
                        'hidden sm:block text-xs font-semibold mt-1.5 transition-colors',
                        isCurrent ? 'text-primary' : isCompleted ? 'text-navy' : 'text-text-muted'
                      )}
                    >
                      {step.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Mobile Current Step Subtitle */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between sm:hidden text-xs font-medium text-text-secondary">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span className="text-primary font-semibold">{STEPS[currentStep - 1].description}</span>
            </div>
          </div>
        </nav>

        {/* Form Container Card */}
        <main className="bg-surface rounded-2xl border border-border shadow-sm p-6 sm:p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" aria-hidden="true" />
                  Personal Information
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Tell us a bit about yourself so we can address you properly.
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className={cn('input', errors.fullName && 'border-danger focus:ring-danger')}
                    aria-required="true"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="e.g. priya.sharma@example.com"
                    className={cn('input', errors.email && 'border-danger focus:ring-danger')}
                    aria-required="true"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Gender & Date of Birth in a 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="label">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value as 'male' | 'female' | 'other' | '')}
                      className="input"
                    >
                      <option value="">Select Gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      Helps match with women-specific or diversity grants.
                    </p>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="label">
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className="input"
                      max={TODAY_DATE}
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Optional: Some scholarships have age limits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                  Academic Details
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Your academic records determine eligibility for merit-based and level-specific scholarships.
                </p>
              </div>

              <div className="space-y-4">
                {/* Education Level */}
                <div>
                  <label htmlFor="educationLevel" className="label">
                    Education Level <span className="text-danger">*</span>
                  </label>
                  <select
                    id="educationLevel"
                    value={formData.educationLevel}
                    onChange={(e) => updateField('educationLevel', e.target.value as EducationLevel | '')}
                    className={cn('input', errors.educationLevel && 'border-danger focus:ring-danger')}
                    aria-required="true"
                    aria-invalid={Boolean(errors.educationLevel)}
                    aria-describedby={errors.educationLevel ? 'educationLevel-error' : undefined}
                  >
                    <option value="">Select Education Level</option>
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {errors.educationLevel && (
                    <p id="educationLevel-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.educationLevel}</span>
                    </p>
                  )}
                </div>

                {/* Current Course */}
                <div>
                  <label htmlFor="currentCourse" className="label">
                    Current Course / Degree <span className="text-danger">*</span>
                  </label>
                  <input
                    id="currentCourse"
                    type="text"
                    value={formData.currentCourse}
                    onChange={(e) => updateField('currentCourse', e.target.value)}
                    placeholder="e.g. B.Tech in Computer Science, B.Com, MBBS, M.Sc"
                    className={cn('input', errors.currentCourse && 'border-danger focus:ring-danger')}
                    aria-required="true"
                    aria-invalid={Boolean(errors.currentCourse)}
                    aria-describedby={errors.currentCourse ? 'currentCourse-error' : undefined}
                  />
                  {errors.currentCourse && (
                    <p id="currentCourse-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.currentCourse}</span>
                    </p>
                  )}
                </div>

                {/* Institution Name */}
                <div>
                  <label htmlFor="institution" className="label">
                    Institution / University Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="institution"
                    type="text"
                    value={formData.institution}
                    onChange={(e) => updateField('institution', e.target.value)}
                    placeholder="e.g. Indian Institute of Technology, Delhi"
                    className={cn('input', errors.institution && 'border-danger focus:ring-danger')}
                    aria-required="true"
                    aria-invalid={Boolean(errors.institution)}
                    aria-describedby={errors.institution ? 'institution-error' : undefined}
                  />
                  {errors.institution && (
                    <p id="institution-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.institution}</span>
                    </p>
                  )}
                </div>

                {/* Academic Year & Academic Score Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Academic Year */}
                  <div>
                    <label htmlFor="academicYear" className="label">
                      Academic Year <span className="text-danger">*</span>
                    </label>
                    <select
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) => updateField('academicYear', e.target.value)}
                      className={cn('input', errors.academicYear && 'border-danger focus:ring-danger')}
                      aria-required="true"
                      aria-invalid={Boolean(errors.academicYear)}
                      aria-describedby={errors.academicYear ? 'academicYear-error' : undefined}
                    >
                      <option value="">Select Academic Year</option>
                      {ACADEMIC_YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {errors.academicYear && (
                      <p id="academicYear-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.academicYear}</span>
                      </p>
                    )}
                  </div>

                  {/* Academic Score */}
                  <div>
                    <label htmlFor="academicScore" className="label">
                      Academic Score / Percentage <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="academicScore"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.academicScore}
                        onChange={(e) => updateField('academicScore', e.target.value)}
                        placeholder="e.g. 85.5"
                        className={cn('input pr-8', errors.academicScore && 'border-danger focus:ring-danger')}
                        aria-required="true"
                        aria-invalid={Boolean(errors.academicScore)}
                        aria-describedby={errors.academicScore ? 'academicScore-error' : undefined}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium pointer-events-none">
                        %
                      </span>
                    </div>
                    {errors.academicScore ? (
                      <p id="academicScore-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.academicScore}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted mt-1">
                        Enter your aggregate % or convert CGPA to %
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location & Background */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  Location & Background
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Many government and private scholarships target specific states, economic brackets, or quotas.
                </p>
              </div>

              <div className="space-y-4">
                {/* State & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State */}
                  <div>
                    <label htmlFor="state" className="label">
                      State / Domicile <span className="text-danger">*</span>
                    </label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className={cn('input', errors.state && 'border-danger focus:ring-danger')}
                      aria-required="true"
                      aria-invalid={Boolean(errors.state)}
                      aria-describedby={errors.state ? 'state-error' : undefined}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p id="state-error" className="text-xs text-danger mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.state}</span>
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="label">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g. Pune, Lucknow, Bengaluru"
                      className="input"
                    />
                    <p className="text-xs text-text-muted mt-1">Optional city of residence</p>
                  </div>
                </div>

                {/* Social Category & Family Income */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Social Category */}
                  <div>
                    <label htmlFor="category" className="label">
                      Social Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="input"
                    >
                      <option value="">Select Category (Optional)</option>
                      {SOCIAL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      Enables matching with affirmative action and community grants
                    </p>
                  </div>

                  {/* Family Annual Income */}
                  <div>
                    <label htmlFor="familyIncome" className="label">
                      Family Annual Income
                    </label>
                    <select
                      id="familyIncome"
                      value={formData.familyIncome}
                      onChange={(e) => updateField('familyIncome', e.target.value)}
                      className="input"
                    >
                      <option value="">Select Income Bracket (Optional)</option>
                      {INCOME_RANGES.map((inc) => (
                        <option key={inc.value} value={inc.value}>
                          {inc.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      Required for most need-based financial assistance
                    </p>
                  </div>
                </div>

                {/* Special Categories / Checkboxes */}
                <div className="pt-2 space-y-3">
                  <p className="text-sm font-semibold text-navy">Special Eligibility Categories</p>

                  {/* Disability Checkbox */}
                  <label
                    className={cn(
                      'flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      formData.hasDisability
                        ? 'border-primary bg-primary-50/60 ring-1 ring-primary'
                        : 'border-border hover:bg-background/60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.hasDisability}
                      onChange={(e) => updateField('hasDisability', e.target.checked)}
                      className="mt-1 size-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Accessibility className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        <span className="text-sm font-semibold text-navy">
                          Person with Disabilities (PwD)
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Check if you qualify for government and NGO disability-specific educational grants and assistive stipends.
                      </p>
                    </div>
                  </label>

                  {/* Sports Quota Checkbox */}
                  <label
                    className={cn(
                      'flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      formData.isSportsQuota
                        ? 'border-primary bg-primary-50/60 ring-1 ring-primary'
                        : 'border-border hover:bg-background/60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isSportsQuota}
                      onChange={(e) => updateField('isSportsQuota', e.target.checked)}
                      className="mt-1 size-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                        <span className="text-sm font-semibold text-navy">
                          Sports Achievements / Quota
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Check if you have represented at district, state, national, or inter-university sports events.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Interests & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                  Interests & Preferences
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Tune recommendations towards your fields of interest and preferred grant types.
                </p>
              </div>

              <div className="space-y-6">
                {/* Areas of Interest Multi-select */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">
                      Areas of Interest <span className="text-danger">*</span>
                    </label>
                    <span className="text-xs text-text-muted">
                      {formData.areasOfInterest.length} selected (min 1)
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    Choose domains corresponding to your career aspirations:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {INTEREST_AREAS.map((interest) => {
                      const selected = formData.areasOfInterest.includes(interest)
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left',
                            selected
                              ? 'bg-primary-50 border-primary text-primary font-semibold ring-1 ring-primary shadow-xs'
                              : 'bg-surface border-border text-text-primary hover:border-primary-200 hover:bg-background'
                          )}
                          role="checkbox"
                          aria-checked={selected}
                        >
                          <span className="truncate pr-1">{interest}</span>
                          {selected ? (
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {errors.areasOfInterest && (
                    <p className="text-xs text-danger mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.areasOfInterest}</span>
                    </p>
                  )}
                </div>

                {/* Scholarship Preferences Multi-select */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">
                      Scholarship Preferences
                    </label>
                    <span className="text-xs text-text-muted">
                      {formData.scholarshipPreferences.length} selected (optional)
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    Select the categories of scholarships you would like to prioritize:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SCHOLARSHIP_CATEGORIES.map((cat) => {
                      const selected = formData.scholarshipPreferences.includes(cat.value)
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => toggleCategoryPreference(cat.value)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left',
                            selected
                              ? 'bg-teal-50 border-teal text-teal font-semibold ring-1 ring-teal shadow-xs'
                              : 'bg-surface border-border text-text-primary hover:border-teal-200 hover:bg-background'
                          )}
                          role="checkbox"
                          aria-checked={selected}
                        >
                          <span className="truncate pr-1">{cat.label}</span>
                          {selected ? (
                            <Check className="w-3.5 h-3.5 text-teal shrink-0" aria-hidden="true" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-teal" aria-hidden="true" />
                  Review & Confirm Profile
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Double check your profile details before finishing setup. You can always update them in settings.
                </p>
              </div>

              {/* Profile Strength Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy">Profile Completeness</h3>
                    <p className="text-xs text-text-secondary">
                      {estimatedCompletion}% completed • High matching accuracy
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-36 bg-surface rounded-full h-2.5 border border-border overflow-hidden">
                  <div
                    className="bg-teal h-full rounded-full transition-all duration-500"
                    style={{ width: `${estimatedCompletion}%` }}
                  />
                </div>
              </div>

              {/* Review Section Cards */}
              <div className="space-y-4">
                {/* 1. Personal Information Review */}
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-navy">Personal Information</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(1)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 focus-visible:outline-none"
                    >
                      <Edit2 className="w-3 h-3" aria-hidden="true" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">Full Name:</span>{' '}
                      <span className="font-semibold text-navy">{formData.fullName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Email:</span>{' '}
                      <span className="font-semibold text-navy">{formData.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Gender:</span>{' '}
                      <span className="font-semibold text-navy capitalize">
                        {formData.gender || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Date of Birth:</span>{' '}
                      <span className="font-semibold text-navy">
                        {formData.dateOfBirth || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Academic Details Review */}
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-navy">Academic Details</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(2)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 focus-visible:outline-none"
                    >
                      <Edit2 className="w-3 h-3" aria-hidden="true" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">Level:</span>{' '}
                      <span className="font-semibold text-navy capitalize">
                        {EDUCATION_LEVELS.find((l) => l.value === formData.educationLevel)?.label || formData.educationLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Course:</span>{' '}
                      <span className="font-semibold text-navy">{formData.currentCourse || '—'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Institution:</span>{' '}
                      <span className="font-semibold text-navy">{formData.institution || '—'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Academic Year:</span>{' '}
                      <span className="font-semibold text-navy">{formData.academicYear || '—'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-text-secondary">Score / Percentage:</span>{' '}
                      <span className="font-bold text-primary">{formData.academicScore}%</span>
                    </div>
                  </div>
                </div>

                {/* 3. Location & Background Review */}
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-navy">Location & Background</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(3)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 focus-visible:outline-none"
                    >
                      <Edit2 className="w-3 h-3" aria-hidden="true" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">State:</span>{' '}
                      <span className="font-semibold text-navy">{formData.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">City:</span>{' '}
                      <span className="font-semibold text-navy">{formData.city || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Social Category:</span>{' '}
                      <span className="font-semibold text-navy">{formData.category || 'General / None'}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Annual Income:</span>{' '}
                      <span className="font-semibold text-navy">
                        {INCOME_RANGES.find((i) => i.value === formData.familyIncome)?.label || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Disability (PwD):</span>{' '}
                      <span className={cn('font-semibold', formData.hasDisability ? 'text-teal' : 'text-text-primary')}>
                        {formData.hasDisability ? 'Yes (Applicable)' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Sports Quota:</span>{' '}
                      <span className={cn('font-semibold', formData.isSportsQuota ? 'text-teal' : 'text-text-primary')}>
                        {formData.isSportsQuota ? 'Yes (Applicable)' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Interests & Preferences Review */}
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-navy">Interests & Preferences</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(4)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 focus-visible:outline-none"
                    >
                      <Edit2 className="w-3 h-3" aria-hidden="true" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-text-secondary block mb-1">Areas of Interest:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.areasOfInterest.map((interest) => (
                          <span
                            key={interest}
                            className="bg-primary-50 text-primary border border-primary-100 rounded-md px-2 py-0.5 font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {formData.scholarshipPreferences.length > 0 && (
                      <div className="pt-1">
                        <span className="text-text-secondary block mb-1">Scholarship Categories:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.scholarshipPreferences.map((pref) => {
                            const label = SCHOLARSHIP_CATEGORIES.find((c) => c.value === pref)?.label || pref
                            return (
                              <span
                                key={pref}
                                className="bg-teal-50 text-teal border border-teal-100 rounded-md px-2 py-0.5 font-medium"
                              >
                                {label}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                'btn-secondary flex items-center gap-2 text-sm',
                currentStep === 1 && 'opacity-40 cursor-not-allowed hover:bg-surface hover:border-border'
              )}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back</span>
            </button>

            {/* Step Counter Indicator */}
            <span className="text-xs text-text-muted hidden sm:inline-block font-medium">
              Step {currentStep} of {STEPS.length}
            </span>

            {/* Continue or Complete Button */}
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 text-sm"
                aria-label="Continue to next step"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteProfile}
                className="btn-primary flex items-center gap-2 text-sm shadow-md"
                aria-label="Complete Profile and go to dashboard"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Complete Profile</span>
              </button>
            )}
          </div>
        </main>

        {/* Footer info notice */}
        <footer className="mt-6 text-center text-xs text-text-secondary">
          <p>
            Your information is stored locally and used solely to match you with relevant scholarship opportunities.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default OnboardingPage
