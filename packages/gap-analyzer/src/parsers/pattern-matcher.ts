/**
 * Pattern Matcher
 *
 * Fast keyword-based pattern matching for gap analysis.
 * Used for quick scans and breaking change detection (AC-5.6).
 *
 * @packageDocumentation
 */

import type { Requirement } from '../types/index.js';

/**
 * Pattern matching result
 */
export interface PatternMatchResult {
  /** Whether pattern was found */
  found: boolean;

  /** Matched keywords */
  matchedKeywords: string[];

  /** Line numbers where matches occurred */
  matchedLines: number[];
}

/**
 * Pattern Matcher for fast keyword searches
 *
 * AC-5.6: Breaking Change Detection - Quick scan for API changes
 *
 * Complements AST Parser with faster, simpler keyword matching.
 * Trade-off: Speed vs. accuracy (may have false positives in comments/strings).
 */
export class PatternMatcher {
  /**
   * Search text for given keywords
   *
   * Fast keyword search without AST parsing.
   * Returns true if any keyword found in text.
   *
   * @param text - Text to search
   * @param keywords - Keywords to search for
   * @returns True if at least one keyword found
   */
  search(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();

    return keywords.some((keyword) => {
      const lowerKeyword = keyword.toLowerCase();
      return lowerText.includes(lowerKeyword);
    });
  }

  /**
   * Search with detailed match information
   *
   * @param text - Text to search
   * @param keywords - Keywords to search for
   * @returns Detailed match result
   */
  searchDetailed(text: string, keywords: string[]): PatternMatchResult {
    const lowerText = text.toLowerCase();
    const matchedKeywords: string[] = [];
    const matchedLines: number[] = [];
    const lines = text.split('\n');

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();

      if (lowerText.includes(lowerKeyword)) {
        matchedKeywords.push(keyword);

        // Find line numbers
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(lowerKeyword)) {
            matchedLines.push(index + 1);
          }
        });
      }
    }

    return {
      found: matchedKeywords.length > 0,
      matchedKeywords,
      matchedLines,
    };
  }

  /**
   * AC-5.6: Detect breaking changes in codebase
   *
   * Searches for keywords indicating API changes:
   * - interface, type, export changes
   * - public API modifications
   * - signature changes
   *
   * @param codebase - Codebase text to analyze
   * @param requirement - Requirement to check
   * @returns True if breaking change detected
   */
  findBreakingChanges(codebase: string, requirement: Requirement): boolean {
    // Keywords indicating breaking changes in REQUIREMENT
    const reqBreakingKeywords = [
      'remove',
      'delete',
      'deprecate',
      'rename',
      'change',
      'modify',
      'update',
      'refactor',
    ];

    // Keywords indicating public API in codebase
    const codebreakingKeywords = [
      'interface',
      'type',
      'export',
      'public',
      'function',
      'class',
      'api',
      'endpoint',
    ];

    // Check if requirement has breaking keywords
    const hasReqBreakingKeywords = this.search(
      requirement.description + ' ' + requirement.feature,
      reqBreakingKeywords
    );

    // Check if requirement keywords exist in codebase (something to break)
    const hasRequirementKeywords = this.search(codebase, requirement.keywords);

    // Check if codebase has public API markers
    const hasCodeBreakingKeywords = this.search(codebase, codebreakingKeywords);

    // Breaking if: requirement wants to change something AND that thing exists in codebase
    return hasReqBreakingKeywords && (hasRequirementKeywords || hasCodeBreakingKeywords);
  }

  /**
   * Detect API signature changes
   *
   * Looks for changes in function/method signatures that could break compatibility.
   *
   * @param oldSignature - Original API signature
   * @param newSignature - New API signature
   * @returns True if breaking change detected
   */
  detectSignatureChange(oldSignature: string, newSignature: string): boolean {
    // Simple check: if signatures differ, could be breaking
    if (oldSignature === newSignature) {
      return false;
    }

    // Check for removed parameters
    const oldParams = this.extractParameters(oldSignature);
    const newParams = this.extractParameters(newSignature);

    // Breaking if required parameters removed
    if (oldParams.length > newParams.length) {
      return true;
    }

    // Breaking if parameter types changed
    for (let i = 0; i < oldParams.length; i++) {
      if (oldParams[i] !== newParams[i]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract parameters from function signature
   *
   * @param signature - Function signature string
   * @returns Array of parameter names/types
   */
  private extractParameters(signature: string): string[] {
    // Extract text between parentheses
    const match = signature.match(/\((.*?)\)/);
    if (!match || !match[1]) {
      return [];
    }

    const paramsText = match[1];
    if (!paramsText.trim()) {
      return [];
    }

    // Split by comma (simple parsing, not handling complex types)
    return paramsText.split(',').map((param) => param.trim());
  }

  /**
   * Search for deprecated code markers
   *
   * @param text - Text to search
   * @returns True if deprecated markers found
   */
  findDeprecatedCode(text: string): boolean {
    const deprecationKeywords = ['@deprecated', 'DEPRECATED', 'deprecated:', 'TODO: remove'];

    return this.search(text, deprecationKeywords);
  }

  /**
   * Check if text contains test code
   *
   * @param text - Text to check
   * @returns True if text appears to contain tests
   */
  isTestCode(text: string): boolean {
    const testKeywords = [
      'describe(',
      'it(',
      'test(',
      'expect(',
      'assert',
      'beforeEach',
      'afterEach',
      'beforeAll',
      'afterAll',
    ];

    return this.search(text, testKeywords);
  }

  /**
   * Extract keywords from requirement description
   *
   * Automatically extracts potential keywords from EARS-format requirement text.
   *
   * @param requirementText - EARS-format requirement
   * @returns Extracted keywords
   */
  extractKeywords(requirementText: string): string[] {
    const keywords: string[] = [];

    // Remove EARS patterns
    let text = requirementText
      .replace(/WHEN\s+/gi, '')
      .replace(/WHILE\s+/gi, '')
      .replace(/IF\s+/gi, '')
      .replace(/THEN\s+/gi, '')
      .replace(/WHERE\s+/gi, '')
      .replace(/SHALL\s+/gi, '');

    // Extract words (alphanumeric + hyphen)
    const words = text.match(/\b[a-zA-Z][a-zA-Z0-9-]*\b/g) || [];

    // Filter out common words
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'may',
      'might',
      'must',
      'can',
    ]);

    for (const word of words) {
      const lower = word.toLowerCase();
      if (!stopWords.has(lower) && word.length > 3) {
        keywords.push(word);
      }
    }

    return keywords;
  }

  /**
   * Calculate text similarity (simple Jaccard coefficient)
   *
   * @param text1 - First text
   * @param text2 - Second text
   * @returns Similarity score (0.0 to 1.0)
   */
  calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);

    const intersection = new Set([...words1].filter((word) => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  }
}
