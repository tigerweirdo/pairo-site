import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ensureGsapRegistered, gsap, prefersReducedMotion } from '@/lib/gsap';
import { scheduleScrollTriggerRefresh, subscribePageProgress } from '@/lib/scroll';
import { PearBrandMarkPaths } from '@/icons/PearBrandMark';

ensureGsapRegistered();

/**
 * Marka armut-çiftinin (PEAR_MARK_LAYERS) birleşik bbox'ı — pear-icon.svg'den türetilir.
 * Finali normalize etmek için: tepe-ortası (0,0)'a, gövde aşağı doğru birim boya ölçeklenir.
 */
const PEAR_MARK_MIN_X = 196.99;
const PEAR_MARK_MAX_X = 1426.81;
const PEAR_MARK_MIN_Y = 388.09;
const PEAR_MARK_MAX_Y = 1669.88;
const PEAR_MARK_CX = (PEAR_MARK_MIN_X + PEAR_MARK_MAX_X) / 2;
const PEAR_MARK_H = PEAR_MARK_MAX_Y - PEAR_MARK_MIN_Y;
/** Tepe-ortası → (0,0), yükseklik → 1 birim. */
const PEAR_MARK_TRANSFORM = `scale(${(1 / PEAR_MARK_H).toFixed(6)}) translate(${(-PEAR_MARK_CX).toFixed(2)} ${(-PEAR_MARK_MIN_Y).toFixed(2)})`;

const STEM_Y_START = 44;
/** Footer öncesi boşluk — armut finali için yer. */
const STEM_Y_END_PAD = 120;
const SAMPLE_STEP = 7;
/** Armudun olgunlaşmaya başladığı reveal oranı. */
const PEAR_START = 0.9;
/**
 * Süsler, çizim ucu noktayı GEÇTİKTEN biraz sonra belirir (lag) — asla önce.
 * Değerler scroll oranı; ~0.01 ≈ bir ekranın küçük bir kısmı.
 */
const LEAF_LAG = 0.006;
const LEAF_WINDOW = 0.04;
const SPRIG_LAG = 0.004;
/** Yan dal hızlı çizilir → yaprakları reveal ucu hâlâ oradayken (görünürken) açılır. */
const BRANCH_WINDOW = 0.014;
/** Sülük biraz daha yavaş "sarılır". */
const TENDRIL_WINDOW = 0.03;
const LEAF_T_START = 0.16;
const LEAF_T_END = 0.82;
const HEAD_FADE = 0.05;
const PEAR_POP_AT = 0.995;
const RESIZE_DEBOUNCE_MS = 220;
const SETTLE_EPS = 0.00025;
const VEL_IDLE_EPS = 0.0004;

const GRAD_ID = 'pear-stem-gradient';
const LEAF_GRAD_ID = 'pear-stem-leaf-gradient';
const BUD_GRAD_ID = 'pear-stem-bud-gradient';
const REVEAL_ID = 'pear-stem-reveal';

/** Desktop = cömert kenar boşluğunda gezen dal · mobil = kenara yapışık ince hâli. */
const VARIANT = {
  wide: {
    centerX: 66,
    width: 172,
    meanderAmp: 15,
    stroke: 3.4,
    vineTop: 7,
    vineTip: 2.4,
    leafScale: 1.1,
    pearPx: 84,
    baseAlpha: 1,
    leafSpacing: 440,
    alternate: true,
    branches: 5,
    branchScale: 1.05,
    tendrils: 3,
    tendrilScale: 1,
    seed: 0x51ed21,
  },
  compact: {
    centerX: 28,
    width: 84,
    meanderAmp: 9,
    stroke: 2.6,
    vineTop: 5,
    vineTip: 1.9,
    leafScale: 0.68,
    pearPx: 54,
    baseAlpha: 0.62,
    leafSpacing: 560,
    alternate: false,
    branches: 3,
    branchScale: 0.7,
    tendrils: 1,
    tendrilScale: 0.7,
    seed: 0x77a13b,
  },
};

/** Sivri uçlu, damarlı yaprak. */
const LEAF_BODY = 'M0,0 C9,-9 22,-10 31,-1 C22,8 9,8 0,0 Z';
const LEAF_VEINS = 'M2,0 L29,-1 M8,-1.5 L13,-6 M8,1.5 L13,5.5 M16,-2.5 L21,-6.5 M16,2.5 L21,5.5';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(x) {
  return x * x * (3 - 2 * x);
}

/** Seeded PRNG (mulberry32) — desen deterministik, prerender ile tutarlı. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;
/** Piksel-tabanlı çok-oktavlı kıvrım — sayfa boyundan bağımsız, tutarlı sıklıkta. */
const MEANDER_OCTAVES = [
  [1, 540],
  [0.5, 250],
  [0.28, 110],
];

function buildMeander(rng, amp) {
  return MEANDER_OCTAVES.map(([a, len]) => ({ amp: a * amp, len, phase: rng() * TAU }));
}

function meanderAt(m, y) {
  let s = 0;
  for (const o of m) s += o.amp * Math.sin((y / o.len) * TAU + o.phase);
  return s;
}

/** Daldan çıkıp içe doğru sıkılaşan kıvrılma sülüğü (tendril) — bir şeylere dolanır gibi. */
function spiralPath(ax, ay, side, size, rng) {
  const pivot = { x: ax + side * size, y: ay - size * 0.15 };
  const a0 = Math.atan2(ay - pivot.y, ax - pivot.x);
  const sweep = (1.7 + rng() * 0.6) * TAU * side;
  const steps = 30;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps;
    const ang = a0 + sweep * u;
    const rad = size * (1 - 0.72 * u);
    const x = pivot.x + Math.cos(ang) * rad;
    const y = pivot.y + Math.sin(ang) * rad;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d;
}

/** Ana daldan çıkan kısa yan dal — dışa + hafif yukarı (yataya yakın) uzanır; ucunda yaprak.
 *  Yataya yakın olması, reveal ucu o hizadayken oluşmasını → görünür olmasını sağlar. */
function branchPath(ax, ay, side, len) {
  const ex = ax + side * len * 0.82;
  const ey = ay - len * 0.4;
  const c1x = ax + side * len * 0.28;
  const c1y = ay - len * 0.1;
  const c2x = ax + side * len * 0.6;
  const c2y = ay - len * 0.28;
  const d =
    `M${ax.toFixed(1)},${ay.toFixed(1)} C${c1x.toFixed(1)},${c1y.toFixed(1)} ` +
    `${c2x.toFixed(1)},${c2y.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  return { d, tipX: ex, tipY: ey };
}

/** Dalın merkez x'i (gövde + armuda kaynaşan uzantı). */
function vineCenterAt(v, meander, yEnd, ext, exEndX, y) {
  if (y <= yEnd) return v.centerX + meanderAt(meander, y);
  const f = clamp01((y - yEnd) / ext);
  return (v.centerX + meanderAt(meander, yEnd)) * (1 - f) + exEndX * f;
}

/** Üstte kalın → uca incelen dolgulu gövde dış hattı (yuvarlak tepe başlıklı). */
function buildVineFill(v, meander, yStart, yEnd, ext, exEndX) {
  const yEx = yEnd + ext;
  const spanFull = yEx - yStart;
  const hTop = v.vineTop / 2;
  const hTip = v.vineTip / 2;
  const halfAt = (y) => hTop + (hTip - hTop) * clamp01((y - yStart) / spanFull);
  const L = [];
  const R = [];
  for (let y = yStart; y <= yEx + 0.001; y += SAMPLE_STEP) {
    const yy = Math.min(y, yEx);
    const x = vineCenterAt(v, meander, yEnd, ext, exEndX, yy);
    const h = halfAt(yy);
    L.push(`${(x - h).toFixed(1)},${yy.toFixed(1)}`);
    R.push(`${(x + h).toFixed(1)},${yy.toFixed(1)}`);
  }
  R.reverse();
  // Üstte düz kesim yerine yarım daire başlık.
  return `M${L.join(' L')} L${R.join(' L')} A${hTop.toFixed(1)} ${hTop.toFixed(1)} 0 0 0 ${L[0]} Z`;
}

/** Tek dal: incelen gövde, sık damarlı yapraklar, yan dallar, sülükler, armut finali. */
function buildBranchGeometry(container, v) {
  if (!container) return null;

  const height = container.offsetHeight;
  if (!height || height < window.innerHeight * 0.5) return null;

  const yStart = STEM_Y_START;
  const yEnd = height - STEM_Y_END_PAD;
  const span = yEnd - yStart;
  if (span < 200) return null;

  const rng = mulberry32(v.seed);
  const meander = buildMeander(rng, v.meanderAmp);

  const ext = v.pearPx * 0.34;
  const exEndX = v.centerX + meanderAt(meander, yEnd) + v.pearPx * 0.05;
  const yEx = yEnd + ext;
  const spanFull = yEx - yStart;

  const xOf = (y) => v.centerX + meanderAt(meander, y);
  const tOf = (y) => clamp01((y - yStart) / spanFull);

  const dFill = buildVineFill(v, meander, yStart, yEnd, ext, exEndX);

  // Yapraklar — sık ve eşit aralıklı, hafif kayma + boy/açı/ritim çeşitlemesi.
  const leaves = [];
  // delay/dur → her yaprak farklı ritimde esir (deterministik, prerender uyumlu).
  const pushLeaf = (lf) => leaves.push({ delay: -(rng() * 5), dur: 3.2 + rng() * 2.6, ...lf });
  const firstY = yStart + v.leafSpacing * 0.6;
  let li = 0;
  for (let y = firstY; y < yEnd - 70; y += v.leafSpacing, li += 1) {
    const yy = y + (rng() - 0.5) * v.leafSpacing * 0.34;
    const t = tOf(yy);
    if (t < LEAF_T_START || t > LEAF_T_END) continue;
    const side = v.alternate ? (li % 2 === 0 ? -1 : 1) : 1;
    pushLeaf({
      t,
      x: xOf(yy),
      y: yy,
      side,
      rot: (side === 1 ? -22 : 22) + (rng() - 0.5) * 16,
      scale: (0.82 + rng() * 0.4) * v.leafScale,
    });
  }

  // Yan dallar — ana daldan çıkan kısa, yukarı kıvrılan dallar; uçlarında küçük yapraklar.
  const sprigs = [];
  for (let i = 0; i < v.branches; i += 1) {
    const bt = clamp01(0.2 + ((i + 0.5) / v.branches) * 0.58 + (rng() - 0.5) * 0.05);
    const yy = yStart + bt * span;
    const t = tOf(yy);
    const side = i % 2 === 0 ? -1 : 1;
    const len = (38 + rng() * 16) * v.branchScale;
    const ax = xOf(yy);
    const b = branchPath(ax, yy, side, len);
    sprigs.push({ t, d: b.d, w: 0.95, win: BRANCH_WINDOW });
    // Yapraklar dal çizilirken/biter bitmez açılır → reveal ucu hâlâ ekranda, görünür.
    pushLeaf({
      t: t + SPRIG_LAG + BRANCH_WINDOW,
      x: b.tipX,
      y: b.tipY,
      side,
      rot: (side === 1 ? -34 : 34) + (rng() - 0.5) * 14,
      scale: (0.66 + rng() * 0.2) * v.leafScale,
    });
    pushLeaf({
      t: t + SPRIG_LAG + BRANCH_WINDOW * 0.5,
      x: ax + (b.tipX - ax) * 0.55,
      y: yy + (b.tipY - yy) * 0.55,
      side,
      rot: (side === 1 ? -24 : 24) + (rng() - 0.5) * 14,
      scale: (0.52 + rng() * 0.16) * v.leafScale,
    });
  }

  // Kıvrılma sülükleri (tendril) — dal boyunca birkaç yerde, scrollla "sarılarak" çizilir.
  for (let i = 0; i < v.tendrils; i += 1) {
    const yy = yStart + (0.24 + rng() * 0.5) * span;
    const side = rng() < 0.5 ? -1 : 1;
    const size = (13 + rng() * 9) * v.tendrilScale;
    sprigs.push({
      t: tOf(yy),
      d: spiralPath(xOf(yy), yy, side, size, rng),
      w: 0.72,
      win: TENDRIL_WINDOW,
    });
  }

  const pear = { x: xOf(yEnd), y: yEnd };
  const vine = { meander, centerX: v.centerX, yStart, yEnd, ext, exEndX, yEx };

  return { dFill, height, leaves, sprigs, pear, vine };
}

/**
 * Yaşayan tek dal: incelen gövde scrollla yukarıdan büyür, sık damarlı yaprakları
 * uç geçtikçe açar (yapraklar sürekli hafifçe esir), yan dallar ve kıvrılma sülükleri
 * salar, en altta marka armut-çiftinde olgunlaşıp birleşir.
 */
export function PageStem({ containerRef }) {
  const wide = useMediaQuery('(min-width: 1024px)');
  const variant = wide ? VARIANT.wide : VARIANT.compact;
  const [geom, setGeom] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [sprigs, setSprigs] = useState([]);
  const revealRectRef = useRef(null);
  const headRef = useRef(null);
  const pearRef = useRef(null);
  const leafRefs = useRef([]);
  const leafDataRef = useRef([]);
  const sprigRefs = useRef([]);
  const sprigDataRef = useRef([]);
  const sprigLenRef = useRef([]);
  const targetDrawRef = useRef(0);
  const lastDrawRef = useRef(0);
  const scrollVelRef = useRef(0);
  const pearPulseRef = useRef(0);
  const tickerRef = useRef(null);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) {
      setGeom(null);
      return undefined;
    }

    let timeoutId = 0;

    const build = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const next = buildBranchGeometry(containerRef.current, variant);
        setGeom((prev) => {
          if (prev && next && prev.dFill === next.dFill && prev.height === next.height) return prev;
          if (next) {
            leafDataRef.current = next.leaves;
            sprigDataRef.current = next.sprigs;
            scheduleScrollTriggerRefresh();
          }
          return next;
        });
        setLeaves(next ? next.leaves : []);
        setSprigs(next ? next.sprigs : []);
      }, RESIZE_DEBOUNCE_MS);
    };

    build();

    const observer = new ResizeObserver(build);
    observer.observe(container);

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [containerRef, variant]);

  useEffect(() => {
    if (!geom) return undefined;

    const { baseAlpha, stroke } = variant;
    const { meander, centerX, yStart, yEnd, ext, exEndX, yEx } = geom.vine;
    const spanFull = yEx - yStart;
    const hTop = variant.vineTop / 2;
    const hTip = variant.vineTip / 2;
    const halfAt = (y) => hTop + (hTip - hTop) * clamp01((y - yStart) / spanFull);
    const cAt = (y) => vineCenterAt({ centerX }, meander, yEnd, ext, exEndX, y);

    let unsub = null;
    let cancelled = false;

    const stopTicker = () => {
      if (!tickerRef.current) return;
      gsap.ticker.remove(tickerRef.current);
      tickerRef.current = null;
    };

    const ensureTicker = () => {
      if (tickerRef.current) return;
      tickerRef.current = paint;
      gsap.ticker.add(paint);
    };

    const setHead = (d, revealY) => {
      const head = headRef.current;
      if (!head) return;
      const fade = clamp01((PEAR_START - d) / HEAD_FADE);
      if (d <= 0.002 || fade <= 0) {
        head.style.opacity = '0';
        return;
      }
      head.setAttribute('cx', cAt(revealY).toFixed(2));
      head.setAttribute('cy', revealY.toFixed(2));
      head.setAttribute('r', (halfAt(revealY) + stroke * 0.55).toFixed(2));
      head.style.opacity = String(clamp01(d * 30) * 0.9 * fade * baseAlpha);
    };

    const render = (d, pulse) => {
      const revealY = yStart + d * spanFull;
      const rect = revealRectRef.current;
      if (rect) rect.setAttribute('height', Math.max(0, revealY).toFixed(1));

      setHead(d, revealY);

      leafDataRef.current.forEach((lf, i) => {
        const node = leafRefs.current[i];
        if (!node) return;
        const grow = clamp01((d - lf.t - LEAF_LAG) / LEAF_WINDOW);
        const pop = grow <= 0 ? 0 : grow >= 1 ? 1 : grow * (1 + 0.18 * Math.sin(grow * Math.PI));
        node.style.setProperty('--lf-grow', pop.toFixed(3));
        node.style.opacity = String(clamp01(grow * 1.3) * baseAlpha);
      });

      sprigDataRef.current.forEach((sp, i) => {
        const node = sprigRefs.current[i];
        const len = sprigLenRef.current[i];
        if (!node || !len) return;
        const draw = clamp01((d - sp.t - SPRIG_LAG) / sp.win);
        node.style.setProperty('--stem-offset', String(len * (1 - draw)));
        node.style.opacity = String(clamp01(draw * 2.4) * 0.9 * baseAlpha);
      });

      const pear = pearRef.current;
      if (pear) {
        const pp = clamp01((d - PEAR_START) / (1 - PEAR_START));
        const grow = smoothstep(pp);
        pear.style.setProperty('--pear-grow', grow.toFixed(3));
        pear.style.setProperty('--pear-pop', (1 + pulse * 0.14).toFixed(3));
        pear.style.opacity = String(grow * baseAlpha);
      }
    };

    const paint = () => {
      // Lenis scroll'u zaten yumuşatıyor → reveal'i progress'e birebir kilitle.
      const target = targetDrawRef.current;
      const delta = target - lastDrawRef.current;
      scrollVelRef.current = scrollVelRef.current * 0.8 + delta * 0.2;

      // Armut tam olgunlaşınca bir kez tatlı bir "yerine oturma" sıçraması (sonra durur).
      if (lastDrawRef.current < PEAR_POP_AT && target >= PEAR_POP_AT) pearPulseRef.current = 1;
      lastDrawRef.current = target;
      pearPulseRef.current *= 0.9;

      // İdle olunca ticker tamamen durur (en altta bile) → sıfır CPU.
      const moving =
        Math.abs(delta) > SETTLE_EPS ||
        Math.abs(scrollVelRef.current) > VEL_IDLE_EPS ||
        pearPulseRef.current > 0.02;

      if (!moving) {
        stopTicker();
        return;
      }

      render(target, pearPulseRef.current);
    };

    const bind = () => {
      if (cancelled) return;

      const sprigNodes = sprigRefs.current.filter(Boolean);
      if (sprigNodes.length && !sprigNodes[0].getTotalLength()) {
        requestAnimationFrame(bind);
        return;
      }
      sprigRefs.current.forEach((node, i) => {
        if (!node) return;
        const sl = node.getTotalLength();
        sprigLenRef.current[i] = sl;
        node.style.setProperty('--stem-length', String(sl));
        node.style.setProperty('--stem-offset', String(sl));
      });

      if (prefersReducedMotion()) {
        targetDrawRef.current = 1;
        lastDrawRef.current = 1;
        render(1, 0);
        return;
      }

      unsub = subscribePageProgress((progress) => {
        targetDrawRef.current = clamp01(progress);
        ensureTicker();
      });

      ensureTicker();
    };

    bind();

    return () => {
      cancelled = true;
      unsub?.();
      stopTicker();
    };
  }, [geom, variant]);

  if (!geom) return null;

  return (
    <svg
      aria-hidden
      width={variant.width}
      height={geom.height}
      viewBox={`0 0 ${variant.width} ${geom.height}`}
      className="page-stem-svg pointer-events-none absolute left-0 top-0 z-[1] overflow-visible"
    >
      <defs>
        <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="hsl(var(--seasonal-primary))" />
          <stop offset="55%" stopColor="var(--seasonal-color-main)" />
          <stop
            offset="100%"
            stopColor="hsl(var(--seasonal-primary-dark, var(--seasonal-primary)))"
          />
        </linearGradient>
        <linearGradient id={LEAF_GRAD_ID} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="hsl(var(--seasonal-primary) / 0.55)" />
          <stop offset="100%" stopColor="hsl(var(--seasonal-primary) / 0.26)" />
        </linearGradient>
        <radialGradient id={BUD_GRAD_ID} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="hsl(var(--seasonal-primary))" />
          <stop offset="60%" stopColor="hsl(var(--seasonal-primary))" />
          <stop offset="100%" stopColor="hsl(var(--seasonal-primary) / 0)" />
        </radialGradient>
        <clipPath id={REVEAL_ID}>
          <rect ref={revealRectRef} x="0" y="0" width={variant.width} height="0" />
        </clipPath>
      </defs>

      {/* İncelen gövde — scrollla yukarıdan aşağı açığa çıkar (clip reveal). */}
      <path
        className="page-stem-vine"
        d={geom.dFill}
        fill={`url(#${GRAD_ID})`}
        clipPath={`url(#${REVEAL_ID})`}
      />

      {/* Yan dallar + kıvrılma sülükleri — scrollla sarılarak çizilir. */}
      {sprigs.map((sp, i) => (
        <path
          key={`sprig-${sp.t}-${i}`}
          ref={(node) => {
            sprigRefs.current[i] = node;
          }}
          className="page-stem-sprig"
          d={sp.d}
          fill="none"
          stroke={`url(#${GRAD_ID})`}
          strokeWidth={variant.stroke * sp.w}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0 }}
        />
      ))}

      {/* Yapraklar — uç geçince açılır (damarlı, iki tonlu). Statik kalır → hafif. */}
      {leaves.map((lf, i) => (
        <g
          key={`leaf-${lf.t}-${i}`}
          className="page-stem-leaf"
          ref={(node) => {
            leafRefs.current[i] = node;
          }}
          style={{
            '--lf-x': `${lf.x.toFixed(1)}px`,
            '--lf-y': `${lf.y.toFixed(1)}px`,
            '--lf-rot': lf.rot.toFixed(1),
            '--lf-side': lf.side,
            '--lf-scale': lf.scale.toFixed(3),
            '--lf-grow': 0,
            opacity: 0,
          }}
        >
          <g
            className="page-stem-leaf-sway"
            style={{ '--lf-delay': `${lf.delay.toFixed(2)}s`, '--lf-dur': `${lf.dur.toFixed(2)}s` }}
          >
            <path
              d={LEAF_BODY}
              fill={`url(#${LEAF_GRAD_ID})`}
              stroke="hsl(var(--seasonal-primary) / 0.6)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d={LEAF_VEINS}
              fill="none"
              stroke="hsl(var(--seasonal-primary) / 0.55)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}

      {/* Büyüyen uç tomurcuğu — reveal kenarında; radial gradient ile filtresiz yumuşak. */}
      <circle
        ref={headRef}
        className="page-stem-head"
        r={variant.stroke}
        fill={`url(#${BUD_GRAD_ID})`}
        style={{ opacity: 0 }}
      />

      {/* Final: dalın ucunda olgunlaşan marka armut-çifti (pear = pair). */}
      <g
        ref={pearRef}
        className="page-stem-pear"
        style={{
          '--pear-x': `${geom.pear.x.toFixed(1)}px`,
          '--pear-y': `${geom.pear.y.toFixed(1)}px`,
          '--pear-scale': variant.pearPx,
          '--pear-grow': 0,
          '--pear-pop': 1,
          opacity: 0,
        }}
      >
        <g transform={PEAR_MARK_TRANSFORM}>
          <PearBrandMarkPaths fill="var(--seasonal-color-main)" detailFill="#ffffff" />
        </g>
      </g>
    </svg>
  );
}
