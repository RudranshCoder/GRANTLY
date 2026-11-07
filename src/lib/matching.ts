import type { Scholarship, StudentProfile, ScholarshipMatch, MatchResult, MatchStatus } from '@/types'

export function calculateMatch(scholarship: Scholarship, profile: StudentProfile | null): ScholarshipMatch {
  if (!profile) {
    return {
      scholarshipId: scholarship.id,
      overallScore: 0,
      results: scholarship.eligibilityCriteria.map(c => ({
        criterionId: c.id,
        label: c.label,
        description: c.description,
        status: 'not-assessed' as MatchStatus,
        explanation: 'Create a profile to see matching results.',
      })),
      totalCriteria: scholarship.eligibilityCriteria.length,
      metCount: 0,
      notMetCount: 0,
      missingInfoCount: 0,
      notAssessedCount: scholarship.eligibilityCriteria.length,
    }
  }

  const results: MatchResult[] = scholarship.eligibilityCriteria.map(criterion => {
    return evaluateCriterion(criterion, profile, scholarship)
  })

  const metCount = results.filter(r => r.status === 'met').length
  const notMetCount = results.filter(r => r.status === 'not-met').length
  const missingInfoCount = results.filter(r => r.status === 'missing-info').length
  const notAssessedCount = results.filter(r => r.status === 'not-assessed').length
  const totalCriteria = results.length

  // Score: met criteria contribute positively. Missing info is neutral (not a match).
  // Only count met vs assessable criteria
  const assessable = metCount + notMetCount
  const overallScore = assessable > 0 ? Math.round((metCount / totalCriteria) * 100) : 0

  return {
    scholarshipId: scholarship.id,
    overallScore,
    results,
    totalCriteria,
    metCount,
    notMetCount,
    missingInfoCount,
    notAssessedCount,
  }
}

function evaluateCriterion(
  criterion: { id: string; label: string; description: string; field: string; type: string; value?: string | number; operator?: string },
  profile: StudentProfile,
  scholarship: Scholarship
): MatchResult {
  const base = {
    criterionId: criterion.id,
    label: criterion.label,
    description: criterion.description,
  }

  switch (criterion.field) {
    case 'educationLevel': {
      const profileVal = profile.educationLevel
      if (!profileVal) return { ...base, status: 'missing-info', explanation: 'Education level not set in your profile.' }
      const matches = scholarship.educationLevel.includes(profileVal)
      return {
        ...base,
        status: matches ? 'met' : 'not-met',
        explanation: matches
          ? `Your education level (${profileVal}) matches this requirement.`
          : `This scholarship requires ${scholarship.educationLevel.join(' or ')} level. Your profile shows ${profileVal}.`,
      }
    }

    case 'academicScore': {
      const profileVal = profile.academicScore
      if (!profileVal && profileVal !== 0) return { ...base, status: 'missing-info', explanation: 'Academic score not set in your profile.' }
      const required = Number(criterion.value)
      const meets = criterion.operator === 'gte' ? profileVal >= required : profileVal <= required
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets
          ? `Your academic score (${profileVal}%) meets the minimum requirement of ${required}%.`
          : `This scholarship requires a minimum of ${required}%. Your score is ${profileVal}%.`,
      }
    }

    case 'familyIncome': {
      const profileVal = profile.familyIncome
      if (profileVal === undefined || profileVal === null) return { ...base, status: 'missing-info', explanation: 'Family income not set in your profile.' }
      const limit = Number(criterion.value)
      const meets = criterion.operator === 'lte' ? profileVal <= limit : profileVal >= limit
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets
          ? `Your family income is within the eligibility limit.`
          : `This scholarship requires family income ${criterion.operator === 'lte' ? 'up to' : 'above'} ₹${limit.toLocaleString('en-IN')}. Your declared income exceeds this.`,
      }
    }

    case 'gender': {
      const profileVal = profile.gender
      if (!profileVal) return { ...base, status: 'missing-info', explanation: 'Gender not set in your profile.' }
      if (criterion.value === 'all') return { ...base, status: 'met', explanation: 'This scholarship is open to all genders.' }
      const meets = profileVal === criterion.value
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets
          ? `Your gender matches the requirement.`
          : `This scholarship is for ${criterion.value} candidates.`,
      }
    }

    case 'state': {
      const profileVal = profile.state
      if (!profileVal) return { ...base, status: 'missing-info', explanation: 'State not set in your profile.' }
      if (scholarship.state === 'All India') return { ...base, status: 'met', explanation: 'This scholarship is open to candidates from all states.' }
      const meets = profileVal === scholarship.state
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets
          ? `Your state (${profileVal}) matches.`
          : `This scholarship is for candidates from ${scholarship.state}. Your profile shows ${profileVal}.`,
      }
    }

    case 'category': {
      const profileVal = profile.category
      if (!profileVal) return { ...base, status: 'missing-info', explanation: 'Social category not set in your profile.' }
      const requiredCategories = String(criterion.value).split(',').map(s => s.trim())
      const meets = requiredCategories.some(c => c.toLowerCase() === profileVal.toLowerCase() || c === 'All')
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets
          ? `Your category matches the requirement.`
          : `This scholarship is for ${requiredCategories.join(', ')} categories.`,
      }
    }

    case 'hasDisability': {
      if (profile.hasDisability === undefined) return { ...base, status: 'missing-info', explanation: 'Disability status not set in your profile.' }
      const meets = profile.hasDisability === true
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets ? 'You have indicated a disability.' : 'This scholarship is for persons with disabilities.',
      }
    }

    case 'isSportsQuota': {
      if (profile.isSportsQuota === undefined) return { ...base, status: 'missing-info', explanation: 'Sports quota status not set in your profile.' }
      const meets = profile.isSportsQuota === true
      return {
        ...base,
        status: meets ? 'met' : 'not-met',
        explanation: meets ? 'You have indicated sports achievements.' : 'This scholarship requires sports achievements.',
      }
    }

    default:
      return { ...base, status: 'not-assessed', explanation: 'This criterion cannot be automatically assessed.' }
  }
}

export function getMatchSummary(match: ScholarshipMatch): string {
  if (match.totalCriteria === 0) return 'No specific criteria to match.'
  if (match.metCount === match.totalCriteria) return 'You appear to meet all listed criteria.'
  if (match.notMetCount > 0 && match.missingInfoCount === 0)
    return `You meet ${match.metCount} of ${match.totalCriteria} criteria. ${match.notMetCount} criteria are not met.`
  if (match.missingInfoCount > 0)
    return `You meet ${match.metCount} of ${match.totalCriteria} criteria. ${match.missingInfoCount} require more profile information.`
  return `Matching: ${match.metCount}/${match.totalCriteria} criteria met.`
}
