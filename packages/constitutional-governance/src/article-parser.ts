/**
 * Article Parser
 * Validates and parses Article structure from constitution
 * @module @musuhi-ng/constitutional-governance
 */

import type { Article, ArticleConfig } from './types.js';

/**
 * Article validation result
 */
export interface ArticleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingArticles: Article[];
}

/**
 * Expected Article titles for validation
 */
const EXPECTED_ARTICLES: Record<Article, string> = {
  1: 'Library-First Development',
  2: 'Test-First Development',
  3: 'Security-First Development',
  4: 'Documentation-First Development',
  5: 'Simplicity-First Development',
  6: 'Performance-First Development',
  7: 'Accessibility-First Development',
  8: 'Privacy-First Development',
  9: 'Integration-First Development',
};

/**
 * Article Parser
 * Validates and processes Articles from constitution
 */
export class ArticleParser {
  /**
   * Validate Articles structure and completeness
   */
  static validate(articles: ArticleConfig[]): ArticleValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingArticles: Article[] = [];

    // Check for exactly 9 articles
    if (articles.length !== 9) {
      errors.push(`Expected 9 Articles, but found ${articles.length}`);
    }

    // Check each expected article
    for (const [articleNum, expectedTitle] of Object.entries(EXPECTED_ARTICLES)) {
      const article = articles.find((a) => a.article === parseInt(articleNum, 10));

      if (!article) {
        missingArticles.push(parseInt(articleNum, 10) as Article);
        errors.push(`Missing Article ${articleNum}: ${expectedTitle}`);
        continue;
      }

      // Validate article structure
      const structureErrors = this.validateArticleStructure(article, expectedTitle);
      errors.push(...structureErrors);
    }

    // Check for duplicate articles
    const articleNumbers = articles.map((a) => a.article);
    const duplicates = articleNumbers.filter((num, index) => articleNumbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate Articles found: ${duplicates.join(', ')}`);
    }

    // Check for unexpected articles
    const validNumbers = Object.keys(EXPECTED_ARTICLES).map(Number);
    const invalidArticles = articles.filter((a) => !validNumbers.includes(a.article));
    if (invalidArticles.length > 0) {
      warnings.push(
        `Unexpected Articles found: ${invalidArticles.map((a) => a.article).join(', ')}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingArticles,
    };
  }

  /**
   * Validate individual Article structure
   */
  private static validateArticleStructure(
    article: ArticleConfig,
    expectedTitle: string
  ): string[] {
    const errors: string[] = [];

    // Check title
    if (!article.title) {
      errors.push(`Article ${article.article}: Missing title`);
    } else if (article.title !== expectedTitle) {
      errors.push(
        `Article ${article.article}: Title mismatch. Expected "${expectedTitle}", got "${article.title}"`
      );
    }

    // Check principle
    if (!article.principle || article.principle.trim() === '') {
      errors.push(`Article ${article.article}: Missing principle`);
    }

    // Check enforcement
    if (!article.enforcement || article.enforcement.trim() === '') {
      errors.push(`Article ${article.article}: Missing enforcement rules`);
    }

    return errors;
  }

  /**
   * Parse and extract Article by number
   */
  static getArticle(articles: ArticleConfig[], articleNum: Article): ArticleConfig | undefined {
    return articles.find((a) => a.article === articleNum);
  }

  /**
   * Get all Article titles
   */
  static getArticleTitles(articles: ArticleConfig[]): Map<Article, string> {
    const titles = new Map<Article, string>();
    for (const article of articles) {
      titles.set(article.article, article.title);
    }
    return titles;
  }

  /**
   * Check if all required Articles are present
   */
  static hasAllArticles(articles: ArticleConfig[]): boolean {
    const requiredArticles: Article[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const presentArticles = articles.map((a) => a.article);

    return requiredArticles.every((num) => presentArticles.includes(num));
  }

  /**
   * Get missing Articles
   */
  static getMissingArticles(articles: ArticleConfig[]): Article[] {
    const requiredArticles: Article[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const presentArticles = articles.map((a) => a.article);

    return requiredArticles.filter((num) => !presentArticles.includes(num));
  }

  /**
   * Get expected Article title
   */
  static getExpectedTitle(articleNum: Article): string {
    return EXPECTED_ARTICLES[articleNum];
  }
}
