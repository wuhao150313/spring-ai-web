# Spring AI Alibaba 前端项目

基于 Vue 3 + TypeScript + Element Plus 的 AI 前端应用

## 一、项目简介

本项目为 Spring AI Alibaba 演示项目的前端，提供友好的用户界面来调用后端 AI 功能。

### 核心功能

- AI 问答
- 作业点评
- 课程推荐
- 知识点总结
- 思维导图生成

## 二、技术栈

- **Vue**: 3.5+
- **TypeScript**: 5.0+
- **Vite**: 7.1+
- **Element Plus**: 2.5.6
- **Axios**: 1.6.7

## 三、快速开始

### 3.1 前置条件

1. 安装 Node.js 18+
2. 确保后端服务已启动 (http://localhost:8080)

### 3.2 安装依赖

```bash
cd spring-ai-web
npm install
```

### 3.3 启动项目

```bash
npm run dev
```

启动成功后访问: http://localhost:5173

### 3.4 构建项目

```bash
npm run build
```

## 四、项目结构

```
spring-ai-web/
├── src/
│   ├── api/              # API 接口封装
│   │   └── ai.ts         # AI 相关接口
│   ├── components/       # 公共组件
│   ├── utils/            # 工具类
│   │   └── request.ts    # axios 封装
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts      # 类型定义
│   ├── views/            # 页面组件
│   │   ├── AiQna.vue               # AI 问答页面
│   │   ├── HomeworkReview.vue      # 作业点评页面
│   │   ├── CourseRecommend.vue     # 课程推荐页面
│   │   └── KnowledgeSummary.vue    # 知识总结页面
│   ├── App.vue           # 主应用组件
│   ├── main.ts           # 应用入口
│   └── style.css         # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 五、功能说明

### 5.1 AI 问答

输入问题，AI 会根据问题回答。

### 5.2 作业自动点评

输入任务描述和学生答案，AI 会进行全面点评,包括:

- 得分
- 总体评价
- 优点
- 不足
- 改进建议

### 5.3 课程推荐

根据用户当前水平和已完成课程,推荐适合的后续课程。

### 5.4 知识点总结

输入课程内容,可以生成:

- 课程总结
- 思维导图

## 六、API 配置

API 基础地址配置在 `src/utils/request.ts` 中:

```typescript
const service = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 30000,
});
```

如需修改后端地址,请修改 `baseURL` 配置。

## 七、开发建议

1. **代码规范**

   - 使用 TypeScript 严格模式
   - 组件使用 `<script setup lang="ts">`
   - 遵循 Vue 3 Composition API 最佳实践

2. **样式规范**

   - 使用 Element Plus 组件库
   - scoped 样式隔离
   - 统一使用 Element Plus 主题色

3. **错误处理**
   - axios 拦截器统一处理错误
   - Element Plus Message 组件提示用户

## 八、常见问题

### 8.1 连接后端失败

**错误信息**: 网络错误

**解决方法**:

1. 确认后端服务已启动
2. 检查后端地址配置是否正确
3. 确认 CORS 配置正常

### 8.2 请求超时

**解决方法**:

1. 增加 timeout 配置时间
2. 检查网络连接
3. 减少输入内容长度
