/**
 * Mode Storage
 *
 * Persists verification mode preference to disk.
 *
 * Requirement Coverage:
 * - AC-7.9: Mode Persistence - Save and apply mode preference
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for mode persistence
 * - Article 2: Test-First - All methods covered by unit tests
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { VerificationMode } from '../types/index.js';

/**
 * ModeStorage - Persists and loads verification mode preference
 *
 * AC-7.9: Mode Persistence
 * - Save mode preference to .musuhi/verification-mode.json
 * - Load mode preference on initialization
 * - Default to 'enabled' if no preference exists
 */
export class ModeStorage {
  private configPath: string;

  constructor(projectRoot: string) {
    this.configPath = path.join(projectRoot, '.musuhi', 'verification-mode.json');
  }

  /**
   * Save mode preference to disk
   *
   * AC-7.9: Mode Persistence
   * - Persist mode preference (enabled/disabled)
   * - Include timestamp for audit trail
   */
  async saveMode(mode: VerificationMode): Promise<void> {
    const config = {
      mode,
      updatedAt: new Date().toISOString(),
    };

    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Load mode preference from disk
   *
   * AC-7.9: Mode Persistence
   * - Read mode preference from disk
   * - Default to 'enabled' if file doesn't exist
   * - Return 'enabled' if file is corrupted
   */
  async loadMode(): Promise<VerificationMode> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(content);
      return config.mode || 'enabled';
    } catch {
      // Default to enabled if file doesn't exist or is corrupted
      return 'enabled';
    }
  }
}
