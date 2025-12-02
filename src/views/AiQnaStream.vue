#流式回答
<template>
  <div class="ai-qna-stream">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI 流式问答</span>
        </div>
      </template>

      <div class="form-container">
        <el-form label-width="80px">
          <el-form-item label="问题">
            <el-input
              v-model="question"
              type="textarea"
              :rows="6"
              placeholder="请输入您的问题，我会实时为您解答..."
              resize="vertical"
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleStreamAsk"
              :loading="loading"
              size="default"
              :disabled="loading"
            >
              {{ loading ? "回答中..." : "流式提问" }}
            </el-button>
            <el-button @click="handleReset" size="default" :disabled="loading">
              清空
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-divider v-if="streamAnswer || loading" />

      <div v-if="streamAnswer || loading" class="answer-section">
        <h3>AI 实时回答</h3>
        <!-- 用XMarkdown实时渲染流式Markdown -->
        <div class="answer-content" v-if="streamAnswer">
          <XMarkdown :markdown="streamAnswer" theme="github" />
        </div>
        <div class="loading-content" v-else-if="loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          正在实时生成回答，请稍候...
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
// 导入流式API和XMarkdown组件
import { askQuestionStream } from "../api/stream"; // 你的流式API
import { XMarkdown } from "vue-element-plus-x"; // 用于实时渲染Markdown

// 响应式数据
const loading = ref(false);
const question = ref("请用Markdown格式介绍Vue3的新特性");
const streamAnswer = ref(""); // 存储流式拼接的Markdown内容

/**
 * 处理流式提问
 */
const handleStreamAsk = async () => {
  // 校验问题
  if (!question.value.trim()) {
    ElMessage.warning("请输入问题");
    return;
  }

  try {
    // 重置状态
    loading.value = true;
    streamAnswer.value = "";

    // 调用流式API，实时拼接Markdown内容
    await askQuestionStream(
      question.value,
      (chunk) => {
        // 每收到一块数据，追加到streamAnswer（XMarkdown会自动重新渲染）
        streamAnswer.value += chunk;
      },
      () => {
        // 流结束回调
        ElMessage.success("回答已完成");
      },
      (error) => {
        // 错误回调
        ElMessage.error(`回答失败: ${error.message}`);
      }
    );
  } finally {
    // 无论成功失败，结束加载状态
    loading.value = false;
  }
};

/**
 * 清空内容
 */
const handleReset = () => {
  question.value = "";
  streamAnswer.value = "";
};
</script>

<style scoped>
/* 复用原页面样式，保持风格一致 */
.ai-qna-stream {
  padding: 8px;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  display: block;
}

.ai-qna-stream :deep(.el-card) {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 16px);
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 8px;
}

.ai-qna-stream :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.ai-qna-stream :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
}

.ai-qna-stream .el-form {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ai-qna-stream .el-form-item {
  width: 100%;
  margin-bottom: 20px;
}

.ai-qna-stream :deep(.el-form-item__content) {
  width: 100%;
  flex: 1;
}

.ai-qna-stream :deep(.el-textarea) {
  width: 100%;
}

.ai-qna-stream :deep(.el-textarea__inner) {
  width: 100%;
  min-height: 120px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.answer-section {
  margin-top: 20px;
  width: 100%;
  flex: 1;
}

.answer-section h3 {
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
}

.answer-content {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  width: 100%;
  font-size: 14px;
  border: 1px solid #e4e7ed;
  min-height: 120px; /* 确保空状态时有高度 */
}

/* 按钮组样式 */
.ai-qna-stream :deep(.el-form-item):last-child {
  margin-bottom: 0;
}

.ai-qna-stream :deep(.el-button) {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 6px;
  margin-right: 10px;
}

.ai-qna-stream :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

.ai-qna-stream :deep(.el-divider) {
  margin: 20px 0;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  font-size: 16px;
  min-height: 120px;
}

.loading-content .el-icon {
  margin-right: 8px;
  font-size: 20px;
  animation: rotate 1.5s linear infinite;
}

/* 加载动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
