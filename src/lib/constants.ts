export const EDUCATION_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate (UG)' },
  { value: 'postgraduate', label: 'Postgraduate (PG)' },
  { value: 'doctoral', label: 'Doctoral (PhD)' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'professional', label: 'Professional Degree' },
] as const;

export const SCHOLARSHIP_CATEGORIES = [
  { value: 'merit-based', label: 'Merit Based' },
  { value: 'need-based', label: 'Need Based' },
  { value: 'minority', label: 'Minority' },
  { value: 'women', label: 'Women' },
  { value: 'sports', label: 'Sports' },
  { value: 'research', label: 'Research' },
  { value: 'stem', label: 'STEM' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'disability', label: 'Disability' },
  { value: 'government', label: 'Government' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' },
] as const;

export const APPLICATION_STATUSES = [
  { value: 'interested', label: 'Interested', color: '#667085' },
  { value: 'preparing', label: 'Preparing', color: '#F59E0B' },
  { value: 'ready-to-apply', label: 'Ready to Apply', color: '#315CDB' },
  { value: 'submitted', label: 'Submitted', color: '#8B5CF6' },
  { value: 'under-review', label: 'Under Review', color: '#F97316' },
  { value: 'approved', label: 'Approved', color: '#16A085' },
  { value: 'rejected', label: 'Rejected', color: '#EF4444' },
] as const;

export const INDIAN_STATES = [
  'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Andaman & Nicobar Islands',
] as const;

export const INCOME_RANGES = [
  { value: '200000', label: 'Up to ₹2,00,000' },
  { value: '500000', label: 'Up to ₹5,00,000' },
  { value: '800000', label: 'Up to ₹8,00,000' },
  { value: '1000000', label: 'Up to ₹10,00,000' },
  { value: '1500000', label: 'Up to ₹15,00,000' },
  { value: '2500000', label: 'Up to ₹25,00,000' },
  { value: '2500001', label: 'Above ₹25,00,000' },
] as const;

export const ACADEMIC_YEARS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year',
  'Final Year', 'Completed',
] as const;

export const SOCIAL_CATEGORIES = [
  'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'Other',
] as const;

export const INTEREST_AREAS = [
  'Engineering', 'Medicine', 'Law', 'Commerce', 'Arts',
  'Science', 'Technology', 'Management', 'Education',
  'Agriculture', 'Architecture', 'Design', 'Media',
  'Social Work', 'Environmental Science', 'Research',
] as const;

export const MATCH_STATUS_CONFIG = {
  met: { label: 'Meets requirement', color: '#16A085', bgColor: '#ECFDF5' },
  'not-met': { label: 'Does not meet', color: '#EF4444', bgColor: '#FEF2F2' },
  'missing-info': { label: 'Missing information', color: '#F59E0B', bgColor: '#FFFBEB' },
  'not-assessed': { label: 'Not assessed', color: '#667085', bgColor: '#F9FAFB' },
} as const;
