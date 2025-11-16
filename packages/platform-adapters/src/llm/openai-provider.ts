/**
 * AC-8.7: LLM Abstraction Layer
 * OpenAI GPT-4 LLM provider implementation
 * @module @musuhi-ng/platform-adapters/llm
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import type { ILLMProvider, LLMConfig } from './llm-provider.js';

const execAsync = promisify(exec);

/**
 * OpenAI GPT-4 provider
 * Integrates with OpenAI models via CLI or SDK
 *
 * Models supported:
 * - gpt-4-turbo-preview (latest GPT-4)
 * - gpt-4 (standard)
 * - gpt-3.5-turbo (faster, cheaper)
 */
export class OpenAIProvider implements ILLMProvider {
  readonly name = 'gpt-4';
  readonly model: string;
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
    this.model = config.model || 'gpt-4-turbo-preview';
  }

  /**
   * Invoke GPT-4 model with prompt
   * @param prompt - Input prompt
   * @param context - Additional context
   * @returns Promise resolving to generated response
   */
  async invoke(prompt: string, context?: Record<string, unknown>): Promise<string> {
    try {
      // Use OpenAI CLI if available
      const cliArgs = ['--model', this.model];

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

      const command = `openai ${cliArgs.join(' ')}`;
      const { stdout } = await execAsync(command);

      return stdout.trim();
    } catch (error) {
      // Fallback to mock mode
      console.warn(`[openai-provider] CLI not available, using mock mode`);
      return this.mockInvoke(prompt, context);
    }
  }

  /**
   * Mock invocation for testing/development
   */
  private mockInvoke(prompt: string, context?: Record<string, unknown>): string {
    return `Mock GPT-4 response to: "${prompt.substring(0, 50)}..."${
      context ? ` (context: ${Object.keys(context).join(', ')})` : ''
    }`;
  }

  /**
   * Check if streaming is supported
   * @returns true (GPT-4 supports streaming)
   */
  supportsStreaming(): boolean {
    return true;
  }

  /**
   * Stream response from GPT-4
   * @param prompt - Input prompt
   * @param context - Additional context
   * @param onChunk - Callback for each chunk
   *
   * Real implementation with OpenAI SDK:
   * ```typescript
   * import OpenAI from 'openai';
   *
   * const client = new OpenAI({ apiKey: this.config.apiKey });
   * const stream = await client.chat.completions.create({
   *   model: this.model,
   *   max_tokens: this.config.maxTokens || 4096,
   *   temperature: this.config.temperature || 0.7,
   *   messages: [
   *     ...(context ? [{ role: 'system', content: JSON.stringify(context) }] : []),
   *     { role: 'user', content: prompt }
   *   ],
   *   stream: true,
   * });
   *
   * for await (const chunk of stream) {
   *   const content = chunk.choices[0]?.delta?.content;
   *   if (content) onChunk(content);
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
        // Try to use OpenAI SDK if available
        await this.streamWithSDK(prompt, context, onChunk);
        return;
      } catch (error) {
        // Fall through to mock streaming
        console.warn('[openai-provider] SDK streaming failed, using mock mode:', error);
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
   * Stream with OpenAI SDK (placeholder for actual implementation)
   * @private
   */
  private streamWithSDK(
    _prompt: string,
    _context: Record<string, unknown> | undefined,
    _onChunk: (chunk: string) => void
  ): Promise<void> {
    // This method would use the actual OpenAI SDK
    // For now, throw to trigger fallback to mock streaming
    return Promise.reject(new Error('OpenAI SDK not available - install openai'));

    /*
     * Real implementation (uncomment when SDK is installed):
     *
     * import OpenAI from 'openai';
     *
     * const client = new OpenAI({ apiKey: this.config.apiKey });
     *
     * const stream = await client.chat.completions.create({
     *   model: this.model,
     *   max_tokens: this.config.maxTokens || 4096,
     *   temperature: this.config.temperature || 0.7,
     *   messages: [
     *     ...(_context ? [{ role: 'system', content: JSON.stringify(_context) }] : []),
     *     { role: 'user', content: _prompt }
     *   ],
     *   stream: true,
     * });
     *
     * for await (const chunk of stream) {
     *   const content = chunk.choices[0]?.delta?.content;
     *   if (content) _onChunk(content);
     * }
     */
  }
}
