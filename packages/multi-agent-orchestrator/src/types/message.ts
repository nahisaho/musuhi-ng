/**
 * Message Types
 *
 * Defines message structures for inter-agent communication.
 * Maps to AC-3.9 (Conversation History)
 */

/**
 * Message type classification
 */
export enum MessageType {
  /** Regular conversational message */
  CHAT = 'chat',
  /** Task assignment message */
  TASK = 'task',
  /** Task result/response */
  RESULT = 'result',
  /** Tool/function call */
  TOOL_CALL = 'tool_call',
  /** Tool execution result */
  TOOL_RESULT = 'tool_result',
  /** Error message */
  ERROR = 'error',
  /** System notification */
  SYSTEM = 'system',
  /** Human approval request */
  APPROVAL_REQUEST = 'approval_request',
  /** Human approval response */
  APPROVAL_RESPONSE = 'approval_response',
}

/**
 * Message status
 */
export enum MessageStatus {
  /** Message is pending delivery */
  PENDING = 'pending',
  /** Message has been sent */
  SENT = 'sent',
  /** Message has been delivered */
  DELIVERED = 'delivered',
  /** Message has been read */
  READ = 'read',
  /** Message processing failed */
  FAILED = 'failed',
}

/**
 * Tool call request structure
 * Maps to AC-3.7 (Tool Registration)
 */
export interface ToolCall {
  /** Unique tool call identifier */
  id: string;
  /** Name of the tool/function to call */
  name: string;
  /** Arguments for the tool call */
  arguments: Record<string, unknown>;
  /** Timestamp of the call */
  timestamp: Date;
}

/**
 * Tool call result structure
 */
export interface ToolResult {
  /** Reference to the tool call ID */
  toolCallId: string;
  /** Tool execution result */
  result: unknown;
  /** Whether the tool call succeeded */
  success: boolean;
  /** Error message if tool call failed */
  error?: string;
  /** Execution duration (milliseconds) */
  duration?: number;
  /** Timestamp of the result */
  timestamp: Date;
}

/**
 * Core Message interface
 *
 * Represents a single message in agent communication.
 * Used by ConversationHistory for message persistence.
 * Maps to AC-3.9 (Conversation History)
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Message type */
  type: MessageType;
  /** Sender agent ID */
  sender: string;
  /** Receiver agent ID (or 'broadcast' for group messages) */
  receiver: string;
  /** Message content */
  content: string;
  /** Message status */
  status: MessageStatus;
  /** Message timestamp */
  timestamp: Date;
  /** Optional tool call data */
  toolCall?: ToolCall;
  /** Optional tool result data */
  toolResult?: ToolResult;
  /** Optional parent message ID for threading */
  parentId?: string;
  /** Optional conversation/session ID */
  conversationId?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Message filter criteria for querying conversation history
 */
export interface MessageFilter {
  /** Filter by agent ID (sender or receiver) */
  agentId?: string;
  /** Filter by conversation ID */
  conversationId?: string;
  /** Filter by message type */
  type?: MessageType;
  /** Filter by status */
  status?: MessageStatus;
  /** Filter by timestamp range (start) */
  startTime?: Date;
  /** Filter by timestamp range (end) */
  endTime?: Date;
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Message query result
 */
export interface MessageQueryResult {
  /** Matching messages */
  messages: Message[];
  /** Total count of matching messages (before pagination) */
  totalCount: number;
  /** Whether there are more results */
  hasMore: boolean;
}
