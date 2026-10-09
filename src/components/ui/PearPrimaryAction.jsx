import { useEffect, useRef, useState } from 'react';
import { NavAnchor } from '@/components/layout/NavAnchor';
import { APP_URL } from '@/components/layout/navLinks';
import { CheckIcon, ShareIcon } from '@/icons/PearIcons';
import { ArrowRightIcon } from '@/icons/UiIcons';
import { trackEvent } from '@/lib/analytics';
import { buttonClassName } from '@/components/ui/Button';
import { DEFAULT_SITE_URL } from '@/constants/site';

const SHARE_TITLE = 'pairo — the little app made for two';
const SHARE_TEXT = 'I found pairo: a private app for the two of us.';
const RESET_DELAY_MS = 2400;

function legacyCopy(text) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  return copied;
}

async function copyShareText() {
  const text = `${SHARE_TEXT} ${DEFAULT_SITE_URL}`;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (!legacyCopy(text)) throw new Error('Copy is unavailable');
}

export function PearPrimaryAction({
  location,
  appLabel = 'try pairo — free',
  shareLabel = 'send to your person',
  variant = 'primary',
  size = 'md',
  className,
  onAction,
}) {
  const [state, setState] = useState('idle');
  const resetTimerRef = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  if (APP_URL) {
    return (
      <NavAnchor
        href={APP_URL}
        className={buttonClassName(variant, size, className)}
        analytics={{ cta: 'start_web', location }}
        onNavigate={onAction}
      >
        {appLabel}
        <ArrowRightIcon size={18} />
      </NavAnchor>
    );
  }

  const sharePear = async () => {
    window.clearTimeout(resetTimerRef.current);

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: DEFAULT_SITE_URL });
        setState('shared');
        trackEvent('Share Pear', { location, method: 'native' });
        onAction?.();
      } catch (error) {
        if (error?.name === 'AbortError') return;
        try {
          await copyShareText();
          setState('copied');
          trackEvent('Share Pear', { location, method: 'clipboard_after_share_error' });
          onAction?.();
        } catch {
          setState('error');
        }
      }
    } else {
      try {
        await copyShareText();
        setState('copied');
        trackEvent('Share Pear', { location, method: 'clipboard' });
        onAction?.();
      } catch {
        setState('error');
      }
    }

    resetTimerRef.current = window.setTimeout(() => setState('idle'), RESET_DELAY_MS);
  };

  const completed = state === 'shared' || state === 'copied';
  const label = completed ? (state === 'shared' ? 'shared' : 'link copied') : shareLabel;

  return (
    <>
      <button
        type="button"
        className={buttonClassName(variant, size, className)}
        onClick={sharePear}
      >
        {completed ? <CheckIcon size={18} aria-hidden /> : <ShareIcon size={18} aria-hidden />}
        {label}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === 'shared' ? 'Pear was shared.' : null}
        {state === 'copied' ? 'A share message and link were copied.' : null}
        {state === 'error' ? 'Sharing is unavailable in this browser.' : null}
      </span>
    </>
  );
}
