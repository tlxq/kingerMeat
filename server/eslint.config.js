import tseslint from 'typescript-eslint'

// TypeScript-rekommenderade regler — fångar vanliga misstag
export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
