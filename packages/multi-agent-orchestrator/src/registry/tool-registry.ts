/**
 * Tool Registry
 *
 * Manages registration and discovery of tools/functions for agent use.
 * Validates function signatures and makes tools discoverable to agents.
 *
 * Maps to AC-3.7: Tool Registration
 * EARS: The system SHALL support registration of tools with metadata and signature validation
 */

/**
 * Tool parameter definition
 */
export interface ToolParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  /** Parameter description */
  description: string;
  /** Whether parameter is required */
  required: boolean;
  /** Default value if not required */
  default?: unknown;
  /** Schema for object/array types (JSON Schema compatible) */
  schema?: Record<string, unknown>;
}

/**
 * Tool function signature
 */
export interface ToolSignature {
  /** Function parameters */
  parameters: ToolParameter[];
  /** Return type */
  returnType: string;
  /** Return description */
  returnDescription?: string;
}

/**
 * Tool metadata
 */
export interface ToolMetadata {
  /** Unique tool identifier */
  id: string;
  /** Tool name (must be valid function name) */
  name: string;
  /** Tool description */
  description: string;
  /** Tool category (e.g., 'data', 'communication', 'analysis') */
  category: string;
  /** Tool version */
  version: string;
  /** Function signature */
  signature: ToolSignature;
  /** Tags for discovery */
  tags: string[];
  /** Optional usage examples */
  examples?: string[];
  /** Registration timestamp */
  registeredAt: Date;
  /** Last used timestamp */
  lastUsedAt?: Date;
  /** Usage count */
  usageCount: number;
}

/**
 * Tool function wrapper
 */
export type ToolFunction = (...args: unknown[]) => unknown | Promise<unknown>;

/**
 * Registered tool entry
 */
export interface RegisteredTool {
  /** Tool metadata */
  metadata: ToolMetadata;
  /** Tool function */
  fn: ToolFunction;
}

/**
 * Tool validation error
 */
export class ToolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolValidationError';
  }
}

/**
 * Tool execution error
 */
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

/**
 * ToolRegistry class
 *
 * Manages tool registration, validation, and discovery.
 *
 * EARS: The system SHALL validate tool signatures and make tools discoverable to agents
 */
export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  /**
   * Registers a tool with metadata
   *
   * EARS: WHEN a tool is registered, the system SHALL validate its signature
   *
   * @param metadata - Tool metadata
   * @param fn - Tool function
   * @throws ToolValidationError if validation fails
   */
  registerTool(metadata: Omit<ToolMetadata, 'registeredAt' | 'lastUsedAt' | 'usageCount'>, fn: ToolFunction): void {
    // Validate tool name
    if (!this.isValidFunctionName(metadata.name)) {
      throw new ToolValidationError(
        `Invalid tool name: ${metadata.name}. Must be a valid JavaScript identifier.`
      );
    }

    // Check for duplicate
    if (this.tools.has(metadata.id)) {
      throw new ToolValidationError(
        `Tool with ID ${metadata.id} is already registered`
      );
    }

    // Validate function
    if (typeof fn !== 'function') {
      throw new ToolValidationError('Tool must be a function');
    }

    // Validate signature
    this.validateSignature(metadata.signature);

    // Create full metadata
    const fullMetadata: ToolMetadata = {
      ...metadata,
      registeredAt: new Date(),
      usageCount: 0,
    };

    // Register tool
    this.tools.set(metadata.id, {
      metadata: fullMetadata,
      fn,
    });

    // Update category index
    if (!this.categoryIndex.has(metadata.category)) {
      this.categoryIndex.set(metadata.category, new Set());
    }
    this.categoryIndex.get(metadata.category)!.add(metadata.id);

    // Update tag index
    metadata.tags.forEach((tag) => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(metadata.id);
    });
  }

  /**
   * Unregisters a tool
   *
   * @param toolId - Tool ID to unregister
   * @returns True if tool was unregistered, false if not found
   */
  unregisterTool(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return false;
    }

    // Remove from category index
    const categoryTools = this.categoryIndex.get(tool.metadata.category);
    if (categoryTools) {
      categoryTools.delete(toolId);
      if (categoryTools.size === 0) {
        this.categoryIndex.delete(tool.metadata.category);
      }
    }

    // Remove from tag index
    tool.metadata.tags.forEach((tag) => {
      const tagTools = this.tagIndex.get(tag);
      if (tagTools) {
        tagTools.delete(toolId);
        if (tagTools.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });

    // Remove tool
    this.tools.delete(toolId);
    return true;
  }

  /**
   * Gets a registered tool
   *
   * @param toolId - Tool ID
   * @returns Registered tool or undefined
   */
  getTool(toolId: string): RegisteredTool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Gets a tool by name
   *
   * @param name - Tool name
   * @returns Registered tool or undefined
   */
  getToolByName(name: string): RegisteredTool | undefined {
    for (const tool of this.tools.values()) {
      if (tool.metadata.name === name) {
        return tool;
      }
    }
    return undefined;
  }

  /**
   * Lists all registered tools
   *
   * EARS: The system SHALL provide discovery of all registered tools
   *
   * @returns Array of tool metadata
   */
  listTools(): ToolMetadata[] {
    return Array.from(this.tools.values()).map((tool) => tool.metadata);
  }

  /**
   * Finds tools by category
   *
   * @param category - Tool category
   * @returns Array of tool metadata
   */
  findByCategory(category: string): ToolMetadata[] {
    const toolIds = this.categoryIndex.get(category);
    if (!toolIds) {
      return [];
    }

    return Array.from(toolIds)
      .map((id) => this.tools.get(id)?.metadata)
      .filter((metadata): metadata is ToolMetadata => metadata !== undefined);
  }

  /**
   * Finds tools by tag
   *
   * @param tag - Tool tag
   * @returns Array of tool metadata
   */
  findByTag(tag: string): ToolMetadata[] {
    const toolIds = this.tagIndex.get(tag);
    if (!toolIds) {
      return [];
    }

    return Array.from(toolIds)
      .map((id) => this.tools.get(id)?.metadata)
      .filter((metadata): metadata is ToolMetadata => metadata !== undefined);
  }

  /**
   * Searches tools by name or description
   *
   * @param query - Search query
   * @returns Array of tool metadata
   */
  searchTools(query: string): ToolMetadata[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tools.values())
      .filter(
        (tool) =>
          tool.metadata.name.toLowerCase().includes(lowerQuery) ||
          tool.metadata.description.toLowerCase().includes(lowerQuery)
      )
      .map((tool) => tool.metadata);
  }

  /**
   * Executes a tool with arguments
   *
   * EARS: WHEN a tool is executed, the system SHALL validate arguments and track usage
   *
   * @param toolId - Tool ID
   * @param args - Tool arguments
   * @returns Tool execution result
   * @throws ToolExecutionError if execution fails
   */
  async executeTool(toolId: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new ToolExecutionError(`Tool not found: ${toolId}`, toolId);
    }

    // Validate arguments
    this.validateArguments(tool.metadata.signature, args);

    try {
      // Convert args object to array based on parameter order
      const orderedArgs = tool.metadata.signature.parameters.map(
        (param) => args[param.name] ?? param.default
      );

      // Execute tool
      const result = await tool.fn(...orderedArgs);

      // Update usage stats
      tool.metadata.usageCount++;
      tool.metadata.lastUsedAt = new Date();

      return result;
    } catch (error) {
      throw new ToolExecutionError(
        `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool.metadata.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Gets all tool categories
   *
   * @returns Array of category names
   */
  getCategories(): string[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Gets all tool tags
   *
   * @returns Array of tag names
   */
  getTags(): string[] {
    return Array.from(this.tagIndex.keys());
  }

  /**
   * Gets registry statistics
   *
   * @returns Registry statistics
   */
  getStats(): {
    totalTools: number;
    totalCategories: number;
    totalTags: number;
    totalUsage: number;
    mostUsedTools: ToolMetadata[];
  } {
    const totalUsage = Array.from(this.tools.values()).reduce(
      (sum, tool) => sum + tool.metadata.usageCount,
      0
    );

    const mostUsedTools = Array.from(this.tools.values())
      .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
      .slice(0, 10)
      .map((tool) => tool.metadata);

    return {
      totalTools: this.tools.size,
      totalCategories: this.categoryIndex.size,
      totalTags: this.tagIndex.size,
      totalUsage,
      mostUsedTools,
    };
  }

  /**
   * Validates a function signature
   *
   * @param signature - Function signature to validate
   * @throws ToolValidationError if invalid
   */
  private validateSignature(signature: ToolSignature): void {
    if (!signature.parameters || !Array.isArray(signature.parameters)) {
      throw new ToolValidationError('Signature must include parameters array');
    }

    signature.parameters.forEach((param, index) => {
      if (!param.name || typeof param.name !== 'string') {
        throw new ToolValidationError(
          `Parameter at index ${index} missing valid name`
        );
      }

      if (!param.type) {
        throw new ToolValidationError(
          `Parameter ${param.name} missing type`
        );
      }

      const validTypes = ['string', 'number', 'boolean', 'object', 'array', 'any'];
      if (!validTypes.includes(param.type)) {
        throw new ToolValidationError(
          `Parameter ${param.name} has invalid type: ${param.type}`
        );
      }
    });
  }

  /**
   * Validates tool arguments against signature
   *
   * @param signature - Tool signature
   * @param args - Arguments to validate
   * @throws ToolValidationError if validation fails
   */
  private validateArguments(
    signature: ToolSignature,
    args: Record<string, unknown>
  ): void {
    // Check required parameters
    signature.parameters.forEach((param) => {
      if (param.required && !(param.name in args)) {
        throw new ToolValidationError(
          `Missing required parameter: ${param.name}`
        );
      }

      // Type validation (basic)
      if (param.name in args) {
        const value = args[param.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (param.type !== 'any' && actualType !== param.type) {
          throw new ToolValidationError(
            `Parameter ${param.name} expected type ${param.type} but got ${actualType}`
          );
        }
      }
    });

    // Check for unexpected parameters
    const validParams = new Set(signature.parameters.map((p) => p.name));
    Object.keys(args).forEach((argName) => {
      if (!validParams.has(argName)) {
        throw new ToolValidationError(
          `Unexpected parameter: ${argName}`
        );
      }
    });
  }

  /**
   * Validates if a string is a valid JavaScript function name
   *
   * @param name - Name to validate
   * @returns True if valid
   */
  private isValidFunctionName(name: string): boolean {
    // Must start with letter, $, or _
    // Can contain letters, digits, $, or _
    const validNameRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    return validNameRegex.test(name);
  }

  /**
   * Clears all registered tools
   */
  clear(): void {
    this.tools.clear();
    this.categoryIndex.clear();
    this.tagIndex.clear();
  }
}
