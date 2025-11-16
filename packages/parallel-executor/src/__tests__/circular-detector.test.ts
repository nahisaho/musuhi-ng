/**
 * Tests for CircularDependencyDetector
 *
 * AC-4.7: Race Condition Prevention (circular dependency detection)
 */

import { describe, it, expect } from 'vitest';
import { Graph } from 'graphlib';
import { CircularDependencyDetector } from '../core/circular-detector.js';
import { CircularDependencyError } from '../types/index.js';

describe('CircularDependencyDetector', () => {
  const detector = new CircularDependencyDetector();

  describe('detectCycles', () => {
    it('should detect no cycles in acyclic graph', () => {
      // AC-4.7: Valid DAG should have no cycles
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setNode('t3', {});
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't3');

      const cycles = detector.detectCycles(graph);

      expect(cycles).toEqual([]);
    });

    it('should detect simple 2-node cycle', () => {
      // AC-4.7: t1 -> t2 -> t1 (cycle)
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't1');

      const cycles = detector.detectCycles(graph);

      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles[0]).toContain('t1');
      expect(cycles[0]).toContain('t2');
    });

    it('should detect self-loop cycle', () => {
      // AC-4.7: t1 -> t1 (self-loop)
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setEdge('t1', 't1');

      const cycles = detector.detectCycles(graph);

      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should detect 3-node cycle', () => {
      // AC-4.7: t1 -> t2 -> t3 -> t1 (cycle)
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setNode('t3', {});
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't3');
      graph.setEdge('t3', 't1');

      const cycles = detector.detectCycles(graph);

      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles[0]).toContain('t1');
      expect(cycles[0]).toContain('t2');
      expect(cycles[0]).toContain('t3');
    });
  });

  describe('hasCycles', () => {
    it('should return false for acyclic graph', () => {
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setEdge('t1', 't2');

      expect(detector.hasCycles(graph)).toBe(false);
    });

    it('should return true for cyclic graph', () => {
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't1');

      expect(detector.hasCycles(graph)).toBe(true);
    });
  });

  describe('validateNoCycles', () => {
    it('should not throw for acyclic graph', () => {
      // AC-4.7: Valid DAG should pass validation
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setEdge('t1', 't2');

      expect(() => detector.validateNoCycles(graph)).not.toThrow();
    });

    it('should throw CircularDependencyError for cyclic graph', () => {
      // AC-4.7: Circular dependencies should be prevented
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't1');

      expect(() => detector.validateNoCycles(graph)).toThrow(CircularDependencyError);
    });

    it('should include cycle information in error', () => {
      const graph = new Graph({ directed: true });
      graph.setNode('t1', {});
      graph.setNode('t2', {});
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't1');

      try {
        detector.validateNoCycles(graph);
        expect.fail('Should have thrown CircularDependencyError');
      } catch (error) {
        expect(error).toBeInstanceOf(CircularDependencyError);
        const circularError = error as CircularDependencyError;
        expect(circularError.cycles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('describeCycles', () => {
    it('should format cycle descriptions', () => {
      const graph = new Graph({ directed: true });
      graph.setNode('t1', { description: 'Task A' });
      graph.setNode('t2', { description: 'Task B' });

      const cycles = [['t1', 't2', 't1']];
      const descriptions = detector.describeCycles(graph, cycles);

      expect(descriptions[0]).toContain('Cycle 1');
      expect(descriptions[0]).toContain('Task A');
      expect(descriptions[0]).toContain('Task B');
    });
  });
});
