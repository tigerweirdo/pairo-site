import { useScrollDepthAnalytics } from '@/hooks/useScrollDepthAnalytics';
import { PageShell } from '@/components/layout/PageShell';
import { PageEnd } from '@/components/layout/PageEnd';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { TimeStoryExperience } from '@/pages/landing/components/story/TimeStoryExperience';

export function LandingPage() {
  useScrollDepthAnalytics();

  return (
    <PageShell>
      <SiteHeader />

      <main id="main" tabIndex={-1} className="relative w-full flex-1 outline-none">
        <TimeStoryExperience />
      </main>

      <PageEnd>
        <SiteFooter />
      </PageEnd>
    </PageShell>
  );
}
