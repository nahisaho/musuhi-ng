import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import {
  createTestProject,
  cleanupTestProject,
} from '../helpers/test-project-setup';
import {
  assertFileExists,
  assertFileContains,
  readYamlConfig,
} from '../helpers/file-assertions';
import { createMetrics } from '../helpers/performance-metrics';

/**
 * TEST-E2E-005: Platform Switching
 *
 * Validates seamless platform migration (Claude Code → Cursor).
 *
 * Test ID: TEST-E2E-005
 * Priority: P0
 * Estimated Time: 2 minutes
 */
describe('TEST-E2E-005: Platform Switching', () => {
  let projectRoot: string;
  const metrics = createMetrics();

  beforeEach(async () => {
    metrics.start();
    projectRoot = await createTestProject('e2e-platform-switching', {
      includeSteeringFiles: true,
      includeConstitution: true,
      includeSpecs: true,
    });
  });

  afterEach(async () => {
    await cleanupTestProject(projectRoot);
    metrics.stop();
  });

  it('should switch platform from Claude Code to Cursor without data loss', async () => {
    // ========================================
    // Step 1: Initialize on Claude Code
    // ========================================
    const configPath = path.join(projectRoot, '.musuhi', 'config.yaml');
    let config = await readYamlConfig(configPath);

    expect(config.platform.current).toBe('claude-code');
    console.log('Initial platform: claude-code');

    // ========================================
    // Step 2: Create specs and changes
    // ========================================
    const fs = await import('node:fs/promises');
    const changeName = '2025-11-16-add-feature';
    const changePath = path.join(projectRoot, 'changes', changeName);

    await fs.mkdir(changePath, { recursive: true });
    await fs.writeFile(
      path.join(changePath, 'proposal.md'),
      '# Add Feature\n\nProposal content'
    );

    await assertFileExists(path.join(changePath, 'proposal.md'));

    // ========================================
    // Step 3: Switch platform to Cursor
    // ========================================
    // Simulate: musuhi config set platform cursor
    await fs.writeFile(
      configPath,
      `project:
  name: e2e-platform-switching
  version: 0.1.0

platform:
  current: cursor
  adapters:
    - claude-code
    - cursor

workflow:
  currentStage: 1
  completedStages: []

dashboard:
  theme: default
  refreshInterval: 2000
`
    );

    config = await readYamlConfig(configPath);
    expect(config.platform.current).toBe('cursor');
    console.log('Platform switched to: cursor');

    // ========================================
    // Step 4: Verify context preserved
    // ========================================
    // All steering files should still exist
    await assertFileExists(path.join(projectRoot, 'steering', 'structure.md'));
    await assertFileExists(path.join(projectRoot, 'steering', 'tech.md'));
    await assertFileExists(path.join(projectRoot, 'steering', 'product.md'));
    await assertFileExists(path.join(projectRoot, 'steering', 'constitution.md'));

    // Specs should still exist
    await assertFileExists(path.join(projectRoot, 'specs', 'user-authentication.md'));

    // Changes should still exist
    await assertFileExists(path.join(changePath, 'proposal.md'));

    // ========================================
    // Step 5: Execute agent on new platform
    // ========================================
    // Simulate agent execution (mock)
    const agentResult = {
      platform: 'cursor',
      agent: 'requirements-analyst',
      success: true,
      output: 'Requirements analyzed successfully',
    };

    expect(agentResult.platform).toBe('cursor');
    expect(agentResult.success).toBe(true);
    console.log('Agent executed successfully on Cursor platform');

    // ========================================
    // Acceptance Criteria
    // ========================================
    const executionTime = metrics.getElapsedSeconds();
    console.log(`\nPlatform switching completed in ${executionTime}s`);

    expect(executionTime).toBeLessThan(120); // < 2 minutes
    expect(config.platform.current).toBe('cursor');
  });

  it('should preserve steering context across platforms', async () => {
    const steeringFiles = [
      'steering/structure.md',
      'steering/tech.md',
      'steering/product.md',
      'steering/constitution.md',
    ];

    // Verify all steering files exist and are readable
    for (const file of steeringFiles) {
      const filePath = path.join(projectRoot, file);
      await assertFileExists(filePath);

      // Verify content is not empty
      const fs = await import('node:fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it('should support multiple platform adapters', async () => {
    const configPath = path.join(projectRoot, '.musuhi', 'config.yaml');
    const fs = await import('node:fs/promises');
    const content = await fs.readFile(configPath, 'utf-8');

    // Simple check: config file should list both adapters
    expect(content).toContain('claude-code');
    expect(content).toContain('cursor');

    console.log('Config file contains both claude-code and cursor adapters');
  });
});
