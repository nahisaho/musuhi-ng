/**
 * Gap Analyzer Types
 *
 * Public type exports for the gap analyzer package.
 *
 * @packageDocumentation
 */

export type {
  GapType,
  GapSeverity,
  Gap,
  GapSummary,
  GapReport,
  BreakingChange,
  GapAnalysisConfig,
} from './gap.js';

export type {
  EARSPattern,
  RequirementPriority,
  RequirementStatus,
  Requirement,
  RequirementSet,
  RequirementMapping,
  RequirementParseResult,
  RequirementParseError,
} from './requirement.js';

export type {
  SupportedLanguage,
  CodebaseMetadata,
  DirectoryPattern,
  Dependency,
  CodeFile,
  ExportedSymbol,
  ASTNode,
  ASTParseResult,
  ASTParseError,
} from './codebase.js';
