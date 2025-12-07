import request from "../utils/request";
import type {
  Result,
  ChatSessionVO,
  CreateSessionDTO,
  UpdateSessionDTO,
} from "../types";

/**
 * 创建会话
 */
export function createSession(
  data: CreateSessionDTO
): Promise<Result<ChatSessionVO>> {
  return request({
    url: "/api/chat/session/create",
    method: "post",
    data,
  });
}

/**
 * 修改会话标题
 */
export function updateSessionTitle(
  id: number,
  data: UpdateSessionDTO
): Promise<Result<ChatSessionVO>> {
  return request({
    url: `/api/chat/session/${id}/title`,
    method: "put",
    data,
  });
}

/**
 * 获取会话详情
 */
export function getSessionById(id: number): Promise<Result<ChatSessionVO>> {
  return request({
    url: `/api/chat/session/${id}`,
    method: "get",
  });
}

/**
 * 删除会话
 */
export function deleteSession(id: number): Promise<Result<boolean>> {
  return request({
    url: `/api/chat/session/${id}`,
    method: "delete",
  });
}

/**
 * 获取会话列表
 */
export function getSessionList(): Promise<Result<ChatSessionVO[]>> {
  return request({
    url: "/api/chat/session/list",
    method: "get",
  });
}




