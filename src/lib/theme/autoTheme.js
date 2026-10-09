/** Marketing site is light-only — no system dark mode. */
export function getSystemTheme() {
  return 'light';
}

/** Pins `<html>` to light theme. */
export function applyAutoTheme() {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add('light');
  return 'light';
}

/** No-op — kept for callers that subscribed to OS theme changes. */
export function subscribeSystemTheme() {
  return () => {};
}
