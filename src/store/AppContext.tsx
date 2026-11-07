import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { StudentProfile, TrackedApplication, SavedScholarship, NotificationPreferences, OnboardingData } from '@/types'

// State shape
interface AppState {
  profile: StudentProfile | null
  onboarding: OnboardingData | null
  onboardingComplete: boolean
  savedScholarships: SavedScholarship[]
  trackedApplications: TrackedApplication[]
  recentlyViewed: string[]
  notifications: NotificationPreferences
}

// Action types
type AppAction =
  | { type: 'SET_PROFILE'; payload: StudentProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<StudentProfile> }
  | { type: 'SET_ONBOARDING'; payload: OnboardingData }
  | { type: 'COMPLETE_ONBOARDING'; payload: StudentProfile }
  | { type: 'SAVE_SCHOLARSHIP'; payload: SavedScholarship }
  | { type: 'UNSAVE_SCHOLARSHIP'; payload: string }
  | { type: 'ADD_APPLICATION'; payload: TrackedApplication }
  | { type: 'UPDATE_APPLICATION'; payload: { id: string; updates: Partial<TrackedApplication> } }
  | { type: 'REMOVE_APPLICATION'; payload: string }
  | { type: 'ADD_RECENTLY_VIEWED'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Partial<NotificationPreferences> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }

const STORAGE_KEY = 'grantly-app-state'

const defaultNotifications: NotificationPreferences = {
  deadlineReminders: true,
  newScholarships: true,
  applicationUpdates: true,
  emailNotifications: false,
  reminderDaysBefore: 7,
}

const initialState: AppState = {
  profile: null,
  onboarding: null,
  onboardingComplete: false,
  savedScholarships: [],
  trackedApplications: [],
  recentlyViewed: [],
  notifications: defaultNotifications,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload, updatedAt: new Date().toISOString() } : null,
      }

    case 'SET_ONBOARDING':
      return { ...state, onboarding: action.payload }

    case 'COMPLETE_ONBOARDING':
      return { ...state, profile: action.payload, onboardingComplete: true, onboarding: null }

    case 'SAVE_SCHOLARSHIP': {
      const exists = state.savedScholarships.some(s => s.scholarshipId === action.payload.scholarshipId)
      if (exists) return state
      return { ...state, savedScholarships: [...state.savedScholarships, action.payload] }
    }

    case 'UNSAVE_SCHOLARSHIP':
      return {
        ...state,
        savedScholarships: state.savedScholarships.filter(s => s.scholarshipId !== action.payload),
      }

    case 'ADD_APPLICATION': {
      const exists = state.trackedApplications.some(a => a.scholarshipId === action.payload.scholarshipId)
      if (exists) return state
      return { ...state, trackedApplications: [...state.trackedApplications, action.payload] }
    }

    case 'UPDATE_APPLICATION':
      return {
        ...state,
        trackedApplications: state.trackedApplications.map(app =>
          app.id === action.payload.id
            ? { ...app, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : app
        ),
      }

    case 'REMOVE_APPLICATION':
      return {
        ...state,
        trackedApplications: state.trackedApplications.filter(a => a.id !== action.payload),
      }

    case 'ADD_RECENTLY_VIEWED': {
      const filtered = state.recentlyViewed.filter(id => id !== action.payload)
      return { ...state, recentlyViewed: [action.payload, ...filtered].slice(0, 10) }
    }

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: { ...state.notifications, ...action.payload } }

    case 'LOAD_STATE':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  isScholarshipSaved: (id: string) => boolean
  isScholarshipTracked: (id: string) => boolean
  getApplication: (scholarshipId: string) => TrackedApplication | undefined
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        dispatch({ type: 'LOAD_STATE', payload: parsed })
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e)
    }
  }, [])

  // Save state to localStorage on change
  useEffect(() => {
    try {
      const toStore = {
        profile: state.profile,
        onboardingComplete: state.onboardingComplete,
        savedScholarships: state.savedScholarships,
        trackedApplications: state.trackedApplications,
        recentlyViewed: state.recentlyViewed,
        notifications: state.notifications,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e)
    }
  }, [state])

  const isScholarshipSaved = (id: string) =>
    state.savedScholarships.some(s => s.scholarshipId === id)

  const isScholarshipTracked = (id: string) =>
    state.trackedApplications.some(a => a.scholarshipId === id)

  const getApplication = (scholarshipId: string) =>
    state.trackedApplications.find(a => a.scholarshipId === scholarshipId)

  return (
    <AppContext.Provider value={{ state, dispatch, isScholarshipSaved, isScholarshipTracked, getApplication }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
