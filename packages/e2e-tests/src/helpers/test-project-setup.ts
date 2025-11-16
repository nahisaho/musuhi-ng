import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Test project configuration
 */
export interface TestProjectConfig {
  name: string;
  includeSteeringFiles?: boolean;
  includeConstitution?: boolean;
  includeSpecs?: boolean;
}

/**
 * Creates a temporary test project
 */
export async function createTestProject(
  projectName: string,
  config: Partial<TestProjectConfig> = {}
): Promise<string> {
  const {
    includeSteeringFiles = true,
    includeConstitution = true,
    includeSpecs = false,
  } = config;

  // Create temp directory
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), `musuhi-e2e-${projectName}-`));

  // Create directory structure
  await Promise.all([
    fs.mkdir(path.join(tempDir, 'steering'), { recursive: true }),
    fs.mkdir(path.join(tempDir, 'specs'), { recursive: true }),
    fs.mkdir(path.join(tempDir, 'changes'), { recursive: true }),
    fs.mkdir(path.join(tempDir, 'archive'), { recursive: true }),
    fs.mkdir(path.join(tempDir, '.musuhi'), { recursive: true }),
  ]);

  // Create steering files
  if (includeSteeringFiles) {
    await createSteeringFiles(tempDir);
  }

  // Create constitution
  if (includeConstitution) {
    await createConstitution(tempDir);
  }

  // Create sample specs
  if (includeSpecs) {
    await createSampleSpecs(tempDir);
  }

  // Create config
  await createConfig(tempDir, projectName);

  return tempDir;
}

/**
 * Cleans up test project
 */
export async function cleanupTestProject(projectRoot: string): Promise<void> {
  try {
    await fs.rm(projectRoot, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Failed to cleanup test project at ${projectRoot}:`, error);
  }
}

/**
 * Creates steering files
 */
async function createSteeringFiles(projectRoot: string): Promise<void> {
  const steeringDir = path.join(projectRoot, 'steering');

  // structure.md
  await fs.writeFile(
    path.join(steeringDir, 'structure.md'),
    `# Project Structure

## Directory Organization
- \`src/\`: Source code
- \`tests/\`: Test files
- \`specs/\`: Specifications
- \`changes/\`: Change proposals
- \`archive/\`: Historical changes
`
  );

  // tech.md
  await fs.writeFile(
    path.join(steeringDir, 'tech.md'),
    `# Technology Stack

## Languages
- TypeScript 5.3+
- Node.js 18+

## Frameworks
- Express (backend)
- React (frontend)

## Testing
- Vitest
- React Testing Library
`
  );

  // product.md
  await fs.writeFile(
    path.join(steeringDir, 'product.md'),
    `# Product Context

## Overview
Test e-commerce application

## Target Users
- Online shoppers
- Store administrators

## Core Features
- User authentication
- Product catalog
- Shopping cart
- Checkout
`
  );
}

/**
 * Creates constitution file
 */
async function createConstitution(projectRoot: string): Promise<void> {
  const constitutionPath = path.join(projectRoot, 'steering', 'constitution.md');

  await fs.writeFile(
    constitutionPath,
    `# Project Constitution

## Article 1: Library-First Development
Prefer existing libraries over custom implementations.

## Article 2: Test-First Development
Write tests before implementation. Minimum 80% coverage.

## Article 3: Security-First Development
Security review required before merge.

## Article 4: Documentation-First Development
Document before implementing.

## Article 5: Simplicity-First Development
Reject over-engineering. Prefer simple solutions.

## Article 6: Performance-First Development
Performance budgets enforced.

## Article 7: Accessibility-First Development
WCAG 2.1 AA compliance required.

## Article 8: Privacy-First Development
Minimal data collection. GDPR compliant.

## Article 9: Open-First Development
Default to open source.
`
  );
}

/**
 * Creates sample specification
 */
async function createSampleSpecs(projectRoot: string): Promise<void> {
  const specsDir = path.join(projectRoot, 'specs');

  await fs.writeFile(
    path.join(specsDir, 'user-authentication.md'),
    `# User Authentication Specification

## Overview
User authentication for e-commerce platform.

## Requirements

### AC-1.1: User Login
WHEN a user enters valid credentials, the system SHALL authenticate the user and create a session.

**Acceptance Criteria**:
- Valid email/password grants access
- Session token generated (JWT, 24-hour expiry)
- User redirected to dashboard

### AC-1.2: Invalid Login
IF a user enters invalid credentials, THEN the system SHALL display an error message.

**Acceptance Criteria**:
- Generic error: "Invalid email or password"
- No account enumeration
- Login attempt logged

### AC-1.3: Session Persistence
WHILE a user has a valid session token, the system SHALL maintain authentication state.

**Acceptance Criteria**:
- Session persists across page reloads
- Session expires after 24 hours
- Logout invalidates session immediately
`
  );
}

/**
 * Creates config file
 */
async function createConfig(projectRoot: string, projectName: string): Promise<void> {
  const configPath = path.join(projectRoot, '.musuhi', 'config.yaml');

  await fs.writeFile(
    configPath,
    `project:
  name: ${projectName}
  version: 0.1.0

platform:
  current: claude-code
  adapters:
    - claude-code
    - cursor

workflow:
  currentStage: 1
  completedStages: []

dashboard:
  theme: default
  refreshInterval: 2000
`
  );
}
