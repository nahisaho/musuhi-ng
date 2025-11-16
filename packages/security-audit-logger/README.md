# @musuhi-ng/security-audit-logger

Security audit logging for MUSUHI - Constitutional SDD framework.

## Features

- **Structured JSON Logging**: Machine-parseable audit logs
- **Tamper-Evident**: Append-only logging prevents tampering
- **Automatic Log Rotation**: Prevents disk space issues
- **Configurable Retention**: Customizable log retention policy
- **Security Events**: Constitutional violations, path traversal, validation failures, etc.

## Installation

```bash
pnpm add @musuhi-ng/security-audit-logger
```

## Usage

### Basic Setup

```typescript
import { SecurityAuditLogger } from '@musuhi-ng/security-audit-logger';

// Initialize logger
const logger = new SecurityAuditLogger({
  logDir: './logs/security-audit',
  maxLogSizeMB: 100, // Optional: Max file size before rotation (default: 100MB)
  retentionDays: 90, // Optional: Log retention period (default: 90 days)
});

await logger.initialize();
```

### Logging Events

#### Constitutional Violations

```typescript
await logger.logConstitutionalViolation('Article 1', [
  { ac: 'AC-1.1', description: 'Missing AC comment' },
  { ac: 'AC-1.2', description: 'Incorrect EARS format' },
]);
```

#### Path Traversal Attempts

```typescript
await logger.logPathTraversalAttempt('../../../etc/passwd', 'gap-analyzer');
```

#### Validation Failures

```typescript
await logger.logValidationFailure('requirements', [
  { id: 'AC-1.1', reason: 'Invalid EARS pattern' },
  { id: 'AC-2.3', reason: 'Missing acceptance criteria' },
]);
```

#### Security Scan Completion

```typescript
await logger.logSecurityScanComplete('OWASP Top 10', {
  critical: 0,
  high: 0,
  medium: 2,
  low: 5,
  info: 10,
});
```

#### Custom Security Events

```typescript
await logger.logEvent({
  type: 'file-access-denied',
  severity: 'high',
  action: 'read-config-file',
  result: 'blocked',
  details: {
    filePath: '/etc/sensitive-config.json',
    reason: 'Insufficient permissions',
  },
  source: 'file-system-module',
});
```

## Event Types

- `constitutional-violation` - Phase -1 Gate violations
- `path-traversal-attempt` - Attempted directory traversal
- `file-access-denied` - Unauthorized file access attempt
- `validation-failure` - Requirements or code validation failure
- `authentication-failure` - Authentication attempt failed
- `authorization-failure` - Authorization check failed
- `configuration-change` - Security-relevant configuration change
- `dependency-vulnerability` - Vulnerable dependency detected
- `security-scan-complete` - Security scan completed
- `audit-log-tamper-attempt` - Attempted audit log tampering

## Severity Levels

- `critical` - Immediate action required
- `high` - Significant security issue
- `medium` - Moderate security concern
- `low` - Minor security issue
- `info` - Informational event

## Log Format

Each audit log entry is a JSON object with the following structure:

```json
{
  "type": "constitutional-violation",
  "severity": "high",
  "action": "commit-attempt",
  "result": "blocked",
  "details": {
    "articleId": "Article 1",
    "violations": [{ "ac": "AC-1.1", "description": "Missing AC comment" }],
    "violationCount": 1
  },
  "source": "phase--1-gate",
  "timestamp": "2025-01-16T12:30:45.123Z",
  "eventId": "l8x9k2-abc123",
  "hostname": "dev-machine",
  "processId": 12345,
  "userId": "developer"
}
```

## Log Rotation

Logs are automatically rotated when:

- File size exceeds `maxLogSizeMB` (default: 100MB)
- A new day begins (daily rotation)

Log file naming convention:

- `security-audit-YYYY-MM-DD.log`
- `security-audit-YYYY-MM-DD-TIMESTAMP.log` (if multiple files in one day)

## Security Considerations

- **Log Directory Permissions**: Automatically set to `0o700` (owner-only access)
- **Log File Permissions**: Automatically set to `0o600` (owner read/write only)
- **Append-Only**: Logs are append-only to prevent tampering
- **Error Handling**: Failed writes are logged to stderr without breaking the application

## Integration with MUSUHI

### Phase -1 Gate

```typescript
import { PhaseGate } from '@musuhi-ng/constitutional-governance';
import { SecurityAuditLogger } from '@musuhi-ng/security-audit-logger';

const logger = new SecurityAuditLogger({ logDir: './logs/security-audit' });
await logger.initialize();

const gate = new PhaseGate(constitution, logger);

// Phase -1 Gate automatically logs violations
const result = await gate.validate(codeChanges);
if (!result.passed) {
  // Violations are already logged by PhaseGate
  process.exit(1);
}
```

### Gap Analyzer

```typescript
import { GapAnalyzer } from '@musuhi-ng/gap-analyzer';
import { SecurityAuditLogger } from '@musuhi-ng/security-audit-logger';

const logger = new SecurityAuditLogger({ logDir: './logs/security-audit' });
await logger.initialize();

const analyzer = new GapAnalyzer(config);

try {
  const report = await analyzer.analyze();
} catch (error) {
  if (error.message.includes('Path traversal')) {
    await logger.logPathTraversalAttempt(error.details.path, 'gap-analyzer');
  }
  throw error;
}
```

## License

MIT
