import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/',
        '**/__tests__/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['packages/**/__tests__/**/*.test.ts', 'packages/**/*.{test,spec}.ts'],
    exclude: [
      'node_modules',
      'dist',
      '.pnpm-store',
      '**/node_modules/**',
      'packages/**/node_modules/**',
    ],
  },
  resolve: {
    alias: {
      '@musuhi-ng/core': path.resolve(__dirname, './packages/core/src'),
      '@musuhi-ng/cli': path.resolve(__dirname, './packages/cli/src'),
      '@musuhi-ng/dashboard': path.resolve(__dirname, './packages/dashboard/src'),
      '@musuhi-ng/constitutional-governance': path.resolve(
        __dirname,
        './packages/constitutional-governance/src'
      ),
      '@musuhi-ng/change-workflow': path.resolve(__dirname, './packages/change-workflow/src'),
      '@musuhi-ng/multi-agent-orchestrator': path.resolve(
        __dirname,
        './packages/multi-agent-orchestrator/src'
      ),
      '@musuhi-ng/parallel-executor': path.resolve(__dirname, './packages/parallel-executor/src'),
      '@musuhi-ng/gap-analyzer': path.resolve(__dirname, './packages/gap-analyzer/src'),
      '@musuhi-ng/verification-engine': path.resolve(
        __dirname,
        './packages/verification-engine/src'
      ),
    },
  },
});
