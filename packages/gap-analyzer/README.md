# @musuhi-ng/gap-analyzer

Brownfield gap analysis for MUSUHI 2.0 - Feature 5

## Overview

The Gap Analyzer automates detection of gaps between requirements and implementation for brownfield projects. It identifies missing features, undocumented code, conflicts, breaking changes, and pattern violations.

## Features

- **AC-5.1**: Gap Analysis Command (`/musuhi:validate-gap`)
- **AC-5.2**: Missing Features Detection (requirements with no implementation)
- **AC-5.3**: Undocumented Features Detection (code with no requirements)
- **AC-5.4**: Conflict Detection (requirements conflicting with existing patterns)
- **AC-5.5**: Reconciliation Recommendations (Add feature, Update requirement, Deprecate code)
- **AC-5.6**: Breaking Change Detection (flags breaking changes, suggests migration)
- **AC-5.7**: Pattern Violation Detection (checks against steering/structure.md)
- **AC-5.8**: Gap Report Format (comprehensive markdown report)
- **AC-5.9**: Design Integration (incorporates gap findings in design)

## Installation

```bash
pnpm add @musuhi-ng/gap-analyzer
```

## Usage

### Basic Usage

```typescript
import { GapAnalyzer } from '@musuhi-ng/gap-analyzer';

const analyzer = new GapAnalyzer({
  codebasePath: '/path/to/codebase',
  requirementsPath: '/path/to/requirements.md',
  steeringPath: '/path/to/steering',
});

// Generate gap report
await analyzer.generateReport('./gap-report.md');
```

### Advanced Usage

```typescript
import {
  GapAnalyzer,
  GapReportGenerator,
  RecommendationEngine,
} from '@musuhi-ng/gap-analyzer';

// Analyze gaps
const analyzer = new GapAnalyzer(config);
const report = await analyzer.analyze();

// Generate recommendations
const recommendationEngine = new RecommendationEngine();
const recommendations = recommendationEngine.generate(report.gaps);

// Generate custom report formats
const generator = new GapReportGenerator();
const markdown = generator.generate(report, recommendations);
const json = generator.generateJSON(report, recommendations);
const html = generator.generateHTML(report, recommendations);
```

## Architecture

### Multi-Strategy Gap Detection

1. **AST Parsing** (High Accuracy) - Uses ts-morph for TypeScript analysis
2. **Pattern Matching** (Fast) - Keyword search for quick scans
3. **Semantic Analysis** (Future) - Placeholder for ML-based conflict detection

### Components

- **Parsers**:
  - `ASTParser`: TypeScript/JavaScript AST parsing using ts-morph
  - `PatternMatcher`: Fast keyword-based pattern matching

- **Detectors**:
  - `MissingFeatureDetector`: AC-5.2 - Requirements with no implementation
  - `UndocumentedFeatureDetector`: AC-5.3 - Code with no requirements
  - `ConflictDetector`: AC-5.4 - Conflicts with existing patterns
  - `BreakingChangeDetector`: AC-5.6 - Breaking change detection
  - `PatternViolationDetector`: AC-5.7 - Pattern violations

- **Engine**:
  - `RecommendationEngine`: AC-5.5 - Generates actionable recommendations
  - `GapReportGenerator`: AC-5.8 - Formats gap reports (Markdown, JSON, HTML)

## Performance

- **Target**: <60s for 100K LOC (NFR-P.3)
- **Strategy**: Parallel execution of detectors, AST caching

## Gap Types

1. **missing-feature**: Requirements without implementation
2. **undocumented-feature**: Code without requirements
3. **conflict**: Requirements conflict with existing patterns
4. **breaking-change**: Requirements introduce breaking changes
5. **pattern-violation**: Requirements violate architectural patterns

## Report Format

```markdown
# Gap Analysis Report

**Generated**: 2025-11-16T10:00:00Z
**Codebase**: /project (100,000 LOC)
**Requirements**: 72 AC

## Summary

- **Coverage**: 62.5% (45/72 requirements implemented)
- **Missing Features**: 27
- **Undocumented Features**: 8
- **Conflicts**: 3
- **Breaking Changes**: 2
- **Pattern Violations**: 5

## Missing Features (27)

| Requirement | Feature           | Recommendation                           | Severity |
| ----------- | ----------------- | ---------------------------------------- | -------- |
| AC-1.1      | Constitution File | Add implementation for Constitution File | critical |

## Recommendations (45)

### Add Feature (27)

- **Add implementation for Constitution File**
  - Priority: critical
  - Estimated Effort: 40 hours (5 days)

...
```

## API Reference

### GapAnalyzer

```typescript
class GapAnalyzer {
  constructor(config: GapAnalysisConfig);
  analyze(): Promise<GapReport>;
  generateReport(outputPath: string): Promise<void>;
}
```

### Types

```typescript
interface GapReport {
  timestamp: Date;
  codebasePath: string;
  linesOfCode: number;
  totalRequirements: number;
  coverage: number; // 0.0 to 1.0
  gaps: Gap[];
  summary: GapSummary;
}

interface Gap {
  type: GapType;
  requirement?: string;
  file?: string;
  description: string;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## License

MIT

## Contributing

See main MUSUHI 2.0 repository for contribution guidelines.
