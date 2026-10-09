import { useMediaQuery } from '@/hooks/useMediaQuery';
import { IPhoneFrame, PHONE_LOGICAL_WIDTH } from '@/pages/landing/components/phone/IPhoneFrame';
import { PearHomeScreen } from '@/pages/landing/components/phone/PearHomeScreen';
import {
  buildCelineData,
  buildJesseData,
  HERO_PHONE_MAX_SCALE,
  HERO_PHONE_MAX_WIDTH,
  HERO_SPARK,
  usePhoneMockLayout,
} from '@/pages/landing/components/phone/phoneMock.shared';
import { cn } from '@/lib/utils';

function PhoneUnit({
  children,
  width,
  phoneHeight,
  shellRadius,
  scale,
  className,
  style,
  dataPhone,
}) {
  return (
    <div
      data-hero-phone-unit={dataPhone}
      className={cn('flex flex-col items-center', className)}
      style={{ width, ...style }}
    >
      <div
        className="relative isolate overflow-hidden bg-[#1d1d1f] shadow-[0_24px_64px_-20px_hsl(var(--seasonal-primary)/0.35)]"
        style={{ width, height: phoneHeight, borderRadius: shellRadius }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: PHONE_LOGICAL_WIDTH, transform: `scale(${scale})` }}
        >
          <IPhoneFrame>{children}</IPhoneFrame>
        </div>
      </div>
    </div>
  );
}

function HeroPhoneSolo() {
  const { containerRef, layout } = usePhoneMockLayout({
    maxWidth: 300,
    maxScale: 0.62,
    solo: true,
  });
  const jesseData = buildJesseData(HERO_SPARK);
  const { scale, phoneWidth, phoneHeight, shellRadius, stageHeight } = layout;

  return (
    <div className="relative mx-auto w-full max-w-[300px]" aria-hidden>
      <div
        className="hero-phone-glow pointer-events-none absolute left-1/2 top-[42%] -z-10 aspect-square w-[min(100%,14rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--seasonal-primary)/0.28)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        ref={containerRef}
        className="relative mx-auto flex justify-center overflow-visible"
        style={{ height: stageHeight }}
      >
        <PhoneUnit
          dataPhone="front"
          width={phoneWidth}
          phoneHeight={phoneHeight}
          shellRadius={shellRadius}
          scale={scale}
          className="relative"
        >
          <PearHomeScreen demo={jesseData} />
        </PhoneUnit>
      </div>
    </div>
  );
}

function HeroPhoneDuo() {
  const { containerRef, layout } = usePhoneMockLayout({
    maxWidth: HERO_PHONE_MAX_WIDTH,
    maxScale: HERO_PHONE_MAX_SCALE,
  });
  const jesseData = buildJesseData(HERO_SPARK);
  const celineData = buildCelineData(HERO_SPARK);
  const { scale, phoneWidth, phoneHeight, shellRadius, rightLeft, rightTop, stageHeight } = layout;

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[540px] overflow-visible" aria-hidden>
      <div
        className="hero-phone-glow pointer-events-none absolute left-1/2 top-[44%] -z-10 aspect-square w-[min(100%,17rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--seasonal-primary)/0.22)_0%,transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[8%] left-1/2 -z-10 h-8 w-[52%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(var(--seasonal-primary)/0.1)_0%,transparent_72%)]"
        aria-hidden
      />
      <div
        ref={containerRef}
        className="relative mx-auto w-full overflow-visible"
        style={{ height: stageHeight }}
      >
        <PhoneUnit
          dataPhone="front"
          width={phoneWidth}
          phoneHeight={phoneHeight}
          shellRadius={shellRadius}
          scale={scale}
          className="absolute left-0 top-0 z-10"
        >
          <PearHomeScreen demo={jesseData} />
        </PhoneUnit>
        <PhoneUnit
          dataPhone="back"
          width={phoneWidth}
          phoneHeight={phoneHeight}
          shellRadius={shellRadius}
          scale={scale}
          className="absolute z-0"
          style={{ left: rightLeft, top: rightTop }}
        >
          <PearHomeScreen demo={celineData} />
        </PhoneUnit>
      </div>
    </div>
  );
}

export function HeroPhoneMock() {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  return isMobile ? <HeroPhoneSolo /> : <HeroPhoneDuo />;
}
