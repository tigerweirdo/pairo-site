import { useEffect } from 'react';
import { applyAutoTheme, syncBrandTheme } from '@/lib/theme';
import { isScrubberPreviewActive } from '@/lib/theme/scrubberPreview';

const SYNC_INTERVAL_MS = 60_000;

/** Keeps light theme class and seasonal palette in sync while the page is open. */
export function useThemeSync() {
  useEffect(() => {
    applyAutoTheme();
    syncBrandTheme(new Date(), { instant: true });

    const intervalId = window.setInterval(() => {
      if (!isScrubberPreviewActive()) syncBrandTheme();
    }, SYNC_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);
}
