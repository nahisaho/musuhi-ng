/**
 * Multi-Agent Orchestrator
 *
 * Core infrastructure for multi-agent orchestration patterns.
 * Supports Sequential, Group, Nested, Swarm, and other orchestration patterns.
 *
 * @packageDocumentation
 */

// Export all types
export * from './types/index.js';

// Export core components
export { ConversationHistory } from './core/conversation-history.js';
export type {
  ConversationStats,
  ConversationExport,
} from './core/conversation-history.js';

export { Orchestrator } from './core/orchestrator.js';
export type {
  OrchestrationContext,
  OrchestratorConfig,
} from './core/orchestrator.js';

export { PatternSelector } from './core/pattern-selector.js';
export type { PatternRecommendation } from './core/pattern-selector.js';

// Export registry components
export {
  ToolRegistry,
  ToolValidationError,
  ToolExecutionError,
} from './registry/tool-registry.js';
export type {
  ToolParameter,
  ToolSignature,
  ToolMetadata,
  ToolFunction,
  RegisteredTool,
} from './registry/tool-registry.js';

export { CapabilityRegistry } from './registry/capability-registry.js';
export type {
  CapabilityMatch,
  TaskRequirements,
  AgentSearchCriteria,
} from './registry/capability-registry.js';
