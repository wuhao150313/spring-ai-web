/**
 * 统一响应结果类型
 */
export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 作业点评请求对象
 */
export interface ReviewRequest {
  taskDescription: string;
  studentAnswer: string;
}

/**
 * 课程推荐请求对象
 */
export interface RecommendRequest {
  userLevel: string;
  completedCourses: string[];
}

/**
 * 知识总结请求对象
 */
export interface SummaryRequest {
  courseContent: string;
}

/**
 * 作业点评结果对象
 */
export interface ReviewResult {
  score: number;
  summary: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
}

export interface ImageAnalysisRequest {
  prompt: string; // 对图片的分析提示（如“描述图片内容”“识别图片中的物体”）
  imageUrl: string; // 图片的URL地址
}
