/**
 * Orchestration Pattern Types
 *
 * Defines orchestration pattern types and configuration.
 * Maps to AC-3.1 through AC-3.6 (Orchestration Patterns)
 */

/**
 * Orchestration pattern types
 *
 * Maps to:
 * - AC-3.1: Sequential Chat
 * - AC-3.2: Group Chat
 * - AC-3.3: Nested Chat
 * - AC-3.4: Swarm Pattern
 * - AC-3.5: AutoPattern
 * - AC-3.6: UserProxyAgent
 */
export enum OrchestrationPattern {
  /** Linear handoff pattern (A → B → C) - AC-3.1 */
  SEQUENTIAL = 'sequential',
  /** Manager-driven speaker selection - AC-3.2 */
  GROUP_CHAT = 'group_chat',
  /** Hierarchical delegation pattern - AC-3.3 */
  NESTED = 'nested',
  /** Autonomous coordination pattern - AC-3.4 */
  SWARM = 'swarm',
  /** State machine based orchestration */
  FSM = 'fsm',
  /** Hierarchical command chain */
  HIERARCHICAL = 'hierarchical',
  /** Human approval gate pattern - AC-3.6 */
  USER_PROXY = 'user_proxy',
  /** Automatic pattern selection - AC-3.5 */
  AUTO = 'auto',
}

/**
 * Speaker selection strategy for Group Chat pattern
 * Maps to AC-3.2
 */
export enum SpeakerSelectionStrategy {
  /** Round-robin selection */
  ROUND_ROBIN = 'round_robin',
  /** Random selection */
  RANDOM = 'random',
  /** Manager decides next speaker */
  MANAGER_DRIVEN = 'manager_driven',
  /** Agent volunteers to speak */
  VOLUNTEER = 'volunteer',
  /** Capability-based selection */
  CAPABILITY_BASED = 'capability_based',
}

/**
 * Pattern execution status
 */
export enum PatternExecutionStatus {
  /** Pattern is initializing */
  INITIALIZING = 'initializing',
  /** Pattern is running */
  RUNNING = 'running',
  /** Pattern is paused */
  PAUSED = 'paused',
  /** Pattern completed successfully */
  COMPLETED = 'completed',
  /** Pattern failed */
  FAILED = 'failed',
  /** Pattern was cancelled */
  CANCELLED = 'cancelled',
  /** Waiting for human approval */
  AWAITING_APPROVAL = 'awaiting_approval',
}

/**
 * Sequential Chat configuration
 * Maps to AC-3.1
 */
export interface SequentialChatConfig {
  /** Ordered list of agent IDs to execute sequentially */
  agentSequence: string[];
  /** Whether to stop on first error */
  stopOnError?: boolean;
  /** Timeout for each agent step (milliseconds) */
  stepTimeout?: number;
}

/**
 * Group Chat configuration
 * Maps to AC-3.2
 */
export interface GroupChatConfig {
  /** List of participating agent IDs */
  participants: string[];
  /** Manager agent ID (optional) */
  managerId?: string;
  /** Speaker selection strategy */
  selectionStrategy: SpeakerSelectionStrategy;
  /** Maximum number of rounds */
  maxRounds?: number;
  /** Whether to allow agents to speak multiple times in a round */
  allowMultipleTurns?: boolean;
}

/**
 * Nested Chat configuration
 * Maps to AC-3.3
 */
export interface NestedChatConfig {
  /** Root agent ID */
  rootAgentId: string;
  /** Maximum nesting depth */
  maxDepth?: number;
  /** Whether child tasks can spawn their own children */
  allowRecursion?: boolean;
}

/**
 * Swarm Pattern configuration
 * Maps to AC-3.4
 */
export interface SwarmPatternConfig {
  /** List of agent IDs in the swarm */
  agents: string[];
  /** Coordination strategy */
  coordinationStrategy: 'autonomous' | 'consensus' | 'leader_election';
  /** Minimum agents required for consensus */
  quorumSize?: number;
  /** Maximum parallel tasks */
  maxParallelTasks?: number;
}

/**
 * FSM Pattern configuration
 */
export interface FSMPatternConfig {
  /** Initial state */
  initialState: string;
  /** State transitions */
  transitions: FSMTransition[];
  /** Agent assignments for each state */
  stateAgents: Record<string, string>;
}

/**
 * FSM transition definition
 */
export interface FSMTransition {
  /** Source state */
  from: string;
  /** Target state */
  to: string;
  /** Transition condition/trigger */
  condition: string;
  /** Optional action to execute on transition */
  action?: string;
}

/**
 * Hierarchical Pattern configuration
 */
export interface HierarchicalPatternConfig {
  /** Root agent ID */
  rootAgentId: string;
  /** Child agents for each parent */
  agentHierarchy: Record<string, string[]>;
  /** Maximum depth */
  maxDepth?: number;
}

/**
 * User Proxy configuration
 * Maps to AC-3.6
 */
export interface UserProxyConfig {
  /** Agent ID that requires approval */
  agentId: string;
  /** Approval timeout (milliseconds) */
  approvalTimeout?: number;
  /** Default action if timeout occurs */
  defaultAction?: 'approve' | 'reject' | 'cancel';
  /** Whether to require approval for all actions */
  requireApprovalForAll?: boolean;
}

/**
 * Pattern configuration union type
 */
export type PatternConfig =
  | SequentialChatConfig
  | GroupChatConfig
  | NestedChatConfig
  | SwarmPatternConfig
  | FSMPatternConfig
  | HierarchicalPatternConfig
  | UserProxyConfig;

/**
 * Pattern execution context
 */
export interface PatternExecutionContext {
  /** Unique execution ID */
  executionId: string;
  /** Pattern being executed */
  pattern: OrchestrationPattern;
  /** Pattern configuration */
  config: PatternConfig;
  /** Current execution status */
  status: PatternExecutionStatus;
  /** Start timestamp */
  startTime: Date;
  /** End timestamp (if completed) */
  endTime?: Date;
  /** Current step/stage in execution */
  currentStep?: number;
  /** Total steps in execution */
  totalSteps?: number;
  /** Error information (if failed) */
  error?: Error;
  /** Execution metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Conversation context
 * Shared state across all patterns
 */
export interface ConversationContext {
  /** Unique conversation ID */
  conversationId: string;
  /** Participating agents */
  agents: string[];
  /** Orchestration pattern in use */
  pattern: OrchestrationPattern;
  /** Pattern execution context */
  execution: PatternExecutionContext;
  /** Shared state accessible to all agents */
  sharedState: Record<string, unknown>;
  /** Conversation metadata */
  metadata?: Record<string, unknown>;
}
