import { cn } from '@/lib/utils';

/** iPhone 15 Pro logical width — scaled fluidly in HeroPhoneMock */
export const PHONE_LOGICAL_WIDTH = 393;
export const PHONE_SHELL_PADDING = 10;
export const PHONE_SHELL_RADIUS = 54;
export const PHONE_SCREEN_ASPECT = 19.5 / 9;

export function getPhoneLogicalHeight() {
  const screenWidth = PHONE_LOGICAL_WIDTH - PHONE_SHELL_PADDING * 2;
  return screenWidth * PHONE_SCREEN_ASPECT + PHONE_SHELL_PADDING * 2;
}

export function IPhoneFrame({ children, className }) {
  return (
    <div className={cn('relative', className)} style={{ width: PHONE_LOGICAL_WIDTH }}>
      <div
        aria-hidden
        className="absolute -left-[3px] top-[19%] z-10 h-[26px] w-[4px] rounded-l-sm bg-[#3a3a3c]"
      />
      <div
        aria-hidden
        className="absolute -left-[3px] top-[27%] z-10 h-[46px] w-[4px] rounded-l-sm bg-[#3a3a3c]"
      />
      <div
        aria-hidden
        className="absolute -left-[3px] top-[36%] z-10 h-[46px] w-[4px] rounded-l-sm bg-[#3a3a3c]"
      />
      <div
        aria-hidden
        className="absolute -right-[3px] top-[30%] z-10 h-[64px] w-[4px] rounded-r-sm bg-[#3a3a3c]"
      />

      <div
        className="bg-[#1d1d1f] p-[10px] shadow-[0_24px_48px_-14px_rgba(0,0,0,0.22),0_8px_20px_-8px_rgba(0,0,0,0.12)]"
        style={{ borderRadius: PHONE_SHELL_RADIUS }}
      >
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[44px] bg-white">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[12px] z-20 h-[28px] w-[90px] -translate-x-1/2 rounded-full bg-black"
          />
          {children}
        </div>
      </div>
    </div>
  );
}
