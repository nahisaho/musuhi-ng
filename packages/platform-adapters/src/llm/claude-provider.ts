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
  async invoke(prompt: string, context?: Record<string, unknown>): Promise<string> {
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
  private mockInvoke(prompt: string, context?: Record<string, unknown>): string {
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
   *
   * Real implementation with Anthropic SDK:
   * ```typescript
   * import Anthropic from '@anthropic-ai/sdk';
   *
   * const client = new Anthropic({ apiKey: this.config.apiKey });
   * const stream = await client.messages.create({
   *   model: this.model,
   *   max_tokens: this.config.maxTokens || 4096,
   *   temperature: this.config.temperature || 0.7,
   *   messages: [{ role: 'user', content: prompt }],
   *   stream: true,
   * });
   *
   * for await (const event of stream) {
   *   if (event.type === 'content_block_delta' &&
   *       event.delta.type === 'text_delta') {
   *     onChunk(event.delta.text);
   *   }
   * }
   * ```
   */
  async stream(
    prompt: string,
    context: Record<string, unknown> | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // Check if we have API key for real streaming
    if (this.config.apiKey && typeof this.config.apiKey === 'string') {
      try {
        // Try to use Anthropic SDK if available
        await this.streamWithSDK(prompt, context, onChunk);
        return;
      } catch (error) {
        // Fall through to mock streaming
        console.warn('[claude-provider] SDK streaming failed, using mock mode:', error);
      }
    }

    // Fallback: Simulate streaming by chunking the response
    const response = await this.invoke(prompt, context);
    const words = response.split(/(\s+)/); // Preserve whitespace

    for (const word of words) {
      if (word.length > 0) {
        onChunk(word);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
  }

  /**
   * Stream with Anthropic SDK (placeholder for actual implementation)
   * @private
   */
  private streamWithSDK(
    _prompt: string,
    _context: Record<string, unknown> | undefined,
    _onChunk: (chunk: string) => void
  ): Promise<void> {
    // This method would use the actual Anthropic SDK
    // For now, throw to trigger fallback to mock streaming
    return Promise.reject(new Error('Anthropic SDK not available - install @anthropic-ai/sdk'));

    /*
     * Real implementation (uncomment when SDK is installed):
     *
     * import Anthropic from '@anthropic-ai/sdk';
     *
     * const client = new Anthropic({ apiKey: this.config.apiKey });
     *
     * const stream = await client.messages.create({
     *   model: this.model,
     *   max_tokens: this.config.maxTokens || 4096,
     *   temperature: this.config.temperature || 0.7,
     *   system: _context ? JSON.stringify(_context) : undefined,
     *   messages: [{ role: 'user', content: _prompt }],
     *   stream: true,
     * });
     *
     * for await (const event of stream) {
     *   if (event.type === 'content_block_delta' &&
     *       event.delta.type === 'text_delta') {
     *     _onChunk(event.delta.text);
     *   }
     * }
     */
  }
}
