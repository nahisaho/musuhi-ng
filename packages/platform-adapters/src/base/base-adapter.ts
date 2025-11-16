/**
 * AC-8.1: Platform-Agnostic Core
 * Base abstract adapter class for all platform adapters
 * @module @musuhi/platform-adapters/base
 */

import type {
  IPlatformAdapter,
  PlatformType,
  AgentConfig,
  AgentContext,
  AgentResponse,
  Delta,
  PhaseGate,
  GateResult,
} from '../types/index.js';

/**
 * Abstract base class for all platform adapters
 * Provides common infrastructure and enforces interface compliance
 *
 * All 8 platform adapters extend this class:
 * - ClaudeCodeAdapter (CLI)
 * - CursorAdapter (IDE)
 * - VSCodeCopilotAdapter (IDE)
 * - ZedAdapter (IDE)
 * - WindsurfAdapter (IDE)
 * - CodexCLIAdapter (CLI)
 * - GeminiCLIAdapter (CLI)
 * - QwenCodeAdapter (CLI)
 */
export abstract class BasePlatformAdapter implements IPlatformAdapter {
  abstract readonly platform: PlatformType;
  abstract readonly version: string;

  protected initialized: boolean = false;
  protected projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Initialize the platform adapter
   * @returns Promise resolving when initialized
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.doInitialize();
    this.initialized = true;
  }

  /**
   * Platform-specific initialization logic
   * Subclasses must implement this method
   */
  protected abstract doInitialize(): Promise<void>;

  /**
   * Invoke an AI agent
   * @param agent - Agent configuration
   * @param context - Agent context
   * @returns Promise resolving to agent response
   */
  abstract invokeAgent(
    agent: AgentConfig,
    context: AgentContext
  ): Promise<AgentResponse>;

  /**
   * Read steering context file
   * @param path - Relative path from steering directory
   * @returns Promise resolving to file content
   */
  abstract readSteering(path: string): Promise<string>;

  /**
   * Write delta (file changes)
   * @param path - File path
   * @param delta - Delta to apply
   * @returns Promise resolving when delta is written
   */
  abstract writeDelta(path: string, delta: Delta): Promise<void>;

  /**
   * Enforce Phase -1 Gate (constitutional validation)
   * @param gate - Phase gate configuration
   * @returns Promise resolving to gate result
   */
  abstract enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;

  /**
   * Get platform capabilities
   * @returns Platform capabilities
   */
  abstract getCapabilities(): {
    supportsMultiAgent: boolean;
    supportsStreaming: boolean;
    supportsCodeGeneration: boolean;
    supportsRefactoring: boolean;
  };

  /**
   * Check if adapter is initialized
   * @returns true if initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        `${this.platform} adapter not initialized. Call initialize() first.`
      );
    }
  }
}
