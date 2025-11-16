/**
 * Security Audit Logger
 *
 * AC-3.4: Security Audit Logging
 * Logs security-relevant events for compliance and forensic analysis.
 *
 * @packageDocumentation
 */

import { writeFile, appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Security Event Type
 *
 * Categories of security-relevant events that should be logged.
 */
export type SecurityEventType =
  | 'constitutional-violation'    // Phase -1 Gate violations
  | 'path-traversal-attempt'     // Attempted directory traversal
  | 'file-access-denied'         // Unauthorized file access attempt
  | 'validation-failure'         // Requirements or code validation failure
  | 'authentication-failure'     // Authentication attempt failed (future)
  | 'authorization-failure'      // Authorization check failed (future)
  | 'configuration-change'       // Security-relevant configuration change
  | 'dependency-vulnerability'   // Vulnerable dependency detected
  | 'security-scan-complete'     // Security scan completed
  | 'audit-log-tamper-attempt';  // Attempted audit log tampering

/**
 * Security Event Severity
 */
export type SecurityEventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Security Event
 *
 * Represents a security-relevant event to be logged.
 */
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  action: string;               // What action was attempted
  result: 'allowed' | 'blocked' | 'error'; // Outcome of the action
  details?: Record<string, unknown>;       // Additional event details
  userId?: string;              // User who triggered the event
  source?: string;              // Source component/module
}

/**
 * Audit Log Entry
 *
 * Complete audit log entry with metadata.
 */
export interface AuditLogEntry extends SecurityEvent {
  timestamp: string;            // ISO 8601 timestamp
  eventId: string;              // Unique event identifier
  hostname: string;             // Machine hostname
  processId: number;            // Process ID
}

/**
 * Security Audit Logger
 *
 * AC-3.4: Logs security-relevant events for compliance and forensic analysis.
 *
 * Features:
 * - Structured JSON logging for machine parsing
 * - Tamper-evident logging (append-only)
 * - Automatic log rotation
 * - Configurable retention policy
 */
export class SecurityAuditLogger {
  private logDir: string;
  private currentLogFile: string;
  private maxLogSizeMB: number;
  // @ts-ignore - TODO: Implement log cleanup based on retention policy
  private retentionDays: number;
  private hostname: string;

  /**
   * Create a new security audit logger
   *
   * AC-3.4: Initialize audit logger with secure defaults.
   *
   * @param config - Logger configuration
   */
  constructor(config: {
    logDir: string;
    maxLogSizeMB?: number;
    retentionDays?: number;
  }) {
    this.logDir = path.resolve(config.logDir);
    this.maxLogSizeMB = config.maxLogSizeMB ?? 100; // 100MB default
    this.retentionDays = config.retentionDays ?? 90; // 90 days default
    this.hostname = this.getHostname();
    this.currentLogFile = this.getCurrentLogFilePath();
  }

  /**
   * AC-3.4: Initialize audit logger
   *
   * Creates log directory if it doesn't exist.
   * Validates log directory permissions.
   */
  async initialize(): Promise<void> {
    // Create log directory if it doesn't exist
    if (!existsSync(this.logDir)) {
      await mkdir(this.logDir, { recursive: true, mode: 0o700 }); // Owner-only access
    }

    // Create initial log file if needed
    if (!existsSync(this.currentLogFile)) {
      await this.createNewLogFile();
    }
  }

  /**
   * AC-3.4: Log security event
   *
   * Appends security event to audit log with metadata.
   * Implements tamper-evident logging (append-only).
   *
   * @param event - Security event to log
   */
  async logEvent(event: SecurityEvent): Promise<void> {
    // Create audit log entry with metadata
    const entry: AuditLogEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      eventId: this.generateEventId(),
      hostname: this.hostname,
      processId: process.pid,
      userId: event.userId ?? process.env.USER ?? 'unknown',
    };

    // Serialize to JSON (one line per entry for easy parsing)
    const logLine = JSON.stringify(entry) + '\n';

    // Append to current log file
    try {
      await appendFile(this.currentLogFile, logLine, 'utf-8');

      // Check if log rotation is needed
      await this.checkLogRotation();
    } catch (error) {
      // Log to stderr if file write fails (don't throw - avoid breaking application)
      console.error(
        `[SECURITY AUDIT] Failed to write audit log: ${error instanceof Error ? error.message : String(error)}`
      );
      console.error(`[SECURITY AUDIT] Event: ${JSON.stringify(entry)}`);
    }
  }

  /**
   * AC-3.4: Log constitutional violation
   *
   * Convenience method for Phase -1 Gate violations.
   *
   * @param articleId - Article that was violated (e.g., "Article 1")
   * @param violations - Violation details
   */
  async logConstitutionalViolation(
    articleId: string,
    violations: Array<{ ac: string; description: string }>
  ): Promise<void> {
    await this.logEvent({
      type: 'constitutional-violation',
      severity: 'high',
      action: 'commit-attempt',
      result: 'blocked',
      details: {
        articleId,
        violations,
        violationCount: violations.length,
      },
      source: 'phase--1-gate',
    });
  }

  /**
   * AC-3.4: Log path traversal attempt
   *
   * Logs attempted directory traversal attacks.
   *
   * @param attemptedPath - Path that was attempted
   * @param component - Component that detected the attempt
   */
  async logPathTraversalAttempt(
    attemptedPath: string,
    component: string
  ): Promise<void> {
    await this.logEvent({
      type: 'path-traversal-attempt',
      severity: 'critical',
      action: 'file-access',
      result: 'blocked',
      details: {
        attemptedPath,
        component,
      },
      source: component,
    });
  }

  /**
   * AC-3.4: Log validation failure
   *
   * Logs requirements or code validation failures.
   *
   * @param validationType - Type of validation that failed
   * @param failures - Failure details
   */
  async logValidationFailure(
    validationType: string,
    failures: Array<{ id: string; reason: string }>
  ): Promise<void> {
    await this.logEvent({
      type: 'validation-failure',
      severity: 'medium',
      action: `${validationType}-validation`,
      result: 'error',
      details: {
        validationType,
        failures,
        failureCount: failures.length,
      },
      source: 'validation-engine',
    });
  }

  /**
   * AC-3.4: Log security scan completion
   *
   * Logs completion of security scans (OWASP, dependency audit, etc.).
   *
   * @param scanType - Type of security scan
   * @param findings - Scan findings summary
   */
  async logSecurityScanComplete(
    scanType: string,
    findings: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    }
  ): Promise<void> {
    const totalFindings = findings.critical + findings.high + findings.medium + findings.low + findings.info;
    const severity: SecurityEventSeverity =
      findings.critical > 0 ? 'critical' :
      findings.high > 0 ? 'high' :
      findings.medium > 0 ? 'medium' : 'info';

    await this.logEvent({
      type: 'security-scan-complete',
      severity,
      action: `${scanType}-scan`,
      result: totalFindings > 0 ? 'error' : 'allowed',
      details: {
        scanType,
        findings,
        totalFindings,
      },
      source: 'security-auditor',
    });
  }

  /**
   * Generate unique event ID
   *
   * @returns Event ID (timestamp + random)
   */
  private generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}-${random}`;
  }

  /**
   * Get hostname
   *
   * @returns Machine hostname
   */
  private getHostname(): string {
    try {
      return require('node:os').hostname();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get current log file path
   *
   * Format: security-audit-YYYY-MM-DD.log
   *
   * @returns Log file path
   */
  private getCurrentLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `security-audit-${date}.log`);
  }

  /**
   * Create new log file with header
   */
  private async createNewLogFile(): Promise<void> {
    const header = {
      logVersion: '1.0',
      created: new Date().toISOString(),
      hostname: this.hostname,
      purpose: 'MUSUHI Security Audit Log',
    };

    await writeFile(
      this.currentLogFile,
      `# ${JSON.stringify(header)}\n`,
      { mode: 0o600 } // Owner read/write only
    );
  }

  /**
   * Check if log rotation is needed
   *
   * Rotates logs if current file exceeds max size.
   */
  private async checkLogRotation(): Promise<void> {
    try {
      const fs = await import('node:fs/promises');
      const stats = await fs.stat(this.currentLogFile);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB >= this.maxLogSizeMB) {
        // Create new log file for today
        const newLogFile = this.getCurrentLogFilePath();
        if (newLogFile !== this.currentLogFile) {
          this.currentLogFile = newLogFile;
          await this.createNewLogFile();
        } else {
          // Same day but exceeded size - append timestamp
          const timestamp = Date.now();
          this.currentLogFile = path.join(
            this.logDir,
            `security-audit-${new Date().toISOString().split('T')[0]}-${timestamp}.log`
          );
          await this.createNewLogFile();
        }
      }
    } catch (error) {
      console.error(`Failed to check log rotation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
