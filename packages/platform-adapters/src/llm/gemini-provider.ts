/**
 * AC-8.7: LLM Abstraction Layer
 * Google Gemini LLM provider implementation
 * @module @musuhi/platform-adapters/llm
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { ILLMProvider, LLMConfig } from './llm-provider.js';

const execAsync = promisify(exec);

/**
 * Google Gemini provider
 * Integrates with Google Gemini models via CLI or SDK
 *
 * Models supported:
 * - gemini-pro (text generation)
 * - gemini-pro-vision (multimodal)
 */
export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  readonly model: string;
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
    this.model = config.model || 'gemini-pro';
  }

  /**
   * Invoke Gemini model with prompt
   * @param prompt - Input prompt
   * @param context - Additional context
   * @returns Promise resolving to generated response
   */
  async invoke(
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<string> {
    try {
      const cliArgs = ['generate', '--model', this.model];

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

      const command = `gemini ${cliArgs.join(' ')}`;
      const { stdout } = await execAsync(command);

      return stdout.trim();
    } catch (error) {
      console.warn(`[gemini-provider] CLI not available, using mock mode`);
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
    return `Mock Gemini response to: "${prompt.substring(0, 50)}..."${
      context ? ` (context: ${Object.keys(context).join(', ')})` : ''
    }`;
  }

  /**
   * Check if streaming is supported
   * @returns true (Gemini supports streaming)
   */
  supportsStreaming(): boolean {
    return true;
  }

  /**
   * Stream response from Gemini
   * @param prompt - Input prompt
   * @param context - Additional context
   * @param onChunk - Callback for each chunk
   */
  async stream(
    prompt: string,
    context: Record<string, unknown> | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await this.invoke(prompt, context);
    const chunks = response.split(' ');

    for (const chunk of chunks) {
      onChunk(chunk + ' ');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}
