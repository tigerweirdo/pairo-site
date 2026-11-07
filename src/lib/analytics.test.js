import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  POSTHOG_TRACKING_HOSTNAMES,
  PAGEVIEW_DEDUPE_MS,
  isPostHogTrackingHostname,
  shouldDedupePageview,
  shouldEnablePostHogTracking,
} from './analytics.js';

describe('PostHog tracking gate', () => {
  const prod = { PROD: true };
  const dev = { PROD: false };

  it('exports the production hostname allowlist', () => {
    assert.deepEqual(POSTHOG_TRACKING_HOSTNAMES, ['getpairo.app', 'www.getpairo.app']);
  });

  it('isPostHogTrackingHostname accepts allowlisted hosts only', () => {
    assert.equal(isPostHogTrackingHostname('getpairo.app'), true);
    assert.equal(isPostHogTrackingHostname('www.getpairo.app'), true);
    assert.equal(isPostHogTrackingHostname('localhost'), false);
    assert.equal(isPostHogTrackingHostname('127.0.0.1'), false);
    assert.equal(isPostHogTrackingHostname('preview.vercel.app'), false);
  });

  it('shouldEnablePostHogTracking requires prod, non-webdriver, allowlisted host', () => {
    const inBrowser = {};
    assert.equal(
      shouldEnablePostHogTracking(
        prod,
        { location: { hostname: 'getpairo.app' } },
        { webdriver: false },
        inBrowser,
      ),
      true,
    );
    assert.equal(
      shouldEnablePostHogTracking(
        prod,
        { location: { hostname: 'www.getpairo.app' } },
        {},
        inBrowser,
      ),
      true,
    );
    assert.equal(
      shouldEnablePostHogTracking(
        prod,
        { location: { hostname: 'localhost' } },
        { webdriver: false },
        inBrowser,
      ),
      false,
    );
    assert.equal(
      shouldEnablePostHogTracking(
        prod,
        { location: { hostname: 'getpairo.app' } },
        { webdriver: true },
        inBrowser,
      ),
      false,
    );
    assert.equal(
      shouldEnablePostHogTracking(
        dev,
        { location: { hostname: 'getpairo.app' } },
        { webdriver: false },
        inBrowser,
      ),
      false,
    );
    assert.equal(
      shouldEnablePostHogTracking(prod, { location: {} }, { webdriver: false }, inBrowser),
      false,
    );
  });
});

describe('$pageview deduplication', () => {
  it('dedupes the same href inside the dedupe window', () => {
    const href = 'https://getpairo.app/#faq';
    const t0 = 1_000;
    assert.equal(shouldDedupePageview(href, t0 + 30, '', 0), false);
    assert.equal(shouldDedupePageview(href, t0 + 45, href, t0), true);
    assert.equal(shouldDedupePageview(href, t0 + PAGEVIEW_DEDUPE_MS, href, t0), false);
  });

  it('does not dedupe when the href changes', () => {
    const t0 = 5_000;
    assert.equal(
      shouldDedupePageview('https://getpairo.app/#hero', t0 + 10, 'https://getpairo.app/', t0),
      false,
    );
  });
});
