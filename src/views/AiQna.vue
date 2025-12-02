<template>
  <div class="ai-qna">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI 问答</span>
        </div>
      </template>

      <div class="form-container">
        <el-form label-width="80px">
          <el-form-item label="问题">
            <el-input
              v-model="question"
              type="textarea"
              :rows="6"
              placeholder="请输入您的问题，我会尽力为您解答..."
              resize="vertical"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleAsk"
              :loading="loading"
              size="default"
            >
              {{ loading ? "思考中..." : "提问" }}
            </el-button>
            <el-button @click="handleReset" size="default">清空</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-divider v-if="answer || loading" />

      <div v-if="answer || loading" class="answer-section">
        <h3>AI 回答</h3>
        <div
          class="answer-content markdown-body"
          v-if="answer"
          v-html="renderedAnswer"
        ></div>
        <div class="loading-content" v-else-if="loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          正在思考中，请稍候...
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import { askQuestion } from "../api/ai";
import { marked } from "marked";

const loading = ref(false);
const answer = ref("");

const question = ref("你是谁");

// 计算属性：将markdown转换为HTML
const renderedAnswer = computed(() => {
  if (!answer.value) return "";
  return marked(answer.value);
});

const handleAsk = async () => {
  if (!question.value.trim()) {
    ElMessage.warning("请输入问题");
    return;
  }

  try {
    loading.value = true;
    answer.value = "";
    const res = await askQuestion(question.value);
    console.log(res);
    answer.value = res.data;
    ElMessage.success("回答成功");
  } catch (error) {
    console.error("提问失败:", error);
    ElMessage.error("提问失败，请重试");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  question.value = "";
  answer.value = "";
};
</script>

<style scoped>
.ai-qna {
  padding: 8px;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  display: block;
}

.ai-qna :deep(.el-card) {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 16px);
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 8px;
}

.ai-qna :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.ai-qna :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
}

.ai-qna .el-form {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ai-qna .el-form-item {
  width: 100%;
  margin-bottom: 20px;
}

.ai-qna :deep(.el-form-item__content) {
  width: 100%;
  flex: 1;
}

.ai-qna :deep(.el-textarea) {
  width: 100%;
}

.ai-qna :deep(.el-textarea__inner) {
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
  line-height: 1.8;
  width: 100%;
  font-size: 14px;
  border: 1px solid #e4e7ed;
}

/* 按钮组样式 */
.ai-qna :deep(.el-form-item):last-child {
  margin-bottom: 0;
}

.ai-qna :deep(.el-button) {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 6px;
}

.ai-qna :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

.ai-qna :deep(.el-divider) {
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
}

.loading-content .el-icon {
  margin-right: 8px;
  font-size: 20px;
}
</style>

<style>
/* Markdown 样式 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.25em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body h3 {
  font-size: 1.1em;
}

.markdown-body p {
  margin-bottom: 16px;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body li {
  margin-bottom: 4px;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin-bottom: 16px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
    Liberation Mono, monospace;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.markdown-body pre code {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-body table th,
.markdown-body table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body table th {
  font-weight: 600;
  background-color: #f6f8fa;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
}

.markdown-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}
</style>