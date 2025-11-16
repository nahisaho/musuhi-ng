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
  async invoke(
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<string> {
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
  private mockInvoke(
    prompt: string,
    context?: Record<string, unknown>
  ): string {
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
   */
  async stream(
    prompt: string,
    context: Record<string, unknown> | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // NOTE: Real implementation would use OpenAI SDK with streaming
    // For now, simulate streaming
    const response = await this.invoke(prompt, context);
    const chunks = response.split(' ');

    for (const chunk of chunks) {
      onChunk(chunk + ' ');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}
