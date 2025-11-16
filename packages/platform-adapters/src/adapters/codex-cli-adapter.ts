/**
 * AC-8.2: CLI Interface Support
 * OpenAI Codex CLI integration adapter
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
 * Codex CLI adapter implementation
 * Integrates with OpenAI Codex command-line interface
 *
 * Features:
 * - OpenAI Codex CLI wrapper
 * - Code generation and completion
 * - Limited multi-agent support (5 concurrent tasks)
 */
export class CodexCLIAdapter extends CLIAdapterBase {
  readonly platform: PlatformType = 'codex-cli';
  readonly version: string = '2.0.0';
  protected cliCommand = 'codex';

  protected async doInitialize(): Promise<void> {
    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      console.warn(`[codex-cli] CLI not found. Install OpenAI Codex CLI first.`);
      console.warn(`[codex-cli] Falling back to mock mode`);
    } else {
      console.log(`[codex-cli] CLI detected and ready`);
    }
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke agent via Codex CLI
   */
  async invokeAgent(
    agent: AgentConfig,
    _context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      // Mock mode
      console.log(`[codex-cli] Mock: Invoking ${agent.name}`);
      return {
        status: 'success',
        message: `Mock: Codex agent ${agent.name} invoked`,
        data: { agent: agent.name, mode: 'mock' },
      };
    }

    try {
      const args = ['generate'];

      if (agent.instructions) {
        args.push(`--prompt="${agent.instructions}"`);
      }

      const output = await this.execCLI(args);

      return {
        status: 'success',
        message: `Codex agent ${agent.name} executed successfully`,
        data: { output, agent: agent.name },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to invoke Codex agent ${agent.name}`,
        error: {
          code: 'CODEX_INVOCATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * AC-8.6: Platform-Specific Optimizations
   * Codex has limited parallel execution (5 concurrent tasks vs 10)
   */
  getCapabilities() {
    return {
      supportsMultiAgent: true,
      supportsStreaming: false, // Codex CLI doesn't support streaming
      supportsCodeGeneration: true,
      supportsRefactoring: true,
    };
  }
}
