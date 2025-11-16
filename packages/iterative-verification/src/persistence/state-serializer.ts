/**
 * State Serializer
 *
 * Serializes and deserializes checkpoint state for persistence.
 *
 * Architecture:
 * - SOLID Principle: Single Responsibility - Only responsible for state serialization
 * - Article 2: Test-First - All methods covered by unit tests
 */

import type { CheckpointState } from '../types/index.js';

/**
 * StateSerializer - Handles checkpoint state serialization
 *
 * Provides utilities for converting checkpoint state to/from JSON format.
 * Handles special cases like Map serialization.
 */
export class StateSerializer {
  /**
   * Serialize checkpoint state to JSON string
   *
   * - Convert Map objects to JSON-compatible format
   * - Format JSON with indentation for readability
   */
  static serialize(state: CheckpointState): string {
    return JSON.stringify(state, this.replacer, 2);
  }

  /**
   * Deserialize checkpoint state from JSON string
   *
   * - Parse JSON string
   * - Convert JSON-compatible format back to Map objects
   */
  static deserialize(json: string): CheckpointState {
    return JSON.parse(json, this.reviver);
  }

  /**
   * Custom JSON replacer for Map serialization
   */
  private static replacer(_key: string, value: unknown): unknown {
    if (value instanceof Map) {
      return {
        __type: 'Map',
        value: Array.from(value.entries()),
      };
    }
    return value;
  }

  /**
   * Custom JSON reviver for Map deserialization
   */
  private static reviver(_key: string, value: unknown): unknown {
    if (
      value &&
      typeof value === 'object' &&
      '__type' in value &&
      value.__type === 'Map' &&
      'value' in value &&
      Array.isArray(value.value)
    ) {
      return new Map(value.value as Array<[string, unknown]>);
    }
    return value;
  }
}
