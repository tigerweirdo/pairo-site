import { FAQ_ITEMS } from '../pages/landing/landing.content.js';

/** Production origin — override with VITE_SITE_URL at build time. */
export const DEFAULT_SITE_URL = 'https://getpairo.app';

export const SITE_NAME = 'pairo';

export const SITE_TITLE = 'pairo — the little app made for two';

export const SITE_DESCRIPTION =
  'pairo is the private super-app for couples. Plan together, remember the little things, and feel close even when life is loud. Free during beta.';

/** Runtime origin (client). Build-time meta uses process.env.VITE_SITE_URL in vite.config.js. */
export const SITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) ||
  DEFAULT_SITE_URL;

/**
 * Per-route SEO (future /privacy, 404, etc.):
 * Meta is injected once at build via index.html placeholders + inject-html-meta.
 * When adding routes, pick one:
 * 1) react-helmet-async — per-page title/description/canonical at runtime (pair with prerender per route).
 * 2) Per-route prerender — extend pear-static-prerender to visit each path and write dist/<path>/index.html.
 * 3) transformIndexHtml(ctx.path) — route-specific placeholder values during vite build.
 * Keep structured data in buildMarketingJsonLd(); add route-specific @graph nodes as pages ship.
 */

/** Canonical paths listed in sitemap.xml at build time. Add entries when new routes ship. */
export const SITEMAP_PATHS = ['/'];

/** JSON-LD @graph for the marketing homepage — FAQPage mirrors FAQ_ITEMS (single source of truth). */
export function buildMarketingJsonLd(siteUrl = DEFAULT_SITE_URL) {
  const origin = siteUrl.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: origin,
        logo: `${origin}/icons/icon-512.png`,
      },
      {
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        url: origin,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'iOS, Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        })),
      },
    ],
  };
}
