import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { expect } from 'vitest';

/**
 * Asserts that a file exists
 */
export async function assertFileExists(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
    expect(true).toBe(true); // File exists
  } catch {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
}

/**
 * Asserts that a directory exists
 */
export async function assertDirectoryExists(dirPath: string): Promise<void> {
  try {
    const stats = await fs.stat(dirPath);
    expect(stats.isDirectory()).toBe(true);
  } catch {
    throw new Error(`Expected directory to exist: ${dirPath}`);
  }
}

/**
 * Asserts that file contains specific content
 */
export async function assertFileContains(filePath: string, content: string): Promise<void> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  expect(fileContent).toContain(content);
}

/**
 * Asserts that file matches regex pattern
 */
export async function assertFileMatches(filePath: string, pattern: RegExp): Promise<void> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  expect(fileContent).toMatch(pattern);
}

/**
 * Counts lines in a file
 */
export async function countLines(filePath: string): Promise<number> {
  const content = await fs.readFile(filePath, 'utf-8');
  return content.split('\n').length;
}

/**
 * Reads YAML config file
 */
export async function readYamlConfig(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, 'utf-8');
  // Simple YAML parsing (for basic key: value format)
  const lines = content.split('\n');
  const config: any = {};
  let currentSection: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header (e.g., "project:")
    if (trimmed.endsWith(':') && !trimmed.includes('  ')) {
      currentSection = trimmed.slice(0, -1);
      config[currentSection] = {};
      continue;
    }

    // Array item (e.g., "    - claude-code")
    if (trimmed.startsWith('- ') && currentSection) {
      const value = trimmed.substring(2);
      const lastKey = Object.keys(config[currentSection]).pop();
      if (lastKey && Array.isArray(config[currentSection][lastKey])) {
        config[currentSection][lastKey].push(value);
      }
      continue;
    }

    // Key-value pair
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match && currentSection) {
      const [, key, value] = match;
      // Check if next line might be array items
      config[currentSection][key] = value || [];
    }
  }

  return config;
}

/**
 * Asserts EARS requirement format
 */
export async function assertEARSFormat(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');

  // Check for EARS patterns
  const hasWHEN = /WHEN\s+.+,\s+the\s+.+\s+SHALL\s+/i.test(content);
  const hasIF = /IF\s+.+,\s+THEN\s+the\s+.+\s+SHALL\s+/i.test(content);
  const hasWHILE = /WHILE\s+.+,\s+the\s+.+\s+SHALL\s+/i.test(content);
  const hasWHERE = /WHERE\s+.+,\s+the\s+.+\s+SHALL\s+/i.test(content);
  const hasSHALL = /The\s+.+\s+SHALL\s+/i.test(content);

  const hasEARSPattern = hasWHEN || hasIF || hasWHILE || hasWHERE || hasSHALL;
  expect(hasEARSPattern).toBe(true);
}

/**
 * Lists all files in directory recursively
 */
export async function listFilesRecursive(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  async function traverse(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await traverse(dirPath);
  return files;
}
