import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      // Dependencies
      'node_modules/**',

      // Build outputs
      'dist/**',
      'build/**',
      'web-build/**',
      '.expo/**',
      '.expo-shared/**',

      // Coverage
      'coverage/**',
      '.nyc_output/**',

      // Native builds
      'ios/build/**',
      'ios/Pods/**',
      'android/app/build/**',
      'android/.gradle/**',
      'android/build/**',

      // Generated files
      'expo-env.d.ts',
      '**/*.d.ts',

      // Config files
      '**/*.config.js',
      '**/*.config.mjs',

      // Serena
      '.serena/**',

      // Lock files
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',

      // Supabase functions (have their own tsconfig)
      'supabase/functions/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
];
