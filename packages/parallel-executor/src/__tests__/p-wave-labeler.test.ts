/**
 * Tests for PWaveLabeler
 *
 * AC-4.1: P-Wave Labeling
 */

import { describe, it, expect } from 'vitest';
import { Graph } from 'graphlib';
import { PWaveLabeler } from '../core/p-wave-labeler.js';

describe('PWaveLabeler', () => {
  const labeler = new PWaveLabeler();

  describe('labelTasks', () => {
    it('should assign P0 to tasks with no dependencies', () => {
      // AC-4.1: P0 tasks have no dependencies
      const graph = new Graph({ directed: true });
      graph.setNode('t1', { id: 't1', description: 'Task 1' });
      graph.setNode('t2', { id: 't2', description: 'Task 2' });
      graph.setNode('t3', { id: 't3', description: 'Task 3' });

      const waves = labeler.labelTasks(graph);

      expect(waves.get('t1')).toBe(0);
      expect(waves.get('t2')).toBe(0);
      expect(waves.get('t3')).toBe(0);
    });

    it('should assign P1 to tasks depending on P0', () => {
      // AC-4.1: P1 tasks depend only on P0 tasks
      const graph = new Graph({ directed: true });
      graph.setNode('t1', { id: 't1', description: 'Task 1' }); // P0
      graph.setNode('t2', { id: 't2', description: 'Task 2' }); // P1
      graph.setNode('t3', { id: 't3', description: 'Task 3' }); // P1
      graph.setEdge('t1', 't2');
      graph.setEdge('t1', 't3');

      const waves = labeler.labelTasks(graph);

      expect(waves.get('t1')).toBe(0); // P0
      expect(waves.get('t2')).toBe(1); // P1
      expect(waves.get('t3')).toBe(1); // P1
    });

    it('should assign P2 to tasks depending on P1', () => {
      // AC-4.1: P2 tasks depend on P1 tasks
      const graph = new Graph({ directed: true });
      graph.setNode('t1', { id: 't1' }); // P0
      graph.setNode('t2', { id: 't2' }); // P1
      graph.setNode('t3', { id: 't3' }); // P2
      graph.setEdge('t1', 't2');
      graph.setEdge('t2', 't3');

      const waves = labeler.labelTasks(graph);

      expect(waves.get('t1')).toBe(0);
      expect(waves.get('t2')).toBe(1);
      expect(waves.get('t3')).toBe(2);
    });

    it('should handle diamond dependency pattern', () => {
      // Graph: t1 -> t2 -> t4
      //          \-> t3 -> /
      const graph = new Graph({ directed: true });
      graph.setNode('t1', { id: 't1' });
      graph.setNode('t2', { id: 't2' });
      graph.setNode('t3', { id: 't3' });
      graph.setNode('t4', { id: 't4' });
      graph.setEdge('t1', 't2');
      graph.setEdge('t1', 't3');
      graph.setEdge('t2', 't4');
      graph.setEdge('t3', 't4');

      const waves = labeler.labelTasks(graph);

      expect(waves.get('t1')).toBe(0); // P0
      expect(waves.get('t2')).toBe(1); // P1
      expect(waves.get('t3')).toBe(1); // P1
      expect(waves.get('t4')).toBe(2); // P2 (depends on max(P1, P1) = P1)
    });
  });

  describe('groupByWave', () => {
    it('should group tasks by wave number', () => {
      const waves = new Map([
        ['t1', 0],
        ['t2', 1],
        ['t3', 0],
        ['t4', 2],
        ['t5', 1],
      ]);

      const grouped = labeler.groupByWave(waves);

      expect(grouped.get(0)).toEqual(['t1', 't3']);
      expect(grouped.get(1)).toEqual(['t2', 't5']);
      expect(grouped.get(2)).toEqual(['t4']);
    });
  });

  describe('getMaxWave', () => {
    it('should return maximum wave number', () => {
      const waves = new Map([
        ['t1', 0],
        ['t2', 1],
        ['t3', 2],
        ['t4', 1],
      ]);

      expect(labeler.getMaxWave(waves)).toBe(2);
    });

    it('should return -1 for empty waves', () => {
      expect(labeler.getMaxWave(new Map())).toBe(-1);
    });
  });

  describe('estimateTimeSavings', () => {
    it('should estimate 50%+ time savings for well-parallelized tasks', () => {
      // AC-4.6: Time savings should be 50%+
      // 10 tasks: 5 in P0, 3 in P1, 2 in P2
      // Sequential: 10 units, Parallel: 3 units (max wave = 2)
      // Savings: (10 - 3) / 10 * 100 = 70%
      const waves = new Map([
        ['t1', 0], ['t2', 0], ['t3', 0], ['t4', 0], ['t5', 0], // P0: 5 tasks
        ['t6', 1], ['t7', 1], ['t8', 1],                       // P1: 3 tasks
        ['t9', 2], ['t10', 2],                                  // P2: 2 tasks
      ]);

      const savings = labeler.estimateTimeSavings(waves);

      expect(savings).toBe(70);
      expect(savings).toBeGreaterThanOrEqual(50); // AC-4.6 requirement
    });

    it('should return 0% for fully sequential tasks', () => {
      // All tasks depend on previous: P0 -> P1 -> P2 -> P3
      const waves = new Map([
        ['t1', 0],
        ['t2', 1],
        ['t3', 2],
        ['t4', 3],
      ]);

      const savings = labeler.estimateTimeSavings(waves);

      expect(savings).toBe(0);
    });
  });

  describe('getWaveStatistics', () => {
    it('should return comprehensive wave statistics', () => {
      const waves = new Map([
        ['t1', 0], ['t2', 0], ['t3', 0],
        ['t4', 1], ['t5', 1],
        ['t6', 2],
      ]);

      const stats = labeler.getWaveStatistics(waves);

      expect(stats.totalTasks).toBe(6);
      expect(stats.maxWave).toBe(2);
      expect(stats.waveCounts.get(0)).toBe(3);
      expect(stats.waveCounts.get(1)).toBe(2);
      expect(stats.waveCounts.get(2)).toBe(1);
      expect(stats.estimatedSavings).toBeGreaterThan(0);
    });
  });
});
