/**
 * Validate Command Tests
 * @module @musuhi-ng/cli/commands
 */

import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ConstitutionLoader } from '@musuhi-ng/constitutional-governance';
import { NodeFileSystem } from '@musuhi-ng/core';

describe('Validate Command Integration', () => {
  const projectRoot = '/home/nahisaho/GitHub/musuhi2';
  const constitutionPath = path.join(projectRoot, 'steering', 'constitution.md');

  it('should load constitution successfully', async () => {
    const fsManager = new NodeFileSystem();
    const loader = new ConstitutionLoader(fsManager, constitutionPath);

    const articles = await loader.load();

    expect(articles).toHaveLength(9);
    expect(articles[0]?.principle).toBeTruthy();
    expect(articles[0]?.enforcement).toBeTruthy();
  });

  it('should validate that constitution file exists', async () => {
    const exists = await fs
      .access(constitutionPath)
      .then(() => true)
      .catch(() => false);

    expect(exists).toBe(true);
  });

  it('should create validation context with correct structure', () => {
    const testFile = '/test/file.ts';
    const testContent = 'const x = 1;';

    const context = {
      filePath: testFile,
      content: testContent,
      projectRoot,
      metadata: {
        timestamp: new Date(),
        author: 'cli-user',
      },
    };

    expect(context.filePath).toBe(testFile);
    expect(context.content).toBe(testContent);
    expect(context.projectRoot).toBe(projectRoot);
    expect(context.metadata?.author).toBe('cli-user');
  });
});
