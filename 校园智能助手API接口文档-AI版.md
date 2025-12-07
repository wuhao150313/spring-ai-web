# 校园智能助手 API 接口文档（AI 可读版）

## 文档说明

本文档面向 AI 代理和前端开发者，提供校园智能助手 API 的完整接口定义。所有接口定义采用 JSON Schema 格式，便于 AI 自动解析和生成代码。

**基础信息**：
- 基础URL: `http://localhost:8082`（开发环境）
- API版本: v1（简单接口）、v2（高级接口）
- 跨域支持: 所有接口支持 CORS (`CrossOrigin(origins = "*")`)

---

## 一、简单 Agent 对话接口（无状态）

### 1.1 GET /api/v1/chat

**接口描述**：简单的单次对话接口，不支持上下文记忆。每次请求都是独立的，适合快速测试。

**接口元数据**：
```json
{
  "method": "GET",
  "path": "/api/v1/chat",
  "controller": "SimpleAgentController",
  "authentication": false,
  "contentType": "text/plain; charset=utf-8"
}
```

**请求参数 Schema**：
```json
{
  "type": "object",
  "properties": {
    "question": {
      "type": "string",
      "description": "用户的问题",
      "default": "图书馆在哪里",
      "example": "今天天气怎么样"
    }
  },
  "required": []
}
```

**请求示例**：
```http
GET /api/v1/chat?question=今天天气怎么样
```

**响应 Schema**：
```json
{
  "type": "string",
  "description": "AI 返回的纯文本回答",
  "contentType": "text/plain; charset=utf-8"
}
```

**响应示例**：
```
今天南京的天气是晴天，温度22°C，适合出行，建议穿长袖。
```

**使用场景**：
- 快速测试 AI 功能
- 不需要上下文记忆的简单问答
- 一次性查询

---

## 二、高级 Agent 对话接口（带记忆）

### 2.1 POST /api/v2/chat

**接口描述**：支持多轮对话的智能对话接口，具有上下文记忆功能。后端会为每个 `userId` 维护一个 threadId，实现对话连续性。

**接口元数据**：
```json
{
  "method": "POST",
  "path": "/api/v2/chat",
  "controller": "AdvancedAgentController",
  "authentication": false,
  "contentType": "application/json"
}
```

**请求体 Schema (RequestDTO)**：
```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "用户唯一标识，用于生成和维护 threadId。相同 userId 的请求会共享同一个对话上下文",
      "required": true,
      "example": "user123"
    },
    "message": {
      "type": "string",
      "description": "用户发送的消息内容",
      "required": true,
      "example": "帮我查一下今天的天气"
    }
  },
  "required": ["userId", "message"]
}
```

**请求示例**：
```http
POST /api/v2/chat
Content-Type: application/json

{
  "userId": "user123",
  "message": "帮我查一下今天的天气"
}
```

**响应体 Schema (AssistantResponse)**：
```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "用户ID",
      "example": "user123"
    },
    "threadId": {
      "type": "string",
      "description": "线程ID，用于维护对话上下文",
      "format": "uuid",
      "example": "550e8400-e29b-41d4-a716-446655440000"
    },
    "answer": {
      "type": "string",
      "description": "AI 返回的主要回答内容（自然语言）",
      "example": "今天南京的天气是晴天，温度22°C，适合出行，建议穿长袖。"
    },
    "type": {
      "type": "string",
      "description": "回答类型，可能的值：weather（天气）、course（课程）、library（图书馆）、general（通用）",
      "enum": ["weather", "course", "library", "general"],
      "default": "general",
      "example": "weather"
    },
    "suggestion": {
      "type": "string",
      "description": "给用户的建议文案",
      "default": "请根据你的需求，给出一个建议",
      "example": "建议根据天气情况选择合适的衣物"
    },
    "needsFurtherHelp": {
      "type": "boolean",
      "description": "是否需要进一步帮助",
      "default": false,
      "example": false
    }
  },
  "required": ["answer", "type", "suggestion", "needsFurtherHelp"]
}
```

**响应示例**：
```json
{
  "userId": "user123",
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "answer": "今天南京的天气是晴天，温度22°C，适合出行，建议穿长袖。",
  "type": "weather",
  "suggestion": "建议根据天气情况选择合适的衣物",
  "needsFurtherHelp": false
}
```

**多轮对话示例**：
```javascript
// 第一轮对话
POST /api/v2/chat
{
  "userId": "user123",
  "message": "我是学号20220001的学生"
}

// 响应
{
  "answer": "你好！我是小椰，很高兴为你服务。",
  "threadId": "xxx-xxx-xxx"
}

// 第二轮对话（使用相同的 userId，会自动关联上下文）
POST /api/v2/chat
{
  "userId": "user123",
  "message": "帮我查一下我的课程表"
}

// 响应（AI 会记住之前提到的学号）
{
  "answer": "根据你的学号20220001，你的课程安排如下：...",
  "threadId": "xxx-xxx-xxx"  // 相同的 threadId
}
```

**使用场景**：
- 需要上下文记忆的多轮对话
- 个性化服务（如查询个人课程表）
- 复杂问题解答

---

### 2.2 GET /api/v2/history/{userId}

**接口描述**：根据 `userId` 查询该用户对应的对话 threadId 和简化的历史信息。目前历史内容为占位实现。

**接口元数据**：
```json
{
  "method": "GET",
  "path": "/api/v2/history/{userId}",
  "controller": "AdvancedAgentController",
  "authentication": false,
  "contentType": "application/json"
}
```

**路径参数 Schema**：
```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "用户ID",
      "required": true,
      "example": "user123"
    }
  },
  "required": ["userId"]
}
```

**请求示例**：
```http
GET /api/v2/history/user123
```

**成功响应 Schema**：
```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "example": "user123"
    },
    "threadId": {
      "type": "string",
      "format": "uuid",
      "example": "550e8400-e29b-41d4-a716-446655440000"
    },
    "history": {
      "type": "string",
      "description": "历史记录内容（当前为占位文本）",
      "example": "历史记录功能需要进一步实现"
    }
  },
  "required": ["userId", "threadId", "history"]
}
```

**成功响应示例**：
```json
{
  "userId": "user123",
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "history": "历史记录功能需要进一步实现"
}
```

**错误响应 Schema**（未找到用户历史）：
```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "string",
      "description": "错误信息",
      "example": "未找到该用户的历史记录"
    }
  },
  "required": ["error"]
}
```

**错误响应示例**：
```json
{
  "error": "未找到该用户的历史记录"
}
```

**使用场景**：
- 查询用户的对话历史
- 获取用户的 threadId（用于调试）
- 检查用户是否有对话记录

---

## 三、Agent 功能说明

### 3.1 可用工具（Tools）

校园智能助手"小椰"支持以下工具功能：

#### 3.1.1 天气查询工具 (getWeather)
- **触发条件**：用户提到天气、温度、穿衣建议等
- **输入参数**：城市名称（如：北京、上海、南京）
- **返回内容**：天气情况、温度、穿衣建议

#### 3.1.2 课程查询工具 (getCourseInfo)
- **触发条件**：用户问课程、课表、上课地点等
- **输入参数**：学生学号
- **返回内容**：课程名称、时间、地点

#### 3.1.3 图书馆座位查询工具 (getLibrarySeat)
- **触发条件**：用户问图书馆、自习、座位等
- **输入参数**：查询条件（可选）
- **返回内容**：空闲座位数、位置信息

#### 3.1.4 校园信息查询工具 (getCampusInfo)
- **触发条件**：其他校园相关问题
- **输入参数**：查询关键词
- **返回内容**：校园相关信息（如图书馆、食堂、教务处等）

### 3.2 Agent 行为特征

- **角色**：贴心的校园智能助手"小椰"
- **语气**：轻松友好，像学长学姐一样亲切
- **回答风格**：具体实用，不空泛
- **交互方式**：主动提供相关建议，适当使用 emoji

---

## 四、前端集成指南

### 4.1 TypeScript 类型定义

```typescript
// RequestDTO
interface RequestDTO {
  userId: string;    // 用户唯一标识
  message: string;   // 用户消息内容
}

// AssistantResponse
interface AssistantResponse {
  userId?: string;              // 用户ID
  threadId?: string;            // 线程ID
  answer: string;               // AI回答
  type: 'weather' | 'course' | 'library' | 'general';  // 回答类型
  suggestion: string;           // 建议
  needsFurtherHelp: boolean;    // 是否需要进一步帮助
}

// HistoryResponse
interface HistoryResponse {
  userId: string;
  threadId: string;
  history: string;
}

// ErrorResponse
interface ErrorResponse {
  error: string;
}
```

### 4.2 前端调用示例

#### 4.2.1 简单对话（无状态）

```typescript
async function simpleChat(question: string): Promise<string> {
  const response = await fetch(
    `http://localhost:8082/api/v1/chat?question=${encodeURIComponent(question)}`
  );
  return await response.text();
}

// 使用
const answer = await simpleChat("今天天气怎么样");
console.log(answer);
```

#### 4.2.2 高级对话（带记忆）

```typescript
async function advancedChat(
  userId: string, 
  message: string
): Promise<AssistantResponse> {
  const response = await fetch('http://localhost:8082/api/v2/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      message,
    }),
  });
  return await response.json();
}

// 使用
const result = await advancedChat('user123', '帮我查一下今天的天气');
console.log(result.answer);
console.log(result.threadId); // 保存 threadId 用于后续对话
```

#### 4.2.3 查询历史

```typescript
async function getHistory(
  userId: string
): Promise<HistoryResponse | ErrorResponse> {
  const response = await fetch(
    `http://localhost:8082/api/v2/history/${userId}`
  );
  return await response.json();
}

// 使用
const history = await getHistory('user123');
if ('error' in history) {
  console.error(history.error);
} else {
  console.log(history.threadId);
}
```

### 4.3 多轮对话实现示例

```typescript
class ChatSession {
  private userId: string;
  private threadId?: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async sendMessage(message: string): Promise<AssistantResponse> {
    const response = await advancedChat(this.userId, message);
    this.threadId = response.threadId;
    return response;
  }

  async getHistory(): Promise<HistoryResponse | ErrorResponse> {
    return await getHistory(this.userId);
  }
}

// 使用
const session = new ChatSession('user123');

// 第一轮
const response1 = await session.sendMessage('我是学号20220001的学生');
console.log(response1.answer);

// 第二轮（自动关联上下文）
const response2 = await session.sendMessage('帮我查一下我的课程表');
console.log(response2.answer); // AI 会记住学号
```

---

## 五、错误处理

### 5.1 常见错误场景

1. **网络错误**：请求失败、超时等
2. **参数错误**：缺少必填参数、参数格式错误
3. **服务错误**：后端服务异常（会返回 500 错误）

### 5.2 错误处理示例

```typescript
async function safeChat(
  userId: string, 
  message: string
): Promise<AssistantResponse | null> {
  try {
    const response = await fetch('http://localhost:8082/api/v2/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat request failed:', error);
    return null;
  }
}
```

---

## 六、最佳实践

### 6.1 userId 管理

- **登录用户**：使用用户ID作为 `userId`
- **游客用户**：使用浏览器 localStorage 或 sessionStorage 生成唯一ID
- **持久化**：建议将 `userId` 和 `threadId` 保存到本地存储

### 6.2 对话上下文管理

- 使用相同的 `userId` 来维持对话上下文
- 如果需要开始新对话，可以生成新的 `userId` 或调用重置接口（如果提供）

### 6.3 性能优化

- 对于简单查询，使用 v1 接口（无状态，响应更快）
- 对于需要上下文的对话，使用 v2 接口
- 合理设置请求超时时间

---

## 七、接口总结

| 接口 | 方法 | 路径 | 状态管理 | 适用场景 |
|------|------|------|----------|----------|
| 简单对话 | GET | `/api/v1/chat` | 无 | 快速测试、简单查询 |
| 高级对话 | POST | `/api/v2/chat` | 有 | 多轮对话、个性化服务 |
| 查询历史 | GET | `/api/v2/history/{userId}` | - | 历史记录查询 |

---

## 八、AI 代理使用说明

对于 AI 代理，本文档提供了完整的 JSON Schema 定义，可以直接用于：

1. **接口调用生成**：根据 Schema 自动生成 HTTP 请求
2. **参数验证**：根据 Schema 验证请求参数
3. **响应解析**：根据 Schema 解析和验证响应数据
4. **代码生成**：根据 Schema 生成前端调用代码

**关键字段说明**：
- `userId`: 用于维护对话上下文，相同 userId 的请求会共享 threadId
- `threadId`: 由后端自动生成和管理，用于标识对话会话
- `type`: 回答类型，可用于前端UI展示不同的样式

---

**文档版本**: 1.0  
**最后更新**: 2025-11-26  
**维护者**: 开发团队

