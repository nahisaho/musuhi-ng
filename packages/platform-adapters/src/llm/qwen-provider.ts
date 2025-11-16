/**
 * AC-8.7: LLM Abstraction Layer
 * Alibaba Qwen LLM provider implementation
 * @module @musuhi/platform-adapters/llm
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { ILLMProvider, LLMConfig } from './llm-provider.js';

const execAsync = promisify(exec);

/**
 * Alibaba Qwen provider
 * Integrates with Qwen code generation models
 *
 * Models supported:
 * - qwen-coder (code generation)
 * - qwen-chat (general chat)
 */
export class QwenProvider implements ILLMProvider {
  readonly name = 'qwen';
  readonly model: string;
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
    this.model = config.model || 'qwen-coder';
  }

  /**
   * Invoke Qwen model with prompt
   * @param prompt - Input prompt
   * @param context - Additional context
   * @returns Promise resolving to generated response
   */
  async invoke(
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<string> {
    try {
      const cliArgs = ['code-gen', '--model', this.model];

      if (this.config.temperature !== undefined) {
        cliArgs.push('--temperature', this.config.temperature.toString());
      }

      if (this.config.maxTokens !== undefined) {
        cliArgs.push('--max-tokens', this.config.maxTokens.toString());
      }

      if (context) {
        cliArgs.push('--context', JSON.stringify(context));
      }

      cliArgs.push(JSON.stringify(prompt));

      const command = `qwen ${cliArgs.join(' ')}`;
      const { stdout } = await execAsync(command);

      return stdout.trim();
    } catch (error) {
      console.warn(`[qwen-provider] CLI not available, using mock mode`);
      return this.mockInvoke(prompt, context);
    }
  }

  /**
   * Mock invocation for testing/development
   */
  private mockInvoke(
    prompt: string,
    context?: Record<string, unknown>
  ): string {
    return `Mock Qwen response to: "${prompt.substring(0, 50)}..."${
      context ? ` (context: ${Object.keys(context).join(', ')})` : ''
    }`;
  }

  /**
   * Check if streaming is supported
   * @returns false (Qwen does not support streaming in current implementation)
   */
  supportsStreaming(): boolean {
    return false;
  }
}
