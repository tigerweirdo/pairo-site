export const STORY_COPY = {
  spark: {
    question: 'what made you smile this week?',
    choices: ['their laugh, unfortunately', "a meme i can't explain", 'we cooked. nothing burned.'],
    partnerAnswer: 'watching you parallel park for eleven minutes. cinema.',
  },
  sharedDay: {
    eyebrow: 'THE SAME WEDNESDAY',
    title: 'not a dashboard. just Wednesday.',
    sub: 'yoga moves once. groceries stay shared. Spark opens when both answers are in.',
    events: [
      { icon: 'Calendar', time: '09:00', title: 'yoga', meta: 'Céline added · both see it' },
      {
        icon: 'ShoppingCart',
        time: '17:10',
        title: 'groceries · after',
        meta: '5 items · both can edit',
      },
      { icon: 'Flame', time: '20:00', title: 'Spark revealed', meta: 'day 47 → 48' },
    ],
  },
  year: {
    seasons: [
      { name: 'winter', range: 'JAN — MAR', note: 'quiet, low light' },
      { name: 'spring', range: 'APR — JUN', note: 'everything in bloom' },
      { name: 'summer', range: 'JUL — SEP', note: 'long, slow evenings' },
      { name: 'autumn', range: 'OCT — DEC', note: 'turning inward' },
    ],
  },
  /** Cinematic landing chapters — single authoring source for UI + prerender contract. */
  chapters: {
    hero: {
      eyebrow: "PAIRO / TODAY'S LIGHT, FOR TWO",
      titleLines: ["what's hidden", 'is still here.'],
      body: 'Answer first. The blur clears only when both sides are in — and two separate lights become one pairo color.',
      shareLabel: 'send to your person',
      followLabel: 'follow the year',
    },
    pair: {
      eyebrow: '01 / TWO LIGHTS',
      titleLines: ['a color', 'neither makes alone.'],
      body: 'Each half keeps its own warmth and motion. The color in the seam exists only where their light overlaps.',
    },
    warm: {
      eyebrow: '02 / SPRING → SUMMER',
      titleLines: ['light becomes', 'weather.'],
      body: 'Spring lets light travel through the form. Summer hardens it into contrast, caustic edges and a sharper shadow.',
    },
    cold: {
      eyebrow: '03 / AUTUMN → WINTER',
      titleLines: ['the same year', 'changes matter.'],
      body: 'Dust catches the low autumn light. Then the surface turns still, refractive and cold enough for light to slide across it.',
    },
    return: {
      eyebrow: '04 / ONE YEAR LATER',
      titleLines: ['same light.', 'changed form.'],
      body: 'The camera returns to the day you arrived. The light is identical. The seam carries a year of movement.',
    },
  },
  final: {
    eyebrow: 'TWO PEOPLE. NO AUDIENCE.',
    titleLines: ['make time', 'feel like yours.'],
    title: 'make time feel like yours.',
    sub: 'send one link. when both halves join, Sparks, plans and lists live behind one private pair_id.',
    cta: 'start on the web — free',
    shareCta: 'send pairo to your person',
    note: 'free during beta · no card · delete anytime',
    shareNote: 'share the idea now · no sign-up required',
    privacyTitle: 'one private pair_id.',
    privacyBody: 'no friend graph, no feed, no data sold. what you write is for your person.',
    faqEyebrow: 'THE HONEST QUESTIONS',
    nextSteps: ['send this page', 'open pairo together', 'pair once — the space is yours'],
  },
};

export const LANDING_COPY = {
  hero: {
    title: 'for the two of you. and no one else.',
    subtitle:
      'a shared calendar, daily questions, lists, and small rituals — without turning your relationship into a to-do list.',
    ctaPrimary: 'try pairo — free',
    ctaSecondary: "see what's inside ↓",
    trustLine: ['free during beta', 'iOS soon', 'pair with one link'],
  },
  ticker: [
    'one daily spark — answer together',
    'shared calendar, not a project board',
    'lists you both edit in real time',
    'colors shift with the season',
    'groceries, dates, notes — one place',
  ],
  ribbon:
    'sparks ✦ calendar ✦ lists ✦ recipes ✦ streaks ✦ quiet by default ✦ sparks ✦ calendar ✦ lists ✦ recipes ✦ streaks ✦ quiet by default ✦',
  manifesto: {
    eyebrow: 'WHY PAIRO',
    paragraph:
      'every app that "organizes your relationship" treats your partner like a coworker — shared docs, assigned tasks, status updates. we built the opposite.\n\nno productivity. no pressure. just your actual life, in one place.',
    anchors: [
      { icon: 'Shield', label: 'private pair only' },
      { icon: 'Heart', label: 'built for couples' },
      { icon: 'Lock', label: 'nothing sold, ever' },
    ],
  },
  pairing: {
    eyebrow: 'HOW IT WORKS',
    title: 'Two phones. One private space.',
    sub: 'One link to pair. No friend graph, no algorithm.',
    steps: [
      {
        number: 1,
        title: 'Make your half',
        description: 'Sign up in thirty seconds. Email only — no phone, no socials.',
      },
      {
        number: 2,
        title: 'Send the link',
        description: "Your partner taps it once. You're paired by a private ID only you two share.",
      },
      {
        number: 3,
        title: 'Live in pairo',
        description: 'Calendar, lists, sparks, streaks — your shared home screen.',
      },
    ],
    privacyLink: '→ See how we keep this private',
  },
  featuresSection: {
    eyebrow: "WHAT'S INSIDE",
    titleLine1: 'Four reasons to open it every day.',
    sub: 'calendar, lists, daily sparks, streaks.',
    alsoInside: {
      eyebrow: 'ALSO INSIDE',
      items: [
        { icon: 'Gift', name: 'Promise cards' },
        { icon: 'Droplets', name: 'Period' },
        { icon: 'CheckSquare', name: 'Tasks' },
        { icon: 'ShoppingCart', name: 'Shopping' },
        { icon: 'StickyNote', name: 'Notes' },
        { icon: 'ChefHat', name: 'Recipes' },
      ],
    },
  },
  seasonalSection: {
    eyebrow: 'YOUR YEAR, ON SCREEN',
    title: 'pairo has no color of its own.',
    subPrefix: "it borrows today's. right now it's the color of ",
    subSuffix:
      " — and tomorrow it won't be. the app shifts with the seasons, not with whatever's trending.",
    scrubberLabel: 'drag through the year →',
    seasonHints: {
      winter: 'quiet, low light',
      spring: 'everything in bloom',
      summer: 'long, slow evenings',
      autumn: 'turning inward',
    },
  },
  privacySection: {
    title: "what's between you stays between you.",
    body: "one private pair_id links your accounts — and nothing else. no ads, no data sold, no feed. when you write here, it's for your person.",
    linkLabel: 'read the full privacy approach →',
  },
  betaSection: {
    eyebrow: 'PRICING',
    titleLine1: "Free while we're",
    titleLine2: 'small.',
    sub: 'no trial, no asterisk. while pairo is in beta, everything is free — and you can delete it all in one tap.',
    tierLabel: 'BETA ACCESS',
    badge: 'beta · free',
    price: 'Everything. $0.',
    priceSuffix: 'while the beta runs',
    features: [
      'Daily Spark questions',
      'Shared calendar & events',
      'Tasks, groceries & notes',
      'Recipe collection',
      'Promise cards',
      'Streaks & daily habits',
      'Period tracking (optional)',
      'Special days theme the app',
      'Future iOS app — first access',
    ],
    buttonLabel: 'Try pairo',
    buttonNote: 'No card needed. Delete your account anytime.',
    footnote: 'When pricing arrives, anyone in the beta keeps the launch deal — locked in.',
  },
  faqSection: {
    eyebrow: 'QUESTIONS',
    title: 'Things people ask.',
    sub: "The real questions. If yours isn't here, write to us.",
  },
  finalCTA: {
    eyebrow: "when you're ready",
    titleLine1: 'Start small.',
    titleAccent: 'Stay close.',
    sub: 'Free in the beta. One link to pair — no card, no noise.',
    ctaPrimary: 'Try pairo — free',
    ctaSecondary: 'Notify me on iOS',
    footnote: 'No card needed · delete anytime',
  },
};

export const FAQ_ITEMS = [
  {
    id: 'free',
    question: 'Is pairo free?',
    answer:
      "Right now, yes. The whole app is free during the beta. We're still figuring out pricing. Anyone in the beta keeps the founding deal when prices launch.",
  },
  {
    id: 'private',
    question: 'Can you read what we write?',
    answer:
      "No. Your data is scoped to your pair_id — only you and your partner can see it. We don't read it, sell it, or train AI on it. Even our database team doesn't browse user content.",
  },
  {
    id: 'breakup',
    question: 'What happens if we break up?',
    answer:
      'Either of you can leave the pair from Profile. The other person keeps the app and their own data. Or you can delete your account — everything is gone within thirty days.',
  },
  {
    id: 'app-store',
    question: 'Is pairo on the App Store?',
    answer:
      "Almost. We're submitting via Capacitor in the next few weeks. Right now it's a PWA — add it to your home screen and it behaves almost exactly like a native app. Join the beta and we'll email you the day it lands.",
  },
  {
    id: 'name',
    question: 'Why is it called pairo?',
    answer:
      'pair + o — two people, one app. the name stuck when we renamed from an earlier inside joke (yes, there was a fruit phase).',
  },
  {
    id: 'partner-not-using',
    question: "What if my partner doesn't use it?",
    answer:
      "It still works for one — your half of the calendar, your lists, your notes. But honestly, the magic is when both of you do. Spark especially — there's no one to reveal an answer to alone.",
  },
  {
    id: 'languages',
    question: 'What languages does it support?',
    answer:
      "English right now. Turkish is next — we'll add more after the App Store launch. The seasonal calendar already knows hemispheres, so summer in Sydney looks different from summer in Berlin.",
  },
  {
    id: 'data-export',
    question: 'Can I export my data?',
    answer:
      'Yes. Profile → Account → Export. You get a JSON archive of everything you and your partner ever wrote, with timestamps preserved. Readable without an account.',
  },
  {
    id: 'partner-data',
    question: "If only I sign up, do you have my partner's data?",
    answer:
      "No. We don't know who your partner is until they join. Nothing about them is collected, inferred, or stored before they tap your link and create their own account.",
  },
  {
    id: 'web-or-phone',
    question: 'Can I use it on the web, or just my phone?',
    answer:
      'Both. pairo runs in the browser today — add it to your home screen and it feels native. The iOS app is on the way; beta members get first access when it ships.',
  },
];

/** Demo-only copy for the hero phone mock — fictional, not real user data. */
export const HERO_PHONE = {
  statusTime: '9:41',
  greeting: 'Good morning',
  userName: 'jesse',
  dayContext: 'Today · Saturday',
  formattedDate: 'Oct 12',
  yourDay: {
    title: 'a calm Saturday, two things',
    items: [
      { label: '6 items on shopping list' },
      { label: 'Date night reservation', emphasis: 'tonight' },
    ],
  },
  spark: {
    eyebrow: "TODAY'S SPARK · FUN",
    question: 'If you could eat only one food forever, what would it be?',
  },
  period: {
    phaseCode: 'd8',
    eyebrow: 'FOLLICULAR · DAY 8 OF 28',
    title: 'Energy tends to pick up this week',
  },
  specialDay: {
    eyebrow: 'SPECIAL DAY · IN 18 DAYS',
    title: "Jesse's birthday",
  },
};

/** All toggleable product features — matches Couple App FEATURE_CATALOG. */
export const FEATURE_GRID = [
  { id: 'spark', icon: 'Sparkles', label: 'Spark', tagline: 'Daily questions' },
  { id: 'calendar', icon: 'Calendar', label: 'Calendar', tagline: 'Shared events' },
  { id: 'tasks', icon: 'ListChecks', label: 'Tasks', tagline: 'To-dos together' },
  { id: 'shopping', icon: 'ShoppingCart', label: 'Shopping', tagline: 'Groceries list' },
  { id: 'notes', icon: 'StickyNote', label: 'Notes', tagline: 'Shared scratchpad' },
  { id: 'recipes', icon: 'ChefHat', label: 'Recipes', tagline: 'What you cooked' },
  { id: 'cards', icon: 'Ticket', label: 'Promise cards', tagline: 'Little gifts' },
  { id: 'specialDays', icon: 'Gift', label: 'Special days', tagline: 'Birthdays & more' },
  { id: 'streaks', icon: 'Flame', label: 'Streaks', tagline: 'Daily habits' },
  { id: 'period', icon: 'Droplets', label: 'Period', tagline: 'Optional tracking' },
];

/** Four spotlight features — short copy on the landing page. */
export const FEATURE_BLOCKS = [
  {
    id: 'spark',
    icon: 'Sparkles',
    label: 'SPARK',
    isLead: true,
    name: 'One question, every morning.',
    description: 'Answer privately. Reveal together.',
  },
  {
    id: 'calendar',
    icon: 'Calendar',
    label: 'CALENDAR',
    name: 'One calendar, both your lives.',
    description: 'Shared plans, anniversaries, and the dates neither of you can forget.',
  },
  {
    id: 'lists',
    icon: 'ListChecks',
    label: 'LISTS',
    name: 'The list you both can edit.',
    description: 'Groceries, tasks, and notes — shared the second you add them.',
  },
  {
    id: 'streaks',
    icon: 'Flame',
    label: 'STREAKS',
    name: 'Streaks without the guilt.',
    description: 'Little rituals you keep as a pair — miss a day, no big deal.',
  },
];

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
