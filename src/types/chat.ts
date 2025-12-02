/**
 * 消息角色
 */
export type MessageRole = "user" | "assistant";

/**
 * 消息对象
 */
export interface Message {
  role: MessageRole;
  content: string;
  time: string;
}

