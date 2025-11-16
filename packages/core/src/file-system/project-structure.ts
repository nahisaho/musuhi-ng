/**
 * Project Structure Management
 * Manages MUSUHI project directory structure
 * @module @musuhi-ng/core/file-system
 */

import * as path from 'path';
import type { IFileSystem, ProjectStructure } from '../types/file-system.js';

/**
 * Project structure manager
 * Handles MUSUHI project directory layout
 */
export class ProjectStructureManager {
  private fs: IFileSystem;
  private projectRoot: string;

  constructor(fileSystem: IFileSystem, projectRoot: string) {
    this.fs = fileSystem;
    this.projectRoot = projectRoot;
  }

  /**
   * Get project structure paths
   */
  getStructure(): ProjectStructure {
    return {
      root: this.projectRoot,
      specsDir: path.join(this.projectRoot, 'specs'),
      changesDir: path.join(this.projectRoot, 'changes'),
      archiveDir: path.join(this.projectRoot, 'archive'),
      steeringDir: path.join(this.projectRoot, 'steering'),
      docsDir: path.join(this.projectRoot, 'docs'),
    };
  }

  /**
   * Initialize project structure
   * Creates all required directories
   */
  async initialize(): Promise<ProjectStructure> {
    const structure = this.getStructure();

    // Create all directories
    await this.fs.createDirectory(structure.specsDir, { recursive: true });
    await this.fs.createDirectory(structure.changesDir, { recursive: true });
    await this.fs.createDirectory(structure.archiveDir, { recursive: true });
    await this.fs.createDirectory(structure.steeringDir, { recursive: true });
    await this.fs.createDirectory(structure.docsDir, { recursive: true });

    // Create subdirectories
    await this.fs.createDirectory(path.join(structure.docsDir, 'requirements'), {
      recursive: true,
    });
    await this.fs.createDirectory(path.join(structure.docsDir, 'design'), { recursive: true });
    await this.fs.createDirectory(path.join(structure.docsDir, 'design', 'adr'), {
      recursive: true,
    });
    await this.fs.createDirectory(path.join(structure.docsDir, 'tasks'), { recursive: true });

    // Create steering subdirectories
    await this.fs.createDirectory(path.join(structure.steeringDir, 'rules'), {
      recursive: true,
    });
    await this.fs.createDirectory(path.join(structure.steeringDir, 'templates'), {
      recursive: true,
    });

    return structure;
  }

  /**
   * Validate project structure
   * Checks if all required directories exist
   */
  async validate(): Promise<{
    valid: boolean;
    missingDirectories: string[];
  }> {
    const structure = this.getStructure();
    const requiredDirs = [
      structure.specsDir,
      structure.changesDir,
      structure.archiveDir,
      structure.steeringDir,
      structure.docsDir,
    ];

    const missingDirectories: string[] = [];

    for (const dir of requiredDirs) {
      const exists = await this.fs.fileExists(dir);
      if (!exists) {
        missingDirectories.push(dir);
      }
    }

    return {
      valid: missingDirectories.length === 0,
      missingDirectories,
    };
  }

  /**
   * Get specs directory path
   */
  getSpecsPath(relativePath?: string): string {
    const structure = this.getStructure();
    return relativePath ? path.join(structure.specsDir, relativePath) : structure.specsDir;
  }

  /**
   * Get changes directory path
   */
  getChangesPath(relativePath?: string): string {
    const structure = this.getStructure();
    return relativePath ? path.join(structure.changesDir, relativePath) : structure.changesDir;
  }

  /**
   * Get archive directory path
   */
  getArchivePath(relativePath?: string): string {
    const structure = this.getStructure();
    return relativePath ? path.join(structure.archiveDir, relativePath) : structure.archiveDir;
  }

  /**
   * Get steering directory path
   */
  getSteeringPath(relativePath?: string): string {
    const structure = this.getStructure();
    return relativePath
      ? path.join(structure.steeringDir, relativePath)
      : structure.steeringDir;
  }

  /**
   * Get docs directory path
   */
  getDocsPath(relativePath?: string): string {
    const structure = this.getStructure();
    return relativePath ? path.join(structure.docsDir, relativePath) : structure.docsDir;
  }
}
