import request from "../utils/request";
import type {
  Result,
  ReviewRequest,
  ReviewResult,
  RecommendRequest,
  SummaryRequest,
} from "../types";
import type { AxiosResponse } from "axios";

/**
 * AI 问答（普通）
 */
export function askQuestion(
  question?: string
): Promise<AxiosResponse<string>> {
  return request({
    url: "/ai/qna/ask",
    method: "get",
    params: { question },
    responseType: "text",
  });
}

/**
 * 切换 AI 模型
 */
export function switchModel(
  model?: string
): Promise<AxiosResponse<string>> {
  return request({
    url: "/ai/qna/switch-model",
    method: "get",
    params: { model },
    responseType: "text",
  });
}

/**
 * 作业点评
 */
export function reviewHomework(
  data: ReviewRequest
): Promise<Result<ReviewResult>> {
  return request({
    url: "/ai/homework/review",
    method: "post",
    data,
  });
}

/**
 * 课程推荐
 */
export function recommendCourses(
  data: RecommendRequest
): Promise<Result<string[]>> {
  return request({
    url: "/ai/recommend/courses",
    method: "post",
    data,
  });
}

/**
 * 课程总结
 */
export function summarizeCourse(data: SummaryRequest): Promise<Result<string>> {
  return request({
    url: "/ai/summary/course",
    method: "post",
    data,
  });
}

/**
 * 思维导图生成
 */
export function generateMindMap(data: SummaryRequest): Promise<Result<string>> {
  return request({
    url: "/ai/summary/mindmap",
    method: "post",
    data,
  });
}
