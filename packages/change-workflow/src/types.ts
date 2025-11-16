/**
 * Change Workflow Types
 * @module @musuhi-ng/change-workflow
 */

/**
 * Change workspace directory structure
 */
export interface ChangeWorkspace {
  /** Root directory: changes/YYYY-MM-DD-change-name/ */
  root: string;

  /** Proposal file: proposal.md */
  proposalPath: string;

  /** Tasks file: tasks.md */
  tasksPath: string;

  /** Design file: design.md */
  designPath: string;

  /** Specs subdirectory: specs/ */
  specsDir: string;

  /** Created timestamp */
  createdAt: Date;
}

/**
 * Change proposal metadata
 */
export interface ChangeProposal {
  /** Change name (kebab-case) */
  name: string;

  /** Change description */
  description: string;

  /** Author */
  author: string;

  /** Created date */
  createdDate: string;

  /** Status */
  status: 'draft' | 'review' | 'approved' | 'archived';
}

/**
 * Delta change operation
 */
export interface DeltaOperation {
  /** Operation type */
  type: 'ADDED' | 'MODIFIED' | 'REMOVED';

  /** Spec file path (relative to specs/) */
  specPath: string;

  /** Change content */
  content: string;
}

/**
 * Change delta format
 */
export interface ChangeDelta {
  /** All delta operations */
  operations: DeltaOperation[];

  /** Affected spec files */
  affectedSpecs: string[];
}
