import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    decorator: { legacy: true },
  },
  test: {
    include: ['src/**/*.spec.ts', 'markdown/**/*.spec.ts', 'docs/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
      include: ['src/**/*.ts', 'markdown/**/*.ts', 'docs/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'markdown/**/*.spec.ts', 'docs/**/*.spec.ts'],
    },
  },
});
