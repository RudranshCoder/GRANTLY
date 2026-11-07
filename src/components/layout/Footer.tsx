import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-0.5"
              aria-label="GRANTLY - Home"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <span className="font-heading font-bold text-xl text-navy tracking-tight">
                GRANTLY
              </span>
            </Link>
            <p className="text-sm text-text-secondary max-w-md leading-relaxed">
              Empowering students across India to discover eligible scholarships, track application deadlines, and unlock higher education opportunities.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-50 text-primary text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verified Eligibility & Matching Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-navy uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/dashboard"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Explore Scholarships
                </Link>
              </li>
              <li>
                <Link
                  to="/saved"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Saved Scholarships
                </Link>
              </li>
              <li>
                <Link
                  to="/applications"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Student Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-navy uppercase tracking-wider">
              Platform & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  About GRANTLY
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="rounded-lg bg-background border border-border p-3.5 mb-8 text-xs text-text-secondary leading-relaxed">
          <span className="font-semibold text-navy mr-1">Demo Project Notice:</span>
          GRANTLY is an educational demo prototype designed for scholarship discovery, eligibility matching, and tracking.
          All scholarship offerings, provider names, and deadlines displayed are simulated demo data.
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {CURRENT_YEAR} GRANTLY. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-danger inline fill-danger" aria-hidden="true" /> for Indian student success
          </p>
        </div>
      </div>
    </footer>
  );
};
