/**
 * Requirement Types
 *
 * Defines types for EARS-format requirements and their metadata.
 *
 * @packageDocumentation
 */

/**
 * EARS requirement patterns
 *
 * Five standard patterns from Easy Approach to Requirements Syntax:
 * - event-driven: WHEN [event], the [system] SHALL [response]
 * - state-driven: WHILE [state], the [system] SHALL [response]
 * - unwanted: IF [error], THEN the [system] SHALL [response]
 * - optional: WHERE [feature enabled], the [system] SHALL [response]
 * - ubiquitous: The [system] SHALL [requirement]
 */
export type EARSPattern =
  | 'event-driven'
  | 'state-driven'
  | 'unwanted'
  | 'optional'
  | 'ubiquitous';

/**
 * Requirement priority levels
 *
 * - P0: Critical, must-have features
 * - P1: High priority, important features
 * - P2: Medium priority, nice-to-have features
 */
export type RequirementPriority = 'P0' | 'P1' | 'P2';

/**
 * Requirement status in implementation
 */
export type RequirementStatus =
  | 'not-started'
  | 'in-progress'
  | 'implemented'
  | 'verified'
  | 'deprecated';

/**
 * EARS-format requirement
 *
 * Represents a single acceptance criterion (AC-X.Y) with its metadata
 * and implementation keywords for gap analysis.
 */
export interface Requirement {
  /** Unique requirement identifier (e.g., AC-5.1) */
  id: string;

  /** Feature name or brief title */
  feature: string;

  /** Full requirement description in EARS format */
  description: string;

  /** EARS pattern used for this requirement */
  pattern: EARSPattern;

  /** Priority level (P0, P1, P2) */
  priority: RequirementPriority;

  /** Keywords for pattern matching in code */
  keywords: string[];

  /** File patterns where implementation is expected (glob) */
  expectedFiles?: string[];

  /** Current implementation status */
  status?: RequirementStatus;

  /** Path to files implementing this requirement */
  implementedIn?: string[];

  /** Test files verifying this requirement */
  testedBy?: string[];

  /** Related requirements (dependencies) */
  dependencies?: string[];

  /** Source feature number (1-8 for Features 1-8) */
  featureNumber?: number;
}

/**
 * Collection of requirements from a requirements document
 */
export interface RequirementSet {
  /** Source file path */
  source: string;

  /** All requirements parsed from the document */
  requirements: Requirement[];

  /** Total requirement count */
  totalCount: number;

  /** Requirements grouped by feature */
  byFeature?: Map<number, Requirement[]>;

  /** Requirements grouped by priority */
  byPriority?: Map<RequirementPriority, Requirement[]>;
}

/**
 * Requirement-to-code mapping
 *
 * Tracks which code files implement which requirements for traceability.
 */
export interface RequirementMapping {
  /** Requirement ID */
  requirementId: string;

  /** Files implementing this requirement */
  implementationFiles: string[];

  /** Test files verifying this requirement */
  testFiles: string[];

  /** Coverage percentage (0.0 to 1.0) */
  coverage: number;

  /** Whether requirement is fully implemented */
  isImplemented: boolean;

  /** Whether requirement is fully tested */
  isTested: boolean;
}

/**
 * Parsing result for a requirements document
 */
export interface RequirementParseResult {
  /** Successfully parsed requirements */
  requirements: Requirement[];

  /** Parsing errors encountered */
  errors: RequirementParseError[];

  /** Whether parsing was successful */
  success: boolean;
}

/**
 * Error encountered during requirements parsing
 */
export interface RequirementParseError {
  /** Line number where error occurred */
  line: number;

  /** Error message */
  message: string;

  /** Severity of the error */
  severity: 'error' | 'warning';

  /** Context around the error */
  context?: string;
}
