import { defineBurtsonFrontendConfig } from '@burtson-labs/frontend-standards';
import globals from 'globals';

// Burtson Labs frontend standards for the components, the docs site and the
// tests; the build scripts are plain Node ESM.
export default [
  { ignores: ['src/primitives/vendor/**', '.verify/**'] },
  ...defineBurtsonFrontendConfig({
    files: [
      'src/**/*.{ts,tsx}',
      'site/src/**/*.{ts,tsx}',
      'test/**/*.{ts,tsx}',
      'site/vite.config.ts',
      'vitest.config.ts',
    ],
    ignores: ['dist/**', 'site/dist/**', 'site/public/**'],
    tsconfigRootDir: import.meta.dirname,
  }),
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },
];
