import request from "../utils/request";
import type {
  Result,
  AdvancedChatRequest,
  AssistantResponse,
  ChatHistoryResponse,
} from "../types";
import type { AxiosResponse } from "axios";

/**
 * 简单 Agent 对话（无记忆）
 */
export function simpleChat(
  question?: string
): Promise<AxiosResponse<string>> {
  return request({
    url: "/api/v1/chat",
    method: "get",
    params: { question },
    responseType: "text",
  });
}

/**
 * 高级 Agent 对话（带记忆）
 */
export function advancedChat(
  data: AdvancedChatRequest
): Promise<Result<AssistantResponse>> {
  return request({
    url: "/api/v2/chat",
    method: "post",
    data,
  });
}

/**
 * 获取用户对话历史
 */
export function getChatHistory(
  userId: string
): Promise<Result<ChatHistoryResponse>> {
  return request({
    url: `/api/v2/history/${userId}`,
    method: "get",
  });
}

