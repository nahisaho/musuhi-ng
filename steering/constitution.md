# MUSUHI 2.0 Constitutional Governance

**Version**: 1.0
**Status**: Immutable (read-only after approval)
**Last Updated**: 2025-11-15
**Enforcement**: Phase -1 Gate Validator

---

## Purpose

This constitution defines 9 immutable Articles that enforce best practices and prevent common pitfalls in AI-assisted software development. These principles are inspired by spec-kit's constitutional governance model and are enforced via Phase -1 Gates before any implementation phase.

**Key Principle**: Prevention over Correction - Catch violations before they enter the codebase

---

## Article 1: Library-First Development

### Principle

**Prefer existing, well-maintained libraries over custom implementations**

### Rationale

- Reduces development time (don't reinvent the wheel)
- Leverages battle-tested solutions (fewer bugs)
- Improves maintainability (community support)
- Reduces technical debt (no custom code to maintain)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. For every custom implementation proposed in design.md, check if an existing library exists
2. Search npm registry (Node.js) or PyPI (Python) for alternatives
3. Require explicit justification for custom code in one of these categories:
   - **Performance**: Existing libraries don't meet performance requirements (provide benchmarks)
   - **Security**: Existing libraries have known vulnerabilities (provide CVE references)
   - **Licensing**: Existing libraries have incompatible licenses (e.g., GPL vs. MIT)
   - **Feature Gap**: No existing library provides required functionality (provide feature comparison)

**Acceptance Criteria**:

- Library search documented in design.md (minimum 3 alternatives evaluated)
- Justification provided if custom implementation chosen
- Compliance: >90% of functionality uses existing libraries

**Examples**:

✅ **Good**:

```markdown
## Design Decision: Markdown Parsing

**Alternatives Evaluated**:

1. unified + remark (⭐️ 15K stars, active maintenance)
2. marked (⭐️ 32K stars, simpler API)
3. markdown-it (⭐️ 17K stars, extensible)

**Selected**: unified + remark
**Rationale**: Best AST manipulation, supports our YAML frontmatter needs
```

❌ **Bad**:

```markdown
## Design Decision: Markdown Parsing

**Implementation**: Custom regex-based parser
**Rationale**: More control over parsing logic
```

**Violation**: No library search performed, reinventing the wheel

---

## Article 2: Test-First Development

### Principle

**Write tests before implementation (TDD mandatory)**

### Rationale

- Ensures 100% testable code (tests written first)
- Reduces bugs (test coverage >80%)
- Improves design (testability forces better architecture)
- Provides living documentation (tests as examples)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. For every task in tasks.md, check that corresponding test file exists
2. Test file must be created BEFORE implementation
3. Test coverage target: 80%+ (unit + integration tests)
4. Test-to-requirement ratio: 3:1 (3 test cases per acceptance criterion)

**Acceptance Criteria**:

- Test files exist for all components (e.g., `ComponentName.test.ts`)
- Tests reference requirement IDs (e.g., `// AC-1.1: Library-First validation`)
- Coverage report generated after every build (>80% threshold enforced)

**Examples**:

✅ **Good** (Test-First):

```typescript
// Step 1: Write test FIRST (AC-1.1.test.ts)
describe('AC-1.1: Library-First Checker', () => {
  it('should detect custom implementations without justification', () => {
    const design = parseDesign('design.md');
    const violations = libraryChecker.validate(design);
    expect(violations).toContain('Custom markdown parser lacks justification');
  });
});

// Step 2: Implement feature to make test pass
class LibraryChecker {
  validate(design) {
    // Implementation here
  }
}
```

❌ **Bad** (Implementation-First):

```typescript
// Step 1: Implementation written first
class LibraryChecker {
  validate(design) {
    // Implementation here
  }
}

// Step 2: Test written AFTER (violation!)
describe('AC-1.1: Library-First Checker', () => {
  // Tests here
});
```

**Violation**: Tests written after implementation (not TDD)

---

## Article 3: Security-First Development

### Principle

**Security review is mandatory before merge**

### Rationale

- Prevents vulnerabilities from entering production (OWASP Top 10 compliance)
- Ensures dependency security (no known CVEs)
- Enforces secure coding practices (no hardcoded secrets, no SQL injection)
- Protects user data (GDPR/CCPA compliance)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. No hardcoded secrets in code (API keys, passwords, tokens)
2. All dependencies scanned for vulnerabilities (npm audit, Snyk, or Dependabot)
3. Security review checklist completed for sensitive operations:
   - File system access (scoped to project directory only)
   - Network requests (validate URLs, no SSRF)
   - User input validation (sanitize Markdown, YAML)
   - Authentication/Authorization (if applicable)

**Acceptance Criteria**:

- Security review checklist completed (see steering/rules/security-checklist.md)
- No HIGH or CRITICAL vulnerabilities in dependencies
- All sensitive operations logged (audit trail)

**Examples**:

✅ **Good** (Security-First):

```typescript
// Secure file reading (scoped to project directory)
class FileSystemManager {
  read(filePath: string): string {
    const projectRoot = process.cwd();
    const absolutePath = path.resolve(projectRoot, filePath);

    // Prevent directory traversal attacks
    if (!absolutePath.startsWith(projectRoot)) {
      throw new SecurityError('Access denied: Outside project directory');
    }

    return fs.readFileSync(absolutePath, 'utf-8');
  }
}
```

❌ **Bad** (Security Risk):

```typescript
// Insecure file reading (directory traversal vulnerability)
class FileSystemManager {
  read(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8'); // VULNERABLE!
  }
}
```

**Violation**: Allows reading any file on system (e.g., `../../etc/passwd`)

---

## Article 4: Documentation-First Development

### Principle

**Document before implement (README, API docs, ADRs)**

### Rationale

- Clarifies intent before coding (prevents misunderstandings)
- Provides onboarding material (new contributors ramp up faster)
- Captures design rationale (why decisions were made)
- Enables asynchronous collaboration (distributed teams)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. Every feature has design documentation (in docs/design/design.md)
2. Every public API has JSDoc comments (with @param, @returns, @throws)
3. Every major design decision has an ADR (Architecture Decision Record)
4. README.md updated for new features (installation, usage, examples)

**Acceptance Criteria**:

- Design documentation references requirement IDs (AC-X.Y)
- API documentation generated automatically (TypeDoc or similar)
- ADRs follow template (Context, Decision, Consequences, Alternatives)

**Examples**:

✅ **Good** (Documentation-First):

```markdown
<!-- design.md - Written BEFORE implementation -->

## Feature 1: Constitutional Governance

### Context (AC-1.1)

MUSUHI 2.0 enforces 9 immutable Articles via Phase -1 Gates.

### Design

- Constitution Reader parses steering/constitution.md
- Phase Gate Validator enforces compliance
- Violations block implementation phase

### API

See `src/core/constitutional/PhaseGateValidator.ts`:

- `validatePhaseGate(phase: SDDPhase, design: Design): Promise<GateResult>`
```

```typescript
/**
 * Validates design against Phase -1 Gates (AC-1.3)
 *
 * @param phase - Current SDD phase (Design, Implementation, etc.)
 * @param design - Design document to validate
 * @returns GateResult with pass/fail status and violations
 * @throws ConstitutionalError if constitution file is missing
 *
 * @example
 * const result = await validator.validatePhaseGate('Design', design);
 * if (!result.passed) {
 *   console.error('Violations:', result.violations);
 * }
 */
async validatePhaseGate(phase: SDDPhase, design: Design): Promise<GateResult> {
  // Implementation
}
```

❌ **Bad** (No Documentation):

```typescript
// No JSDoc, unclear purpose
async validatePhaseGate(phase, design) {
  // Implementation
}
```

**Violation**: Public API lacks documentation

---

## Article 5: Simplicity-First Development

### Principle

**Reject over-engineering, prefer simple solutions**

### Rationale

- Reduces complexity (easier to understand and maintain)
- Prevents scope creep (focus on essential features)
- Improves velocity (ship faster with less code)
- Reduces bugs (fewer lines of code = fewer bugs)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. Project count: Maximum 3 projects in a single design (enforce monorepo simplicity)
2. Abstraction layers: Maximum 3 layers (Presentation → Application → Infrastructure)
3. Custom abstractions: Require justification for every wrapper/adapter
4. Premature optimization: Flag performance optimizations without benchmarks

**Acceptance Criteria**:

- Complexity Tracking section in design.md (if >3 projects, provide justification)
- Architecture diagrams show clear layering (no unnecessary abstraction)
- Code review comments: "Can this be simpler?"

**Examples**:

✅ **Good** (Simple):

```markdown
## Design: MUSUHI 2.0 Architecture

**Projects**: 2

1. @musuhi/core (SDD engine)
2. @musuhi/cli (CLI interface)

**Justification**: CLI separated for lighter npm package (core can be used programmatically)
```

❌ **Bad** (Over-Engineering):

```markdown
## Design: MUSUHI 2.0 Architecture

**Projects**: 7

1. @musuhi/core
2. @musuhi/cli
3. @musuhi/utils
4. @musuhi/types
5. @musuhi/validators
6. @musuhi/parsers
7. @musuhi/loggers

**Violation**: Unnecessary project splitting (Article 5: >3 projects requires justification)
```

---

## Article 6: Performance-First Development

### Principle

**Enforce performance budgets (measure, don't guess)**

### Rationale

- Prevents performance regressions (catch slowdowns early)
- Ensures user experience (fast is a feature)
- Enables scalability (handle larger workloads)
- Data-driven optimization (benchmark before optimize)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. Performance budgets defined in design.md (e.g., "TUI refresh <100ms")
2. Benchmarks run before optimization (baseline established)
3. Performance tests included in test suite (automated regression detection)
4. Critical paths identified (e.g., "Gap analysis for 100K LOC")

**Acceptance Criteria**:

- Performance requirements documented (NFR-P.X references)
- Benchmark results included in PR (before/after comparison)
- Performance tests fail if budget exceeded

**Performance Budgets (from NFR-P.X)**:

- TUI Dashboard refresh: <100ms (95th percentile) - NFR-P.1
- Parallel execution time savings: >50% vs sequential - NFR-P.2
- Gap analysis: <60s for 100K LOC codebase - NFR-P.3
- Agent routing overhead: <200ms - NFR-P.4

**Examples**:

✅ **Good** (Performance-First):

```typescript
// Benchmark BEFORE optimization
describe('Performance: Gap Analysis', () => {
  it('should complete gap analysis in <60s for 100K LOC', async () => {
    const start = Date.now();
    await gapAnalyzer.analyze(largeCodebase);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(60000); // 60s budget (NFR-P.3)
  });
});
```

❌ **Bad** (No Benchmarks):

```typescript
// Optimization without baseline
function optimizeGapAnalysis() {
  // Optimized implementation
  // No benchmark data to prove improvement!
}
```

**Violation**: Performance optimization without baseline measurement

---

## Article 7: Accessibility-First Development

### Principle

**WCAG 2.1 AA compliance mandatory (for UI components)**

### Rationale

- Inclusive design (usable by everyone)
- Legal compliance (ADA, Section 508)
- Better UX for all users (not just accessibility users)
- Keyboard navigation support (critical for CLI/TUI)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. Keyboard navigation tested (Tab, Arrow keys, Enter, Esc)
2. Screen reader compatibility (semantic HTML, ARIA labels if applicable)
3. Color contrast ratio: >4.5:1 for text (WCAG AA)
4. Focus indicators visible (no :focus { outline: none })

**Acceptance Criteria** (TUI Dashboard):

- All dashboard widgets navigable via keyboard
- Status indicators use both color AND text (not color alone)
- Help text accessible (H key shows help, Esc closes)

**Examples**:

✅ **Good** (Accessible TUI):

```typescript
// Dashboard keyboard navigation (Article 7)
dashboard.on('keypress', (ch, key) => {
  if (key.name === 'tab') {
    focusNextWidget(); // Tab navigation
  }
  if (key.name === 'h') {
    showHelpDialog(); // Help dialog
  }
  if (key.name === 'escape') {
    closeCurrentDialog(); // Esc closes dialogs
  }
});
```

❌ **Bad** (Inaccessible):

```typescript
// No keyboard navigation (mouse-only)
dashboard.widgets.forEach((widget) => {
  widget.on('click', handleClick); // VIOLATION: No keyboard support
});
```

**Violation**: TUI requires keyboard navigation (CLI environment)

---

## Article 8: Privacy-First Development

### Principle

**Minimal data collection, GDPR/CCPA compliance**

### Rationale

- User trust (transparent data practices)
- Legal compliance (GDPR fines up to €20M)
- Security by default (less data = less risk)
- Ethical responsibility (respect user privacy)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. No PII collected without explicit user consent
2. No telemetry by default (opt-in only)
3. Data retention policy documented (how long, where stored)
4. Privacy policy updated for new data collection

**Acceptance Criteria**:

- MUSUHI 2.0 is fully local (no cloud sync, no analytics by default)
- Optional telemetry is anonymized (no user identification)
- Privacy policy in README.md (what data is collected, why, how to opt out)

**Examples**:

✅ **Good** (Privacy-First):

```typescript
// Optional, anonymized telemetry (opt-in)
class Telemetry {
  constructor(private config: Config) {
    if (!config.telemetry.enabled) {
      return; // Disabled by default
    }
  }

  trackEvent(event: string, metadata: object) {
    // Anonymize: No user ID, no code content, no file paths
    const anonymized = {
      event,
      timestamp: Date.now(),
      version: MUSUHI_VERSION,
      // No PII
    };
    this.send(anonymized);
  }
}
```

❌ **Bad** (Privacy Violation):

```typescript
// Telemetry enabled by default, sends code content
class Telemetry {
  trackEvent(event: string, metadata: object) {
    this.send({
      event,
      userId: getUserId(), // VIOLATION: PII without consent
      codeContent: metadata.code, // VIOLATION: User's code
      filePath: metadata.path, // VIOLATION: Reveals project structure
    });
  }
}
```

**Violation**: Collects PII and code content without consent

---

## Article 9: Integration-First Development

### Principle

**Integrate existing tools, avoid reinventing platforms**

### Rationale

- Leverage existing ecosystems (Git, npm, VS Code)
- Avoid vendor lock-in (platform-agnostic core)
- Interoperability (works with other tools)
- Faster adoption (users don't switch platforms)

### Enforcement Rules

**Phase -1 Gate SHALL validate**:

1. No custom version control (use Git)
2. No custom package manager (use npm/pnpm/yarn)
3. No custom IDE (integrate with existing: VS Code, Cursor, Zed, etc.)
4. No custom CI/CD (provide templates for GitHub Actions, GitLab CI, etc.)

**Acceptance Criteria**:

- Platform adapters for 8 AI coding platforms (AC-8.1 through AC-8.9)
- File-based storage compatible with Git (Markdown/YAML)
- CLI tool installable via npm (`npm install -g @musuhi/cli`)

**Examples**:

✅ **Good** (Integration-First):

```markdown
## Design: Version Control Integration

**Decision**: Use Git for specs/ versioning
**Rationale**: Universal adoption, no need for custom VCS

## Design: Package Management

**Decision**: Publish to npm registry
**Rationale**: Standard Node.js distribution, familiar to developers
```

❌ **Bad** (Reinventing Platforms):

```markdown
## Design: Version Control Integration

**Decision**: Build custom "MUSUHI Sync" for specs/ versioning
**Rationale**: More control over versioning logic

**Violation**: Reinventing Git (Article 9: Integration-First)
```

---

## Phase -1 Gate Validation Process

### Workflow

**WHEN** a design phase is marked complete, **THEN** the system SHALL execute Phase -1 Gate validation:

1. **Load Constitution**: Read `steering/constitution.md` (9 Articles)
2. **Run Checkers**: Execute validation for each Article
   - Article 1: Library-First Checker (search npm/PyPI)
   - Article 2: Test-First Enforcer (check for test files)
   - Article 3: Security Review Checklist (scan for vulnerabilities)
   - Article 4: Documentation Checker (verify JSDoc, ADRs, README)
   - Article 5: Simplicity Checker (count projects, layers)
   - Article 6: Performance Budget Validator (check NFR-P.X defined)
   - Article 7: Accessibility Checker (keyboard navigation, WCAG)
   - Article 8: Privacy Checker (no PII collection)
   - Article 9: Integration Checker (no custom platforms)
3. **Generate Report**: Create `compliance-report.md` with:
   - ✅ Passed checks (with evidence)
   - ❌ Failed checks (with remediation steps)
   - ⚠️ Warnings (requires justification)
   - **Overall Pass Rate**: X/9 Articles (must be >90% to proceed)
4. **Block or Approve**:
   - IF pass rate <90%, THEN block design approval (must fix violations)
   - IF pass rate ≥90%, THEN approve design (proceed to implementation)

### Compliance Report Example

```markdown
# Phase -1 Gate Compliance Report

**Phase**: Design
**Date**: 2025-11-15
**Design Document**: docs/design/design.md
**Overall Pass Rate**: 8/9 Articles (88.9%) - ❌ FAILED (requires ≥90%)

---

## Article 1: Library-First Development ✅ PASSED

- **Evidence**: 15 libraries evaluated (unified, graphlib, blessed-contrib, etc.)
- **Custom Implementations**: 0
- **Justifications**: N/A

## Article 2: Test-First Development ✅ PASSED

- **Test Files**: 127 test files created (3:1 ratio)
- **Coverage Target**: 80%+ documented
- **Blocked**: Implementation phase cannot start without test files

## Article 3: Security-First Development ✅ PASSED

- **Security Review Checklist**: Completed
- **Vulnerabilities**: 0 HIGH/CRITICAL (npm audit clean)
- **Scoped File Access**: Validated (no directory traversal)

## Article 4: Documentation-First Development ⚠️ WARNING

- **Design Documentation**: ✅ Present (docs/design/design.md)
- **ADRs**: ✅ 7 ADRs created
- **API Documentation**: ⚠️ Some interfaces lack JSDoc (PhaseGateValidator)
- **Remediation**: Add JSDoc to all public APIs

## Article 5: Simplicity-First Development ✅ PASSED

- **Project Count**: 2 (@musuhi/core, @musuhi/cli)
- **Layers**: 3 (Presentation, Application, Infrastructure)
- **Complexity**: Within limits

## Article 6: Performance-First Development ✅ PASSED

- **Performance Budgets**: Defined (NFR-P.1 through NFR-P.4)
- **Benchmarks**: Planned in test suite
- **Critical Paths**: Identified (gap analysis, dashboard refresh)

## Article 7: Accessibility-First Development ✅ PASSED

- **Keyboard Navigation**: Designed (Tab, Arrow keys, H, Esc)
- **WCAG Compliance**: TUI color contrast >4.5:1
- **Screen Reader**: N/A (CLI/TUI interface)

## Article 8: Privacy-First Development ✅ PASSED

- **PII Collection**: None (fully local tool)
- **Telemetry**: Opt-in only, anonymized
- **Privacy Policy**: Documented in README.md

## Article 9: Integration-First Development ❌ FAILED

- **Version Control**: ✅ Uses Git
- **Package Management**: ✅ Uses npm/pnpm
- **IDE Integration**: ⚠️ Only 3 platforms in Phase 1 (target: 8)
- **Violation**: Missing 5 platform adapters (Zed, Windsurf, Codex, Gemini, Qwen)
- **Remediation**: Complete all 8 platform adapters in P2 wave (weeks 17-24)

---

## Remediation Required

**Before Approval**:

1. Add JSDoc to PhaseGateValidator interface (Article 4)
2. Plan implementation for remaining 5 platform adapters (Article 9)

**Pass Rate After Remediation**: 9/9 (100%) - Ready for approval
```

---

## Enforcement Mechanism

### Read-Only Constitution (Immutable)

**File Permissions**:

```bash
chmod 444 steering/constitution.md  # Read-only for all users
```

**Automated Validation**:

- Phase -1 Gate Validator runs automatically before design approval
- No bypass mechanism (human override requires explicit constitutional amendment)

**Human Override Process** (Constitutional Amendment):

1. Propose amendment in `changes/YYYY-MM-DD-amend-constitution/`
2. Justification required (why amendment is necessary)
3. Stakeholder approval required (Product Manager, Tech Lead, QA Lead)
4. Amendment merged to `steering/constitution.md`
5. File permissions restored (chmod 444)

---

## Success Metrics

**Target**: >90% Phase -1 Gate pass rate (indicates high-quality specifications)

**Tracking**:

- Compliance reports generated for every design phase
- Pass rate trends over time (monthly review)
- Common violations analyzed (improve guidelines)

**Expected Impact**:

- 50% reduction in technical debt (measured by code complexity)
- 90%+ best practices adherence
- 0 constitutional violations in production code

---

## Related Documents

- **Design**: docs/design/design.md (references this constitution)
- **Requirements**: docs/requirements/requirements.md (AC-1.1 through AC-1.9)
- **ADR-001**: Architecture Decision Record for Constitutional Enforcement
- **Security Checklist**: steering/rules/security-checklist.md (Article 3 validation)
- **Workflow**: steering/rules/workflow.md (Phase -1 Gate integration)

---

**Document Metadata**:

- **Version**: 1.0
- **Status**: Immutable (read-only)
- **Last Updated**: 2025-11-15
- **Next Review**: After Phase 5 (Implementation) completion
- **Enforced By**: Phase -1 Gate Validator (src/core/constitutional/PhaseGateValidator.ts)
