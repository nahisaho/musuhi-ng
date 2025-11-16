/**
 * ConversationHistory Tests
 *
 * Tests for AC-3.9: Conversation History
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationHistory } from '../core/conversation-history.js';
import type { Message } from '../types/message.js';
import { MessageType, MessageStatus } from '../types/message.js';

describe('ConversationHistory', () => {
  let history: ConversationHistory;

  beforeEach(() => {
    history = new ConversationHistory();
  });

  describe('addMessage', () => {
    it('should add a message to history', () => {
      const message: Message = {
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
      };

      history.addMessage(message);

      expect(history.getMessage('msg1')).toEqual(message);
      expect(history.getMessageCount()).toBe(1);
    });

    it('should index message by conversation ID', () => {
      const message: Message = {
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
        conversationId: 'conv1',
      };

      history.addMessage(message);

      const messages = history.getConversationMessages('conv1');
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    it('should index message by agent ID', () => {
      const message: Message = {
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
      };

      history.addMessage(message);

      const agent1Messages = history.getAgentMessages('agent1');
      const agent2Messages = history.getAgentMessages('agent2');

      expect(agent1Messages).toHaveLength(1);
      expect(agent2Messages).toHaveLength(1);
    });
  });

  describe('queryMessages', () => {
    beforeEach(() => {
      const now = new Date();

      // Add test messages
      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(now.getTime() - 3000),
        conversationId: 'conv1',
      });

      history.addMessage({
        id: 'msg2',
        type: MessageType.TASK,
        sender: 'agent2',
        receiver: 'agent3',
        content: 'Do something',
        status: MessageStatus.DELIVERED,
        timestamp: new Date(now.getTime() - 2000),
        conversationId: 'conv1',
      });

      history.addMessage({
        id: 'msg3',
        type: MessageType.RESULT,
        sender: 'agent3',
        receiver: 'agent2',
        content: 'Done',
        status: MessageStatus.READ,
        timestamp: new Date(now.getTime() - 1000),
        conversationId: 'conv2',
      });
    });

    it('should query by conversation ID', () => {
      const result = history.queryMessages({ conversationId: 'conv1' });

      expect(result.messages).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should query by agent ID', () => {
      const result = history.queryMessages({ agentId: 'agent2' });

      // agent2 is involved in all 3 messages (receiver of msg1, sender of msg2, receiver of msg3)
      expect(result.messages).toHaveLength(3);
      expect(result.messages.every(
        (msg) => msg.sender === 'agent2' || msg.receiver === 'agent2'
      )).toBe(true);
    });

    it('should query by message type', () => {
      const result = history.queryMessages({ type: MessageType.CHAT });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].type).toBe(MessageType.CHAT);
    });

    it('should query by status', () => {
      const result = history.queryMessages({ status: MessageStatus.SENT });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].status).toBe(MessageStatus.SENT);
    });

    it('should query by timestamp range', () => {
      const now = new Date();
      const result = history.queryMessages({
        startTime: new Date(now.getTime() - 2500),
        endTime: new Date(now.getTime() - 1500),
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].id).toBe('msg2');
    });

    it('should support pagination', () => {
      const result = history.queryMessages({ limit: 1, offset: 1 });

      expect(result.messages).toHaveLength(1);
      expect(result.totalCount).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('should combine multiple filters', () => {
      const result = history.queryMessages({
        conversationId: 'conv1',
        type: MessageType.TASK,
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].id).toBe('msg2');
    });

    it('should return empty result for no matches', () => {
      const result = history.queryMessages({ conversationId: 'nonexistent' });

      expect(result.messages).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getConversationMessages', () => {
    it('should return messages in chronological order', () => {
      const now = new Date();

      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'First',
        status: MessageStatus.SENT,
        timestamp: new Date(now.getTime() - 2000),
        conversationId: 'conv1',
      });

      history.addMessage({
        id: 'msg2',
        type: MessageType.CHAT,
        sender: 'agent2',
        receiver: 'agent1',
        content: 'Second',
        status: MessageStatus.SENT,
        timestamp: new Date(now.getTime() - 1000),
        conversationId: 'conv1',
      });

      const messages = history.getConversationMessages('conv1');

      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('msg1');
      expect(messages[1].id).toBe('msg2');
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics', () => {
      const now = new Date();

      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(now.getTime() - 2000),
        conversationId: 'conv1',
      });

      history.addMessage({
        id: 'msg2',
        type: MessageType.CHAT,
        sender: 'agent2',
        receiver: 'agent1',
        content: 'Hi',
        status: MessageStatus.DELIVERED,
        timestamp: new Date(now.getTime() - 1000),
        conversationId: 'conv1',
      });

      const stats = history.getStats();

      expect(stats.totalMessages).toBe(2);
      expect(stats.messagesByType[MessageType.CHAT]).toBe(2);
      expect(stats.messagesByStatus[MessageStatus.SENT]).toBe(1);
      expect(stats.messagesByStatus[MessageStatus.DELIVERED]).toBe(1);
      expect(stats.uniqueAgents.size).toBe(2);
      expect(stats.uniqueConversations.size).toBe(1);
      expect(stats.firstMessageAt).toBeDefined();
      expect(stats.lastMessageAt).toBeDefined();
    });
  });

  describe('exportToJSON', () => {
    it('should export conversation history to JSON', () => {
      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
      });

      const exported = history.exportToJSON();

      expect(exported.metadata.version).toBe('1.0.0');
      expect(exported.metadata.messageCount).toBe(1);
      expect(exported.messages).toHaveLength(1);
      expect(exported.stats).toBeDefined();
    });

    it('should support filtering in export', () => {
      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
        conversationId: 'conv1',
      });

      history.addMessage({
        id: 'msg2',
        type: MessageType.TASK,
        sender: 'agent2',
        receiver: 'agent3',
        content: 'Task',
        status: MessageStatus.SENT,
        timestamp: new Date(),
        conversationId: 'conv2',
      });

      const exported = history.exportToJSON({ conversationId: 'conv1' });

      expect(exported.messages).toHaveLength(1);
      expect(exported.messages[0].id).toBe('msg1');
    });
  });

  describe('clear', () => {
    it('should clear all messages', () => {
      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
      });

      expect(history.getMessageCount()).toBe(1);

      history.clear();

      expect(history.getMessageCount()).toBe(0);
      expect(history.getMessage('msg1')).toBeUndefined();
    });
  });

  describe('hasConversation', () => {
    it('should check if conversation exists', () => {
      history.addMessage({
        id: 'msg1',
        type: MessageType.CHAT,
        sender: 'agent1',
        receiver: 'agent2',
        content: 'Hello',
        status: MessageStatus.SENT,
        timestamp: new Date(),
        conversationId: 'conv1',
      });

      expect(history.hasConversation('conv1')).toBe(true);
      expect(history.hasConversation('conv2')).toBe(false);
    });
  });
});
