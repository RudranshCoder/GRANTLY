import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Search,
  Bookmark,
  FileText,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
];

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Reset mobile menu when location pathname changes (React pattern: adjusting state during render)
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsMobileMenuOpen(false);
  }

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 transition-opacity hover:opacity-90"
              aria-label="GRANTLY - Home"
            >
              <img
                src="/grantly-mark.svg"
                alt=""
                className="w-9 h-9 rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-heading font-bold text-xl sm:text-2xl text-navy tracking-tight">
                GRANTLY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-primary-50 text-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        active ? 'text-primary' : 'text-text-secondary'
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-navy hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close main navigation menu' : 'Open main navigation menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <aside
        id="mobile-menu"
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-surface border-l border-border shadow-xl flex flex-col md:hidden transition-transform duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Mobile navigation drawer"
        aria-modal="true"
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
            aria-label="GRANTLY - Home"
          >
            <img src="/grantly-mark.svg" alt="" className="w-8 h-8 rounded-lg shadow-xs" />
            <span className="font-heading font-bold text-lg text-navy tracking-tight">
              GRANTLY
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-text-secondary hover:text-navy hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto" aria-label="Mobile navigation links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-lg text-base font-medium transition-colors',
                  active
                    ? 'bg-primary-50 text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    active ? 'text-primary' : 'text-text-secondary'
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer / Badge */}
        <div className="p-4 border-t border-border bg-background/50">
          <p className="text-xs text-text-secondary text-center">
            GRANTLY Scholarship Discovery Platform
          </p>
        </div>
      </aside>
    </>
  );
};
