# Agent görev kaydı — pairo-site

## 2026-11-07 — Plausible → PostHog geçişi

### Yapılanlar

- `posthog-js` eklendi; `src/lib/analytics.js` PostHog EU ile yeniden yazıldı.
- Plausible script enjeksiyonu kaldırıldı.
- `VITE_POSTHOG_KEY` ortam değişkeni (fallback: paylaşılan public key).
- `api_host`: `https://eu.i.posthog.com`; `persistence: 'memory'`; autocapture ve session recording kapalı; DNT saygılı.
- Süper özellik: `project_slug: 'pairo'`.
- `$pageview`: ilk yükleme, `hashchange`, `popstate`, App içi pathname değişimi.
- `track()` yardımcısı; olaylar: `primary_cta_click`, `app_store_click`, `outbound_click`, `web_vitals`, `scroll_depth`, `set_piece_reached`.
- CSP (`vercel.json`): `connect-src` → `eu.i.posthog.com`, `eu-assets.i.posthog.com`.
- Gizlilik metinleri (`landing.content.js`): PostHog EU açıklaması (İngilizce).
- `.env.example` ve README güncellendi.

### Ortam değişkeni (sahip)

| Değişken           | Nerede                             | Zorunlu                     |
| ------------------ | ---------------------------------- | --------------------------- |
| `VITE_POSTHOG_KEY` | Vercel (getpairo.app) build ortamı | Hayır (fallback key gömülü) |

### Form olayları

Sitede form yok; `form_start` / `form_success` eklenmedi.

## 2026-11-07 — PostHog hostname + çift $pageview düzeltmesi

### Sorun

- CI / Lighthouse / Puppeteer prerender (`localhost`, `navigator.webdriver`) prod build ile PostHog’a fallback key ile event gönderiyordu.
- İlk yüklemede `loaded` callback ile `App.jsx` `useEffect` aynı `$pageview`’ı ~30–60 ms arayla iki kez gönderiyordu.

### Yapılanlar

- `POSTHOG_TRACKING_HOSTNAMES`: yalnızca `getpairo.app` ve `www.getpairo.app`.
- `canTrack()` → `shouldEnablePostHogTracking()`: PROD + allowlist hostname + `!navigator.webdriver`.
- `shouldDedupePageview` / `PAGEVIEW_DEDUPE_MS` (250 ms): aynı URL için ardışık `$pageview` birleştirme.
- `App.jsx` içindeki gereksiz `capturePageview` kaldırıldı (ilk sayfa: `initPostHog` `loaded`; rota: `hashchange` / `popstate`).
- `npm test` (`node --test`) + `src/lib/analytics.test.js`; CI `quality` job’a eklendi.
