import {
  CalendarIcon,
  ChevronRightIcon,
  HomeIcon,
  LayoutGridIcon,
  User2Icon,
} from '@/icons/UiIcons';
import { BrandMarkIcon } from '@/components/brand/BrandMarkIcon';
import { cn } from '@/lib/utils';

function truncateText(text, max = 36) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function StatusBar() {
  return (
    <div className="relative z-10 flex h-[54px] shrink-0 items-end justify-between px-5 pb-1.5">
      <span
        className="w-[72px] text-[15px] font-bold tabular-nums leading-none text-foreground"
        style={{ fontWeight: 700 }}
      >
        11:55
      </span>
      <div className="w-[72px]" aria-hidden />
      <div className="flex w-[72px] items-center justify-end gap-1 pb-0.5" aria-hidden>
        <svg
          width="17"
          height="11"
          viewBox="0 0 16 11"
          fill="currentColor"
          className="text-foreground"
        >
          <rect x="0" y="6" width="2.5" height="5" rx="0.5" opacity="0.35" />
          <rect x="4" y="4" width="2.5" height="7" rx="0.5" opacity="0.55" />
          <rect x="8" y="2" width="2.5" height="9" rx="0.5" opacity="0.75" />
          <rect x="12" y="0" width="2.5" height="11" rx="0.5" />
        </svg>
        <svg
          width="15"
          height="11"
          viewBox="0 0 14 11"
          fill="currentColor"
          className="text-foreground"
        >
          <path d="M7 2.2C9.2 2.2 11.1 3.1 12.5 4.6L13.6 3.4C11.9 1.6 9.6 0.5 7 0.5S2.1 1.6 0.4 3.4L1.5 4.6C2.9 3.1 4.8 2.2 7 2.2ZM7 5.2c1.3 0 2.5.5 3.4 1.4l1.1-1.2C10.2 4.8 8.7 4.2 7 4.2S3.8 4.8 2.5 5.4l1.1 1.2c.9-.9 2.1-1.4 3.4-1.4ZM7 8.2c.7 0 1.3.3 1.8.7l1.8-2C9.5 5.8 8.3 5.2 7 5.2S4.5 5.8 3.4 6.9l1.8 2c.5-.4 1.1-.7 1.8-.7Z" />
        </svg>
        <div className="flex h-[11px] min-w-[27px] items-center rounded-[4px] border border-foreground/35 px-[3px]">
          <span className="pr-[2px] text-[9px] font-semibold leading-none text-foreground">79</span>
          <div className="h-[7px] w-[18px] rounded-[2px] bg-foreground" />
        </div>
      </div>
    </div>
  );
}

function GreetingHeader({ name, greeting, dateLine }) {
  return (
    <div className="border-b border-[hsl(var(--seasonal-primary)/0.10)] pb-3 pt-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground" style={{ fontWeight: 500 }}>
            {greeting}
          </p>
          <p
            className="preserve-case text-[26px] font-bold leading-[1.05] tracking-tight text-[var(--seasonal-color-main)]"
            style={{ fontWeight: 700 }}
          >
            {name}
          </p>
        </div>
        <div className="shrink-0 pt-0.5 text-right">
          <p className="text-[12px] font-medium text-muted-foreground">Today · {dateLine.day}</p>
          <p
            className="text-[15px] font-bold leading-tight text-foreground"
            style={{ fontWeight: 700 }}
          >
            {dateLine.date}
          </p>
        </div>
      </div>
    </div>
  );
}

function YourDayCard({ yourDay }) {
  return (
    <div
      className="mt-4 rounded-[24px] p-4 shadow-[0_8px_24px_hsl(var(--seasonal-primary)/0.16)]"
      style={{ background: 'var(--seasonal-brand-gradient)' }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70"
        style={{ fontWeight: 700 }}
      >
        YOUR DAY · {yourDay.count}
      </p>
      <p
        className="mt-0.5 text-[22px] font-semibold lowercase leading-[1.1] text-white"
        style={{ fontWeight: 600 }}
      >
        {yourDay.title}
      </p>
      <div className="mt-3 space-y-2">
        {yourDay.pills.map((pill) => (
          <div
            key={pill.text}
            className="flex items-center gap-2.5 rounded-full border border-white/35 bg-white/[0.08] px-3.5 py-2.5"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden />
            <p
              className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-white"
              style={{ fontWeight: 500 }}
            >
              {pill.text}
              {pill.trailing ? (
                <>
                  {' '}
                  <span className="text-[13px] italic opacity-90">{pill.trailing}</span>
                </>
              ) : null}
            </p>
            <ChevronRightIcon size={13} className="h-[13px] w-[13px] shrink-0 text-white/90" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedIconBox({ iconText }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[hsl(var(--seasonal-primary)/0.13)]">
      {iconText ? (
        <span
          className="preserve-case text-[13px] font-semibold text-[var(--seasonal-color-main)]"
          style={{ fontWeight: 600 }}
        >
          {iconText}
        </span>
      ) : (
        <BrandMarkIcon size={20} className="h-5 w-5" />
      )}
    </div>
  );
}

function FeedCard({ iconText, label, title, showChevron = false }) {
  return (
    <div className="flex items-center rounded-[20px] bg-white p-3 shadow-[0_2px_12px_hsl(var(--seasonal-primary)/0.06)]">
      <FeedIconBox iconText={iconText} />
      <div className="min-w-0 flex-1 pl-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          style={{ fontWeight: 600 }}
        >
          {label}
        </p>
        <p
          className={cn(
            'truncate text-[16px] font-semibold leading-[1.25] text-foreground',
            !showChevron && 'pr-1',
          )}
          style={{ fontWeight: 600 }}
        >
          {title}
        </p>
      </div>
      {showChevron ? (
        <ChevronRightIcon
          size={14}
          className="ml-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
        />
      ) : null}
    </div>
  );
}

function SparkFeedCard({ sparkQuestion }) {
  const category = sparkQuestion?.category?.toUpperCase() || 'FUN';
  const label = `TODAY'S SPARK · ${category}`;
  const title = truncateText(
    sparkQuestion?.text ?? 'If you could eat only one food forever, what would it be?',
    36,
  );

  return <FeedCard label={label} title={title} showChevron />;
}

const BOTTOM_NAV_ITEMS = [
  { id: 'home', icon: HomeIcon, active: true },
  { id: 'calendar', icon: CalendarIcon, active: false },
  { id: 'lists', icon: LayoutGridIcon, active: false },
  { id: 'profile', icon: User2Icon, active: false },
];

function BottomNavBar() {
  return (
    <div className="relative shrink-0 px-3 pb-2 pt-1">
      <nav
        aria-hidden
        className="rounded-[28px] bg-white/95 shadow-[0_10px_40px_-6px_hsl(var(--foreground)/0.12),0_2px_8px_-2px_hsl(var(--foreground)/0.06)] ring-1 ring-foreground/[0.06]"
      >
        <div className="flex h-16 items-center justify-around px-1">
          {BOTTOM_NAV_ITEMS.map(({ id, icon: Icon, active }) => (
            <div key={id} className="flex flex-1 items-center justify-center">
              <div className="relative px-4 py-2.5">
                {active ? (
                  <div
                    className="absolute inset-0 rounded-full bg-[hsl(var(--seasonal-primary)/0.15)]"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  size={24}
                  className={cn('relative z-10', active ? 'scale-110 opacity-100' : 'opacity-70')}
                />
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

const FALLBACK_DEMO = {
  greetingName: '',
  greeting: 'Good morning',
  dateLine: { day: '—', date: '—' },
  yourDay: { count: '', title: '', pills: [] },
  sparkQuestion: null,
  feedCards: [],
};

/** HeroPhoneMock `demo={...}` veya eski spread (`greetingName` / `name` üst seviye) ile uyumlu. */
function resolveDemo(props) {
  const raw = props.demo ?? props;
  return {
    greetingName: raw.greetingName ?? raw.name ?? FALLBACK_DEMO.greetingName,
    greeting: raw.greeting ?? FALLBACK_DEMO.greeting,
    dateLine: raw.dateLine ?? FALLBACK_DEMO.dateLine,
    yourDay: raw.yourDay ?? FALLBACK_DEMO.yourDay,
    sparkQuestion: raw.sparkQuestion ?? FALLBACK_DEMO.sparkQuestion,
    feedCards: raw.feedCards ?? FALLBACK_DEMO.feedCards,
  };
}

export function PearHomeScreen(props) {
  const demo = resolveDemo(props);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit] bg-[hsl(var(--seasonal-card-wash))]">
      <StatusBar />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-1">
        <GreetingHeader
          name={demo.greetingName}
          greeting={demo.greeting}
          dateLine={demo.dateLine}
        />
        <YourDayCard yourDay={demo.yourDay} />
        <div className="mt-3 space-y-2.5">
          <SparkFeedCard sparkQuestion={demo.sparkQuestion} />
          {demo.feedCards.map((card) => (
            <FeedCard
              key={card.label}
              iconText={card.iconText}
              label={card.label}
              title={card.title}
              showChevron={card.showChevron}
            />
          ))}
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
}
