/**
 * Phase Gate Validator Integration Tests
 * Tests Phase -1 Gate validation with real constitution
 * @module @musuhi-ng/constitutional-governance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConstitutionLoader } from '../constitution-loader.js';
import { PhaseGateValidator } from '../phase-gate.js';
import { NodeFileSystem, Article } from '@musuhi-ng/core';
import type { ValidationContext, ArticleConfig } from '../types.js';

describe('PhaseGateValidator Integration', () => {
  let fsManager: NodeFileSystem;
  let loader: ConstitutionLoader;
  let validator: PhaseGateValidator;
  let articles: ArticleConfig[];
  let constitutionPath: string;

  beforeEach(async () => {
    // Load real constitution
    constitutionPath = '/home/nahisaho/GitHub/musuhi2/steering/constitution.md';
    fsManager = new NodeFileSystem();
    loader = new ConstitutionLoader(fsManager, constitutionPath);

    // Load articles and create validator
    articles = await loader.load();
    validator = new PhaseGateValidator(articles);
  });

  it('should initialize with 9 articles from constitution', async () => {
    const loadedArticles = validator.getArticles();
    expect(loadedArticles).toHaveLength(9);
  });

  it('should initialize validation rules for all articles', async () => {
    const loadedArticles = validator.getArticles();

    // Each article should have validation rules assigned
    for (const article of loadedArticles) {
      expect(article.validationRules).toBeDefined();
      expect(article.validationRules.length).toBeGreaterThan(0);
    }
  });

  it('should get article by number', () => {
    const article1 = validator.getArticle(Article.LibraryFirst);
    expect(article1).toBeDefined();
    expect(article1?.article).toBe(Article.LibraryFirst);
    expect(article1?.title).toBe('Library-First Development');
  });

  it('should validate a simple context (smoke test)', async () => {
    const context: ValidationContext = {
      type: 'design',
      files: [],
      changes: [],
      metadata: {
        timestamp: new Date(),
        author: 'test',
      },
    };

    const result = await validator.validate(context, [Article.LibraryFirst]);

    expect(result).toBeDefined();
    expect(result.name).toBe('Phase -1 Gate');
    expect(result.articles).toContain(Article.LibraryFirst);
    expect(result.status).toBeDefined();
    expect(result.validations).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should validate specific article only', async () => {
    const context: ValidationContext = {
      type: 'design',
      files: [],
      changes: [],
      metadata: {
        timestamp: new Date(),
        author: 'test',
      },
    };

    const results = await validator.validateArticle(context, Article.TestFirst);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should throw error for invalid article number', async () => {
    const context: ValidationContext = {
      type: 'design',
      files: [],
      changes: [],
      metadata: {
        timestamp: new Date(),
        author: 'test',
      },
    };

    await expect(
      validator.validateArticle(context, 99 as Article)
    ).rejects.toThrow('Article 99 not found');
  });
});
