import { PageShell } from '@/components/layout/PageShell';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SeasonalDot } from '@/components/layout/SeasonalDot';
import { buttonClassName } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <PageShell>
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center outline-none"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-[1] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--seasonal-primary)/0.15)] blur-3xl"
        />

        <div className="relative max-w-[520px]">
          <p
            className="mb-2 text-[96px] font-bold leading-none sm:text-[120px]"
            style={{
              fontWeight: 700,
              background: 'var(--seasonal-brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            aria-hidden
          >
            404
          </p>

          <h1
            className="preserve-case mb-3 text-[24px] font-semibold text-foreground"
            style={{ fontWeight: 600 }}
          >
            this page wandered off.
          </h1>

          <p
            className="preserve-case mx-auto mb-10 max-w-[400px] text-[16px] leading-relaxed text-muted-foreground"
            style={{ fontWeight: 400 }}
          >
            even pairs get lost sometimes.
          </p>

          <a href="/" className={buttonClassName('primary', 'md')}>
            ← back home
          </a>
        </div>

        <div className="mt-12">
          <SeasonalDot size="sm" showLabel />
        </div>
      </main>
    </PageShell>
  );
}
