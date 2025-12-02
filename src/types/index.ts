/**
 * 统一响应结果类型
 */
export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * Token 信息
 */
export interface TokenVO {
  token: string;
  expiresIn: number;
}

/**
 * 简单 Agent 对话请求
 */
export interface SimpleChatRequest {
  question?: string;
}

/**
 * 高级 Agent 对话请求
 */
export interface AdvancedChatRequest {
  userId: string;
  message: string;
}

/**
 * 高级 Agent 对话响应
 */
export interface AssistantResponse {
  answer: string;
  type: string;
  suggestion: string;
  needsFurtherHelp: boolean;
}

/**
 * 用户历史记录响应
 */
export interface ChatHistoryResponse {
  userId: string;
  threadId: string;
  history: string;
}

/**
 * 作业点评请求对象
 */
export interface ReviewRequest {
  taskDescription: string;
  studentAnswer: string;
}

/**
 * 作业点评结果对象
 */
export interface ReviewResult {
  score: number;
  summary?: string;
  comment?: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string | string[];
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
 * 图片分析请求
 */
export interface ImageAnalysisRequest {
  prompt: string;
  imageUrl: string;
}

/**
 * AI 模型信息
 */
export interface AIModelVO {
  name: string;
  label: string;
  description?: string;
  [key: string]: any;
}

/**
 * 登录请求
 */
export interface LoginDTO {
  username: string;
  password: string;
}

/**
 * 短信登录请求
 */
export interface SmsLoginDTO {
  mobile: string;
  code: string;
}

/**
 * 微信登录请求
 */
export interface WechatLoginDTO {
  code: string;
}

/**
 * 绑定手机号请求
 */
export interface BindMobileDTO {
  mobile: string;
  code: string;
}

/**
 * 更换手机号请求
 */
export interface ChangeMobileDTO {
  oldMobile: string;
  oldCode: string;
  newMobile: string;
  newCode: string;
}

/**
 * 用户信息
 */
export interface UserVO {
  id?: number;
  username?: string;
  nickname?: string;
  gender?: number;
  mobile?: string;
  [key: string]: any;
}

/**
 * 用户注册请求
 */
export interface UserDTO {
  username: string;
  password: string;
  nickname?: string;
  gender?: number;
  [key: string]: any;
}

/**
 * 分页请求参数
 */
export interface PageRequest {
  current?: number;
  size?: number;
  username?: string;
  [key: string]: any;
}

/**
 * 分页响应
 */
export interface PageResult<T> {
  records: T[];
  total: number;
}

/**
 * 创建会话请求
 */
export interface CreateSessionDTO {
  title: string;
  modelName?: string; // 后端期望的字段名是 modelName，不是 model
  model?: string; // 保留 model 作为兼容
  [key: string]: any;
}

/**
 * 更新会话标题请求
 */
export interface UpdateSessionDTO {
  title: string;
}

/**
 * 会话信息
 */
export interface ChatSessionVO {
  id?: number;
  title?: string;
  model?: string;
  messages?: any[];
  [key: string]: any;
}
