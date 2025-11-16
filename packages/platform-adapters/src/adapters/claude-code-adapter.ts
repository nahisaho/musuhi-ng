/**
 * AC-8.2: CLI Interface Support
 * Claude Code CLI integration adapter (primary platform)
 * @module @musuhi/platform-adapters/adapters
 */

import { CLIAdapterBase } from '../base/cli-adapter-base.js';
import type {
  PlatformType,
  AgentConfig,
  AgentContext,
  AgentResponse,
} from '../types/index.js';

/**
 * Claude Code adapter implementation
 * Primary platform for MUSUHI 2.0 development
 *
 * Features:
 * - Native CLI integration via child_process
 * - Direct @agent invocation
 * - Auto-reads .claude/ directory
 * - Full SDD workflow support
 */
export class ClaudeCodeAdapter extends CLIAdapterBase {
  readonly platform: PlatformType = 'claude-code';
  readonly version: string = '2.0.0';
  protected cliCommand = 'claude';

  /**
   * Initialize Claude Code adapter
   * Verifies CLI availability
   */
  protected async doInitialize(): Promise<void> {
    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      console.warn(
        `[claude-code] CLI not found. Install with: npm install -g @anthropic-ai/claude-code`
      );
      console.warn(
        `[claude-code] Falling back to mock mode (responses will be simulated)`
      );
    } else {
      console.log(`[claude-code] CLI detected and ready`);
    }
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke an AI agent via Claude Code CLI
   *
   * @param agent - Agent configuration
   * @param context - Agent context
   * @returns Promise resolving to agent response
   *
   * @example
   * ```ts
   * const response = await adapter.invokeAgent(
   *   { name: 'requirements-analyst', role: 'requirements', tools: ['read', 'write'] },
   *   { cwd: '/project', steering: { structure: 'structure.md' } }
   * );
   * ```
   */
  async invokeAgent(
    agent: AgentConfig,
    context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      // Mock mode: Return simulated success response
      console.log(`[claude-code] Mock: Invoking @${agent.name}`);
      return {
        status: 'success',
        message: `Mock: Agent @${agent.name} invoked successfully`,
        data: {
          agent: agent.name,
          mode: 'mock',
          context: context.cwd,
        },
      };
    }

    try {
      // Real CLI invocation
      const args = [`@${agent.name}`];

      if (agent.instructions) {
        args.push(`--prompt="${agent.instructions}"`);
      }

      if (context.cwd) {
        args.push(`--cwd="${context.cwd}"`);
      }

      const output = await this.execCLI(args);

      return {
        status: 'success',
        message: `Agent @${agent.name} executed successfully`,
        data: {
          output,
          agent: agent.name,
          context: context.cwd,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to invoke agent @${agent.name}`,
        error: {
          code: 'AGENT_INVOCATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  }

  /**
   * AC-8.6: Platform-Specific Optimizations
   * Get Claude Code platform capabilities
   *
   * @returns Platform capabilities (full support for all features)
   */
  getCapabilities() {
    return {
      supportsMultiAgent: true,
      supportsStreaming: true,
      supportsCodeGeneration: true,
      supportsRefactoring: true,
    };
  }
}
