/**
 * Traceability Engine Implementation
 * Maps requirements ↔ design ↔ tasks ↔ code ↔ tests
 * @module @musuhi/core/traceability
 */

/**
 * Artifact types in the traceability chain
 */
export type ArtifactType = 'requirement' | 'design' | 'task' | 'code' | 'test';

/**
 * Traceability link between artifacts
 */
export interface ArtifactLink {
  /** Source artifact ID */
  from: string;

  /** Source artifact type */
  fromType: ArtifactType;

  /** Target artifact ID */
  to: string;

  /** Target artifact type */
  toType: ArtifactType;

  /** Link type (implements, tests, satisfies, etc.) */
  linkType: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Artifact in the traceability chain
 */
export interface Artifact {
  /** Unique identifier */
  id: string;

  /** Artifact type */
  type: ArtifactType;

  /** Artifact name/title */
  name: string;

  /** Artifact description */
  description?: string;

  /** File path (for code/test artifacts) */
  filePath?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Traceability matrix entry
 */
export interface TraceabilityMatrixEntry {
  /** Requirement ID */
  requirementId: string;

  /** Requirement name */
  requirementName: string;

  /** Design IDs */
  designIds: string[];

  /** Task IDs */
  taskIds: string[];

  /** Code references */
  codeRefs: string[];

  /** Test IDs */
  testIds: string[];

  /** Coverage percentage */
  coverage: number;

  /** Status (complete, partial, missing) */
  status: 'complete' | 'partial' | 'missing';
}

/**
 * Traceability report
 */
export interface TraceabilityReport {
  /** Total artifacts */
  totalArtifacts: number;

  /** Artifacts by type */
  artifactsByType: Record<ArtifactType, number>;

  /** Total links */
  totalLinks: number;

  /** Links by type */
  linksByType: Record<string, number>;

  /** Coverage statistics */
  coverage: {
    requirements: number; // Percentage of requirements with implementation
    design: number; // Percentage of design with tasks
    tasks: number; // Percentage of tasks with code
    code: number; // Percentage of code with tests
  };

  /** Traceability matrix */
  matrix: TraceabilityMatrixEntry[];

  /** Missing links (gaps) */
  gaps: {
    requirementsWithoutDesign: string[];
    designWithoutTasks: string[];
    tasksWithoutCode: string[];
    codeWithoutTests: string[];
  };
}

/**
 * Traceability Engine
 * Manages traceability links between requirements, design, tasks, code, and tests
 */
export class TraceabilityEngine {
  private artifacts: Map<string, Artifact>;
  private links: ArtifactLink[];

  constructor() {
    this.artifacts = new Map();
    this.links = [];
  }

  /**
   * Add an artifact to the traceability chain
   * @param artifact - Artifact to add
   */
  addArtifact(artifact: Artifact): void {
    this.artifacts.set(artifact.id, artifact);
  }

  /**
   * Add a traceability link
   * @param link - Link to add
   */
  addLink(link: ArtifactLink): void {
    this.links.push(link);
  }

  /**
   * Remove an artifact
   * @param artifactId - Artifact ID to remove
   */
  removeArtifact(artifactId: string): void {
    this.artifacts.delete(artifactId);
    // Remove all links involving this artifact
    this.links = this.links.filter((link) => link.from !== artifactId && link.to !== artifactId);
  }

  /**
   * Remove a link
   * @param from - Source artifact ID
   * @param to - Target artifact ID
   */
  removeLink(from: string, to: string): void {
    this.links = this.links.filter((link) => !(link.from === from && link.to === to));
  }

  /**
   * Get artifact by ID
   * @param artifactId - Artifact ID
   * @returns Artifact or undefined
   */
  getArtifact(artifactId: string): Artifact | undefined {
    return this.artifacts.get(artifactId);
  }

  /**
   * Get all artifacts of a specific type
   * @param type - Artifact type
   * @returns Array of artifacts
   */
  getArtifactsByType(type: ArtifactType): Artifact[] {
    return Array.from(this.artifacts.values()).filter((artifact) => artifact.type === type);
  }

  /**
   * Get all links from a specific artifact
   * @param artifactId - Artifact ID
   * @returns Array of links
   */
  getLinksFrom(artifactId: string): ArtifactLink[] {
    return this.links.filter((link) => link.from === artifactId);
  }

  /**
   * Get all links to a specific artifact
   * @param artifactId - Artifact ID
   * @returns Array of links
   */
  getLinksTo(artifactId: string): ArtifactLink[] {
    return this.links.filter((link) => link.to === artifactId);
  }

  /**
   * Get all links between two artifact types
   * @param fromType - Source artifact type
   * @param toType - Target artifact type
   * @returns Array of links
   */
  getLinksBetweenTypes(fromType: ArtifactType, toType: ArtifactType): ArtifactLink[] {
    return this.links.filter((link) => link.fromType === fromType && link.toType === toType);
  }

  /**
   * Trace forward from an artifact (find all downstream artifacts)
   * @param artifactId - Starting artifact ID
   * @returns Array of downstream artifact IDs
   */
  traceForward(artifactId: string): string[] {
    const visited = new Set<string>();
    const queue = [artifactId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      const outgoingLinks = this.getLinksFrom(current);
      for (const link of outgoingLinks) {
        if (!visited.has(link.to)) {
          queue.push(link.to);
        }
      }
    }

    visited.delete(artifactId); // Remove starting artifact
    return Array.from(visited);
  }

  /**
   * Trace backward from an artifact (find all upstream artifacts)
   * @param artifactId - Starting artifact ID
   * @returns Array of upstream artifact IDs
   */
  traceBackward(artifactId: string): string[] {
    const visited = new Set<string>();
    const queue = [artifactId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      const incomingLinks = this.getLinksTo(current);
      for (const link of incomingLinks) {
        if (!visited.has(link.from)) {
          queue.push(link.from);
        }
      }
    }

    visited.delete(artifactId); // Remove starting artifact
    return Array.from(visited);
  }

  /**
   * Generate traceability matrix
   * @returns Traceability matrix entries
   */
  generateMatrix(): TraceabilityMatrixEntry[] {
    const requirements = this.getArtifactsByType('requirement');
    const matrix: TraceabilityMatrixEntry[] = [];

    for (const req of requirements) {
      const designIds = this.getLinksFrom(req.id)
        .filter((link) => link.toType === 'design')
        .map((link) => link.to);

      const taskIds: string[] = [];
      for (const designId of designIds) {
        const designTasks = this.getLinksFrom(designId)
          .filter((link) => link.toType === 'task')
          .map((link) => link.to);
        taskIds.push(...designTasks);
      }

      const codeRefs: string[] = [];
      for (const taskId of taskIds) {
        const taskCode = this.getLinksFrom(taskId)
          .filter((link) => link.toType === 'code')
          .map((link) => link.to);
        codeRefs.push(...taskCode);
      }

      const testIds: string[] = [];
      for (const codeRef of codeRefs) {
        const codeTests = this.getLinksFrom(codeRef)
          .filter((link) => link.toType === 'test')
          .map((link) => link.to);
        testIds.push(...codeTests);
      }

      // Calculate coverage
      let coverage = 0;
      if (designIds.length > 0) coverage += 25;
      if (taskIds.length > 0) coverage += 25;
      if (codeRefs.length > 0) coverage += 25;
      if (testIds.length > 0) coverage += 25;

      // Determine status
      let status: 'complete' | 'partial' | 'missing';
      if (coverage === 100) {
        status = 'complete';
      } else if (coverage > 0) {
        status = 'partial';
      } else {
        status = 'missing';
      }

      matrix.push({
        requirementId: req.id,
        requirementName: req.name,
        designIds,
        taskIds,
        codeRefs,
        testIds,
        coverage,
        status,
      });
    }

    return matrix;
  }

  /**
   * Generate traceability report
   * @returns Traceability report
   */
  generateReport(): TraceabilityReport {
    const matrix = this.generateMatrix();

    // Count artifacts by type
    const artifactsByType: Record<ArtifactType, number> = {
      requirement: 0,
      design: 0,
      task: 0,
      code: 0,
      test: 0,
    };
    for (const artifact of this.artifacts.values()) {
      artifactsByType[artifact.type]++;
    }

    // Count links by type
    const linksByType: Record<string, number> = {};
    for (const link of this.links) {
      linksByType[link.linkType] = (linksByType[link.linkType] || 0) + 1;
    }

    // Calculate coverage
    const requirements = this.getArtifactsByType('requirement');
    const design = this.getArtifactsByType('design');
    const tasks = this.getArtifactsByType('task');
    const code = this.getArtifactsByType('code');

    const coverage = {
      requirements: this.calculateCoverage(requirements, 'design'),
      design: this.calculateCoverage(design, 'task'),
      tasks: this.calculateCoverage(tasks, 'code'),
      code: this.calculateCoverage(code, 'test'),
    };

    // Find gaps
    const gaps = {
      requirementsWithoutDesign: this.findGaps(requirements, 'design'),
      designWithoutTasks: this.findGaps(design, 'task'),
      tasksWithoutCode: this.findGaps(tasks, 'code'),
      codeWithoutTests: this.findGaps(code, 'test'),
    };

    return {
      totalArtifacts: this.artifacts.size,
      artifactsByType,
      totalLinks: this.links.length,
      linksByType,
      coverage,
      matrix,
      gaps,
    };
  }

  /**
   * Calculate coverage percentage
   * @param artifacts - Source artifacts
   * @param targetType - Target artifact type
   * @returns Coverage percentage
   */
  private calculateCoverage(artifacts: Artifact[], targetType: ArtifactType): number {
    if (artifacts.length === 0) {
      return 0;
    }

    let covered = 0;
    for (const artifact of artifacts) {
      const hasLinks = this.getLinksFrom(artifact.id).some((link) => link.toType === targetType);
      if (hasLinks) {
        covered++;
      }
    }

    return (covered / artifacts.length) * 100;
  }

  /**
   * Find gaps (artifacts without links to target type)
   * @param artifacts - Source artifacts
   * @param targetType - Target artifact type
   * @returns Array of artifact IDs without links
   */
  private findGaps(artifacts: Artifact[], targetType: ArtifactType): string[] {
    const gaps: string[] = [];

    for (const artifact of artifacts) {
      const hasLinks = this.getLinksFrom(artifact.id).some((link) => link.toType === targetType);
      if (!hasLinks) {
        gaps.push(artifact.id);
      }
    }

    return gaps;
  }

  /**
   * Clear all artifacts and links
   */
  clear(): void {
    this.artifacts.clear();
    this.links = [];
  }

  /**
   * Get total number of artifacts
   * @returns Total artifacts
   */
  getTotalArtifacts(): number {
    return this.artifacts.size;
  }

  /**
   * Get total number of links
   * @returns Total links
   */
  getTotalLinks(): number {
    return this.links.length;
  }

  /**
   * Export traceability data to JSON
   * @returns JSON string
   */
  exportToJSON(): string {
    return JSON.stringify({
      artifacts: Array.from(this.artifacts.values()),
      links: this.links,
    });
  }

  /**
   * Import traceability data from JSON
   * @param json - JSON string
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json) as {
      artifacts: Artifact[];
      links: ArtifactLink[];
    };

    this.clear();

    for (const artifact of data.artifacts) {
      this.addArtifact(artifact);
    }

    for (const link of data.links) {
      this.addLink(link);
    }
  }
}
