import { useThemeSync } from '@/app/hooks/useThemeSync';
import { LandingPage } from '@/pages/landing/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  useThemeSync();
  const isLandingPage =
    typeof window === 'undefined' || window.location.pathname === '/' || !window.location.pathname;

  return <div className="relative z-[1]">{isLandingPage ? <LandingPage /> : <NotFoundPage />}</div>;
}
