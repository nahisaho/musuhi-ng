/**
 * Constitutional Governance Types
 * Based on ADR-001 and steering/constitution.md
 * @module @musuhi/core/types/constitutional
 */

/**
 * Constitutional Articles (9 immutable principles)
 */
export enum Article {
  LibraryFirst = 1,
  TestFirst = 2,
  SecurityFirst = 3,
  DocumentationFirst = 4,
  SimplicityFirst = 5,
  PerformanceFirst = 6,
  AccessibilityFirst = 7,
  PrivacyFirst = 8,
  IntegrationFirst = 9,
}

/**
 * Constitutional article configuration
 */
export interface ArticleConfig {
  /** Article number */
  article: Article;

  /** Article title */
  title: string;

  /** Article principle */
  principle: string;

  /** Enforcement mechanism description */
  enforcement: string;

  /** Validation rules */
  validationRules: ValidationRule[];

  /** Examples of compliance */
  examples?: string[];
}

/**
 * Validation rule for constitutional article
 */
export interface ValidationRule {
  /** Rule name */
  name: string;

  /** Rule description */
  description: string;

  /** Rule validator function */
  validator: (context: ValidationContext) => Promise<ValidationResult>;

  /** Rule severity */
  severity: 'error' | 'warning' | 'info';

  /** Auto-fix available */
  autoFixable?: boolean;
}

/**
 * Validation context
 */
export interface ValidationContext {
  /** File path being validated */
  filePath?: string;

  /** File content being validated */
  content?: string;

  /** Change delta being validated */
  delta?: {
    type: 'create' | 'update' | 'delete';
    path: string;
    content?: string;
  };

  /** Project root directory */
  projectRoot: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Validation passed */
  valid: boolean;

  /** Violated article (if invalid) */
  article?: Article;

  /** Violation message */
  message?: string;

  /** Violation details */
  details?: string[];

  /** Suggestions for fixing */
  suggestions?: string[];

  /** Auto-fix content (if available) */
  autoFix?: string;
}

/**
 * Phase -1 Gate configuration
 * Pre-approval validation before any change
 */
export interface PhaseMinusOneGate {
  /** Gate name */
  name: string;

  /** Articles to validate */
  articles: Article[];

  /** Gate status */
  status: 'pending' | 'approved' | 'rejected';

  /** Validation results */
  validations: ValidationResult[];

  /** Gate timestamp */
  timestamp: Date;

  /** Change context */
  context: ValidationContext;
}

/**
 * Constitutional governance configuration
 */
export interface ConstitutionalConfig {
  /** Constitution file path (read-only) */
  constitutionPath: string;

  /** All article configurations */
  articles: ArticleConfig[];

  /** Phase -1 Gate enabled */
  phaseGateEnabled: boolean;

  /** Auto-fix enabled */
  autoFixEnabled: boolean;

  /** Strict mode (all violations are errors) */
  strictMode: boolean;
}
