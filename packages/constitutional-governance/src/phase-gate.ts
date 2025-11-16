/**
 * Phase -1 Gate
 * Pre-approval validation before any change
 * @module @musuhi/constitutional-governance
 */

import type {
  PhaseMinusOneGate,
  ValidationContext,
  ValidationResult,
  Article,
  ArticleConfig,
} from './types.js';
import { LibraryFirstValidator } from './validators/library-first-validator.js';
import { TestFirstValidator } from './validators/test-first-validator.js';
import { SecurityFirstValidator } from './validators/security-first-validator.js';
import { DocumentationFirstValidator } from './validators/documentation-first-validator.js';
import { SimplicityFirstValidator } from './validators/simplicity-first-validator.js';
import { PerformanceFirstValidator } from './validators/performance-first-validator.js';
import { AccessibilityFirstValidator } from './validators/accessibility-first-validator.js';
import { PrivacyFirstValidator } from './validators/privacy-first-validator.js';
import { IntegrationFirstValidator } from './validators/integration-first-validator.js';

/**
 * Phase -1 Gate Validator
 * Enforces constitutional compliance before changes
 */
export class PhaseGateValidator {
  private articles: ArticleConfig[];

  constructor(articles: ArticleConfig[]) {
    this.articles = articles;
    this.initializeValidationRules();
  }

  /**
   * Initialize validation rules for all articles
   */
  private initializeValidationRules(): void {
    // Article 1: Library-First
    const article1 = this.articles.find((a) => a.article === 1);
    if (article1) {
      article1.validationRules = LibraryFirstValidator.createRules();
    }

    // Article 2: Test-First
    const article2 = this.articles.find((a) => a.article === 2);
    if (article2) {
      article2.validationRules = TestFirstValidator.createRules();
    }

    // Article 3: Security-First
    const article3 = this.articles.find((a) => a.article === 3);
    if (article3) {
      article3.validationRules = SecurityFirstValidator.createRules();
    }

    // Article 4: Documentation-First
    const article4 = this.articles.find((a) => a.article === 4);
    if (article4) {
      article4.validationRules = DocumentationFirstValidator.createRules();
    }

    // Article 5: Simplicity-First
    const article5 = this.articles.find((a) => a.article === 5);
    if (article5) {
      article5.validationRules = SimplicityFirstValidator.createRules();
    }

    // Article 6: Performance-First
    const article6 = this.articles.find((a) => a.article === 6);
    if (article6) {
      article6.validationRules = PerformanceFirstValidator.createRules();
    }

    // Article 7: Accessibility-First
    const article7 = this.articles.find((a) => a.article === 7);
    if (article7) {
      article7.validationRules = AccessibilityFirstValidator.createRules();
    }

    // Article 8: Privacy-First
    const article8 = this.articles.find((a) => a.article === 8);
    if (article8) {
      article8.validationRules = PrivacyFirstValidator.createRules();
    }

    // Article 9: Integration-First
    const article9 = this.articles.find((a) => a.article === 9);
    if (article9) {
      article9.validationRules = IntegrationFirstValidator.createRules();
    }
  }

  /**
   * Validate a change through Phase -1 Gate
   */
  async validate(context: ValidationContext, articlesToValidate?: Article[]): Promise<PhaseMinusOneGate> {
    const articlesSet = new Set(articlesToValidate ?? [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const validations: ValidationResult[] = [];
    const violations: { article: number; reason: string }[] = [];

    for (const article of this.articles) {
      if (!articlesSet.has(article.article)) {
        continue;
      }

      for (const rule of article.validationRules) {
        const result = await rule.validator(context);

        validations.push(result);

        if (!result.valid && result.article) {
          violations.push({
            article: result.article,
            reason: result.message || 'Validation failed',
          });
        }
      }
    }

    // Determine gate status
    const hasErrors = validations.some((v) => !v.valid && v.article);
    const status = hasErrors ? 'rejected' : 'approved';

    return {
      name: 'Phase -1 Gate',
      articles: Array.from(articlesSet),
      status,
      validations,
      timestamp: new Date(),
      context,
    };
  }

  /**
   * Validate specific article only
   */
  async validateArticle(
    context: ValidationContext,
    article: Article
  ): Promise<ValidationResult[]> {
    const articleConfig = this.articles.find((a) => a.article === article);
    if (!articleConfig) {
      throw new Error(`Article ${article} not found`);
    }

    const results: ValidationResult[] = [];

    for (const rule of articleConfig.validationRules) {
      const result = await rule.validator(context);
      results.push(result);
    }

    return results;
  }

  /**
   * Get all articles
   */
  getArticles(): ArticleConfig[] {
    return this.articles;
  }

  /**
   * Get article by number
   */
  getArticle(article: Article): ArticleConfig | undefined {
    return this.articles.find((a) => a.article === article);
  }
}
