/**
 * ToolRegistry Tests
 *
 * Tests for AC-3.7: Tool Registration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ToolRegistry,
  ToolValidationError,
  ToolExecutionError,
  type ToolMetadata,
} from '../registry/tool-registry.js';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('registerTool', () => {
    it('should register a valid tool', () => {
      const metadata = {
        id: 'tool1',
        name: 'calculateSum',
        description: 'Calculates sum of two numbers',
        category: 'math',
        version: '1.0.0',
        signature: {
          parameters: [
            {
              name: 'a',
              type: 'number' as const,
              description: 'First number',
              required: true,
            },
            {
              name: 'b',
              type: 'number' as const,
              description: 'Second number',
              required: true,
            },
          ],
          returnType: 'number',
          returnDescription: 'Sum of a and b',
        },
        tags: ['math', 'calculation'],
      };

      const fn = (a: number, b: number) => a + b;

      registry.registerTool(metadata, fn);

      const tool = registry.getTool('tool1');
      expect(tool).toBeDefined();
      expect(tool?.metadata.name).toBe('calculateSum');
    });

    it('should reject invalid function name', () => {
      const metadata = {
        id: 'tool1',
        name: 'invalid-name', // Invalid: contains hyphen
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [],
          returnType: 'void',
        },
        tags: [],
      };

      expect(() => {
        registry.registerTool(metadata, () => {});
      }).toThrow(ToolValidationError);
    });

    it('should reject duplicate tool ID', () => {
      const metadata = {
        id: 'tool1',
        name: 'testTool',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [],
          returnType: 'void',
        },
        tags: [],
      };

      registry.registerTool(metadata, () => {});

      expect(() => {
        registry.registerTool(metadata, () => {});
      }).toThrow(ToolValidationError);
    });

    it('should reject non-function', () => {
      const metadata = {
        id: 'tool1',
        name: 'testTool',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [],
          returnType: 'void',
        },
        tags: [],
      };

      expect(() => {
        registry.registerTool(metadata, 'not a function' as any);
      }).toThrow(ToolValidationError);
    });

    it('should validate parameter types', () => {
      const metadata = {
        id: 'tool1',
        name: 'testTool',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [
            {
              name: 'param1',
              type: 'invalid-type' as any,
              description: 'Test param',
              required: true,
            },
          ],
          returnType: 'void',
        },
        tags: [],
      };

      expect(() => {
        registry.registerTool(metadata, () => {});
      }).toThrow(ToolValidationError);
    });
  });

  describe('unregisterTool', () => {
    it('should unregister a tool', () => {
      const metadata = {
        id: 'tool1',
        name: 'testTool',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [],
          returnType: 'void',
        },
        tags: ['test'],
      };

      registry.registerTool(metadata, () => {});
      expect(registry.getTool('tool1')).toBeDefined();

      const result = registry.unregisterTool('tool1');
      expect(result).toBe(true);
      expect(registry.getTool('tool1')).toBeUndefined();
    });

    it('should return false for non-existent tool', () => {
      const result = registry.unregisterTool('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getToolByName', () => {
    it('should find tool by name', () => {
      const metadata = {
        id: 'tool1',
        name: 'testTool',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [],
          returnType: 'void',
        },
        tags: [],
      };

      registry.registerTool(metadata, () => {});

      const tool = registry.getToolByName('testTool');
      expect(tool).toBeDefined();
      expect(tool?.metadata.id).toBe('tool1');
    });

    it('should return undefined for non-existent name', () => {
      const tool = registry.getToolByName('nonexistent');
      expect(tool).toBeUndefined();
    });
  });

  describe('listTools', () => {
    it('should list all registered tools', () => {
      const metadata1 = {
        id: 'tool1',
        name: 'tool1',
        description: 'Tool 1',
        category: 'test',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: [],
      };

      const metadata2 = {
        id: 'tool2',
        name: 'tool2',
        description: 'Tool 2',
        category: 'test',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: [],
      };

      registry.registerTool(metadata1, () => {});
      registry.registerTool(metadata2, () => {});

      const tools = registry.listTools();
      expect(tools).toHaveLength(2);
    });
  });

  describe('findByCategory', () => {
    it('should find tools by category', () => {
      const mathTool = {
        id: 'tool1',
        name: 'add',
        description: 'Add numbers',
        category: 'math',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'number' },
        tags: [],
      };

      const stringTool = {
        id: 'tool2',
        name: 'concat',
        description: 'Concatenate strings',
        category: 'string',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'string' },
        tags: [],
      };

      registry.registerTool(mathTool, () => {});
      registry.registerTool(stringTool, () => {});

      const mathTools = registry.findByCategory('math');
      expect(mathTools).toHaveLength(1);
      expect(mathTools[0].name).toBe('add');
    });
  });

  describe('findByTag', () => {
    it('should find tools by tag', () => {
      const tool1 = {
        id: 'tool1',
        name: 'tool1',
        description: 'Tool 1',
        category: 'test',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: ['important', 'math'],
      };

      const tool2 = {
        id: 'tool2',
        name: 'tool2',
        description: 'Tool 2',
        category: 'test',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: ['important'],
      };

      registry.registerTool(tool1, () => {});
      registry.registerTool(tool2, () => {});

      const importantTools = registry.findByTag('important');
      expect(importantTools).toHaveLength(2);

      const mathTools = registry.findByTag('math');
      expect(mathTools).toHaveLength(1);
    });
  });

  describe('searchTools', () => {
    it('should search tools by name or description', () => {
      const tool1 = {
        id: 'tool1',
        name: 'calculateSum',
        description: 'Calculates sum of numbers',
        category: 'math',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'number' },
        tags: [],
      };

      const tool2 = {
        id: 'tool2',
        name: 'formatText',
        description: 'Formats text string',
        category: 'string',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'string' },
        tags: [],
      };

      registry.registerTool(tool1, () => {});
      registry.registerTool(tool2, () => {});

      const results = registry.searchTools('sum');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('calculateSum');
    });
  });

  describe('executeTool', () => {
    it('should execute a tool successfully', async () => {
      const metadata = {
        id: 'tool1',
        name: 'add',
        description: 'Add numbers',
        category: 'math',
        version: '1.0.0',
        signature: {
          parameters: [
            {
              name: 'a',
              type: 'number' as const,
              description: 'First number',
              required: true,
            },
            {
              name: 'b',
              type: 'number' as const,
              description: 'Second number',
              required: true,
            },
          ],
          returnType: 'number',
        },
        tags: [],
      };

      const fn = (a: number, b: number) => a + b;
      registry.registerTool(metadata, fn);

      const result = await registry.executeTool('tool1', { a: 2, b: 3 });
      expect(result).toBe(5);
    });

    it('should throw error for missing tool', async () => {
      await expect(
        registry.executeTool('nonexistent', {})
      ).rejects.toThrow(ToolExecutionError);
    });

    it('should throw error for missing required parameter', async () => {
      const metadata = {
        id: 'tool1',
        name: 'add',
        description: 'Add numbers',
        category: 'math',
        version: '1.0.0',
        signature: {
          parameters: [
            {
              name: 'a',
              type: 'number' as const,
              description: 'First number',
              required: true,
            },
          ],
          returnType: 'number',
        },
        tags: [],
      };

      registry.registerTool(metadata, (a: number) => a);

      await expect(
        registry.executeTool('tool1', {})
      ).rejects.toThrow(ToolValidationError);
    });

    it('should throw error for incorrect parameter type', async () => {
      const metadata = {
        id: 'tool1',
        name: 'add',
        description: 'Add numbers',
        category: 'math',
        version: '1.0.0',
        signature: {
          parameters: [
            {
              name: 'a',
              type: 'number' as const,
              description: 'First number',
              required: true,
            },
          ],
          returnType: 'number',
        },
        tags: [],
      };

      registry.registerTool(metadata, (a: number) => a);

      await expect(
        registry.executeTool('tool1', { a: 'not a number' })
      ).rejects.toThrow(ToolValidationError);
    });

    it('should update usage statistics', async () => {
      const metadata = {
        id: 'tool1',
        name: 'test',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: {
          parameters: [],
          returnType: 'void',
        },
        tags: [],
      };

      registry.registerTool(metadata, () => 'result');

      await registry.executeTool('tool1', {});

      const tool = registry.getTool('tool1');
      expect(tool?.metadata.usageCount).toBe(1);
      expect(tool?.metadata.lastUsedAt).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return registry statistics', () => {
      const tool1 = {
        id: 'tool1',
        name: 'tool1',
        description: 'Tool 1',
        category: 'cat1',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: ['tag1', 'tag2'],
      };

      const tool2 = {
        id: 'tool2',
        name: 'tool2',
        description: 'Tool 2',
        category: 'cat2',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: ['tag1'],
      };

      registry.registerTool(tool1, () => {});
      registry.registerTool(tool2, () => {});

      const stats = registry.getStats();

      expect(stats.totalTools).toBe(2);
      expect(stats.totalCategories).toBe(2);
      expect(stats.totalTags).toBe(2);
      expect(stats.totalUsage).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all tools', () => {
      const metadata = {
        id: 'tool1',
        name: 'test',
        description: 'Test tool',
        category: 'test',
        version: '1.0.0',
        signature: { parameters: [], returnType: 'void' },
        tags: [],
      };

      registry.registerTool(metadata, () => {});
      expect(registry.listTools()).toHaveLength(1);

      registry.clear();
      expect(registry.listTools()).toHaveLength(0);
    });
  });
});
