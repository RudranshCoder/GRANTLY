import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  GraduationCap,
  Home,
  Search,
  Target,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { DeadlineIndicator, EmptyState, StatusBadge } from '@/components/ui';
import { APPLICATION_STATUSES } from '@/lib/constants';
import { calculateMatch } from '@/lib/matching';
import { formatDate, getDaysUntilDeadline } from '@/lib/utils';
import { scholarships } from '@/data/scholarships';
import { useApp } from '@/store/AppContext';
import type { Scholarship } from '@/types';
import './DashboardPage.css';

const navigation: { label: string; to: string; Icon: LucideIcon }[] = [
  { label: 'Dashboard', to: '/dashboard', Icon: Home },
  { label: 'Explore', to: '/explore', Icon: Compass },
  { label: 'Saved', to: '/saved', Icon: Bookmark },
  { label: 'Applications', to: '/applications', Icon: FileText },
  { label: 'Profile', to: '/profile', Icon: UserRound },
];

function getStatusVariant(
  status: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'preparing':
    case 'under-review':
      return 'warning';
    case 'ready-to-apply':
      return 'info';
    case 'submitted':
      return 'default';
    case 'interested':
      return 'neutral';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string) {
  return APPLICATION_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function DashboardPage() {
  const { state } = useApp();
  const { profile } = state;

  const [todayDateString] = useState(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
  );
  const firstName = profile?.fullName.trim().split(' ')[0] ?? '';

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    if (typeof profile.profileCompletion === 'number') return profile.profileCompletion;

    const fields: (keyof typeof profile)[] = [
      'fullName',
      'email',
      'educationLevel',
      'currentCourse',
      'institution',
      'academicYear',
      'state',
      'academicScore',
      'gender',
      'areasOfInterest',
    ];
    const filled = fields.filter((field) => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '' && value !== null;
    });

    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  const deadlineItems = useMemo(() => {
    const items = new Map<
      string,
      {
        id: string;
        title: string;
        provider: string;
        deadline: string;
        daysRemaining: number;
      }
    >();

    state.trackedApplications.forEach((application) => {
      const scholarship = scholarships.find((item) => item.id === application.scholarshipId);
      const deadline = application.scholarshipDeadline || scholarship?.deadline;
      if (!deadline) return;

      items.set(application.scholarshipId, {
        id: application.scholarshipId,
        title: application.scholarshipTitle || scholarship?.title || 'Scholarship',
        provider: application.scholarshipProvider || scholarship?.provider || '',
        deadline,
        daysRemaining: getDaysUntilDeadline(deadline),
      });
    });

    state.savedScholarships.forEach((saved) => {
      const scholarship = scholarships.find((item) => item.id === saved.scholarshipId);
      if (!scholarship?.deadline || items.has(saved.scholarshipId)) return;

      items.set(saved.scholarshipId, {
        id: saved.scholarshipId,
        title: scholarship.title,
        provider: scholarship.provider,
        deadline: scholarship.deadline,
        daysRemaining: getDaysUntilDeadline(scholarship.deadline),
      });
    });

    return Array.from(items.values()).sort(
      (first, second) => first.daysRemaining - second.daysRemaining
    );
  }, [state.savedScholarships, state.trackedApplications]);

  const upcomingDeadlinesCount = useMemo(
    () =>
      deadlineItems.filter(
        (item) => item.daysRemaining >= 0 && item.daysRemaining <= 30
      ).length,
    [deadlineItems]
  );

  const matchedScholarships = useMemo(() => {
    if (!profile) return [];
    return scholarships
      .map((scholarship) => ({
        scholarship,
        match: calculateMatch(scholarship, profile),
      }))
      .filter(({ match }) => match.overallScore > 0)
      .sort((first, second) => second.match.overallScore - first.match.overallScore)
      .slice(0, 4)
      .map(({ scholarship }) => scholarship);
  }, [profile]);

  const featuredScholarships = useMemo(
    () => (profile && matchedScholarships.length > 0 ? matchedScholarships : scholarships.slice(0, 4)),
    [matchedScholarships, profile]
  );

  const recentApplications = useMemo(
    () =>
      [...state.trackedApplications]
        .sort((first, second) => {
          const firstDate = new Date(first.updatedAt || first.addedAt || 0).getTime();
          const secondDate = new Date(second.updatedAt || second.addedAt || 0).getTime();
          return secondDate - firstDate;
        })
        .slice(0, 4),
    [state.trackedApplications]
  );

  const recentlyViewedScholarships = useMemo(
    () =>
      (state.recentlyViewed ?? [])
        .map((id) => scholarships.find((scholarship) => scholarship.id === id))
        .filter((scholarship): scholarship is Scholarship => !!scholarship)
        .slice(0, 4),
    [state.recentlyViewed]
  );

  const nextDeadline = deadlineItems.find((item) => item.daysRemaining >= 0);
  const initials = firstName ? firstName.charAt(0).toUpperCase() : 'S';

  return (
    <div className="dashboard-page">
      <aside className="dashboard-rail" aria-label="Dashboard sidebar">
        <Link to="/dashboard" className="dashboard-brand" aria-label="Grantly dashboard">
          <img className="dashboard-brand-symbol" src="/grantly-mark.svg" alt="" />
          <span>grantly</span>
        </Link>

        <div className="dashboard-rail-label">Workspace</div>
        <nav className="dashboard-nav" aria-label="Main navigation">
          {navigation.map(({ label, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `dashboard-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {label === 'Saved' && state.savedScholarships.length > 0 && (
                <span className="dashboard-nav-count">{state.savedScholarships.length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-rail-bottom">
          <div className="dashboard-rail-profile">
            <span className="dashboard-avatar" aria-hidden="true">{initials}</span>
            <span className="dashboard-rail-profile-copy">
              <strong>{firstName || 'Your profile'}</strong>
              <span>{profile ? 'Student account' : 'Set up your details'}</span>
            </span>
            <Link
              to="/profile"
              className="dashboard-profile-open"
              aria-label="Open your profile"
            >
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <p className="dashboard-rail-note">A little progress adds up.</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <Link to="/explore" className="dashboard-search-link">
            <Search aria-hidden="true" />
            <span>Find a scholarship</span>
            <span className="dashboard-search-hint">Explore</span>
          </Link>
          <Link to="/profile" className="dashboard-account-link">
            <span className="dashboard-avatar">{initials}</span>
            <span className="dashboard-account-copy">
              <strong>{firstName || 'Student'}</strong>
              <span>{profile?.institution || 'Your account'}</span>
            </span>
            <ChevronRight aria-hidden="true" />
          </Link>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome" aria-labelledby="dashboard-title">
            <div>
              <p className="dashboard-date">
                <CalendarDays aria-hidden="true" />
                {todayDateString}
              </p>
              <h1 id="dashboard-title">
                {firstName ? `Good to see you, ${firstName}.` : 'Make room for what’s next.'}
              </h1>
              <p className="dashboard-welcome-copy">
                Your scholarship search, saved opportunities, and applications—all in one place.
              </p>
            </div>
            <Link to="/explore" className="dashboard-outline-action">
              Browse scholarships <ArrowUpRight aria-hidden="true" />
            </Link>
          </section>

          <section className="dashboard-feature-row" aria-label="Scholarship discovery and next deadline">
            <div className="dashboard-discovery">
              <div className="dashboard-discovery-copy">
                <h2>Find funding for your next step.</h2>
                <p>
                  Start with scholarships that fit your studies, then keep every deadline and application close by.
                </p>
                <Link to="/explore" className="dashboard-light-action">
                  Explore scholarships <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className="dashboard-discovery-stats" aria-label="Your scholarship activity">
                <div>
                  <strong>{scholarships.length}</strong>
                  <span>opportunities</span>
                </div>
                <div>
                  <strong>{state.savedScholarships.length}</strong>
                  <span>saved</span>
                </div>
                <div>
                  <strong>{state.trackedApplications.length}</strong>
                  <span>in progress</span>
                </div>
              </div>
            </div>

            <div className="dashboard-deadline-feature">
              <div className="dashboard-feature-heading">
                <span>Coming up</span>
                <Clock3 aria-hidden="true" />
              </div>
              {nextDeadline ? (
                <>
                  <p className="dashboard-deadline-title">{nextDeadline.title}</p>
                  <p className="dashboard-deadline-provider">{nextDeadline.provider}</p>
                  <div className="dashboard-feature-deadline">
                    <span>{formatDate(nextDeadline.deadline)}</span>
                    <DeadlineIndicator deadline={nextDeadline.deadline} />
                  </div>
                  <Link
                    to={`/scholarships/${nextDeadline.id}`}
                    className="dashboard-yellow-action"
                  >
                    View details <ArrowUpRight aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="dashboard-deadline-title">No deadlines on your list yet.</p>
                  <p className="dashboard-deadline-provider">
                    Save a scholarship or track an application to keep its date in view.
                  </p>
                  <Link to="/explore" className="dashboard-yellow-action">
                    Find scholarships <ArrowUpRight aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </section>

          <div className="dashboard-work-grid">
            <div className="dashboard-primary-column">
              <section className="dashboard-section" aria-labelledby="scholarships-heading">
                <div className="dashboard-section-heading">
                  <div>
                    <h2 id="scholarships-heading">
                      {profile && matchedScholarships.length > 0
                        ? 'Picked for you'
                        : 'Scholarships to explore'}
                    </h2>
                    <p>
                      {profile && matchedScholarships.length > 0
                        ? 'Based on the details in your student profile.'
                        : 'A few opportunities to get your search started.'}
                    </p>
                  </div>
                  <Link to="/explore" className="dashboard-text-link">
                    See all <ArrowUpRight aria-hidden="true" />
                  </Link>
                </div>

                {profile && matchedScholarships.length === 0 ? (
                  <div className="dashboard-empty-card">
                    <EmptyState
                      icon={<AwardIcon />}
                      title="No direct matches yet"
                      description="Update your study details or browse all scholarships to find more options."
                      action={
                        <Link to="/profile" className="dashboard-dark-action">
                          Update profile
                        </Link>
                      }
                    />
                  </div>
                ) : (
                  <div className="dashboard-scholarship-grid">
                    {featuredScholarships.map((scholarship) => (
                      <ScholarshipCard
                        key={scholarship.id}
                        scholarship={scholarship}
                        showMatch={!!profile}
                        className="dashboard-scholarship-card"
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-section" aria-labelledby="applications-heading">
                <div className="dashboard-section-heading">
                  <div>
                    <h2 id="applications-heading">Application tracker</h2>
                    <p>Pick up where you left off.</p>
                  </div>
                  {state.trackedApplications.length > 0 && (
                    <Link to="/applications" className="dashboard-text-link">
                      View tracker <ArrowUpRight aria-hidden="true" />
                    </Link>
                  )}
                </div>

                {recentApplications.length > 0 ? (
                  <div className="dashboard-application-list">
                    {recentApplications.map((application) => (
                      <article key={application.id} className="dashboard-application-row">
                        <div className="dashboard-application-icon" aria-hidden="true">
                          <FileText />
                        </div>
                        <div className="dashboard-application-info">
                          <Link to={`/scholarships/${application.scholarshipId}`}>
                            {application.scholarshipTitle}
                          </Link>
                          <span>
                            {application.scholarshipProvider}
                            {application.scholarshipAmount
                              ? ` · ${application.scholarshipAmount}`
                              : ''}
                          </span>
                        </div>
                        <StatusBadge
                          status={getStatusLabel(application.status)}
                          variant={getStatusVariant(application.status)}
                        />
                        <Link
                          to="/applications"
                          className="dashboard-row-action"
                          aria-label={`Update ${application.scholarshipTitle}`}
                        >
                          <ChevronRight aria-hidden="true" />
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty-card dashboard-empty-compact">
                    <EmptyState
                      icon={<FileText aria-hidden="true" />}
                      title="Nothing tracked yet"
                      description="When you find a scholarship to apply for, add it to your tracker."
                      action={
                        <Link to="/explore" className="dashboard-dark-action">
                          Find a scholarship
                        </Link>
                      }
                    />
                  </div>
                )}
              </section>
            </div>

            <aside className="dashboard-secondary-column" aria-label="Your scholarship activity">
              <section className="dashboard-profile-panel" aria-labelledby="profile-panel-heading">
                <div className="dashboard-profile-panel-top">
                  <span className="dashboard-profile-icon" aria-hidden="true">
                    {profile ? <Check /> : <Target />}
                  </span>
                  <span>{profile ? `${profileCompletion}% complete` : 'A good place to start'}</span>
                </div>
                <h2 id="profile-panel-heading">
                  {profile ? 'Your student profile' : 'Set up your profile'}
                </h2>
                <p>
                  {profile
                    ? profileCompletion >= 100
                      ? 'Your profile is complete. Keep it current as your studies change.'
                      : 'A few more details can help make your matches more relevant.'
                    : 'Add your study details to see scholarships that may fit.'}
                </p>
                {profile && (
                  <div
                    className="dashboard-progress"
                    role="progressbar"
                    aria-valuenow={profileCompletion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Profile is ${profileCompletion}% complete`}
                  >
                    <span style={{ width: `${profileCompletion}%` }} />
                  </div>
                )}
                <Link to={profile ? '/profile' : '/onboarding'} className="dashboard-dark-action">
                  {profile ? 'Edit profile' : 'Get started'} <ArrowRight aria-hidden="true" />
                </Link>
              </section>

              <section className="dashboard-section dashboard-sidebar-section" aria-labelledby="deadlines-heading">
                <div className="dashboard-section-heading">
                  <div>
                    <h2 id="deadlines-heading">Your deadlines</h2>
                    <p>
                      {upcomingDeadlinesCount === 0
                        ? 'Dates from saved and tracked scholarships.'
                        : `${upcomingDeadlinesCount} closing in the next 30 days`}
                    </p>
                  </div>
                  <CalendarDays aria-hidden="true" className="dashboard-heading-icon" />
                </div>

                {deadlineItems.length > 0 ? (
                  <div className="dashboard-deadline-list">
                    {deadlineItems.slice(0, 4).map((item) => (
                      <Link
                        key={item.id}
                        to={`/scholarships/${item.id}`}
                        className="dashboard-deadline-row"
                      >
                        <span className="dashboard-deadline-date">
                          <strong>{new Date(`${item.deadline}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit' })}</strong>
                          <span>{new Date(`${item.deadline}T00:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </span>
                        <span className="dashboard-deadline-info">
                          <strong>{item.title}</strong>
                          <span>{item.provider}</span>
                        </span>
                        <ChevronRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-no-deadlines">
                    Your saved and tracked scholarships will show up here.
                  </p>
                )}
                <Link to="/saved" className="dashboard-section-footer">
                  View saved scholarships <ArrowRight aria-hidden="true" />
                </Link>
              </section>

              {recentlyViewedScholarships.length > 0 && (
                <section className="dashboard-section dashboard-sidebar-section" aria-labelledby="recent-heading">
                  <div className="dashboard-section-heading">
                    <div>
                      <h2 id="recent-heading">Recently viewed</h2>
                      <p>Keep exploring where you left off.</p>
                    </div>
                    <BookOpen aria-hidden="true" className="dashboard-heading-icon" />
                  </div>
                  <div className="dashboard-recent-list">
                    {recentlyViewedScholarships.map((scholarship) => (
                      <Link
                        key={scholarship.id}
                        to={`/scholarships/${scholarship.id}`}
                        className="dashboard-recent-row"
                      >
                        <span>
                          <strong>{scholarship.title}</strong>
                          <small>{scholarship.provider}</small>
                        </span>
                        <ChevronRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function AwardIcon() {
  return <GraduationCap aria-hidden="true" />;
}

export default DashboardPage;
