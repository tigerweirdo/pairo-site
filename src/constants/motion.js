/**
 * Shared motion language — Framer Motion + GSAP read the same tokens here.
 * prefers-reduced-motion: use PEAR_STILL or GSAP early-return.
 */

/** Primary warm deceleration — section entrances, scroll reveals */
export const PEAR_EASE_WARM = [0.22, 1, 0.36, 1];

/** @deprecated use PEAR_EASE_WARM */
export const PEAR_EASE_DEFAULT = PEAR_EASE_WARM;

/** GSAP registered ease name — mirrors PEAR_EASE_WARM (see gsap.js) */
export const PEAR_EASE_GSAP = 'pearWarm';

export const PEAR_DURATION_ENTRANCE = 0.52;
export const PEAR_DURATION_ENTRANCE_HEADING = 0.58;
export const PEAR_DURATION_ENTRANCE_HERO = 0.48;

export const PEAR_OFFSET_Y = 16;
export const PEAR_OFFSET_Y_SM = 10;

export const PEAR_STAGGER = 0.07;
export const PEAR_STAGGER_TIGHT = 0.05;

/** Framer — section / panel entrance (same curve + duration as GSAP reveals) */
export const PEAR_TWEEN_ENTRANCE = {
  type: 'tween',
  duration: PEAR_DURATION_ENTRANCE,
  ease: PEAR_EASE_WARM,
};

/** @deprecated use PEAR_TWEEN_ENTRANCE */
export const PEAR_TWEEN_SOFT = PEAR_TWEEN_ENTRANCE;

/** Klavye / fare ile uyumlu, hafif yay hissi (belirgin sıçrama yok) */
export const PEAR_SPRING_UI = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.85,
};

/** Daha kısa shell animasyonları (tab pill, küçük paneller) */
export const PEAR_SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
  mass: 0.8,
};

/**
 * whileInView / useInView — bölüm henüz ortalanmadan tetiklenir (negatif margin geç kalıyordu).
 * Alt marjı genişletir; amount ile küçük bir görünürlük yeterli.
 */
export const LANDING_VIEWPORT = {
  once: true,
  amount: 0.12,
  margin: '0px 0px 22% 0px',
};

/** Uzun paragraf kelime scrub — daha geniş scroll aralığı, okuma süresi. */
export const SCROLL_WORD_REVEAL = ['start end', 'end 0.28'];

/** Manifesto (WHY PEAR) — yalnızca metin bloğu; son cümle viewport’ta kalırken tamamlanır. */
export const SCROLL_MANIFESTO_REVEAL = ['start 0.92', 'end 0.48'];

/** Manifesto scrub: tüm kelimeler bu progress’te görünür; sonrası okuma payı. */
export const MANIFESTO_REVEAL_COMPLETE = 0.68;

/** Kart / adım scrub — manifesto’dan biraz daha kısa aralık. */
export const SCROLL_SECTION_REVEAL = ['start end', 'end 0.38'];

/** PRICING kartı — görünürken scale/blur/check koreografisi (iç içe whileInView kullanılmaz). */
export const PRICING_CARD_VIEWPORT = {
  once: true,
  amount: 0.38,
  margin: '0px 0px 10% 0px',
};

export const PEAR_TWEEN_LUXE = {
  type: 'tween',
  duration: PEAR_DURATION_ENTRANCE_HEADING,
  ease: PEAR_EASE_WARM,
};

export const PEAR_TWEEN_REDUCED = {
  type: 'tween',
  duration: 0.2,
  ease: 'easeOut',
};

/** Belirgin sıçrama hissi — BottomNav ikon pop, switch checked gibi "zıplama" gereken yerlerde */
export const PEAR_SPRING_BOUNCY = {
  type: 'spring',
  stiffness: 350,
  damping: 18,
  mass: 0.7,
};

export const PEAR_STILL = { duration: 0, ease: 'linear' };

export const PEAR_FADE_ONLY = { duration: 0.12, ease: 'linear' };
