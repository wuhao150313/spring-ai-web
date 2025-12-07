import request from "../utils/request";
import type {
  Result,
  AdvancedChatRequest,
  AssistantResponse,
  ChatHistoryResponse,
  ErrorResponse,
} from "../types";
import type { AxiosResponse } from "axios";

/**
 * 简单 Agent 对话（无记忆）
 * 接口：GET /api/v1/chat
 * 基础URL: http://localhost:8082
 * 说明：简单的单次对话接口，不支持上下文记忆
 */
export function simpleChat(
  question?: string
): Promise<AxiosResponse<string>> {
  // 使用相对路径，通过vite代理转发到8082端口
  return request({
    url: "/api/v1/chat",
    method: "get",
    params: { question },
    responseType: "text",
  });
}

/**
 * 高级 Agent 对话（带记忆）
 * 接口：POST /api/v2/chat
 * 基础URL: http://localhost:8082
 * 说明：支持多轮对话的智能对话接口，具有上下文记忆功能
 */
export function advancedChat(
  data: AdvancedChatRequest
): Promise<AssistantResponse> {
  // 使用相对路径，通过vite代理转发到8082端口
  return request({
    url: "/api/v2/chat",
    method: "post",
    data,
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response: any) => {
    // 接口直接返回 AssistantResponse，不是 Result<AssistantResponse>
    // 如果响应有data字段，取data；否则直接返回响应
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }
    return response;
  });
}

/**
 * 获取用户对话历史
 * 接口：GET /api/v2/history/{userId}
 * 基础URL: http://localhost:8082
 * 说明：根据 userId 查询该用户对应的对话 threadId 和简化的历史信息
 */
export function getChatHistory(
  userId: string
): Promise<ChatHistoryResponse | ErrorResponse> {
  // 使用相对路径，通过vite代理转发到8082端口
  return request({
    url: `/api/v2/history/${userId}`,
    method: "get",
  }).then((response: any) => {
    // 直接返回响应数据
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }
    return response;
  });
}




