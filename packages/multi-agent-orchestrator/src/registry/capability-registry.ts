/**
 * Capability Registry
 *
 * Manages agent capabilities and matches tasks with suitable agents.
 * Provides skill discovery and agent selection based on task requirements.
 *
 * Maps to AC-3.8: Capability Discovery
 * EARS: The system SHALL match task requirements with agent expertise
 */

import type { Agent, AgentCapability, AgentRegistryEntry } from '../types/agent.js';

/**
 * Capability match result
 */
export interface CapabilityMatch {
  /** Matched agent */
  agent: Agent;
  /** Match score (0.0 to 1.0) */
  score: number;
  /** Matching capabilities */
  matchingCapabilities: AgentCapability[];
  /** Missing capabilities */
  missingCapabilities: string[];
  /** Agent's average proficiency for matching capabilities */
  averageProficiency: number;
}

/**
 * Task requirements for capability matching
 */
export interface TaskRequirements {
  /** Required capability IDs or names */
  requiredCapabilities: string[];
  /** Optional preferred capabilities */
  preferredCapabilities?: string[];
  /** Minimum proficiency level (0.0 to 1.0) */
  minProficiency?: number;
  /** Required capability category */
  category?: string;
}

/**
 * Agent search criteria
 */
export interface AgentSearchCriteria {
  /** Capability ID or name to search for */
  capability?: string;
  /** Capability category */
  category?: string;
  /** Minimum proficiency level */
  minProficiency?: number;
  /** Agent role */
  role?: string;
  /** Minimum success rate */
  minSuccessRate?: number;
}

/**
 * CapabilityRegistry class
 *
 * Manages agent registration and capability-based matching.
 *
 * EARS: The system SHALL provide agent discovery based on capabilities and task matching
 */
export class CapabilityRegistry {
  private agents: Map<string, AgentRegistryEntry> = new Map();
  private capabilityIndex: Map<string, Set<string>> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private roleIndex: Map<string, Set<string>> = new Map();

  /**
   * Registers an agent with its capabilities
   *
   * EARS: WHEN an agent is registered, the system SHALL index its capabilities for discovery
   *
   * @param agent - Agent to register
   */
  registerAgent(agent: Agent): void {
    // Check for duplicate
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} is already registered`);
    }

    // Create registry entry
    const entry: AgentRegistryEntry = {
      agent,
      registeredAt: new Date(),
      lastActiveAt: new Date(),
      taskCount: 0,
      successRate: 1.0,
    };

    // Register agent
    this.agents.set(agent.id, entry);

    // Index capabilities
    agent.capabilities.forEach((capability) => {
      // Index by capability ID
      if (!this.capabilityIndex.has(capability.id)) {
        this.capabilityIndex.set(capability.id, new Set());
      }
      this.capabilityIndex.get(capability.id)!.add(agent.id);

      // Index by capability name
      if (!this.capabilityIndex.has(capability.name)) {
        this.capabilityIndex.set(capability.name, new Set());
      }
      this.capabilityIndex.get(capability.name)!.add(agent.id);

      // Index by category
      if (!this.categoryIndex.has(capability.category)) {
        this.categoryIndex.set(capability.category, new Set());
      }
      this.categoryIndex.get(capability.category)!.add(agent.id);
    });

    // Index by role
    if (!this.roleIndex.has(agent.role)) {
      this.roleIndex.set(agent.role, new Set());
    }
    this.roleIndex.get(agent.role)!.add(agent.id);
  }

  /**
   * Unregisters an agent
   *
   * @param agentId - Agent ID to unregister
   * @returns True if agent was unregistered
   */
  unregisterAgent(agentId: string): boolean {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return false;
    }

    const agent = entry.agent;

    // Remove from capability index
    agent.capabilities.forEach((capability) => {
      this.capabilityIndex.get(capability.id)?.delete(agentId);
      this.capabilityIndex.get(capability.name)?.delete(agentId);
      this.categoryIndex.get(capability.category)?.delete(agentId);
    });

    // Remove from role index
    this.roleIndex.get(agent.role)?.delete(agentId);

    // Remove agent
    this.agents.delete(agentId);
    return true;
  }

  /**
   * Gets a registered agent
   *
   * @param agentId - Agent ID
   * @returns Agent registry entry or undefined
   */
  getAgent(agentId: string): AgentRegistryEntry | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Lists all registered agents
   *
   * @returns Array of agents
   */
  listAgents(): Agent[] {
    return Array.from(this.agents.values()).map((entry) => entry.agent);
  }

  /**
   * Finds agents matching search criteria
   *
   * EARS: The system SHALL support searching agents by capability, category, and role
   *
   * @param criteria - Search criteria
   * @returns Array of matching agents
   */
  findAgents(criteria: AgentSearchCriteria): Agent[] {
    let agentIds: Set<string> | undefined;

    // Filter by capability
    if (criteria.capability) {
      agentIds = this.capabilityIndex.get(criteria.capability);
      if (!agentIds || agentIds.size === 0) {
        return [];
      }
    }

    // Filter by category
    if (criteria.category) {
      const categoryAgents = this.categoryIndex.get(criteria.category);
      if (!categoryAgents || categoryAgents.size === 0) {
        return [];
      }
      agentIds = agentIds
        ? new Set([...agentIds].filter((id) => categoryAgents.has(id)))
        : categoryAgents;
    }

    // Filter by role
    if (criteria.role) {
      const roleAgents = this.roleIndex.get(criteria.role);
      if (!roleAgents || roleAgents.size === 0) {
        return [];
      }
      agentIds = agentIds
        ? new Set([...agentIds].filter((id) => roleAgents.has(id)))
        : roleAgents;
    }

    // If no filters applied, use all agents
    if (!agentIds) {
      agentIds = new Set(this.agents.keys());
    }

    // Get agents and apply remaining filters
    const agents = Array.from(agentIds)
      .map((id) => this.agents.get(id)!)
      .filter((entry) => {
        // Proficiency filter
        if (criteria.minProficiency !== undefined) {
          const hasMinProficiency = entry.agent.capabilities.some(
            (cap) => cap.proficiency >= criteria.minProficiency!
          );
          if (!hasMinProficiency) {
            return false;
          }
        }

        // Success rate filter
        if (
          criteria.minSuccessRate !== undefined &&
          entry.successRate < criteria.minSuccessRate
        ) {
          return false;
        }

        return true;
      })
      .map((entry) => entry.agent);

    return agents;
  }

  /**
   * Matches agents to task requirements
   *
   * EARS: The system SHALL return best-fit agents for task requirements
   *
   * @param requirements - Task requirements
   * @returns Array of capability matches, sorted by score (best first)
   */
  matchAgents(requirements: TaskRequirements): CapabilityMatch[] {
    const matches: CapabilityMatch[] = [];

    for (const entry of this.agents.values()) {
      const match = this.calculateMatch(entry.agent, requirements);
      if (match.score > 0) {
        matches.push(match);
      }
    }

    // Sort by score (descending), then by average proficiency
    matches.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.averageProficiency - a.averageProficiency;
    });

    return matches;
  }

  /**
   * Finds the best agent for task requirements
   *
   * EARS: The system SHALL return the best-fit agent for a task
   *
   * @param requirements - Task requirements
   * @returns Best matching agent or undefined if no match
   */
  findBestAgent(requirements: TaskRequirements): Agent | undefined {
    const matches = this.matchAgents(requirements);
    return matches.length > 0 ? matches[0]!.agent : undefined;
  }

  /**
   * Updates agent activity timestamp
   *
   * @param agentId - Agent ID
   */
  updateAgentActivity(agentId: string): void {
    const entry = this.agents.get(agentId);
    if (entry) {
      entry.lastActiveAt = new Date();
    }
  }

  /**
   * Updates agent task statistics
   *
   * @param agentId - Agent ID
   * @param success - Whether task was successful
   */
  updateAgentStats(agentId: string, success: boolean): void {
    const entry = this.agents.get(agentId);
    if (entry) {
      entry.taskCount++;
      entry.lastActiveAt = new Date();

      // Update success rate using exponential moving average
      const alpha = 0.1; // Weight for new data
      const newValue = success ? 1.0 : 0.0;
      entry.successRate = alpha * newValue + (1 - alpha) * entry.successRate;
    }
  }

  /**
   * Gets all capability names
   *
   * @returns Array of capability names
   */
  getCapabilities(): string[] {
    return Array.from(this.capabilityIndex.keys());
  }

  /**
   * Gets all capability categories
   *
   * @returns Array of category names
   */
  getCategories(): string[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Gets all agent roles
   *
   * @returns Array of role names
   */
  getRoles(): string[] {
    return Array.from(this.roleIndex.keys());
  }

  /**
   * Gets registry statistics
   *
   * @returns Registry statistics
   */
  getStats(): {
    totalAgents: number;
    totalCapabilities: number;
    totalCategories: number;
    totalRoles: number;
    averageSuccessRate: number;
    totalTasks: number;
    mostActiveAgents: Agent[];
  } {
    const entries = Array.from(this.agents.values());

    const totalTasks = entries.reduce(
      (sum, entry) => sum + entry.taskCount,
      0
    );

    const averageSuccessRate =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.successRate, 0) /
          entries.length
        : 0;

    const mostActiveAgents = entries
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 10)
      .map((entry) => entry.agent);

    return {
      totalAgents: this.agents.size,
      totalCapabilities: this.capabilityIndex.size,
      totalCategories: this.categoryIndex.size,
      totalRoles: this.roleIndex.size,
      averageSuccessRate,
      totalTasks,
      mostActiveAgents,
    };
  }

  /**
   * Calculates capability match for an agent
   *
   * @param agent - Agent to evaluate
   * @param requirements - Task requirements
   * @returns Capability match result
   */
  private calculateMatch(
    agent: Agent,
    requirements: TaskRequirements
  ): CapabilityMatch {
    const matchingCapabilities: AgentCapability[] = [];
    const missingCapabilities: string[] = [];

    // Check required capabilities
    requirements.requiredCapabilities.forEach((required) => {
      const capability = agent.capabilities.find(
        (cap) => cap.id === required || cap.name === required
      );

      if (capability) {
        // Check proficiency if required
        if (
          requirements.minProficiency === undefined ||
          capability.proficiency >= requirements.minProficiency
        ) {
          matchingCapabilities.push(capability);
        } else {
          missingCapabilities.push(required);
        }
      } else {
        missingCapabilities.push(required);
      }
    });

    // Calculate score
    const requiredCount = requirements.requiredCapabilities.length;
    const matchedCount = matchingCapabilities.length;
    let score = requiredCount > 0 ? matchedCount / requiredCount : 0;

    // Bonus for preferred capabilities
    if (requirements.preferredCapabilities) {
      const preferredMatches = requirements.preferredCapabilities.filter(
        (preferred) =>
          agent.capabilities.some(
            (cap) => cap.id === preferred || cap.name === preferred
          )
      );
      const preferredBonus =
        preferredMatches.length / requirements.preferredCapabilities.length;
      score = score * 0.8 + preferredBonus * 0.2;
    }

    // Calculate average proficiency
    const averageProficiency =
      matchingCapabilities.length > 0
        ? matchingCapabilities.reduce((sum, cap) => sum + cap.proficiency, 0) /
          matchingCapabilities.length
        : 0;

    // Apply category filter
    if (requirements.category) {
      const hasCategory = agent.capabilities.some(
        (cap) => cap.category === requirements.category
      );
      if (!hasCategory) {
        score = 0;
      }
    }

    return {
      agent,
      score,
      matchingCapabilities,
      missingCapabilities,
      averageProficiency,
    };
  }

  /**
   * Clears all registered agents
   */
  clear(): void {
    this.agents.clear();
    this.capabilityIndex.clear();
    this.categoryIndex.clear();
    this.roleIndex.clear();
  }
}
