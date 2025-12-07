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
  prompt: string; // 对图片的分析提示（如"描述图片内容""识别图片中的物体"）
  imageUrl: string; // 图片的URL地址
}

/**
 * 高级 Agent 对话请求对象（RequestDTO）
 */
export interface AdvancedChatRequest {
  userId: string; // 用户唯一标识，用于生成和维护 threadId
  message: string; // 用户发送的消息内容
}

/**
 * 智能助手响应对象（AssistantResponse）
 */
export interface AssistantResponse {
  userId?: string; // 用户ID
  threadId?: string; // 线程ID，用于维护对话上下文（UUID格式）
  answer: string; // AI 返回的主要回答内容（自然语言）
  type: "weather" | "course" | "library" | "general"; // 回答类型
  suggestion: string; // 给用户的建议文案
  needsFurtherHelp: boolean; // 是否需要进一步帮助
}

/**
 * 对话历史响应对象（HistoryResponse）
 */
export interface ChatHistoryResponse {
  userId: string;
  threadId: string;
  history: string;
}

/**
 * 错误响应对象（ErrorResponse）
 */
export interface ErrorResponse {
  error: string; // 错误信息
}

/**
 * Token 响应对象
 */
export interface TokenVO {
  token: string; // Bearer token 字符串
  expiresIn: number; // 过期时间（单位：秒）
}

/**
 * 登录请求对象
 */
export interface LoginDTO {
  username: string; // 不可为空
  password: string; // 不可为空
}

/**
 * 短信登录请求对象
 */
export interface SmsLoginDTO {
  mobile: string;
  code: string;
}

/**
 * 微信登录请求对象
 */
export interface WechatLoginDTO {
  code: string;
}

/**
 * 绑定手机号请求对象
 */
export interface BindMobileDTO {
  mobile: string;
  code: string;
}

/**
 * 更换手机号请求对象
 */
export interface ChangeMobileDTO {
  oldMobile: string;
  oldCode: string;
  newMobile: string;
  newCode: string;
}

/**
 * 聊天会话对象
 */
export interface ChatSessionVO {
  id?: number;
  title?: string;
  model?: string;
  userId?: number;
  createTime?: string;
  updateTime?: string;
  // 可能包含消息列表等其他字段
  [key: string]: any;
}

/**
 * 创建会话请求对象
 */
export interface CreateSessionDTO {
  title: string;
  model: string;
  [key: string]: any; // 其他会话配置字段
}

/**
 * 更新会话请求对象
 */
export interface UpdateSessionDTO {
  title: string;
}

/**
 * 用户对象
 */
export interface UserVO {
  id?: number;
  username?: string;
  nickname?: string;
  gender?: number;
  mobile?: string;
  email?: string;
  avatar?: string;
  [key: string]: any; // 其他用户字段
}

/**
 * 用户数据传输对象
 */
export interface UserDTO {
  username?: string;
  password?: string;
  nickname?: string;
  gender?: number;
  mobile?: string;
  email?: string;
  [key: string]: any; // 其他注册/更新所需字段
}

/**
 * 分页请求对象
 */
export interface PageRequest {
  current?: number; // 当前页号，默认：1
  size?: number; // 每页条数，默认：10
  username?: string; // 按用户名模糊查询
  [key: string]: any; // 其他查询参数
}

/**
 * 分页结果对象
 */
export interface PageResult<T> {
  records: T[]; // 数据列表
  total: number; // 总记录数
}

/**
 * AI 模型对象
 */
export interface AIModelVO {
  name: string; // 模型名称，如 "qwen-turbo"
  label?: string; // 模型显示名称，如 "通义千问 Turbo"
  description?: string; // 模型描述
  [key: string]: any; // 其他模型相关信息
}
