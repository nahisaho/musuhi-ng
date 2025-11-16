/**
 * Platform Adapter Types
 * Based on ADR-007: Multi-Platform Adapter Architecture
 * @module @musuhi/core/types/platform
 */

/**
 * Supported AI coding assistant platforms
 */
export type PlatformType =
  | 'vscode-copilot'
  | 'cursor'
  | 'zed'
  | 'windsurf'
  | 'claude-code'
  | 'codex-cli'
  | 'gemini-cli'
  | 'qwen-code';

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Agent name (from 20 specialized agents) */
  name: string;

  /** Agent role/type */
  role: string;

  /** Agent instructions */
  instructions?: string;

  /** Tool access permissions */
  tools?: string[];

  /** Context to provide to agent */
  context?: Record<string, unknown>;
}

/**
 * Agent context for invocation
 */
export interface AgentContext {
  /** Current working directory */
  cwd: string;

  /** Steering context paths */
  steering: {
    structure?: string;
    tech?: string;
    product?: string;
    constitution?: string;
  };

  /** Additional context data */
  data?: Record<string, unknown>;
}

/**
 * Agent response
 */
export interface AgentResponse {
  /** Response status */
  status: 'success' | 'error' | 'blocked';

  /** Response message */
  message: string;

  /** Response data */
  data?: Record<string, unknown>;

  /** Error details (if status is error) */
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * Delta (file change) for writeDelta operation
 */
export interface Delta {
  /** Operation type */
  type: 'create' | 'update' | 'delete';

  /** File path */
  path: string;

  /** File content (for create/update) */
  content?: string;

  /** Line-based diff (for update) */
  diff?: {
    line: number;
    oldContent: string;
    newContent: string;
  }[];
}

/**
 * Phase Gate for constitutional enforcement
 */
export interface PhaseGate {
  /** Gate name */
  name: string;

  /** Gate type (always 'phase-1' for constitutional gates) */
  type: 'phase-1';

  /** Article numbers to validate */
  articles: number[];

  /** Context for validation */
  context: {
    /** Proposed change */
    change?: Delta;

    /** Additional context */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Gate validation result
 */
export interface GateResult {
  /** Validation status */
  status: 'approved' | 'rejected' | 'needs-review';

  /** Validation message */
  message: string;

  /** Violated articles (if rejected) */
  violations?: {
    article: number;
    reason: string;
  }[];

  /** Suggestions for approval */
  suggestions?: string[];
}

/**
 * Platform Adapter Interface
 * Unified interface for all AI coding assistant platforms
 */
export interface IPlatformAdapter {
  /** Platform type */
  readonly platform: PlatformType;

  /** Platform version */
  readonly version: string;

  /**
   * Initialize the platform adapter
   * @returns Promise resolving when initialized
   */
  initialize(): Promise<void>;

  /**
   * Invoke an AI agent
   * @param agent - Agent configuration
   * @param context - Agent context
   * @returns Promise resolving to agent response
   */
  invokeAgent(agent: AgentConfig, context: AgentContext): Promise<AgentResponse>;

  /**
   * Read steering context file
   * @param path - Relative path from steering directory
   * @returns Promise resolving to file content
   */
  readSteering(path: string): Promise<string>;

  /**
   * Write delta (file changes)
   * @param path - File path
   * @param delta - Delta to apply
   * @returns Promise resolving when delta is written
   */
  writeDelta(path: string, delta: Delta): Promise<void>;

  /**
   * Enforce Phase -1 Gate (constitutional validation)
   * @param gate - Phase gate configuration
   * @returns Promise resolving to gate result
   */
  enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;

  /**
   * Get platform capabilities
   * @returns Platform capabilities
   */
  getCapabilities(): {
    supportsMultiAgent: boolean;
    supportsStreaming: boolean;
    supportsCodeGeneration: boolean;
    supportsRefactoring: boolean;
  };
}
