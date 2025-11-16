/**
 * Conversation History
 *
 * Manages complete message history for agent conversations.
 * Provides query, storage, and export capabilities for debugging and traceability.
 *
 * Maps to AC-3.9: Conversation History
 * EARS: The system SHALL store complete conversation history for all agent interactions
 */

import type {
  Message,
  MessageFilter,
  MessageQueryResult,
  MessageType,
  MessageStatus,
} from '../types/message.js';

/**
 * Conversation statistics
 */
export interface ConversationStats {
  /** Total number of messages */
  totalMessages: number;
  /** Messages by type */
  messagesByType: Record<MessageType, number>;
  /** Messages by status */
  messagesByStatus: Record<MessageStatus, number>;
  /** Unique agents involved */
  uniqueAgents: Set<string>;
  /** Unique conversations */
  uniqueConversations: Set<string>;
  /** First message timestamp */
  firstMessageAt?: Date;
  /** Last message timestamp */
  lastMessageAt?: Date;
}

/**
 * Export format for conversation history
 */
export interface ConversationExport {
  /** Export metadata */
  metadata: {
    exportedAt: Date;
    version: string;
    messageCount: number;
  };
  /** Statistics */
  stats: ConversationStats;
  /** Messages */
  messages: Message[];
}

/**
 * ConversationHistory class
 *
 * Stores and manages complete message history for debugging and traceability.
 * Supports filtering, querying, and exporting conversation data.
 *
 * EARS: The system SHALL provide query capabilities for messages by agent, timestamp, and pattern
 */
export class ConversationHistory {
  private messages: Map<string, Message> = new Map();
  private conversationIndex: Map<string, Set<string>> = new Map();
  private agentIndex: Map<string, Set<string>> = new Map();
  private typeIndex: Map<MessageType, Set<string>> = new Map();

  /**
   * Adds a message to the conversation history
   *
   * EARS: WHEN a message is created, the system SHALL store it in conversation history
   *
   * @param message - Message to add
   */
  addMessage(message: Message): void {
    // Store message
    this.messages.set(message.id, message);

    // Update conversation index
    if (message.conversationId) {
      if (!this.conversationIndex.has(message.conversationId)) {
        this.conversationIndex.set(message.conversationId, new Set());
      }
      this.conversationIndex.get(message.conversationId)!.add(message.id);
    }

    // Update agent index (both sender and receiver)
    [message.sender, message.receiver].forEach((agentId) => {
      if (!this.agentIndex.has(agentId)) {
        this.agentIndex.set(agentId, new Set());
      }
      this.agentIndex.get(agentId)!.add(message.id);
    });

    // Update type index
    if (!this.typeIndex.has(message.type)) {
      this.typeIndex.set(message.type, new Set());
    }
    this.typeIndex.get(message.type)!.add(message.id);
  }

  /**
   * Retrieves a message by ID
   *
   * @param messageId - Message ID
   * @returns Message or undefined if not found
   */
  getMessage(messageId: string): Message | undefined {
    return this.messages.get(messageId);
  }

  /**
   * Queries messages with filtering
   *
   * EARS: The system SHALL support filtering messages by agent, type, status, and timestamp
   *
   * @param filter - Filter criteria
   * @returns Query result with matching messages
   */
  queryMessages(filter: MessageFilter = {}): MessageQueryResult {
    let messageIds: Set<string> | undefined;

    // Start with conversation filter if provided (most selective)
    if (filter.conversationId) {
      messageIds = this.conversationIndex.get(filter.conversationId);
      if (!messageIds) {
        return { messages: [], totalCount: 0, hasMore: false };
      }
    }

    // Apply agent filter
    if (filter.agentId) {
      const agentMessages = this.agentIndex.get(filter.agentId);
      if (!agentMessages) {
        return { messages: [], totalCount: 0, hasMore: false };
      }
      messageIds = messageIds
        ? new Set([...messageIds].filter((id) => agentMessages.has(id)))
        : agentMessages;
    }

    // Apply type filter
    if (filter.type !== undefined) {
      const typeMessages = this.typeIndex.get(filter.type);
      if (!typeMessages) {
        return { messages: [], totalCount: 0, hasMore: false };
      }
      messageIds = messageIds
        ? new Set([...messageIds].filter((id) => typeMessages.has(id)))
        : typeMessages;
    }

    // If no index filters applied, use all messages
    if (!messageIds) {
      messageIds = new Set(this.messages.keys());
    }

    // Get messages and apply remaining filters
    let messages = Array.from(messageIds)
      .map((id) => this.messages.get(id)!)
      .filter((msg) => {
        // Status filter
        if (filter.status !== undefined && msg.status !== filter.status) {
          return false;
        }

        // Timestamp filters
        if (filter.startTime && msg.timestamp < filter.startTime) {
          return false;
        }
        if (filter.endTime && msg.timestamp > filter.endTime) {
          return false;
        }

        return true;
      });

    // Sort by timestamp (newest first)
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const totalCount = messages.length;
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? totalCount;

    // Apply pagination
    messages = messages.slice(offset, offset + limit);

    return {
      messages,
      totalCount,
      hasMore: offset + messages.length < totalCount,
    };
  }

  /**
   * Gets all messages for a specific conversation
   *
   * @param conversationId - Conversation ID
   * @returns Array of messages in chronological order
   */
  getConversationMessages(conversationId: string): Message[] {
    const result = this.queryMessages({ conversationId });
    // Reverse to get chronological order (oldest first)
    return result.messages.reverse();
  }

  /**
   * Gets all messages involving a specific agent
   *
   * @param agentId - Agent ID
   * @returns Array of messages
   */
  getAgentMessages(agentId: string): Message[] {
    const result = this.queryMessages({ agentId });
    return result.messages;
  }

  /**
   * Gets conversation statistics
   *
   * EARS: The system SHALL provide statistics about conversation history
   *
   * @returns Conversation statistics
   */
  getStats(): ConversationStats {
    const messagesByType: Record<MessageType, number> = {} as Record<
      MessageType,
      number
    >;
    const messagesByStatus: Record<MessageStatus, number> = {} as Record<
      MessageStatus,
      number
    >;
    const uniqueAgents = new Set<string>();
    const uniqueConversations = new Set<string>();
    let firstMessageAt: Date | undefined;
    let lastMessageAt: Date | undefined;

    for (const message of this.messages.values()) {
      // Count by type
      messagesByType[message.type] = (messagesByType[message.type] || 0) + 1;

      // Count by status
      messagesByStatus[message.status] =
        (messagesByStatus[message.status] || 0) + 1;

      // Track agents
      uniqueAgents.add(message.sender);
      uniqueAgents.add(message.receiver);

      // Track conversations
      if (message.conversationId) {
        uniqueConversations.add(message.conversationId);
      }

      // Track timestamps
      if (!firstMessageAt || message.timestamp < firstMessageAt) {
        firstMessageAt = message.timestamp;
      }
      if (!lastMessageAt || message.timestamp > lastMessageAt) {
        lastMessageAt = message.timestamp;
      }
    }

    return {
      totalMessages: this.messages.size,
      messagesByType,
      messagesByStatus,
      uniqueAgents,
      uniqueConversations,
      firstMessageAt,
      lastMessageAt,
    };
  }

  /**
   * Exports conversation history to JSON
   *
   * EARS: The system SHALL support exporting conversation history to JSON for debugging
   *
   * @param filter - Optional filter to export subset of messages
   * @returns JSON-serializable export object
   */
  exportToJSON(filter?: MessageFilter): ConversationExport {
    const queryResult = this.queryMessages(filter);
    const stats = this.getStats();

    return {
      metadata: {
        exportedAt: new Date(),
        version: '1.0.0',
        messageCount: queryResult.messages.length,
      },
      stats: {
        ...stats,
        uniqueAgents: stats.uniqueAgents,
        uniqueConversations: stats.uniqueConversations,
      },
      messages: queryResult.messages,
    };
  }

  /**
   * Clears all conversation history
   *
   * EARS: The system SHALL support clearing conversation history
   */
  clear(): void {
    this.messages.clear();
    this.conversationIndex.clear();
    this.agentIndex.clear();
    this.typeIndex.clear();
  }

  /**
   * Gets the total number of messages
   *
   * @returns Total message count
   */
  getMessageCount(): number {
    return this.messages.size;
  }

  /**
   * Gets the total number of unique conversations
   *
   * @returns Conversation count
   */
  getConversationCount(): number {
    return this.conversationIndex.size;
  }

  /**
   * Checks if a conversation exists
   *
   * @param conversationId - Conversation ID
   * @returns True if conversation exists
   */
  hasConversation(conversationId: string): boolean {
    return this.conversationIndex.has(conversationId);
  }
}
