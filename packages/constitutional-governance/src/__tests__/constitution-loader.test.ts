/**
 * Constitution Loader Integration Tests
 * Tests against real constitution.md file
 * @module @musuhi-ng/constitutional-governance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConstitutionLoader } from '../constitution-loader.js';
import { NodeFileSystem, Article } from '@musuhi-ng/core';
import * as path from 'node:path';

describe('ConstitutionLoader Integration', () => {
  let fsManager: NodeFileSystem;
  let loader: ConstitutionLoader;
  let constitutionPath: string;

  beforeEach(() => {
    // Use real constitution file from steering/ - relative to project root
    constitutionPath = path.resolve(process.cwd(), 'steering/constitution.md');
    fsManager = new NodeFileSystem();
    loader = new ConstitutionLoader(fsManager, constitutionPath);
  });

  it('should load 9 Articles from constitution.md', async () => {
    const articles = await loader.load();
    expect(articles).toHaveLength(9);
  });

  it('should load Articles in correct order', async () => {
    const articles = await loader.load();
    expect(articles.map(a => a.article)).toEqual([
      Article.LibraryFirst,
      Article.TestFirst,
      Article.SecurityFirst,
      Article.DocumentationFirst,
      Article.SimplicityFirst,
      Article.PerformanceFirst,
      Article.AccessibilityFirst,
      Article.PrivacyFirst,
      Article.IntegrationFirst,
    ]);
  });

  it('should parse Article titles correctly', async () => {
    const articles = await loader.load();
    expect(articles[0]?.title).toBe('Library-First Development');
    expect(articles[1]?.title).toBe('Test-First Development');
    expect(articles[8]?.title).toBe('Integration-First Development');
  });
});
