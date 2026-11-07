import { useEffect } from 'react';
import { useThemeSync } from '@/app/hooks/useThemeSync';
import { capturePageview } from '@/lib/analytics';
import { LandingPage } from '@/pages/landing/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  useThemeSync();
  const isLandingPage =
    typeof window === 'undefined' || window.location.pathname === '/' || !window.location.pathname;

  useEffect(() => {
    capturePageview();
  }, [isLandingPage]);

  return <div className="relative z-[1]">{isLandingPage ? <LandingPage /> : <NotFoundPage />}</div>;
}
