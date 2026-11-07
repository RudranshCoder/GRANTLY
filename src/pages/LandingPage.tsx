import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Search,
  SlidersHorizontal,
  FileCheck,
  Bell,
  Bookmark,
  Calendar,
  Building2,
  ChevronDown,
  ShieldCheck,
  Award,
  Users,
  IndianRupee,
  MapPin,
  Menu,
  X,
  Target,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { Footer } from '@/components/layout';
import { scholarships } from '@/data/scholarships';
import type { Scholarship } from '@/types';

function formatDeadline(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function getDaysLeft(isoDate: string): { text: string; isUrgent: boolean } {
  try {
    // Relative difference calculation
    const target = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Expired', isUrgent: false };
    if (days === 0) return { text: 'Closes today', isUrgent: true };
    if (days <= 30) return { text: `${days}d left`, isUrgent: true };
    return { text: `${days}d left`, isUrgent: false };
  } catch {
    return { text: 'Active', isUrgent: false };
  }
}

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle smooth scroll for in-page anchors
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Preview scholarships for the featured section (first 3)
  const featuredScholarships: Scholarship[] = scholarships.slice(0, 3);

  const stats = [
    {
      icon: Award,
      value: '500+',
      label: 'Active Scholarships',
      subtext: 'Central, state & corporate grants',
    },
    {
      icon: IndianRupee,
      value: '₹50Cr+',
      label: 'Opportunities Mapped',
      subtext: 'Cumulative funding pool',
    },
    {
      icon: Users,
      value: '10,000+',
      label: 'Indian Students',
      subtext: 'Empowered on the platform',
    },
    {
      icon: MapPin,
      value: '28 States',
      label: 'All-India Coverage',
      subtext: 'Central & regional schemes',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Build Your Scholar Profile',
      description:
        'Share your academic level, course, caste category, and annual family income in 2 minutes. No paperwork or lengthy forms required up front.',
      icon: Users,
      badge: '2 Min Setup',
    },
    {
      number: '02',
      title: 'Match With 100% Eligible Grants',
      description:
        'Our rule-based engine tests 15+ academic, financial, and demographic criteria to instantly calculate your precise eligibility score.',
      icon: Target,
      badge: 'Smart Algorithm',
    },
    {
      number: '03',
      title: 'Track Applications in One Place',
      description:
        'Organize upcoming deadlines, application stages, and document checklists on an intuitive Kanban-style application management board.',
      icon: Layers,
      badge: 'Kanban Tracking',
    },
    {
      number: '04',
      title: 'Never Miss a Grant Deadline',
      description:
        'Receive proactive alerts for approaching closing dates, document verifications, and direct benefit transfer (DBT) milestones.',
      icon: Bell,
      badge: 'Timely Alerts',
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Matching Engine',
      description:
        'Analyzes academic scores, state domicile, stream, gender, and family income to match you only with scholarships you truly qualify for.',
      tag: 'Core Feature',
      highlight: true,
    },
    {
      icon: SlidersHorizontal,
      title: 'Application Tracker',
      description:
        'Move your applications smoothly from Interested to Preparing, Submitted, and Approved with real-time status and notes.',
      tag: 'Workflow',
      highlight: false,
    },
    {
      icon: FileCheck,
      title: 'Document Checklist Vault',
      description:
        'Stay ahead with pre-requisite document checklists — bonafide certificates, income affidavits, and marksheets mapped per scholarship.',
      tag: 'Compliance',
      highlight: false,
    },
    {
      icon: Bell,
      title: 'Proactive Deadline Alerts',
      description:
        'Countdown visual indicators and automated notifications ensure you submit polished applications well before the portal closes.',
      tag: 'Alerts',
      highlight: false,
    },
    {
      icon: ShieldCheck,
      title: 'Eligibility Diagnostics',
      description:
        'Transparent criterion-by-criterion audit showing exactly which requirements you satisfy and what documents are required.',
      tag: 'Transparency',
      highlight: false,
    },
    {
      icon: Bookmark,
      title: 'Curated Saved Pipeline',
      description:
        'Bookmark lucrative grants, compare award amounts side-by-side, and craft a personalized multi-year funding roadmap.',
      tag: 'Planning',
      highlight: false,
    },
  ];

  const faqs = [
    {
      question: 'What is GRANTLY and who is it designed for?',
      answer:
        'GRANTLY is a scholarship discovery and application management platform built specifically for Indian students. Whether you are pursuing an undergraduate degree, diploma, postgraduate studies, or doctoral research, GRANTLY aggregates verified central, state, and corporate schemes into one intuitive portal.',
    },
    {
      question: 'Is GRANTLY completely free to use for students?',
      answer:
        'Yes, 100% free. We believe financial constraints should never stand between an ambitious student and higher education. You can search the full scholarship catalog, calculate eligibility match scores, and track applications without any fees or subscription walls.',
    },
    {
      question: 'How does the smart eligibility matching work?',
      answer:
        'When you create your profile, our algorithm parses your educational background (course, current year, percentage), family income ceiling, category (General, OBC, SC, ST, EWS), and state domicile. It scores your profile against each scholarship’s official criteria, immediately highlighting whether you meet, partially meet, or miss any prerequisites.',
    },
    {
      question: 'Is my personal academic and financial data safe?',
      answer:
        'Yes. We practice strict data privacy and student-first security. Your profile information and application notes are preserved securely within your local environment and are never monetized, sold, or shared with third-party advertisers.',
    },
    {
      question: 'Do I apply directly on GRANTLY or on the official government/provider portals?',
      answer:
        'GRANTLY acts as your discovery engine, document prep checklist, and lifecycle tracker. When you are ready to submit, we provide the verified official portal link (e.g. National Scholarship Portal, state government portals, or corporate foundation pages) so your final submission is authentic, official, and direct.',
    },
    {
      question: 'Does GRANTLY cover private corporate scholarships as well as government schemes?',
      answer:
        'Yes. Our curated database includes central government schemes (like AICTE, UGC, and Ministry of Education), prominent state-level welfare programs, and premier corporate CSR initiatives from foundations like Reliance, Tata Trusts, HDFC Bank, Infosys, and Adobe.',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary selection:bg-primary-200 selection:text-navy flex flex-col">
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 group"
              aria-label="GRANTLY Homepage"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-primary-dark transition-all duration-200">
                <GraduationCap className="w-5.5 h-5.5" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl text-navy tracking-tight leading-none">
                  GRANTLY
                </span>
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider mt-0.5">
                  Scholarship Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Landing Page Navigation">
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-sm font-medium text-text-secondary hover:text-navy transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-sm font-medium text-text-secondary hover:text-navy transition-colors"
              >
                Key Features
              </a>
              <a
                href="#scholarships"
                onClick={(e) => scrollToSection(e, 'scholarships')}
                className="text-sm font-medium text-text-secondary hover:text-navy transition-colors"
              >
                Featured Grants
              </a>
              <a
                href="#faq"
                onClick={(e) => scrollToSection(e, 'faq')}
                className="text-sm font-medium text-text-secondary hover:text-navy transition-colors"
              >
                FAQ
              </a>
              <Link
                to="/explore"
                className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Directory</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-50 text-primary font-semibold">
                  500+
                </span>
              </Link>
            </nav>

            {/* Desktop CTA actions */}
            <div className="hidden md:flex items-center gap-3.5">
              <Link
                to="/dashboard"
                className="px-3.5 py-2 text-sm font-semibold text-text-secondary hover:text-navy transition-colors"
              >
                Sign In / Dashboard
              </Link>
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-navy hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2" aria-label="Mobile Landing Navigation">
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="px-3 py-2 text-base font-medium text-text-secondary hover:text-navy hover:bg-background rounded-md transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="px-3 py-2 text-base font-medium text-text-secondary hover:text-navy hover:bg-background rounded-md transition-colors"
              >
                Key Features
              </a>
              <a
                href="#scholarships"
                onClick={(e) => scrollToSection(e, 'scholarships')}
                className="px-3 py-2 text-base font-medium text-text-secondary hover:text-navy hover:bg-background rounded-md transition-colors"
              >
                Featured Grants
              </a>
              <a
                href="#faq"
                onClick={(e) => scrollToSection(e, 'faq')}
                className="px-3 py-2 text-base font-medium text-text-secondary hover:text-navy hover:bg-background rounded-md transition-colors"
              >
                Frequently Asked Questions
              </a>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-text-secondary hover:text-primary hover:bg-background rounded-md transition-colors flex items-center justify-between"
              >
                <span>Explore Directory</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary font-semibold">
                  500+ Grants
                </span>
              </Link>
            </nav>
            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <Link
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                <span>Get Started (Free)</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-text-secondary hover:text-navy"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 2. Hero Section (Fintech-Inspired SaaS Aesthetic) */}
        <section className="relative overflow-hidden bg-navy text-white pt-16 sm:pt-24 pb-20 sm:pb-32">
          {/* Subtle geometric pattern & gradient ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
              backgroundSize: '36px 36px',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/25 rounded-full blur-3xl pointer-events-none -z-0"
            aria-hidden="true"
          />
          <div
            className="absolute -top-20 -right-20 w-[450px] h-[450px] bg-teal/15 rounded-full blur-3xl pointer-events-none -z-0"
            aria-hidden="true"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline and Call-to-actions */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs sm:text-sm font-medium text-white shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-teal animate-pulse" />
                  <span className="font-semibold text-teal-light">GRANTLY 2.0</span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/90">Smart Indian Scholarship Intelligence</span>
                </div>

                {/* Primary Headline */}
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                  Your potential deserves an{' '}
                  <span className="bg-gradient-to-r from-primary-200 via-white to-teal-light bg-clip-text text-transparent">
                    opportunity.
                  </span>
                </h1>

                {/* Supporting description */}
                <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  GRANTLY matches ambitious students across India with hundreds of verified
                  government, corporate, and institutional scholarships. Zero guesswork, automated
                  eligibility grading, and deadline tracking in one unified workspace.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    to="/explore"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-base text-white bg-primary hover:bg-primary-light shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Explore Scholarships</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href="#how-it-works"
                    onClick={(e) => scrollToSection(e, 'how-it-works')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base text-white/90 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all hover:-translate-y-0.5"
                  >
                    <span>How It Works</span>
                  </a>
                </div>

                {/* Micro Trust Indicators */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-white/70">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal" aria-hidden="true" />
                    <span>100% Free For Students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal" aria-hidden="true" />
                    <span>Verified Eligibility Criteria</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal" aria-hidden="true" />
                    <span>Direct Official Portal Links</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Distinctive Fintech Product Card Preview */}
              <div className="lg:col-span-5 relative">
                {/* Decorative glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-teal opacity-30 blur-lg" />

                <div className="relative rounded-2xl bg-navy-light/90 border border-white/15 p-6 backdrop-blur-xl shadow-2xl text-left space-y-5">
                  {/* Mock card top bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-200">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 font-medium">Algorithmic Scoring</p>
                        <p className="text-sm font-semibold text-white">Live Qualification Engine</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-light text-xs font-semibold border border-teal-500/30">
                      <Check className="w-3 h-3" /> 96% Match
                    </span>
                  </div>

                  {/* Featured Program Insight */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-light">
                          Merit-cum-Means
                        </span>
                        <h4 className="font-heading font-bold text-base text-white mt-0.5">
                          Reliance Foundation UG Scholarship
                        </h4>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/80 font-mono">
                        Pan-India
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-heading text-2xl font-extrabold text-primary-200">
                        ₹2,00,000
                      </span>
                      <span className="text-xs text-white/60">total educational grant</span>
                    </div>

                    {/* Criteria checklist preview */}
                    <div className="pt-2 space-y-1.5 text-xs text-white/80">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-teal/20 text-teal-light flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                        <span>Passed 12th standard with 88% marks (Req: 60%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-teal/20 text-teal-light flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                        <span>Family annual income under ₹15,00,000 ceiling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-teal/20 text-teal-light flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                        <span>Enrolled in full-time accredited Undergraduate course</span>
                      </div>
                    </div>
                  </div>

                  {/* Action row in card */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Closes Dec 15, 2026</span>
                    </div>
                    <Link
                      to="/onboarding"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors"
                    >
                      <span>Check Your Fit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Stats / Trust Bar */}
        <section className="relative z-20 -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xl">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1 sm:space-y-1.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-1">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">{stat.label}</span>
                  <span className="text-xs text-text-secondary leading-tight">{stat.subtext}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-semibold tracking-wide uppercase">
              <span>Simplified Process</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              From discovery to award in four clear steps
            </h2>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
              Finding the right educational funding shouldn’t feel like searching in the dark.
              GRANTLY streamlines the scholarship journey into a structured, stress-free workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative rounded-2xl bg-surface border border-border p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary-200 transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-2xl text-primary/40 group-hover:text-primary transition-colors">
                        {step.number}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-background border border-border text-text-secondary">
                        {step.badge}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>

                    <h3 className="font-heading font-bold text-lg text-navy">{step.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all shadow-xs hover:shadow-md"
            >
              <span>Start Free Profile Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 5. Key Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal text-xs font-semibold tracking-wide uppercase">
                <span>Platform Capabilities</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                Designed to give students an unfair advantage
              </h2>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                Every tool built into GRANTLY is focused on removing friction, saving hours of manual
                research, and ensuring you never lose out due to a technicality or missed deadline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 rounded-2xl bg-background border border-border hover:border-primary-200 hover:bg-surface hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <Icon className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                          {feature.tag}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-xl text-navy">{feature.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Featured Scholarships Section */}
        <section id="scholarships" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-semibold tracking-wide uppercase">
                <span>Handpicked Grants</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                Featured Scholarships Open for Application
              </h2>
              <p className="text-base text-text-secondary">
                Verified high-impact programs currently accepting candidate registrations across India.
              </p>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors group"
            >
              <span>Explore all 500+ scholarships</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Scholarship Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredScholarships.map((scholarship) => {
              const daysInfo = getDaysLeft(scholarship.deadline);
              return (
                <div
                  key={scholarship.id}
                  className="rounded-2xl bg-surface border border-border p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary-200 transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                          <Building2 className="w-3.5 h-3.5 text-text-muted" />
                          <span className="truncate max-w-[180px]">{scholarship.provider}</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-navy group-hover:text-primary transition-colors leading-snug">
                          {scholarship.title}
                        </h3>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal text-[11px] font-semibold border border-teal-100 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {scholarship.shortDescription}
                    </p>

                    {/* Key Metrics */}
                    <div className="pt-2 pb-1 grid grid-cols-2 gap-3 border-y border-border">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block">
                          Benefit Value
                        </span>
                        <span className="font-heading font-extrabold text-base text-primary">
                          {scholarship.benefitAmount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium block">
                          Closing Date
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-text-primary">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span>{formatDeadline(scholarship.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1.5">
                      {scholarship.category.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-background border border-border text-text-secondary capitalize"
                        >
                          {cat.replace('-', ' ')}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-background border border-border text-text-secondary">
                        {scholarship.state}
                      </span>
                      {daysInfo.isUrgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-warning-50 text-warning border border-warning/20">
                          {daysInfo.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-5 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-text-secondary font-medium">Demo dataset</span>
                    <Link
                      to="/explore"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                      aria-label={`View eligibility for ${scholarship.title}`}
                    >
                      <span>Check Eligibility</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Under Cards Banner */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-50 via-background to-teal-50 border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading font-bold text-lg text-navy">
                Looking for scholarships in your specific field or state?
              </h4>
              <p className="text-sm text-text-secondary">
                Filter by Engineering, Medical, Arts, Commerce, Gender, Domicile, and Family Income.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-navy hover:bg-navy-light transition-colors shrink-0 shadow-xs"
            >
              <span>Open Search Filters</span>
              <Search className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 7. FAQ Section */}
        <section id="faq" className="py-20 sm:py-28 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-semibold tracking-wide uppercase">
                <span>Student Support</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-text-secondary">
                Everything you need to know about navigating scholarships and the GRANTLY platform.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-primary-200 bg-background shadow-xs'
                        : 'border-border bg-surface hover:border-border-dark'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-expanded={isOpen}
                    >
                      <span className="font-heading font-semibold text-base sm:text-lg text-navy">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-text-secondary transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-border/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center text-sm text-text-secondary">
              Still have a question?{' '}
              <Link to="/contact" className="font-semibold text-primary hover:underline">
                Contact our scholar support team
              </Link>
            </div>
          </div>
        </section>

        {/* 8. High-Impact CTA Section */}
        <section className="relative overflow-hidden bg-navy text-white py-20 sm:py-24">
          {/* Subtle background glow */}
          <div
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-teal-light uppercase tracking-wider">
                <span>Unlock Your Higher Education</span>
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready to find your scholarship?
              </h2>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed font-normal">
                Join over 10,000 students discovering matching grants across India. Take 2 minutes
                to create your profile and see what opportunities are waiting for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-base text-navy bg-white hover:bg-background shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Get Started in 2 Minutes</span>
                <ArrowRight className="w-4 h-4 text-primary" aria-hidden="true" />
              </Link>

              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all hover:-translate-y-0.5"
              >
                <span>Browse Without Account</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-white/60">
              <span>✓ No credit card or payment required</span>
              <span>✓ Fully automated eligibility matching</span>
              <span>✓ Strict privacy & zero spam guarantee</span>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer Component */}
      <Footer />
    </div>
  );
};

export default LandingPage;
