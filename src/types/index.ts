// Scholarship types
export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  providerLogo?: string;
  description: string;
  shortDescription: string;
  benefitAmount: string;
  benefitType: 'full-tuition' | 'partial-tuition' | 'stipend' | 'grant' | 'fellowship' | 'other';
  educationLevel: EducationLevel[];
  eligibilityCriteria: EligibilityCriterion[];
  requiredDocuments: string[];
  deadline: string; // ISO date string
  applicationUrl: string;
  applicationProcess: string[];
  category: ScholarshipCategory[];
  state: string; // Indian state or 'All India'
  verificationStatus: 'verified' | 'unverified' | 'demo';
  lastVerified?: string;
  isDemo: boolean;
  gender?: 'male' | 'female' | 'all';
  minAcademicScore?: number;
  maxFamilyIncome?: number; // in INR
  tags: string[];
  createdAt: string;
}

export type EducationLevel = 'undergraduate' | 'postgraduate' | 'doctoral' | 'diploma' | 'professional';

export type ScholarshipCategory =
  | 'merit-based'
  | 'need-based'
  | 'minority'
  | 'women'
  | 'sports'
  | 'research'
  | 'stem'
  | 'arts'
  | 'disability'
  | 'government'
  | 'private'
  | 'international';

export interface EligibilityCriterion {
  id: string;
  label: string;
  description: string;
  field: string; // maps to student profile field
  type: 'academic' | 'financial' | 'demographic' | 'institutional' | 'other';
  value?: string | number;
  operator?: 'gte' | 'lte' | 'eq' | 'in' | 'exists';
}

// Student Profile types
export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  educationLevel: EducationLevel;
  currentCourse: string;
  institution: string;
  academicYear: string;
  state: string;
  city?: string;
  academicScore: number; // percentage
  familyIncome?: number; // annual in INR
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  category?: string; // SC/ST/OBC/General etc
  areasOfInterest: string[];
  scholarshipPreferences: ScholarshipCategory[];
  hasDisability?: boolean;
  isSportsQuota?: boolean;
  profileCompletion: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

// Application tracker types
export type ApplicationStatus =
  | 'interested'
  | 'preparing'
  | 'ready-to-apply'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected';

export interface TrackedApplication {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  scholarshipProvider: string;
  scholarshipDeadline: string;
  scholarshipAmount: string;
  status: ApplicationStatus;
  notes: string;
  submissionDate?: string;
  addedAt: string;
  updatedAt: string;
}

// Matching types
export type MatchStatus = 'met' | 'not-met' | 'missing-info' | 'not-assessed';

export interface MatchResult {
  criterionId: string;
  label: string;
  description: string;
  status: MatchStatus;
  explanation: string;
}

export interface ScholarshipMatch {
  scholarshipId: string;
  overallScore: number; // 0-100
  results: MatchResult[];
  totalCriteria: number;
  metCount: number;
  notMetCount: number;
  missingInfoCount: number;
  notAssessedCount: number;
}

// Saved scholarships
export interface SavedScholarship {
  scholarshipId: string;
  savedAt: string;
}

// Filter types
export interface ScholarshipFilters {
  search: string;
  educationLevel: EducationLevel[];
  category: ScholarshipCategory[];
  state: string[];
  minAmount: string;
  maxAmount: string;
  deadlineBefore?: string;
  deadlineAfter?: string;
  verificationStatus: ('verified' | 'unverified' | 'demo')[];
  sortBy: 'deadline' | 'amount-high' | 'amount-low' | 'relevance' | 'newest';
}

// Notification preferences
export interface NotificationPreferences {
  deadlineReminders: boolean;
  newScholarships: boolean;
  applicationUpdates: boolean;
  emailNotifications: boolean;
  reminderDaysBefore: number;
}

// Onboarding
export interface OnboardingData {
  step: number;
  completed: boolean;
  fullName: string;
  email: string;
  educationLevel: EducationLevel | '';
  currentCourse: string;
  institution: string;
  academicYear: string;
  state: string;
  city: string;
  academicScore: string;
  familyIncome: string;
  gender: 'male' | 'female' | 'other' | '';
  category: string;
  areasOfInterest: string[];
  scholarshipPreferences: ScholarshipCategory[];
  hasDisability: boolean;
  isSportsQuota: boolean;
}
