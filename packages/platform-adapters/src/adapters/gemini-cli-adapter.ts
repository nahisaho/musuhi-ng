/**
 * AC-8.2: CLI Interface Support
 * Google Gemini CLI integration adapter
 * @module @musuhi-ng/platform-adapters/adapters
 */

import { CLIAdapterBase } from '../base/cli-adapter-base.js';
import type {
  PlatformType,
  AgentConfig,
  AgentContext,
  AgentResponse,
} from '../types/index.js';

/**
 * Gemini CLI adapter implementation
 * Integrates with Google Gemini command-line interface
 *
 * Features:
 * - Google Gemini CLI wrapper
 * - Multimodal support (code + context)
 * - Limited parallel execution (5 concurrent tasks)
 */
export class GeminiCLIAdapter extends CLIAdapterBase {
  readonly platform: PlatformType = 'gemini-cli';
  readonly version: string = '2.0.0';
  protected cliCommand = 'gemini';

  protected async doInitialize(): Promise<void> {
    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      console.warn(`[gemini-cli] CLI not found. Install Google Gemini CLI first.`);
      console.warn(`[gemini-cli] Falling back to mock mode`);
    } else {
      console.log(`[gemini-cli] CLI detected and ready`);
    }
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke agent via Gemini CLI
   */
  async invokeAgent(
    agent: AgentConfig,
    _context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      // Mock mode
      console.log(`[gemini-cli] Mock: Invoking ${agent.name}`);
      return {
        status: 'success',
        message: `Mock: Gemini agent ${agent.name} invoked`,
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
        message: `Gemini agent ${agent.name} executed successfully`,
        data: { output, agent: agent.name },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to invoke Gemini agent ${agent.name}`,
        error: {
          code: 'GEMINI_INVOCATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * AC-8.6: Platform-Specific Optimizations
   * Gemini has limited parallel execution
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
