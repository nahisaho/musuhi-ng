/**
 * File System Abstraction Types
 * Based on ADR-002: File-Based Storage vs. Database
 * @module @musuhi/core/types/file-system
 */

/**
 * Supported file formats for specifications and documents
 */
export type FileFormat = 'markdown' | 'yaml' | 'json';

/**
 * File metadata for tracking and versioning
 */
export interface FileMetadata {
  /** Absolute file path */
  path: string;

  /** File format */
  format: FileFormat;

  /** Last modified timestamp */
  lastModified: Date;

  /** File size in bytes */
  size: number;

  /** Optional checksum for integrity verification */
  checksum?: string;
}

/**
 * File read options
 */
export interface ReadOptions {
  /** Encoding (default: utf-8) */
  encoding?: BufferEncoding;

  /** Whether to include metadata */
  includeMetadata?: boolean;

  /** Whether to validate file format */
  validate?: boolean;
}

/**
 * File write options
 */
export interface WriteOptions {
  /** Encoding (default: utf-8) */
  encoding?: BufferEncoding;

  /** Whether to create parent directories */
  createDirs?: boolean;

  /** Whether to overwrite existing files */
  overwrite?: boolean;

  /** File permissions (Unix) */
  mode?: number;
}

/**
 * File read result
 */
export interface ReadResult<T = string> {
  /** File content */
  content: T;

  /** File metadata (if requested) */
  metadata?: FileMetadata;
}

/**
 * File write result
 */
export interface WriteResult {
  /** Written file path */
  path: string;

  /** Bytes written */
  bytesWritten: number;

  /** File metadata */
  metadata: FileMetadata;
}

/**
 * Directory entry
 */
export interface DirectoryEntry {
  /** Entry name */
  name: string;

  /** Entry type */
  type: 'file' | 'directory' | 'symlink' | 'other';

  /** Full path */
  path: string;
}

/**
 * Directory structure for MUSUHI projects
 * Based on two-folder model: specs/ and changes/
 */
export interface ProjectStructure {
  /** Root project directory */
  root: string;

  /** Specifications directory (specs/) */
  specsDir: string;

  /** Changes directory (changes/) */
  changesDir: string;

  /** Archive directory (archive/) */
  archiveDir: string;

  /** Steering context directory (steering/) */
  steeringDir: string;

  /** Documentation directory (docs/) */
  docsDir: string;
}

/**
 * File System Abstraction Layer Interface
 * Provides platform-independent file operations
 */
export interface IFileSystem {
  /**
   * Read a file from the file system
   * @param path - Absolute file path
   * @param options - Read options
   * @returns Promise resolving to file content and metadata
   * @throws {Error} If file does not exist or cannot be read
   */
  readFile(path: string, options?: ReadOptions): Promise<ReadResult>;

  /**
   * Write content to a file
   * @param path - Absolute file path
   * @param content - Content to write
   * @param options - Write options
   * @returns Promise resolving to write result
   * @throws {Error} If file cannot be written
   */
  writeFile(path: string, content: string, options?: WriteOptions): Promise<WriteResult>;

  /**
   * Check if a file exists
   * @param path - Absolute file path
   * @returns Promise resolving to true if file exists
   */
  fileExists(path: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param path - Absolute file path
   * @returns Promise resolving to file metadata
   * @throws {Error} If file does not exist
   */
  getMetadata(path: string): Promise<FileMetadata>;

  /**
   * List files in a directory
   * @param dirPath - Absolute directory path
   * @param pattern - Optional glob pattern
   * @returns Promise resolving to array of file paths
   */
  listFiles(dirPath: string, pattern?: string): Promise<string[]>;

  /**
   * Create directory (and parent directories if needed)
   * @param dirPath - Absolute directory path
   * @param options - Creation options
   * @returns Promise resolving to created directory path
   */
  createDirectory(dirPath: string, options?: { recursive?: boolean }): Promise<string>;

  /**
   * Delete a file
   * @param path - Absolute file path
   * @returns Promise resolving when file is deleted
   * @throws {Error} If file cannot be deleted
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Copy a file
   * @param sourcePath - Source file path
   * @param destPath - Destination file path
   * @param options - Copy options
   * @returns Promise resolving to destination path
   */
  copyFile(sourcePath: string, destPath: string, options?: WriteOptions): Promise<string>;

  /**
   * Move a file
   * @param sourcePath - Source file path
   * @param destPath - Destination file path
   * @param options - Move options
   * @returns Promise resolving to destination path
   */
  moveFile(sourcePath: string, destPath: string, options?: WriteOptions): Promise<string>;
}
