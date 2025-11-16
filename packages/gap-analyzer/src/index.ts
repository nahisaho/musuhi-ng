/**
 * MUSUHI 2.0 Gap Analyzer
 *
 * Feature 5: Brownfield Gap Analysis
 * Automated gap detection comparing requirements vs implementation.
 *
 * @packageDocumentation
 * @module @musuhi-ng/gap-analyzer
 */

// Main analyzer
export { GapAnalyzer } from './gap-analyzer.js';

// Parsers
export { ASTParser } from './parsers/ast-parser.js';
export { PatternMatcher } from './parsers/pattern-matcher.js';

// Detectors
export { MissingFeatureDetector } from './detectors/missing-feature-detector.js';
export { UndocumentedFeatureDetector } from './detectors/undocumented-feature-detector.js';
export { ConflictDetector } from './detectors/conflict-detector.js';
export { BreakingChangeDetector } from './detectors/breaking-change-detector.js';
export { PatternViolationDetector } from './detectors/pattern-violation-detector.js';

// Engine
export { RecommendationEngine, type Recommendation, type RecommendationType } from './engine/recommendation-engine.js';
export { GapReportGenerator } from './engine/gap-report-generator.js';

// Types
export type {
  GapType,
  GapSeverity,
  Gap,
  GapSummary,
  GapReport,
  BreakingChange,
  GapAnalysisConfig,
  EARSPattern,
  RequirementPriority,
  RequirementStatus,
  Requirement,
  RequirementSet,
  RequirementMapping,
  RequirementParseResult,
  RequirementParseError,
  SupportedLanguage,
  CodebaseMetadata,
  DirectoryPattern,
  Dependency,
  CodeFile,
  ExportedSymbol,
  ASTNode,
  ASTParseResult,
  ASTParseError,
} from './types/index.js';
