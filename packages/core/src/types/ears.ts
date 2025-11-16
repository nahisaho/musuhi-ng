/**
 * EARS (Easy Approach to Requirements Syntax) Types
 * Based on steering/rules/ears-format.md
 * @module @musuhi/core/types/ears
 */

/**
 * EARS requirement pattern types
 */
export type EARSPattern =
  | 'event-driven' // WHEN [event], the [system] SHALL [response]
  | 'state-driven' // WHILE [state], the [system] SHALL [response]
  | 'unwanted-behavior' // IF [error], THEN the [system] SHALL [response]
  | 'optional' // WHERE [feature enabled], the [system] SHALL [response]
  | 'ubiquitous'; // The [system] SHALL [requirement]

/**
 * EARS requirement priority
 */
export type RequirementPriority = 'must' | 'should' | 'may';

/**
 * EARS requirement type
 */
export type RequirementType = 'functional' | 'non-functional';

/**
 * EARS requirement structure
 */
export interface EARSRequirement {
  /** Unique requirement ID (e.g., FR-001, NFR-001) */
  id: string;

  /** Requirement type */
  type: RequirementType;

  /** EARS pattern used */
  pattern: EARSPattern;

  /** Requirement priority */
  priority: RequirementPriority;

  /** Full requirement statement in EARS format */
  statement: string;

  /** Rationale/justification */
  rationale?: string;

  /** Acceptance criteria */
  acceptanceCriteria?: string[];

  /** Dependencies on other requirements */
  dependencies?: string[];

  /** Source (e.g., stakeholder, user story) */
  source?: string;

  /** Tags for categorization */
  tags?: string[];
}

/**
 * EARS validation result
 */
export interface EARSValidation {
  /** Whether requirement is valid EARS format */
  valid: boolean;

  /** Detected pattern (if valid) */
  pattern?: EARSPattern;

  /** Validation errors */
  errors?: string[];

  /** Validation warnings */
  warnings?: string[];
}

/**
 * Requirements traceability link
 */
export interface TraceabilityLink {
  /** Source requirement ID */
  requirementId: string;

  /** Target artifact type */
  targetType: 'design' | 'task' | 'code' | 'test';

  /** Target artifact ID or path */
  targetId: string;

  /** Link status */
  status: 'mapped' | 'partial' | 'unmapped';

  /** Coverage percentage (0-100) */
  coverage?: number;
}

/**
 * Requirements coverage report
 */
export interface CoverageReport {
  /** Total requirements count */
  totalRequirements: number;

  /** Mapped requirements count */
  mappedRequirements: number;

  /** Partially mapped requirements count */
  partialRequirements: number;

  /** Unmapped requirements count */
  unmappedRequirements: number;

  /** Overall coverage percentage */
  coveragePercentage: number;

  /** Coverage by requirement type */
  byType: {
    functional: number;
    nonFunctional: number;
  };

  /** Traceability links */
  links: TraceabilityLink[];
}
