import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 300000, // 5 minutes per test
    hookTimeout: 60000, // 1 minute for setup/teardown
    maxConcurrency: 1, // Run E2E tests sequentially
    pool: 'forks', // Isolate tests in separate processes
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'dist/**',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/types/**',
      ],
    },
  },
});
