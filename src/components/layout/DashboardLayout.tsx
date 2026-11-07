import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  hideFooter?: boolean;
  hideNavbar?: boolean;
  fullBleed?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
  containerClassName,
  hideFooter = false,
  hideNavbar = false,
  fullBleed = false,
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      {!hideNavbar && <Navbar />}
      <main className={cn('flex-1 w-full', fullBleed && 'flex')}>
        <div
          className={cn(
            fullBleed
              ? 'w-full max-w-none p-0'
              : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
            containerClassName
          )}
        >
          {children ?? <Outlet />}
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};
