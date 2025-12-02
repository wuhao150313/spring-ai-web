#联网搜索
<template>
  <div class="web-search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>联网搜索</span>
        </div>
      </template>

      <div class="form-container">
        <el-form label-width="80px">
          <el-form-item label="搜索问题">
            <el-input
              v-model="question"
              type="textarea"
              :rows="6"
              placeholder="请输入需要联网搜索的问题（如：今天的新闻、最新政策等）..."
              resize="vertical"
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleSearch"
              :loading="loading"
              size="default"
              :disabled="loading"
            >
              {{ loading ? "搜索中..." : "开始联网搜索" }}
            </el-button>
            <el-button @click="handleReset" size="default" :disabled="loading">
              清空
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-divider v-if="streamResult || loading" />

      <div v-if="streamResult || loading" class="result-section">
        <h3>搜索结果（实时更新）</h3>
        <!-- 用XMarkdown实时渲染流式返回的Markdown结果 -->
        <div class="result-content" v-if="streamResult">
          <XMarkdown :markdown="streamResult" theme="github" />
        </div>
        <div class="loading-content" v-else-if="loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          正在联网搜索并生成结果，请稍候...
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
// 导入联网搜索流式API和XMarkdown组件
import { webSearch } from "../api/enhanced"; // 你的联网搜索流式API
import { XMarkdown } from "vue-element-plus-x"; // 用于实时渲染Markdown

// 响应式数据
const loading = ref(false);
const question = ref("2025年最新的前端框架趋势是什么？"); // 示例问题
const streamResult = ref(""); // 存储流式拼接的搜索结果（Markdown格式）

/**
 * 处理联网搜索
 */
const handleSearch = async () => {
  // 校验问题
  if (!question.value.trim()) {
    ElMessage.warning("请输入需要搜索的问题");
    return;
  }

  try {
    // 重置状态
    loading.value = true;
    streamResult.value = "";

    // 调用联网搜索流式API，实时拼接结果
    await webSearch(
      question.value,
      (chunk) => {
        // 每收到一块数据，追加到结果中（XMarkdown自动重新渲染）
        streamResult.value += chunk;
      },
      () => {
        // 流结束回调
        ElMessage.success("搜索完成");
      },
      (error) => {
        // 错误回调
        ElMessage.error(`搜索失败: ${error.message}`);
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
  streamResult.value = "";
};
</script>

<style scoped>
/* 复用流式问答页面的样式结构，保持风格统一 */
.web-search {
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  display: block;
}

.web-search :deep(.el-card) {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 16px);
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 8px;
}

.web-search :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.web-search :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
}

.web-search .el-form {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.web-search .el-form-item {
  width: 100%;
  margin-bottom: 20px;
}

.web-search :deep(.el-form-item__content) {
  width: 100%;
  flex: 1;
}

.web-search :deep(.el-textarea) {
  width: 100%;
}

.web-search :deep(.el-textarea__inner) {
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

.result-section {
  margin-top: 20px;
  width: 100%;
  flex: 1;
}

.result-section h3 {
  margin-bottom: 12px;
  color: #409eff;
  font-size: 16px;
  font-weight: 600;
}

.result-content {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  width: 100%;
  font-size: 14px;
  border: 1px solid #e4e7ed;
  min-height: 120px; /* 确保空状态时有高度 */
}

/* 按钮组样式 */
.web-search :deep(.el-form-item):last-child {
  margin-bottom: 0;
}

.web-search :deep(.el-button) {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 6px;
  margin-right: 10px;
}

.web-search :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

.web-search :deep(.el-divider) {
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
