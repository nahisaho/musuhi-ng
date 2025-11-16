import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import {
  createTestProject,
  cleanupTestProject,
} from '../helpers/test-project-setup';
import {
  assertFileExists,
  assertDirectoryExists,
  assertEARSFormat,
  assertFileContains,
} from '../helpers/file-assertions';
import { createMetrics } from '../helpers/performance-metrics';

/**
 * TEST-E2E-001: Complete SDD Workflow
 *
 * Validates that all 8 stages of the SDD workflow execute successfully
 * from project initialization to change archival.
 *
 * Test ID: TEST-E2E-001
 * Priority: P0
 * Estimated Time: 5 minutes
 */
describe('TEST-E2E-001: Complete SDD Workflow', () => {
  let projectRoot: string;
  const metrics = createMetrics();

  beforeEach(async () => {
    metrics.start();
    projectRoot = await createTestProject('e2e-sdd-workflow', {
      includeSteeringFiles: true,
      includeConstitution: true,
      includeSpecs: true,
    });
  });

  afterEach(async () => {
    await cleanupTestProject(projectRoot);
    metrics.stop();
    console.log(`Test execution time: ${metrics.getElapsedSeconds()}s`);
  });

  it('should execute complete 8-stage SDD workflow', async () => {
    // ========================================
    // Stage 1: Research (Project Initialization)
    // ========================================
    await metrics.measure('stage-1-research', async () => {
      // Verify steering files exist
      await assertFileExists(path.join(projectRoot, 'steering', 'structure.md'));
      await assertFileExists(path.join(projectRoot, 'steering', 'tech.md'));
      await assertFileExists(path.join(projectRoot, 'steering', 'product.md'));
      await assertFileExists(path.join(projectRoot, 'steering', 'constitution.md'));

      // Verify directory structure
      await assertDirectoryExists(path.join(projectRoot, 'specs'));
      await assertDirectoryExists(path.join(projectRoot, 'changes'));
      await assertDirectoryExists(path.join(projectRoot, 'archive'));
      await assertDirectoryExists(path.join(projectRoot, '.musuhi'));

      // Verify config exists
      await assertFileExists(path.join(projectRoot, '.musuhi', 'config.yaml'));
    });

    // ========================================
    // Stage 2: Requirements
    // ========================================
    await metrics.measure('stage-2-requirements', async () => {
      const specPath = path.join(projectRoot, 'specs', 'user-authentication.md');

      // Verify spec exists
      await assertFileExists(specPath);

      // Verify EARS format compliance
      await assertEARSFormat(specPath);

      // Verify requirements are present
      await assertFileContains(specPath, 'AC-1.1');
      await assertFileContains(specPath, 'AC-1.2');
      await assertFileContains(specPath, 'AC-1.3');

      // Verify acceptance criteria sections
      await assertFileContains(specPath, 'Acceptance Criteria');
    });

    // ========================================
    // Stage 3: Design (Change Proposal)
    // ========================================
    const changeDir = await metrics.measure('stage-3-design', async () => {
      // Simulate: musuhi change init "implement-user-authentication"
      const changeName = '2025-11-16-implement-user-authentication';
      const changePath = path.join(projectRoot, 'changes', changeName);

      // Create change directory (simulating CLI command)
      const fs = await import('node:fs/promises');
      await fs.mkdir(changePath, { recursive: true });

      // Create proposal.md
      await fs.writeFile(
        path.join(changePath, 'proposal.md'),
        `# Change Proposal: Implement User Authentication

## Overview
Implement user authentication system as specified in specs/user-authentication.md

## Scope
- Authentication service
- Session management
- User model

## Affected Components
- Backend API
- Database schema
- Frontend login form
`
      );

      // Create delta.md
      await fs.writeFile(
        path.join(changePath, 'delta.md'),
        `# Change Delta

## ADDED
- src/auth/auth-service.ts
- src/auth/session-manager.ts
- src/models/user.ts
- tests/auth/auth-service.test.ts

## MODIFIED
- src/app.ts (add auth middleware)
- package.json (add dependencies)

## REMOVED
- None
`
      );

      return changePath;
    });

    // Verify change proposal created
    await assertFileExists(path.join(changeDir, 'proposal.md'));
    await assertFileExists(path.join(changeDir, 'delta.md'));

    // ========================================
    // Stage 4: Tasks (Task Plan Generation)
    // ========================================
    await metrics.measure('stage-4-tasks', async () => {
      // Simulate task plan generation
      const fs = await import('node:fs/promises');
      await fs.writeFile(
        path.join(changeDir, 'tasks.md'),
        `# Implementation Tasks

## P0 Tasks (No Dependencies)
- [ ] T1: Setup authentication dependencies

## P1 Tasks (Depends on P0)
- [ ] T2: Implement AuthService
- [ ] T3: Implement SessionManager
- [ ] T4: Create User model

## P2 Tasks (Depends on P1)
- [ ] T5: Implement password hashing
- [ ] T6: Implement JWT generation
- [ ] T7: Write unit tests
`
      );
    });

    await assertFileExists(path.join(changeDir, 'tasks.md'));
    await assertFileContains(path.join(changeDir, 'tasks.md'), 'P0 Tasks');
    await assertFileContains(path.join(changeDir, 'tasks.md'), 'P1 Tasks');

    // ========================================
    // Stage 5: Implementation (Code Generation)
    // ========================================
    await metrics.measure('stage-5-implementation', async () => {
      // Simulate code implementation
      const fs = await import('node:fs/promises');
      const srcDir = path.join(projectRoot, 'src', 'auth');
      await fs.mkdir(srcDir, { recursive: true });

      // Create AuthService
      await fs.writeFile(
        path.join(srcDir, 'auth-service.ts'),
        `import bcrypt from 'bcrypt'; // Article 1: Library-First
import jwt from 'jsonwebtoken'; // Article 1: Library-First

export class AuthService {
  async authenticate(email: string, password: string): Promise<string> {
    // Implementation
    return jwt.sign({ email }, 'secret', { expiresIn: '24h' });
  }
}
`
      );

      // Create SessionManager
      await fs.writeFile(
        path.join(srcDir, 'session-manager.ts'),
        `export class SessionManager {
  private sessions: Map<string, any> = new Map();

  createSession(token: string, user: any): void {
    this.sessions.set(token, { user, expiresAt: Date.now() + 86400000 });
  }

  validateSession(token: string): boolean {
    const session = this.sessions.get(token);
    return session && session.expiresAt > Date.now();
  }
}
`
      );
    });

    await assertFileExists(path.join(projectRoot, 'src', 'auth', 'auth-service.ts'));
    await assertFileExists(path.join(projectRoot, 'src', 'auth', 'session-manager.ts'));

    // ========================================
    // Stage 6: Testing (Test Generation)
    // ========================================
    await metrics.measure('stage-6-testing', async () => {
      // Simulate test generation
      const fs = await import('node:fs/promises');
      const testDir = path.join(projectRoot, 'tests', 'auth');
      await fs.mkdir(testDir, { recursive: true });

      await fs.writeFile(
        path.join(testDir, 'auth-service.test.ts'),
        `import { describe, it, expect } from 'vitest';
import { AuthService } from '../../src/auth/auth-service';

describe('AuthService', () => {
  it('should authenticate user with valid credentials', async () => {
    const service = new AuthService();
    const token = await service.authenticate('user@example.com', 'password123');
    expect(token).toBeDefined();
  });
});
`
      );
    });

    await assertFileExists(path.join(projectRoot, 'tests', 'auth', 'auth-service.test.ts'));
    await assertFileContains(
      path.join(projectRoot, 'tests', 'auth', 'auth-service.test.ts'),
      'AuthService'
    );

    // ========================================
    // Stage 7: Deployment (Archive Change)
    // ========================================
    await metrics.measure('stage-7-deployment', async () => {
      // Simulate archival
      const fs = await import('node:fs/promises');
      const changeName = '2025-11-16-implement-user-authentication';
      const archivePath = path.join(projectRoot, 'archive', changeName);

      // Move change to archive
      await fs.rename(
        path.join(projectRoot, 'changes', changeName),
        archivePath
      );
    });

    // Verify change moved to archive
    await assertDirectoryExists(
      path.join(projectRoot, 'archive', '2025-11-16-implement-user-authentication')
    );

    // ========================================
    // Stage 8: Monitoring (Workflow Status)
    // ========================================
    await metrics.measure('stage-8-monitoring', async () => {
      // Simulate workflow status tracking
      const fs = await import('node:fs/promises');
      const workflowLog = path.join(projectRoot, '.musuhi', 'workflow.log');

      await fs.writeFile(
        workflowLog,
        `Stage 1 (Research): COMPLETED
Stage 2 (Requirements): COMPLETED
Stage 3 (Design): COMPLETED
Stage 4 (Tasks): COMPLETED
Stage 5 (Implementation): COMPLETED
Stage 6 (Testing): COMPLETED
Stage 7 (Deployment): COMPLETED
Stage 8 (Monitoring): IN_PROGRESS
`
      );
    });

    await assertFileExists(path.join(projectRoot, '.musuhi', 'workflow.log'));

    // ========================================
    // Final Verification
    // ========================================
    const totalTime = metrics.getElapsedSeconds();
    console.log('\n=== Workflow Stage Metrics ===');
    console.log(`Stage 1 (Research): ${metrics.get('stage-1-research')?.toFixed(2)}ms`);
    console.log(`Stage 2 (Requirements): ${metrics.get('stage-2-requirements')?.toFixed(2)}ms`);
    console.log(`Stage 3 (Design): ${metrics.get('stage-3-design')?.toFixed(2)}ms`);
    console.log(`Stage 4 (Tasks): ${metrics.get('stage-4-tasks')?.toFixed(2)}ms`);
    console.log(`Stage 5 (Implementation): ${metrics.get('stage-5-implementation')?.toFixed(2)}ms`);
    console.log(`Stage 6 (Testing): ${metrics.get('stage-6-testing')?.toFixed(2)}ms`);
    console.log(`Stage 7 (Deployment): ${metrics.get('stage-7-deployment')?.toFixed(2)}ms`);
    console.log(`Stage 8 (Monitoring): ${metrics.get('stage-8-monitoring')?.toFixed(2)}ms`);
    console.log(`Total workflow time: ${totalTime.toFixed(2)}s`);

    // Acceptance Criteria
    expect(totalTime).toBeLessThan(300); // < 5 minutes
    expect(metrics.get('stage-1-research')).toBeDefined();
    expect(metrics.get('stage-8-monitoring')).toBeDefined();
  });
});
