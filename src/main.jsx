import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { initPlausible } from '@/lib/analytics';
import { initWebVitals } from '@/lib/webVitals';
import { initScrollEngine } from '@/lib/scroll';
import { initScrollPerfProbe } from '@/lib/scrollPerfProbe';
import { syncBrandTheme } from '@/lib/theme/syncBrandTheme';
import '@/styles/fonts.css';
import '@/styles/globals.css';

function mountApp() {
  if (typeof document === 'undefined') return;

  syncBrandTheme(new Date(), { instant: true });
  initScrollEngine();
  initScrollPerfProbe();
  initPlausible();
  initWebVitals();

  if (import.meta.env.PROD) {
    const buildId = document.querySelector('meta[name="pear-build"]')?.content;
    if (buildId) console.info(`[pear] build ${buildId}`);
  }

  const rootEl = document.getElementById('root');
  if (!rootEl) return;

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.setAttribute('data-prerender-ready', '');
    });
  });
}

mountApp();
