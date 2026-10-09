/**
 * SPECIAL_DAYS — Cultural & seasonal special day color modifiers.
 * Extracted from seasonColors.js for lazy-loading (code-split).
 */
const SPECIAL_DAYS = {
  // ── Cultural days ─────────────────────────────────────────────────

  '02-14': {
    name: 'Sevgililer Günü',
    hueShift: -52,
    satMult: 1.18,
    lightShift: 2,
    gradientOverride: [
      'hsla(348, 42%, 90%, 0.36)',
      'hsla(330, 46%, 68%, 0.26)',
      'hsla(312, 40%, 44%, 0.2)',
    ],
    textGradient:
      'linear-gradient(127deg, hsl(350, 48%, 82%) 0%, hsl(342, 50%, 68%) 22%, hsl(332, 48%, 56%) 44%, hsl(322, 46%, 44%) 66%, hsl(308, 42%, 36%) 88%, hsl(298, 38%, 30%) 100%)',
    avatarGradient:
      'linear-gradient(125deg, hsl(352, 40%, 88%) 0%, hsl(336, 46%, 70%) 32%, hsl(320, 44%, 52%) 64%, hsl(302, 40%, 38%) 100%)',
    cardBorderGradient:
      'linear-gradient(123deg, hsl(340, 44%, 64%), hsl(322, 42%, 48%), hsl(300, 38%, 38%))',
  },

  '01-01': {
    name: 'Yılbaşı',
    hueShift: -22,
    satMult: 1.1,
    lightShift: 3,
    gradientOverride: [
      'hsla(47, 34%, 93%, 0.4)',
      'hsla(42, 42%, 74%, 0.28)',
      'hsla(34, 46%, 48%, 0.22)',
    ],
    textGradient:
      'linear-gradient(126deg, hsl(48, 28%, 92%) 0%, hsl(45, 36%, 82%) 20%, hsl(42, 44%, 70%) 40%, hsl(38, 50%, 56%) 60%, hsl(34, 52%, 44%) 80%, hsl(30, 46%, 34%) 100%)',
    avatarGradient:
      'linear-gradient(124deg, hsl(49, 32%, 90%) 0%, hsl(43, 40%, 74%) 35%, hsl(37, 48%, 54%) 70%, hsl(31, 48%, 38%) 100%)',
    cardBorderGradient:
      'linear-gradient(121deg, hsl(44, 42%, 64%), hsl(36, 48%, 50%), hsl(28, 44%, 36%))',
  },

  '12-31': {
    name: 'Yılbaşı Gecesi',
    hueShift: 22,
    satMult: 1.06,
    lightShift: -4,
    gradientOverride: [
      'hsla(232, 44%, 26%, 0.38)',
      'hsla(228, 38%, 42%, 0.28)',
      'hsla(220, 28%, 58%, 0.22)',
    ],
    textGradient:
      'linear-gradient(128deg, hsl(234, 42%, 34%) 0%, hsl(230, 40%, 42%) 22%, hsl(226, 36%, 50%) 44%, hsl(222, 30%, 58%) 62%, hsl(218, 24%, 66%) 80%, hsl(214, 20%, 72%) 100%)',
    avatarGradient:
      'linear-gradient(126deg, hsl(236, 38%, 30%) 0%, hsl(230, 36%, 40%) 30%, hsl(224, 30%, 52%) 58%, hsl(218, 22%, 64%) 100%)',
    cardBorderGradient:
      'linear-gradient(122deg, hsl(232, 36%, 38%), hsl(224, 32%, 48%), hsl(216, 26%, 58%))',
  },

  '03-21': {
    name: 'Nevruz',
    hueShift: -14,
    satMult: 1.22,
    lightShift: 3,
    gradientOverride: [
      'hsla(168, 44%, 58%, 0.32)',
      'hsla(142, 42%, 48%, 0.26)',
      'hsla(88, 48%, 50%, 0.22)',
    ],
    textGradient:
      'linear-gradient(125deg, hsl(168, 48%, 46%) 0%, hsl(158, 46%, 44%) 18%, hsl(142, 44%, 42%) 36%, hsl(118, 46%, 44%) 54%, hsl(92, 48%, 48%) 72%, hsl(68, 52%, 52%) 88%, hsl(52, 54%, 52%) 100%)',
    avatarGradient:
      'linear-gradient(127deg, hsl(170, 44%, 52%) 0%, hsl(150, 42%, 46%) 28%, hsl(115, 44%, 46%) 56%, hsl(78, 48%, 50%) 100%)',
    cardBorderGradient:
      'linear-gradient(120deg, hsl(165, 42%, 44%), hsl(125, 44%, 42%), hsl(78, 48%, 48%))',
  },

  // ── Season turning points ─────────────────────────────────────────

  '06-21': {
    name: 'Yaz Gündönümü',
    hueShift: -148,
    satMult: 1.28,
    lightShift: 4,
    gradientOverride: [
      'hsla(48, 62%, 78%, 0.4)',
      'hsla(40, 58%, 56%, 0.3)',
      'hsla(28, 52%, 42%, 0.2)',
    ],
    textGradient:
      'linear-gradient(132deg, hsl(50, 68%, 62%) 0%, hsl(44, 64%, 54%) 28%, hsl(36, 60%, 48%) 56%, hsl(28, 56%, 42%) 100%)',
    avatarGradient:
      'linear-gradient(130deg, hsl(52, 62%, 66%) 0%, hsl(42, 60%, 54%) 38%, hsl(32, 56%, 46%) 76%, hsl(26, 52%, 38%) 100%)',
    cardBorderGradient:
      'linear-gradient(128deg, hsl(46, 58%, 56%), hsl(34, 56%, 46%), hsl(24, 52%, 38%))',
  },

  '09-23': {
    name: 'Sonbahar Başlangıcı',
    hueShift: -82,
    satMult: 1.12,
    lightShift: -2,
    gradientOverride: [
      'hsla(43, 48%, 80%, 0.36)',
      'hsla(32, 44%, 54%, 0.26)',
      'hsla(20, 40%, 36%, 0.2)',
    ],
    textGradient:
      'linear-gradient(125deg, hsl(44, 54%, 62%) 0%, hsl(38, 52%, 54%) 24%, hsl(30, 50%, 46%) 48%, hsl(22, 46%, 38%) 72%, hsl(16, 42%, 30%) 100%)',
    avatarGradient:
      'linear-gradient(124deg, hsl(46, 48%, 68%) 0%, hsl(36, 48%, 52%) 35%, hsl(24, 44%, 40%) 70%, hsl(14, 40%, 30%) 100%)',
    cardBorderGradient:
      'linear-gradient(121deg, hsl(38, 50%, 50%), hsl(26, 48%, 40%), hsl(16, 44%, 30%))',
  },

  '12-21': {
    name: 'Kış Gündönümü',
    hueShift: 10,
    satMult: 0.74,
    lightShift: -7,
    gradientOverride: [
      'hsla(208, 38%, 78%, 0.34)',
      'hsla(222, 36%, 44%, 0.26)',
      'hsla(248, 32%, 38%, 0.18)',
    ],
    textGradient:
      'linear-gradient(127deg, hsl(206, 36%, 76%) 0%, hsl(214, 38%, 62%) 22%, hsl(222, 40%, 50%) 44%, hsl(232, 38%, 42%) 62%, hsl(242, 34%, 38%) 80%, hsl(252, 30%, 36%) 100%)',
    avatarGradient:
      'linear-gradient(125deg, hsl(204, 32%, 82%) 0%, hsl(218, 36%, 58%) 32%, hsl(232, 36%, 44%) 64%, hsl(248, 32%, 38%) 100%)',
    cardBorderGradient:
      'linear-gradient(122deg, hsl(212, 34%, 54%), hsl(228, 36%, 42%), hsl(244, 32%, 40%))',
  },
};

export default SPECIAL_DAYS;
