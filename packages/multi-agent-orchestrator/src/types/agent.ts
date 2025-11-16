/**
 * Agent Types
 *
 * Defines core agent interfaces for multi-agent orchestration.
 * Maps to AC-3.8 (Capability Discovery)
 */

/**
 * Agent capability descriptor
 * Used for skill matching and task assignment
 */
export interface AgentCapability {
  /** Unique capability identifier */
  id: string;
  /** Human-readable capability name */
  name: string;
  /** Detailed capability description */
  description: string;
  /** Capability category (e.g., 'analysis', 'development', 'testing') */
  category: string;
  /** Proficiency level (0.0 to 1.0) */
  proficiency: number;
  /** Optional metadata for capability matching */
  metadata?: Record<string, unknown>;
}

/**
 * Agent role in orchestration patterns
 */
export enum AgentRole {
  /** Coordinates other agents */
  COORDINATOR = 'coordinator',
  /** Executes specific tasks */
  EXECUTOR = 'executor',
  /** Reviews work from other agents */
  REVIEWER = 'reviewer',
  /** Human proxy for approval gates */
  USER_PROXY = 'user_proxy',
  /** Provides specialized expertise */
  SPECIALIST = 'specialist',
}

/**
 * Agent status in conversation
 */
export enum AgentStatus {
  /** Agent is available for tasks */
  AVAILABLE = 'available',
  /** Agent is currently busy */
  BUSY = 'busy',
  /** Agent is idle */
  IDLE = 'idle',
  /** Agent has encountered an error */
  ERROR = 'error',
  /** Agent is offline */
  OFFLINE = 'offline',
}

/**
 * Core Agent interface
 *
 * Represents an autonomous agent that can participate in orchestration patterns.
 * Maps to AC-3.7 (Tool Registration) and AC-3.8 (Capability Discovery)
 */
export interface Agent {
  /** Unique agent identifier */
  id: string;
  /** Human-readable agent name */
  name: string;
  /** Agent description and purpose */
  description: string;
  /** Agent's role in the orchestration */
  role: AgentRole;
  /** List of agent capabilities for task matching */
  capabilities: AgentCapability[];
  /** Current agent status */
  status: AgentStatus;
  /** Optional configuration for agent behavior */
  config?: AgentConfig;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Maximum number of concurrent tasks */
  maxConcurrentTasks?: number;
  /** Timeout for task execution (milliseconds) */
  taskTimeout?: number;
  /** Whether agent requires human approval for tasks */
  requiresApproval?: boolean;
  /** Custom configuration parameters */
  [key: string]: unknown;
}

/**
 * Agent registry entry
 * Used by CapabilityRegistry for agent discovery
 */
export interface AgentRegistryEntry {
  /** The agent instance */
  agent: Agent;
  /** Registration timestamp */
  registeredAt: Date;
  /** Last activity timestamp */
  lastActiveAt: Date;
  /** Number of completed tasks */
  taskCount: number;
  /** Average task success rate (0.0 to 1.0) */
  successRate: number;
}
