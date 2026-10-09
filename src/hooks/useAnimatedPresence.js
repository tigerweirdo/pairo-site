import { useEffect, useRef, useState } from 'react';

/**
 * Keeps an element mounted through its exit transition — the framer-free replacement
 * for AnimatePresence on overlays/sheets.
 *
 * @param {boolean} open desired visibility from the parent
 * @param {{ duration?: number }} [opts] exit duration in ms (pass 0 for reduced motion)
 * @returns {{ render: boolean, visible: boolean }}
 *   `render` — mount the node?  `visible` — apply the open-state styles (drive CSS transitions).
 */
export function useAnimatedPresence(open, { duration = 300 } = {}) {
  const [render, setRender] = useState(open);
  const [visible, setVisible] = useState(open);
  const timerRef = useRef(null);

  useEffect(() => {
    window.clearTimeout(timerRef.current);

    if (open) {
      setRender(true);
      // Flip to visible on the next frame so the entrance transitions from the closed styles.
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    timerRef.current = window.setTimeout(() => setRender(false), duration);
    return () => window.clearTimeout(timerRef.current);
  }, [open, duration]);

  return { render, visible };
}
