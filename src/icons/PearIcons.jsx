/**
 * pear chunky toon icon set — v3 (consistency fix)
 *
 * Changes from v2:
 *  - ALL ghost/opacity background circles removed
 *  - Arrow icons: line + pastel filled triangle tip (style C)
 *  - LogOut: simple filled door + arrow with triangle tip
 *  - RefreshCw/RotateCcw: stroke arc + filled triangle tip
 *  - Undo2/Repeat: stroke path + filled triangle tips
 *  - Download: stroke lines + filled triangle tip
 *  - Activity/Snowflake/WifiOff/Settings/X: ghost removed, clean stroke
 *
 * DESIGN RULES:
 *  - Filled icons (heart, home, check...): P/Sc/A fills, thick S stroke
 *  - Arrows & utility: stroke-only + filled triangle tip where applicable
 *  - Chevrons: pure stroke, no fills (smallest UI primitives)
 *  - NO opacity backgrounds, NO ghost circles, NO #fff hardcodes
 *
 * Semantic tint: pass `color="hsl(var(--destructive))"` etc. — Tailwind `text-*`
 * alone does not recolor paths (they use CSS vars / --_c).
 */

import { PearBrandMarkFramedPaths } from './PearBrandMark';

// Base wrapper — `style` merges with `--_c`; `...rest` must not override merged style.
const IconBase = ({ children, size = 24, color, className = '', style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={`pear-icon ${className}`}
    style={{
      ...(color ? { '--_c': color } : {}),
      ...style,
    }}
    {...rest}
  >
    {children}
  </svg>
);

// Theme color refs — when color prop is set, everything becomes monochrome
const S = 'var(--_c, var(--pear-icon-stroke, #2A2420))';
const P = 'var(--_c, var(--pear-icon-primary, #FF8FA3))';
const Sc = 'var(--_c, var(--pear-icon-secondary, #7EC8E3))';
const A = 'var(--_c, var(--pear-icon-accent, #FFD580))';

// ─── BRAND MARK (pear silhouette — tek kaynak path’ler) ─

export const BrandMarkIcon = (props) => (
  <IconBase {...props}>
    <svg width="32" height="32" viewBox="0 0 1535 2047" preserveAspectRatio="xMidYMid meet">
      <PearBrandMarkFramedPaths fill={S} backdrop />
    </svg>
  </IconBase>
);

// ─── CORE NAV ────────────────────────────────────────

export const HomeIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M4 26V14.5L16 5L28 14.5V26C28 27.5 26.5 28.5 25 28.5H7C5.5 28.5 4 27.5 4 26Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="12"
      y="18"
      width="8"
      height="10.5"
      rx="4"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const CalendarIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="3.5"
      y="8"
      width="25"
      height="20.5"
      rx="4.5"
      fill={Sc}
      stroke={S}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <rect
      x="3.5"
      y="8"
      width="25"
      height="6"
      rx="4.5"
      fill={P}
      stroke={S}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M10.5 4.5V10.5" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
    <path d="M21.5 4.5V10.5" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
    <path d="M6 19.5H26" stroke={S} strokeWidth="0.8" opacity=".3" />
    <path d="M6 23.5H26" stroke={S} strokeWidth="0.8" opacity=".3" />
    <path d="M12 15.5V27" stroke={S} strokeWidth="0.8" opacity=".3" />
    <path d="M20 15.5V27" stroke={S} strokeWidth="0.8" opacity=".3" />
    <circle cx="16" cy="21.5" r="2.5" fill={A} stroke={S} strokeWidth="1.2" />
  </IconBase>
);

export const LayoutGridIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="4"
      width="10.5"
      height="10.5"
      rx="3.5"
      fill={P}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect
      x="17.5"
      y="4"
      width="10.5"
      height="10.5"
      rx="3.5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect
      x="4"
      y="17.5"
      width="10.5"
      height="10.5"
      rx="3.5"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect
      x="17.5"
      y="17.5"
      width="10.5"
      height="10.5"
      rx="3.5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const UserIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="13" r="6" fill={Sc} stroke={S} strokeWidth="3" />
    <path
      d="M7 28C7 22.5 10.5 18.5 16 18.5C21.5 18.5 25 22.5 25 28"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </IconBase>
);

export const User2Icon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="12" r="5.5" fill={Sc} stroke={S} strokeWidth="3" />
    <path
      d="M6 28.5C6 22 10 18 16 18C22 18 26 22 26 28.5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </IconBase>
);

// ─── HEART / LOVE ────────────────────────────────────

export const HeartIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 28C16 28 4.5 19.5 4.5 12C4.5 7.5 7.5 5 10.5 5C12.8 5 14.5 6.5 16 8.5C17.5 6.5 19.2 5 21.5 5C24.5 5 27.5 7.5 27.5 12C27.5 19.5 16 28 16 28Z"
      fill={P}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse
      cx="11"
      cy="11"
      rx="2.5"
      ry="1.8"
      fill={Sc}
      opacity=".35"
      transform="rotate(-20 11 11)"
    />
  </IconBase>
);

export const CalendarHeartIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="3.5"
      y="8"
      width="25"
      height="20.5"
      rx="4.5"
      fill={Sc}
      stroke={S}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <rect
      x="3.5"
      y="8"
      width="25"
      height="6"
      rx="4.5"
      fill={P}
      stroke={S}
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path d="M10.5 4.5V10.5" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
    <path d="M21.5 4.5V10.5" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
    <path
      d="M16 24C16 24 11 21 11 18.5C11 17 12.2 16 13.3 16C14.2 16 15 16.8 16 17.5C17 16.8 17.8 16 18.7 16C19.8 16 21 17 21 18.5C21 21 16 24 16 24Z"
      fill={P}
      stroke={S}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

// ─── ACTIONS ─────────────────────────────────────────

export const CheckIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={A} stroke={S} strokeWidth="3" />
    <path
      d="M10 16.5L14 21L22.5 11.5"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const CheckCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={Sc} stroke={S} strokeWidth="3" />
    <path
      d="M10 16.5L14 21L22.5 11.5"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const CheckSquareIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      rx="5"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M10 16.5L14 21L22.5 11.5"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const XIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 9L23 23M23 9L9 23" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const XCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={P} stroke={S} strokeWidth="3" />
    <path
      d="M11.5 11.5L20.5 20.5M20.5 11.5L11.5 20.5"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </IconBase>
);

export const PlusIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={Sc} stroke={S} strokeWidth="3" />
    <path d="M16 10V22M10 16H22" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const Trash2Icon = (props) => (
  <IconBase {...props}>
    <path
      d="M8 10H24L22.5 27H9.5L8 10Z"
      fill={P}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M6 10H26" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <rect x="12.5" y="5" width="7" height="5" rx="2.5" fill={A} stroke={S} strokeWidth="2.5" />
    <path d="M13.5 15V22M18.5 15V22" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
  </IconBase>
);

export const PencilIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M6 26L7.5 20L22.5 5L27 9.5L12 24.5L6 26Z"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M19.5 8L24 12.5" stroke={S} strokeWidth="2" strokeLinecap="round" />
    <path d="M7.5 20L12 24.5" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
  </IconBase>
);

export const PenLineIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M8 26L10 20L23 7L27 11L14 24L8 26Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M5 28H27" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
  </IconBase>
);

export const SaveIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      rx="5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect x="9" y="4" width="14" height="10" rx="2" fill={A} stroke={S} strokeWidth="2" />
    <rect
      x="9"
      y="19"
      width="14"
      height="9"
      rx="3"
      fill={P}
      stroke={S}
      strokeWidth="2"
      opacity=".4"
    />
  </IconBase>
);

export const SendIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M5 16L27 6L17 26L15 18L5 16Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M15 18L27 6" stroke={S} strokeWidth="1.5" />
  </IconBase>
);

export const ShareIcon = (props) => (
  <IconBase {...props}>
    <circle cx="22" cy="8" r="4.5" fill={P} stroke={S} strokeWidth="2.5" />
    <circle cx="10" cy="16" r="4.5" fill={Sc} stroke={S} strokeWidth="2.5" />
    <circle cx="22" cy="24" r="4.5" fill={A} stroke={S} strokeWidth="2.5" />
    <path d="M14 14L18 10M14 18L18 22" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const DownloadIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 5V20" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M9 15.5L16 22.5L23 15.5Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M6 27H26" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const RefreshCwIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M26 14C25 9 21 5.5 16 5.5C10.5 5.5 6 10 6 16C6 22 10.5 26.5 16 26.5C20 26.5 23.5 24 25.5 20.5"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M23 8L27 14H21Z" fill={Sc} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
  </IconBase>
);

export const RotateCcwIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M6 14C7 9 11 5.5 16 5.5C21.5 5.5 26 10 26 16C26 22 21.5 26.5 16 26.5C12 26.5 8.5 24 6.5 20.5"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M9 8L5 14H11Z" fill={Sc} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
  </IconBase>
);

export const Undo2Icon = (props) => (
  <IconBase {...props}>
    <path
      d="M11 10C18 10 24 14 24 20C24 24.5 20.5 27 16.5 27C12.5 27 9.5 25 8.5 22"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13 5L5 10L13 15Z" fill={Sc} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
  </IconBase>
);

export const LogOutIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M5 8C5 6 6.5 5 8.5 5H17.5C19.5 5 21 6 21 8V24C21 26 19.5 27 17.5 27H8.5C6.5 27 5 26 5 24V8Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M15 12V20" stroke={S} strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
    <path d="M21 16H27" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M24.5 10.5L29.5 16L24.5 21.5Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

// ─── NAVIGATION ARROWS (line + filled triangle tip) ──

export const ArrowLeftIcon = (props) => (
  <IconBase {...props}>
    <path d="M27 16H13" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M15 8.5L5.5 16L15 23.5Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ArrowRightIcon = (props) => (
  <IconBase {...props}>
    <path d="M5 16H19" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M17 8.5L26.5 16L17 23.5Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ArrowDownIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 5V17" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M8.5 17L16 26.5L23.5 17Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ChevronLeftIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M20 7L11 16L20 25"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ChevronRightIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M12 7L21 16L12 25"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ChevronDownIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M7 12L16 21L25 12"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ChevronUpIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M7 20L16 11L25 20"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// ─── COMMUNICATION ──────────────────────────────────

export const BellIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 4C16 4 8 7 8 14V22L6 25H26L24 22V14C24 7 16 4 16 4Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ellipse cx="16" cy="28" rx="3" ry="2" fill={P} stroke={S} strokeWidth="2" />
  </IconBase>
);

export const BellOffIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 4C16 4 8 7 8 14V22L6 25H26L24 22V14C24 7 16 4 16 4Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity=".4"
    />
    <path d="M6 6L26 26" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const MailIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="3"
      y="7"
      width="26"
      height="18"
      rx="5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M4 9L16 18L28 9"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const MessageCircleIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 5C9 5 4 9.5 4 15C4 18 5.5 20.5 8 22.5L6 27L12 24.5C13.3 25 14.6 25.2 16 25.2C23 25.2 28 20.5 28 15C28 9.5 23 5 16 5Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const MessageSquareTextIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M6 5H26C27.5 5 28.5 6.5 28.5 8V22C28.5 23.5 27.5 25 26 25H12L6 29V8C6 6.5 7 5 6 5Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M12 12H22M12 17H18" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const InboxIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M5 18L8 6H24L27 18V25C27 26.5 25.8 27.5 24.5 27.5H7.5C6.2 27.5 5 26.5 5 25V18Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M5 18H11L13 21H19L21 18H27"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// ─── SHOPPING / LISTS ───────────────────────────────

export const ShoppingCartIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M8 4L4.5 10V26C4.5 27.8 6 29 7.5 29H24.5C26 29 27.5 27.8 27.5 26V10L24 4H8Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4.5 10H27.5" stroke={S} strokeWidth="1.5" />
    <path
      d="M21.5 15C21.5 18.3 19 21 16 21C13 21 10.5 18.3 10.5 15"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </IconBase>
);

export const ListChecksIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      rx="5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 11L10.5 13L13.5 9.5"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16.5 11H24" stroke={S} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M8.5 19L10.5 21L13.5 17.5"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16.5 19H24" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const StickyNoteIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M6 5H26C27.5 5 28 6.5 28 8V20L20 28H8C6.5 28 5 27 5 25.5V8C5 6.5 6 5 6 5Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M20 28V22C20 20.5 21 20 22.5 20H28"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M10 13H22M10 18H16" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
  </IconBase>
);

// ─── FOOD / COOKING ─────────────────────────────────

export const ChefHatIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M9 14C6 14 4 11.5 4 9C4 6 6.5 4 9.5 4C11 4 12 4.5 13 5.5C14 4 15 3.5 16 3.5C17 3.5 18 4 19 5.5C20 4.5 21 4 22.5 4C25.5 4 28 6 28 9C28 11.5 26 14 23 14"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="9"
      y="14"
      width="14"
      height="14"
      rx="3"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M12 20H20" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
  </IconBase>
);

export const UtensilsCrossedIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M7 4H15V12C15 15 13 17 11 17L10 28H12"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity=".3"
    />
    <path
      d="M8 4V14C8 16 9.5 17 11 17L10 28"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 4V14C14 16 12.5 17 11 17"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M11 4V10" stroke={S} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M20 4C20 4 24 6 24 12C24 14 22.5 15.5 22 16L19 28"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity=".3"
    />
    <path
      d="M20 4C20 4 24 6 24 12C24 14 22.5 15.5 22 16L19 28"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const PizzaIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 4L4 28H28L16 4Z" fill={A} stroke={S} strokeWidth="3" strokeLinejoin="round" />
    <circle cx="14" cy="18" r="2.5" fill={P} stroke={S} strokeWidth="1.5" />
    <circle cx="19" cy="22" r="2.5" fill={P} stroke={S} strokeWidth="1.5" />
    <circle cx="17" cy="13" r="2" fill={P} stroke={S} strokeWidth="1.5" />
  </IconBase>
);

export const CoffeeIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M5 10H22V24C22 26.5 20 28 17.5 28H9.5C7 28 5 26.5 5 24V10Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M22 13H25C27 13 28 15 28 17C28 19 27 21 25 21H22"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M10 5C10 5 10.5 7 11.5 7C12.5 7 13 5 13 5"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15 5C15 5 15.5 7 16.5 7C17.5 7 18 5 18 5"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </IconBase>
);

// ─── Face / expression icons ─────────────────────────

export const SmileIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={A} stroke={S} strokeWidth="3" />
    <circle cx="12" cy="14" r="1.8" fill={S} />
    <circle cx="20" cy="14" r="1.8" fill={S} />
    <path
      d="M11 20C12 22 14 23 16 23C18 23 20 22 21 20"
      fill="none"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </IconBase>
);

export const MehIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={A} stroke={S} strokeWidth="3" />
    <circle cx="12" cy="14" r="1.8" fill={S} />
    <circle cx="20" cy="14" r="1.8" fill={S} />
    <path d="M11 21H21" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const FrownIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={A} stroke={S} strokeWidth="3" />
    <circle cx="12" cy="14" r="1.8" fill={S} />
    <circle cx="20" cy="14" r="1.8" fill={S} />
    <path
      d="M11 23C12 21 14 20 16 20C18 20 20 21 21 23"
      fill="none"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </IconBase>
);

export const MoonIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M24 18C24 24 19 28 13 28C8 28 4 24.5 4 19C4 13 8 9 14 9C12 12 12.5 16 15 19C17.5 22 21 23 24 22Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const SunIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="7" fill={A} stroke={S} strokeWidth="3" />
    <path
      d="M16 4V7M16 25V28M4 16H7M25 16H28M7.5 7.5L9.5 9.5M22.5 22.5L24.5 24.5M24.5 7.5L22.5 9.5M9.5 22.5L7.5 24.5"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </IconBase>
);

// ─── PROMISE CARD ICONS ─────────────────────────────

export const FilmIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="6"
      width="24"
      height="20"
      rx="4"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M4 11H28M4 21H28" stroke={S} strokeWidth="1.5" />
    <path d="M10 6V11M10 21V26M22 6V11M22 21V26" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const CompassIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={Sc} stroke={S} strokeWidth="3" />
    <path
      d="M12 20L14 14L20 12L18 18L12 20Z"
      fill={P}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const SofaIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M6 14V22H26V14"
      fill={P}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 14C4 12 5.5 11 7 11V14H4Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M28 14C28 12 26.5 11 25 11V14H28Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect x="10" y="10" width="12" height="7" rx="3" fill={A} stroke={S} strokeWidth="2" />
    <path d="M8 22V26M24 22V26" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const HandIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M8 12V20C8 25 11 28 16 28C21 28 24 25 24 20V12"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity=".35"
    />
    <path
      d="M16 3V18M12 7V18M20 7V18M8 12V20C8 25 11 28 16 28C21 28 24 25 24 20V12"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const CarIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M5 20V24C5 25.5 6 26 7.5 26H9M23 26H24.5C26 26 27 25.5 27 24V20L24 13H8L5 20Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M8 13L10 8H22L24 13" fill={A} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="9.5" cy="23" r="2.5" fill={A} stroke={S} strokeWidth="2" />
    <circle cx="22.5" cy="23" r="2.5" fill={A} stroke={S} strokeWidth="2" />
  </IconBase>
);

export const GiftIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="12"
      width="24"
      height="16"
      rx="4"
      fill={P}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <rect
      x="3"
      y="12"
      width="26"
      height="6"
      rx="3"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M16 12V28" stroke={S} strokeWidth="2" />
    <path
      d="M16 12C16 12 12 6 9 6C7 6 6 7.5 7 9C8 10.5 16 12 16 12Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M16 12C16 12 20 6 23 6C25 6 26 7.5 25 9C24 10.5 16 12 16 12Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const MusicIcon = (props) => (
  <IconBase {...props}>
    <circle cx="9" cy="24" r="4" fill={P} stroke={S} strokeWidth="2.5" />
    <circle cx="23" cy="22" r="4" fill={P} stroke={S} strokeWidth="2.5" />
    <path
      d="M13 24V8L27 5V22"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const BookOpenIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 8C16 8 13 5 7 5C5 5 4 6 4 8V24C4 25.5 5 26 7 26C13 26 16 28 16 28C16 28 19 26 25 26C27 26 28 25.5 28 24V8C28 6 27 5 25 5C19 5 16 8 16 8Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M16 8V28" stroke={S} strokeWidth="2" />
  </IconBase>
);

export const PalmtreeIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 14V28" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M16 14C16 14 8 10 6 6C10 7 16 10 16 14Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M16 14C16 14 24 10 26 6C22 7 16 10 16 14Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M16 12C16 12 12 5 16 3C20 5 16 12 16 12Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const Gamepad2Icon = (props) => (
  <IconBase {...props}>
    <path
      d="M6 12H26C27.5 12 28.5 13.5 28.5 15V21C28.5 23.5 26.5 25 24.5 25H7.5C5.5 25 3.5 23.5 3.5 21V15C3.5 13.5 4.5 12 6 12Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M12 16V22M9 19H15" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="21" cy="17" r="1.8" fill={P} stroke={S} strokeWidth="1.5" />
    <circle cx="24" cy="20" r="1.8" fill={A} stroke={S} strokeWidth="1.5" />
  </IconBase>
);

export const Flower2Icon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="14" r="4" fill={A} stroke={S} strokeWidth="2.5" />
    <path
      d="M16 10C16 10 14 4 16 3C18 4 16 10 16 10Z"
      fill={P}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 11.5C12.5 11.5 7 8.5 6 10C6.5 12 12.5 11.5 12.5 11.5Z"
      fill={P}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 16.5C12.5 16.5 7 19.5 6 18C6.5 16 12.5 16.5 12.5 16.5Z"
      fill={P}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 11.5C19.5 11.5 25 8.5 26 10C25.5 12 19.5 11.5 19.5 11.5Z"
      fill={P}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 16.5C19.5 16.5 25 19.5 26 18C25.5 16 19.5 16.5 19.5 16.5Z"
      fill={P}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M16 18V28" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
  </IconBase>
);

export const SparklesIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 3L18.5 12L27 14.5L18.5 17L16 26L13.5 17L5 14.5L13.5 12L16 3Z"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M25 5L26 8L29 9L26 10L25 13L24 10L21 9L24 8L25 5Z"
      fill={P}
      stroke={S}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const TargetIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={Sc} stroke={S} strokeWidth="3" />
    <circle cx="16" cy="16" r="7.5" fill={A} stroke={S} strokeWidth="2" />
    <circle cx="16" cy="16" r="3" fill={P} stroke={S} strokeWidth="2" />
  </IconBase>
);

export const TicketIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M4 10C4 8 5.5 7 7.5 7H24.5C26.5 7 28 8 28 10V13.5C26 13.5 25 14.8 25 16C25 17.2 26 18.5 28 18.5V22C28 24 26.5 25 24.5 25H7.5C5.5 25 4 24 4 22V18.5C6 18.5 7 17.2 7 16C7 14.8 6 13.5 4 13.5V10Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M18 7V25" stroke={S} strokeWidth="1.5" strokeDasharray="3 2" />
  </IconBase>
);

// ─── FEATURES / MISC ────────────────────────────────

export const StarIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 5.5L19 12H26.5L20.5 16.5L23 24L16 19.5L9 24L11.5 16.5L5.5 12H13Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const FlameIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 3C16 3 8 10 8 18C8 23.5 11.5 28 16 28C20.5 28 24 23.5 24 18C24 10 16 3 16 3Z"
      fill={P}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 16C16 16 13 19 13 22C13 24 14.5 26 16 26C17.5 26 19 24 19 22C19 19 16 16 16 16Z"
      fill={A}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const DropletsIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M11 8C11 8 6 14 6 18.5C6 22 8.2 24.5 11 24.5C13.8 24.5 16 22 16 18.5C16 14 11 8 11 8Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M22 14C22 14 19 18 19 20.5C19 22.5 20.3 24 22 24C23.7 24 25 22.5 25 20.5C25 18 22 14 22 14Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const TrophyIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M10 5H22V14C22 18.5 19.5 21 16 21C12.5 21 10 18.5 10 14V5Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M10 8H7C5.5 8 4.5 9.5 5 11L7 15C7.5 16 8.5 16.5 10 16"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 8H25C26.5 8 27.5 9.5 27 11L25 15C24.5 16 23.5 16.5 22 16"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M13 21V24H19V21" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 24H22" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const SnowflakeIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 3V29M5 10L27 22M27 10L5 22" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
    <path
      d="M16 3L13 6M16 3L19 6M16 29L13 26M16 29L19 26"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M5 10L8.5 10.5M5 10L6.5 13M27 22L23.5 21.5M27 22L25.5 19"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M27 10L23.5 10.5M27 10L25.5 13M5 22L8.5 21.5M5 22L6.5 19"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </IconBase>
);

export const UsersIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="11" r="5" fill={P} stroke={S} strokeWidth="2.5" />
    <path
      d="M4 27C4 22 7 18 12 18C17 18 20 22 20 27"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="22" cy="12" r="4" fill={A} stroke={S} strokeWidth="2.5" />
    <path
      d="M20 27C20 23 22 20 25 19.5"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </IconBase>
);

export const ShieldIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 3L5 8V16C5 22 9.5 27 16 29C22.5 27 27 22 27 16V8L16 3Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M12 16L15 19L21 13"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const LockIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="6"
      y="14"
      width="20"
      height="14"
      rx="4"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M10 14V10C10 6.5 12.5 4 16 4C19.5 4 22 6.5 22 10V14"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="16" cy="21" r="2" fill={S} />
  </IconBase>
);

export const EyeIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M4 16C4 16 8 8 16 8C24 8 28 16 28 16C28 16 24 24 16 24C8 24 4 16 4 16Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="4.5" fill={A} stroke={S} strokeWidth="2.5" />
    <circle cx="16" cy="16" r="2" fill={S} />
  </IconBase>
);

export const EyeOffIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M4 16C4 16 8 8 16 8C24 8 28 16 28 16C28 16 24 24 16 24C8 24 4 16 4 16Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
      opacity=".35"
    />
    <path d="M6 6L26 26" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const SettingsIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="5.5" fill={A} stroke={S} strokeWidth="2.5" />
    <path
      d="M16 3V6.5M16 25.5V29M3 16H6.5M25.5 16H29M6.8 6.8L9.3 9.3M22.7 22.7L25.2 25.2M25.2 6.8L22.7 9.3M9.3 22.7L6.8 25.2"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </IconBase>
);

export const PaletteIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 4C9 4 4 9.5 4 16C4 22.5 8 28 16 28C18 28 19 27 19 25.5C19 24.5 18.5 24 18.5 23C18.5 21.5 19.5 20.5 21 20.5H23.5C26 20.5 28 18.5 28 16C28 9.5 22.5 4 16 4Z"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="12" r="2.5" fill={P} stroke={S} strokeWidth="1.5" />
    <circle cx="17" cy="10" r="2.5" fill={A} stroke={S} strokeWidth="1.5" />
    <circle cx="22" cy="14.5" r="2.5" fill={Sc} stroke={S} strokeWidth="1.5" opacity=".6" />
    <circle cx="11" cy="19" r="2.5" fill={P} stroke={S} strokeWidth="1.5" opacity=".6" />
  </IconBase>
);

export const SwatchBookIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="4"
      y="4"
      width="10"
      height="24"
      rx="3"
      fill={P}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect
      x="14"
      y="8"
      width="14"
      height="20"
      rx="3"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="23" r="2" fill={A} stroke={S} strokeWidth="1.5" />
    <path d="M18 14H24M18 19H22" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
  </IconBase>
);

export const LightbulbIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 4C11 4 7 8 7 13C7 16.5 9 19 11 21V24H21V21C23 19 25 16.5 25 13C25 8 21 4 16 4Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M12 27H20" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M13 24V21M19 24V21" stroke={S} strokeWidth="1.5" strokeLinecap="round" />
  </IconBase>
);

export const ZapIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M18 3L7 17H16L14 29L25 15H16L18 3Z"
      fill={A}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ActivityIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M4 16H9L12 6L16 26L20 11L23 16H28"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const BarChart3Icon = (props) => (
  <IconBase {...props}>
    <rect
      x="5"
      y="17"
      width="6"
      height="10"
      rx="2"
      fill={Sc}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect
      x="13"
      y="10"
      width="6"
      height="17"
      rx="2"
      fill={P}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect
      x="21"
      y="5"
      width="6"
      height="22"
      rx="2"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ClockIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={Sc} stroke={S} strokeWidth="3" />
    <path
      d="M16 9V16L20.5 20.5"
      fill="none"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const MapPinIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 3C10.5 3 6 7.5 6 13C6 20 16 29 16 29C16 29 26 20 26 13C26 7.5 21.5 3 16 3Z"
      fill={P}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="13" r="4" fill={A} stroke={S} strokeWidth="2" />
  </IconBase>
);

export const MenuIcon = (props) => (
  <IconBase {...props}>
    <path d="M6 10H26" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path d="M6 16H26" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path d="M6 22H26" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const AlertCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={A} stroke={S} strokeWidth="3" />
    <path d="M16 10V17" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <circle cx="16" cy="22" r="1.8" fill={S} />
  </IconBase>
);

export const AlertTriangleIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 4L3 27H29L16 4Z" fill={A} stroke={S} strokeWidth="3" strokeLinejoin="round" />
    <path d="M16 13V19" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <circle cx="16" cy="23" r="1.8" fill={S} />
  </IconBase>
);

export const BugIcon = (props) => (
  <IconBase {...props}>
    <ellipse cx="16" cy="19" rx="7" ry="8" fill={Sc} stroke={S} strokeWidth="3" />
    <circle cx="16" cy="10" r="4.5" fill={P} stroke={S} strokeWidth="2.5" />
    <path
      d="M6 16H10M22 16H26M7 22H10M22 22H25M9 11H7M23 11H25"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </IconBase>
);

export const SmartphoneIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="8"
      y="3"
      width="16"
      height="26"
      rx="4"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path d="M14 25H18" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 8H24" stroke={S} strokeWidth="1.5" />
  </IconBase>
);

export const MonitorIcon = (props) => (
  <IconBase {...props}>
    <rect
      x="3"
      y="4"
      width="26"
      height="18"
      rx="4"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M12 22V26H20V22"
      stroke={S}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 26H23" stroke={S} strokeWidth="2.5" strokeLinecap="round" />
  </IconBase>
);

export const WifiOffIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M4 11C7.5 7.5 12 5.5 16 5.5C20 5.5 24.5 7.5 28 11"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      opacity=".3"
    />
    <path
      d="M8 16C10 14 13 12 16 12C19 12 22 14 24 16"
      fill="none"
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      opacity=".3"
    />
    <circle cx="16" cy="23" r="2.5" fill={S} />
    <path d="M5 5L27 27" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const CloudOffIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M10 26H9C5.5 26 3 23.5 3 20.5C3 17.5 5 15.5 8 15C8.5 11 11.5 8 15.5 8C18 8 20 9.5 21.5 11.5C22 11 23 10.5 24 10.5C27 10.5 29 13 29 15.5C29 18 27.5 20 25 20.5"
      fill={Sc}
      stroke={S}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity=".3"
    />
    <path d="M5 5L27 27" stroke={S} strokeWidth="3" strokeLinecap="round" />
  </IconBase>
);

export const RepeatIcon = (props) => (
  <IconBase {...props}>
    <path d="M6 10H24" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path d="M21 5L27 10L21 15Z" fill={Sc} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M26 22H8" stroke={S} strokeWidth="3" strokeLinecap="round" />
    <path d="M11 17L5 22L11 27Z" fill={Sc} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
  </IconBase>
);

export const PartyPopperIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M5 27L10 12L20 22L5 27Z"
      fill={A}
      stroke={S}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M12 18L14 16" stroke={S} strokeWidth="2" strokeLinecap="round" />
    <circle cx="22" cy="6" r="2" fill={P} stroke={S} strokeWidth="1.5" />
    <circle cx="27" cy="12" r="1.5" fill={Sc} stroke={S} strokeWidth="1.5" />
    <circle cx="25" cy="18" r="2" fill={A} stroke={S} strokeWidth="1.5" />
    <path d="M17 5L18 8M24 8L22 10M26 15L23 15" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

// ─── SPARK ──────────────────────────────────────────

export const SparkIcon = (props) => (
  <IconBase {...props}>
    <path
      d="M16 3L19.3 11.4L28 16L19.3 20.6L16 29L12.7 20.6L4 16L12.7 11.4Z"
      fill={Sc}
      stroke={S}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="4" fill={P} opacity="0.6" />
  </IconBase>
);

export const QuestionMarkIcon = (props) => (
  <IconBase {...props}>
    <circle cx="16" cy="16" r="12" fill={Sc} stroke={S} strokeWidth="2" />
    <path
      d="M12.5 12.5C12.5 10.5 14 9 16 9C18 9 19.5 10.5 19.5 12.5C19.5 14.5 17.5 15 16 16.5V18.5"
      stroke={S}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="16" cy="22.5" r="1.3" fill={P} />
  </IconBase>
);

// ─── ICON MAP ───────────────────────────────────────

const iconMap = {
  Activity: ActivityIcon,
  AlertCircle: AlertCircleIcon,
  AlertTriangle: AlertTriangleIcon,
  ArrowDown: ArrowDownIcon,
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  BarChart3: BarChart3Icon,
  Bell: BellIcon,
  BellOff: BellOffIcon,
  BookOpen: BookOpenIcon,
  BrandMark: BrandMarkIcon,
  Bug: BugIcon,
  Calendar: CalendarIcon,
  CalendarHeart: CalendarHeartIcon,
  Car: CarIcon,
  Check: CheckIcon,
  CheckCircle: CheckCircleIcon,
  CheckSquare: CheckSquareIcon,
  ChefHat: ChefHatIcon,
  ChevronDown: ChevronDownIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronUp: ChevronUpIcon,
  Clock: ClockIcon,
  CloudOff: CloudOffIcon,
  Coffee: CoffeeIcon,
  Compass: CompassIcon,
  Download: DownloadIcon,
  Droplets: DropletsIcon,
  Eye: EyeIcon,
  EyeOff: EyeOffIcon,
  Film: FilmIcon,
  Flame: FlameIcon,
  Flower2: Flower2Icon,
  Frown: FrownIcon,
  Gamepad2: Gamepad2Icon,
  Gift: GiftIcon,
  Hand: HandIcon,
  Heart: HeartIcon,
  Home: HomeIcon,
  Inbox: InboxIcon,
  LayoutGrid: LayoutGridIcon,
  Lightbulb: LightbulbIcon,
  ListChecks: ListChecksIcon,
  Lock: LockIcon,
  LogOut: LogOutIcon,
  Mail: MailIcon,
  MapPin: MapPinIcon,
  Menu: MenuIcon,
  Meh: MehIcon,
  MessageCircle: MessageCircleIcon,
  MessageSquareText: MessageSquareTextIcon,
  Monitor: MonitorIcon,
  Moon: MoonIcon,
  Music: MusicIcon,
  Palmtree: PalmtreeIcon,
  Palette: PaletteIcon,
  PartyPopper: PartyPopperIcon,
  Pencil: PencilIcon,
  PenLine: PenLineIcon,
  Pizza: PizzaIcon,
  Plus: PlusIcon,
  RefreshCw: RefreshCwIcon,
  Repeat: RepeatIcon,
  RotateCcw: RotateCcwIcon,
  Save: SaveIcon,
  Send: SendIcon,
  Settings: SettingsIcon,
  Share: ShareIcon,
  Shield: ShieldIcon,
  ShoppingCart: ShoppingCartIcon,
  Smartphone: SmartphoneIcon,
  Smile: SmileIcon,
  Snowflake: SnowflakeIcon,
  Sofa: SofaIcon,
  Sparkles: SparklesIcon,
  Star: StarIcon,
  StickyNote: StickyNoteIcon,
  Sun: SunIcon,
  SwatchBook: SwatchBookIcon,
  Target: TargetIcon,
  Ticket: TicketIcon,
  Trash2: Trash2Icon,
  Trophy: TrophyIcon,
  Undo2: Undo2Icon,
  User: UserIcon,
  User2: User2Icon,
  Users: UsersIcon,
  UtensilsCrossed: UtensilsCrossedIcon,
  WifiOff: WifiOffIcon,
  X: XIcon,
  XCircle: XCircleIcon,
  Zap: ZapIcon,
  Spark: SparkIcon,
  QuestionMark: QuestionMarkIcon,
};

/**
 * Universal icon component — drop-in replacement for lucide-react.
 *
 * Usage:
 *   <PearIcon name="Heart" size={24} />
 *   <PearIcon name="LogOut" size={20} color="hsl(var(--destructive))" />
 */
export const PearIcon = ({ name, size = 24, color, className = '', ...props }) => {
  const Icon = iconMap[name];
  if (!Icon) {
    console.warn(`PearIcon: "${name}" not found`);
    return null;
  }
  return <Icon size={size} color={color} className={className} {...props} />;
};

export default PearIcon;
export { iconMap };
