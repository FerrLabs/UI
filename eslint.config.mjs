import js from '@eslint/js';
import ts from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.angular/**',
      'packages/showcase/.storybook/preview.css',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...ts.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'flr', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'flr', style: 'kebab-case' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // `x != null` is the deliberate loose check for null-or-undefined.
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
    },
  },
  {
    files: ['packages/ui-ng/**/*.ts'],
    rules: {
      // An input that maps to a real HTML attribute has to be aliased: `id`,
      // `inputmode`, `aria-label` and `aria-describedby` are not valid
      // TypeScript property names, and a library that renamed them would force
      // every consumer to learn a second vocabulary for the same attributes.
      '@angular-eslint/no-input-rename': 'off',
      // `select` and `search` collide with native event names, which is the
      // rule's point, but renaming a published output is a breaking change for
      // every consumer. Revisit at the next ui-ng major.
      '@angular-eslint/no-output-native': 'off',
    },
  },
  {
    files: ['packages/showcase/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
    },
  },
  {
    files: ['**/*.mjs', '**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);
