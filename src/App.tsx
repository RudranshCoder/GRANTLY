import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/store/AppContext'
import { DashboardLayout } from '@/components/layout'
import { LoadingState } from '@/components/ui'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const ScholarshipDetailsPage = lazy(() => import('@/pages/ScholarshipDetailsPage'))
const SavedPage = lazy(() => import('@/pages/SavedPage'))
const ApplicationsPage = lazy(() => import('@/pages/ApplicationsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

function PageLoader() {
  return <LoadingState text="Loading page..." className="min-h-screen" />
}

export default function App() {
  return (
    <AppProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* App routes with dashboard layout */}
          <Route element={<DashboardLayout hideNavbar fullBleed hideFooter />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/scholarships/:id" element={<ScholarshipDetailsPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
              <h1 className="text-4xl font-bold text-navy font-heading">404</h1>
              <p className="mt-2 text-text-secondary">Page not found</p>
              <a href="/" className="btn-primary mt-6">Go home</a>
            </div>
          } />
        </Routes>
      </Suspense>
    </AppProvider>
  )
}
