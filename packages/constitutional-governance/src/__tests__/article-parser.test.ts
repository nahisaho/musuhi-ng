/**
 * Article Parser Tests
 * Tests Article validation and parsing
 * @module @musuhi/constitutional-governance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArticleParser } from '../article-parser.js';
import { ConstitutionLoader } from '../constitution-loader.js';
import { NodeFileSystem, Article } from '@musuhi/core';
import type { ArticleConfig } from '../types.js';

describe('ArticleParser', () => {
  let fsManager: NodeFileSystem;
  let loader: ConstitutionLoader;
  let articles: ArticleConfig[];
  let constitutionPath: string;

  beforeEach(async () => {
    // Load real constitution
    constitutionPath = '/home/nahisaho/GitHub/musuhi2/steering/constitution.md';
    fsManager = new NodeFileSystem();
    loader = new ConstitutionLoader(fsManager, constitutionPath);
    articles = await loader.load();
  });

  describe('validate', () => {
    it('should validate real constitution successfully', () => {
      const result = ArticleParser.validate(articles);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missingArticles).toHaveLength(0);
    });

    it('should detect missing articles', () => {
      const incompleteArticles = articles.slice(0, 7); // Only first 7 articles

      const result = ArticleParser.validate(incompleteArticles);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.missingArticles).toContain(Article.PrivacyFirst);
      expect(result.missingArticles).toContain(Article.IntegrationFirst);
    });

    it('should detect missing principle', () => {
      const invalidArticles: ArticleConfig[] = [
        {
          article: Article.LibraryFirst,
          title: 'Library-First Development',
          principle: '', // Empty principle
          enforcement: 'Some enforcement',
          validationRules: [],
        },
      ];

      const result = ArticleParser.validate(invalidArticles);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Article 1: Missing principle');
    });

    it('should detect missing enforcement', () => {
      const invalidArticles: ArticleConfig[] = [
        {
          article: Article.TestFirst,
          title: 'Test-First Development',
          principle: 'Some principle',
          enforcement: '', // Empty enforcement
          validationRules: [],
        },
      ];

      const result = ArticleParser.validate(invalidArticles);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Article 2: Missing enforcement rules');
    });

    it('should detect title mismatch', () => {
      const invalidArticles: ArticleConfig[] = [
        {
          article: Article.SecurityFirst,
          title: 'Wrong Title', // Incorrect title
          principle: 'Some principle',
          enforcement: 'Some enforcement',
          validationRules: [],
        },
      ];

      const result = ArticleParser.validate(invalidArticles);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Title mismatch'))).toBe(true);
    });

    it('should detect duplicate articles', () => {
      const duplicateArticles: ArticleConfig[] = [
        {
          article: Article.LibraryFirst,
          title: 'Library-First Development',
          principle: 'Principle 1',
          enforcement: 'Enforcement 1',
          validationRules: [],
        },
        {
          article: Article.LibraryFirst, // Duplicate
          title: 'Library-First Development',
          principle: 'Principle 2',
          enforcement: 'Enforcement 2',
          validationRules: [],
        },
      ];

      const result = ArticleParser.validate(duplicateArticles);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate Articles'))).toBe(true);
    });
  });

  describe('getArticle', () => {
    it('should retrieve article by number', () => {
      const article = ArticleParser.getArticle(articles, Article.LibraryFirst);

      expect(article).toBeDefined();
      expect(article?.article).toBe(Article.LibraryFirst);
      expect(article?.title).toBe('Library-First Development');
    });

    it('should return undefined for non-existent article', () => {
      const article = ArticleParser.getArticle(articles, 99 as Article);

      expect(article).toBeUndefined();
    });
  });

  describe('getArticleTitles', () => {
    it('should return map of all article titles', () => {
      const titles = ArticleParser.getArticleTitles(articles);

      expect(titles.size).toBe(9);
      expect(titles.get(Article.LibraryFirst)).toBe('Library-First Development');
      expect(titles.get(Article.TestFirst)).toBe('Test-First Development');
      expect(titles.get(Article.IntegrationFirst)).toBe('Integration-First Development');
    });
  });

  describe('hasAllArticles', () => {
    it('should return true when all articles are present', () => {
      const hasAll = ArticleParser.hasAllArticles(articles);

      expect(hasAll).toBe(true);
    });

    it('should return false when articles are missing', () => {
      const incompleteArticles = articles.slice(0, 5);

      const hasAll = ArticleParser.hasAllArticles(incompleteArticles);

      expect(hasAll).toBe(false);
    });
  });

  describe('getMissingArticles', () => {
    it('should return empty array when all articles present', () => {
      const missing = ArticleParser.getMissingArticles(articles);

      expect(missing).toHaveLength(0);
    });

    it('should return missing article numbers', () => {
      const partialArticles = articles.filter((a) => a.article <= 6);

      const missing = ArticleParser.getMissingArticles(partialArticles);

      expect(missing).toContain(Article.AccessibilityFirst);
      expect(missing).toContain(Article.PrivacyFirst);
      expect(missing).toContain(Article.IntegrationFirst);
    });
  });

  describe('getExpectedTitle', () => {
    it('should return expected title for article number', () => {
      const title = ArticleParser.getExpectedTitle(Article.LibraryFirst);

      expect(title).toBe('Library-First Development');
    });

    it('should return expected title for all articles', () => {
      expect(ArticleParser.getExpectedTitle(Article.TestFirst)).toBe(
        'Test-First Development'
      );
      expect(ArticleParser.getExpectedTitle(Article.SecurityFirst)).toBe(
        'Security-First Development'
      );
      expect(ArticleParser.getExpectedTitle(Article.IntegrationFirst)).toBe(
        'Integration-First Development'
      );
    });
  });
});
