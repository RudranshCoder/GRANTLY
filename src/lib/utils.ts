import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDeadlineUrgency(deadline: string): 'urgent' | 'soon' | 'normal' | 'passed' {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return 'passed';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'normal';
}

export function calculateProfileCompletion(profile: Partial<Record<string, any>>): number {
  const fields = [
    'fullName', 'email', 'educationLevel', 'currentCourse',
    'institution', 'academicYear', 'state', 'academicScore',
    'gender', 'areasOfInterest'
  ];
  const filled = fields.filter(f => {
    const val = profile[f];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== '' && val !== null;
  });
  return Math.round((filled.length / fields.length) * 100);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function parseAmountFromString(str: string): number {
  const cleaned = str.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}
