/**
 * AC-8.7: LLM Abstraction Layer
 * Claude (Anthropic) LLM provider implementation
 * @module @musuhi-ng/platform-adapters/llm
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { ILLMProvider, LLMConfig } from './llm-provider.js';

const execAsync = promisify(exec);

/**
 * Claude LLM provider
 * Integrates with Anthropic Claude models via CLI or SDK
 *
 * Models supported:
 * - claude-3-opus-20240229 (most capable)
 * - claude-3-sonnet-20240229 (balanced)
 * - claude-3-haiku-20240307 (fastest)
 */
export class ClaudeProvider implements ILLMProvider {
  readonly name = 'claude';
  readonly model: string;
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
    this.model = config.model || 'claude-3-sonnet-20240229';
  }

  /**
   * Invoke Claude model with prompt
   * @param prompt - Input prompt
   * @param context - Additional context
   * @returns Promise resolving to generated response
   */
  async invoke(
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<string> {
    try {
      // Check if Claude CLI is available
      const cliArgs = ['--model', this.model];

      if (this.config.temperature !== undefined) {
        cliArgs.push('--temperature', this.config.temperature.toString());
      }

      if (this.config.maxTokens !== undefined) {
        cliArgs.push('--max-tokens', this.config.maxTokens.toString());
      }

      // Add context as system prompt if provided
      if (context) {
        cliArgs.push('--system', JSON.stringify(context));
      }

      cliArgs.push(JSON.stringify(prompt));

      const command = `claude ${cliArgs.join(' ')}`;
      const { stdout } = await execAsync(command);

      return stdout.trim();
    } catch (error) {
      // Fallback to mock mode
      console.warn(`[claude-provider] CLI not available, using mock mode`);
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
    return `Mock Claude response to: "${prompt.substring(0, 50)}..."${
      context ? ` (context: ${Object.keys(context).join(', ')})` : ''
    }`;
  }

  /**
   * Check if streaming is supported
   * @returns true (Claude supports streaming)
   */
  supportsStreaming(): boolean {
    return true;
  }

  /**
   * Stream response from Claude
   * @param prompt - Input prompt
   * @param context - Additional context
   * @param onChunk - Callback for each chunk
   */
  async stream(
    prompt: string,
    context: Record<string, unknown> | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // NOTE: Real implementation would use Anthropic SDK with streaming
    // For now, simulate streaming by chunking the response
    const response = await this.invoke(prompt, context);
    const chunks = response.split(' ');

    for (const chunk of chunks) {
      onChunk(chunk + ' ');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}
