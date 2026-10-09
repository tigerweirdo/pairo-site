import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'prerender/**', 'public/**'],
  },

  js.configs.recommended,

  // App source — browser runtime, React + hooks + a11y.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx'] },
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/prop-types': 'off',
      // Empty catch blocks are intentional storage/env-guard fallbacks.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // react-hooks v7 experimental compiler rules — high false-positive rate on
      // valid patterns (useMemo accumulators, reduced-motion resets). Classic
      // rules-of-hooks / exhaustive-deps stay on below.
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
        },
      ],
    },
  },

  // Build / tooling scripts — Node runtime. Browser globals included because
  // vite.config.js embeds puppeteer page.evaluate() browser-context code.
  {
    files: ['*.{js,cjs,mjs}', 'scripts/**/*.{js,mjs}', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // R3F maps these JSX props to Three.js objects rather than DOM attributes.
  {
    files: ['src/pages/landing/components/story/PearWorldCanvas.jsx'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },

  // Always last — disables stylistic rules that Prettier owns.
  prettier,
];
