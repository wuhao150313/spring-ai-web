import request from "../utils/request";
import type { Result, AIModelVO } from "../types";

/**
 * 获取模型列表
 */
export function getModelList(): Promise<Result<AIModelVO[]>> {
  return request({
    url: "/api/ai/model/list",
    method: "get",
  });
}

/**
 * 获取当前模型
 */
export function getCurrentModel(): Promise<Result<AIModelVO>> {
  return request({
    url: "/api/ai/model/current",
    method: "get",
  });
}

/**
 * 切换模型
 */
export function switchModel(
  modelName: string
): Promise<Result<AIModelVO>> {
  return request({
    url: "/api/ai/model/switch",
    method: "post",
    params: { modelName },
  });
}

