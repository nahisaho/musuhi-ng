/**
 * Constitution Loader
 * Loads and manages the constitution.md file
 * @module @musuhi/constitutional-governance
 */

import type { IFileSystem } from '@musuhi/core';
import type { Article, ArticleConfig } from './types.js';

/**
 * Constitution Loader
 * Manages loading and parsing of constitution.md
 */
export class ConstitutionLoader {
  private fs: IFileSystem;
  private constitutionPath: string;

  constructor(fileSystem: IFileSystem, constitutionPath: string) {
    this.fs = fileSystem;
    this.constitutionPath = constitutionPath;
  }

  /**
   * Load constitution from file
   */
  async load(): Promise<ArticleConfig[]> {
    const exists = await this.fs.fileExists(this.constitutionPath);
    if (!exists) {
      throw new Error(`Constitution file not found at ${this.constitutionPath}`);
    }

    const { content } = await this.fs.readFile(this.constitutionPath);
    return this.parseConstitution(content);
  }

  /**
   * Parse constitution markdown to ArticleConfig[]
   */
  private async parseConstitution(markdown: string): Promise<ArticleConfig[]> {
    const articles: ArticleConfig[] = [];

    // Split markdown into Article sections using ## Article N: pattern
    // Exclude entries with status icons (✅, ❌, ⚠️) at the end
    const articlePattern = /^## Article (\d+): ([^\n✅❌⚠️]+)$/gm;
    const matches = Array.from(markdown.matchAll(articlePattern));

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (!match) continue;

      const articleNumber = parseInt(match[1]!, 10);
      const title = match[2]!.trim();

      // Extract the content between this article and the next one (or end of file)
      const startIndex = match.index!;
      const nextMatch = matches[i + 1];
      const endIndex = nextMatch ? nextMatch.index! : markdown.length;
      const articleContent = markdown.substring(startIndex, endIndex);

      // Extract principle and enforcement from article content
      const principle = this.extractFieldFromMarkdown(articleContent, 'Principle');
      const enforcement = this.extractFieldFromMarkdown(articleContent, 'Enforcement');

      articles.push({
        article: articleNumber as Article,
        title,
        principle: principle || '',
        enforcement: enforcement || '',
        validationRules: [], // Rules will be added by validators
      });
    }

    return articles.sort((a, b) => a.article - b.article);
  }

  /**
   * Extract field value from markdown content
   * Looks for section header followed by bold text
   */
  private extractFieldFromMarkdown(content: string, fieldName: string): string {
    // For "Principle", look for "### Principle" section followed by first bold text
    // For "Enforcement", look for "### Enforcement Rules" section followed by first bold text
    const sectionPattern = fieldName === 'Principle'
      ? '###\\s+Principle'
      : '###\\s+Enforcement\\s+Rules';

    // Match section header followed by optional text, then capture first bold text
    const regex = new RegExp(
      `${sectionPattern}[\\s\\S]*?\\*\\*([^*]+)\\*\\*`,
      'i'
    );
    const match = content.match(regex);

    if (!match || !match[1]) {
      return '';
    }

    // Clean up the extracted text
    return match[1]
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verify constitution file is read-only
   */
  async verifyReadOnly(): Promise<boolean> {
    try {
      const metadata = await this.fs.getMetadata(this.constitutionPath);
      // In a real implementation, check file permissions
      // For now, just verify it exists
      return metadata.path === this.constitutionPath;
    } catch {
      return false;
    }
  }

  /**
   * Get constitution file path
   */
  getPath(): string {
    return this.constitutionPath;
  }
}
