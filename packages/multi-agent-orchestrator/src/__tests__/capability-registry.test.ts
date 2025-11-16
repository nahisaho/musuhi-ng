/**
 * CapabilityRegistry Tests
 *
 * Tests for AC-3.8: Capability Discovery
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityRegistry } from '../registry/capability-registry.js';
import type { Agent } from '../types/agent.js';
import { AgentRole, AgentStatus } from '../types/agent.js';

describe('CapabilityRegistry', () => {
  let registry: CapabilityRegistry;

  beforeEach(() => {
    registry = new CapabilityRegistry();
  });

  const createTestAgent = (
    id: string,
    capabilities: Array<{ id: string; name: string; category: string; proficiency: number }>
  ): Agent => ({
    id,
    name: `Agent ${id}`,
    description: `Test agent ${id}`,
    role: AgentRole.EXECUTOR,
    status: AgentStatus.AVAILABLE,
    capabilities: capabilities.map((cap) => ({
      ...cap,
      description: `${cap.name} capability`,
    })),
  });

  describe('registerAgent', () => {
    it('should register an agent', () => {
      const agent = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
      ]);

      registry.registerAgent(agent);

      const registered = registry.getAgent('agent1');
      expect(registered).toBeDefined();
      expect(registered?.agent).toEqual(agent);
    });

    it('should reject duplicate agent ID', () => {
      const agent = createTestAgent('agent1', []);

      registry.registerAgent(agent);

      expect(() => {
        registry.registerAgent(agent);
      }).toThrow();
    });

    it('should index agent by capabilities', () => {
      const agent = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
      ]);

      registry.registerAgent(agent);

      const agents = registry.findAgents({ capability: 'coding' });
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('agent1');
    });

    it('should index agent by category', () => {
      const agent = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
      ]);

      registry.registerAgent(agent);

      const agents = registry.findAgents({ category: 'development' });
      expect(agents).toHaveLength(1);
    });
  });

  describe('unregisterAgent', () => {
    it('should unregister an agent', () => {
      const agent = createTestAgent('agent1', []);

      registry.registerAgent(agent);
      expect(registry.getAgent('agent1')).toBeDefined();

      const result = registry.unregisterAgent('agent1');
      expect(result).toBe(true);
      expect(registry.getAgent('agent1')).toBeUndefined();
    });

    it('should return false for non-existent agent', () => {
      const result = registry.unregisterAgent('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('listAgents', () => {
    it('should list all registered agents', () => {
      const agent1 = createTestAgent('agent1', []);
      const agent2 = createTestAgent('agent2', []);

      registry.registerAgent(agent1);
      registry.registerAgent(agent2);

      const agents = registry.listAgents();
      expect(agents).toHaveLength(2);
    });
  });

  describe('findAgents', () => {
    beforeEach(() => {
      const agent1 = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
        { id: 'cap2', name: 'testing', category: 'quality', proficiency: 0.8 },
      ]);

      const agent2 = createTestAgent('agent2', [
        { id: 'cap3', name: 'design', category: 'design', proficiency: 0.95 },
      ]);

      const agent3 = createTestAgent('agent3', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.7 },
      ]);

      registry.registerAgent(agent1);
      registry.registerAgent(agent2);
      registry.registerAgent(agent3);
    });

    it('should find agents by capability', () => {
      const agents = registry.findAgents({ capability: 'coding' });
      expect(agents).toHaveLength(2);
    });

    it('should find agents by category', () => {
      const agents = registry.findAgents({ category: 'development' });
      expect(agents).toHaveLength(2);
    });

    it('should find agents by minimum proficiency', () => {
      const agents = registry.findAgents({
        capability: 'coding',
        minProficiency: 0.85,
      });
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('agent1');
    });

    it('should combine multiple criteria', () => {
      const agents = registry.findAgents({
        category: 'development',
        minProficiency: 0.85,
      });
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe('agent1');
    });

    it('should return empty array for no matches', () => {
      const agents = registry.findAgents({ capability: 'nonexistent' });
      expect(agents).toHaveLength(0);
    });
  });

  describe('matchAgents', () => {
    beforeEach(() => {
      const agent1 = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
        { id: 'cap2', name: 'testing', category: 'quality', proficiency: 0.8 },
      ]);

      const agent2 = createTestAgent('agent2', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.7 },
      ]);

      const agent3 = createTestAgent('agent3', [
        { id: 'cap3', name: 'design', category: 'design', proficiency: 0.95 },
      ]);

      registry.registerAgent(agent1);
      registry.registerAgent(agent2);
      registry.registerAgent(agent3);
    });

    it('should match agents to task requirements', () => {
      const matches = registry.matchAgents({
        requiredCapabilities: ['coding'],
      });

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].score).toBeGreaterThan(0);
    });

    it('should sort matches by score', () => {
      const matches = registry.matchAgents({
        requiredCapabilities: ['coding'],
      });

      // All matches should have score 1.0 (perfect match)
      expect(matches.every((m) => m.score === 1.0)).toBe(true);

      // Should be sorted by proficiency
      expect(matches[0].averageProficiency).toBeGreaterThanOrEqual(
        matches[1].averageProficiency
      );
    });

    it('should calculate correct match score', () => {
      const matches = registry.matchAgents({
        requiredCapabilities: ['coding', 'testing'],
      });

      const agent1Match = matches.find((m) => m.agent.id === 'agent1');
      const agent2Match = matches.find((m) => m.agent.id === 'agent2');

      // agent1 has both capabilities (score = 1.0)
      expect(agent1Match?.score).toBe(1.0);

      // agent2 has only coding (score = 0.5)
      expect(agent2Match?.score).toBe(0.5);
    });

    it('should respect minimum proficiency requirement', () => {
      const matches = registry.matchAgents({
        requiredCapabilities: ['coding'],
        minProficiency: 0.85,
      });

      // Only agent1 has coding with proficiency >= 0.85
      expect(matches.filter((m) => m.score > 0)).toHaveLength(1);
      expect(matches[0].agent.id).toBe('agent1');
    });

    it('should include matching and missing capabilities', () => {
      const matches = registry.matchAgents({
        requiredCapabilities: ['coding', 'design'],
      });

      const agent1Match = matches.find((m) => m.agent.id === 'agent1');
      expect(agent1Match?.matchingCapabilities).toHaveLength(1);
      expect(agent1Match?.missingCapabilities).toContain('design');
    });

    it('should handle preferred capabilities', () => {
      const matches = registry.matchAgents({
        requiredCapabilities: ['coding'],
        preferredCapabilities: ['testing'],
      });

      // agent1 has both required and preferred (higher score)
      // agent2 has only required (lower score)
      expect(matches[0].agent.id).toBe('agent1');
    });
  });

  describe('findBestAgent', () => {
    it('should find the best matching agent', () => {
      const agent1 = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
      ]);

      const agent2 = createTestAgent('agent2', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.7 },
      ]);

      registry.registerAgent(agent1);
      registry.registerAgent(agent2);

      const best = registry.findBestAgent({
        requiredCapabilities: ['coding'],
      });

      expect(best?.id).toBe('agent1');
    });

    it('should return undefined for no matches', () => {
      const best = registry.findBestAgent({
        requiredCapabilities: ['nonexistent'],
      });

      expect(best).toBeUndefined();
    });
  });

  describe('updateAgentActivity', () => {
    it('should update last active timestamp', async () => {
      const agent = createTestAgent('agent1', []);
      registry.registerAgent(agent);

      const before = registry.getAgent('agent1')!.lastActiveAt;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      registry.updateAgentActivity('agent1');
      const after = registry.getAgent('agent1')!.lastActiveAt;

      expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('updateAgentStats', () => {
    it('should update task count and success rate', () => {
      const agent = createTestAgent('agent1', []);
      registry.registerAgent(agent);

      registry.updateAgentStats('agent1', true);

      const entry = registry.getAgent('agent1')!;
      expect(entry.taskCount).toBe(1);
      expect(entry.successRate).toBeGreaterThan(0.9); // Should be high after one success
    });

    it('should adjust success rate on failure', () => {
      const agent = createTestAgent('agent1', []);
      registry.registerAgent(agent);

      // Add some successes
      registry.updateAgentStats('agent1', true);
      registry.updateAgentStats('agent1', true);
      registry.updateAgentStats('agent1', true);

      const beforeFailure = registry.getAgent('agent1')!.successRate;

      // Add a failure
      registry.updateAgentStats('agent1', false);

      const afterFailure = registry.getAgent('agent1')!.successRate;

      expect(afterFailure).toBeLessThan(beforeFailure);
    });
  });

  describe('getCapabilities', () => {
    it('should return all capability names', () => {
      const agent = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
        { id: 'cap2', name: 'testing', category: 'quality', proficiency: 0.8 },
      ]);

      registry.registerAgent(agent);

      const capabilities = registry.getCapabilities();
      expect(capabilities).toContain('coding');
      expect(capabilities).toContain('testing');
      expect(capabilities).toContain('cap1');
      expect(capabilities).toContain('cap2');
    });
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      const agent = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
      ]);

      registry.registerAgent(agent);

      const categories = registry.getCategories();
      expect(categories).toContain('development');
    });
  });

  describe('getStats', () => {
    it('should return registry statistics', () => {
      const agent1 = createTestAgent('agent1', [
        { id: 'cap1', name: 'coding', category: 'development', proficiency: 0.9 },
      ]);

      const agent2 = createTestAgent('agent2', [
        { id: 'cap2', name: 'testing', category: 'quality', proficiency: 0.8 },
      ]);

      registry.registerAgent(agent1);
      registry.registerAgent(agent2);

      registry.updateAgentStats('agent1', true);
      registry.updateAgentStats('agent2', true);

      const stats = registry.getStats();

      expect(stats.totalAgents).toBe(2);
      expect(stats.totalCapabilities).toBeGreaterThan(0);
      expect(stats.totalCategories).toBe(2);
      expect(stats.totalTasks).toBe(2);
      expect(stats.averageSuccessRate).toBeGreaterThan(0);
    });
  });

  describe('clear', () => {
    it('should clear all agents', () => {
      const agent = createTestAgent('agent1', []);
      registry.registerAgent(agent);

      expect(registry.listAgents()).toHaveLength(1);

      registry.clear();

      expect(registry.listAgents()).toHaveLength(0);
    });
  });
});
