<template>
  <div class="image-analysis">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>图片分析（通过URL）</span>
        </div>
      </template>

      <div class="form-container">
        <el-form label-width="100px" class="image-form">
          <!-- 图片OSS地址输入框 -->
          <el-form-item label="图片OSS地址" prop="imageUrl">
            <el-input
              v-model="imageUrl"
              placeholder="请输入图片的OSS地址（如：https://xxx.oss-cn-beijing.aliyuncs.com/xxx.jpg）"
              :disabled="loading"
            />
          </el-form-item>

          <!-- 问题/提示输入框 -->
          <el-form-item label="分析需求" prop="prompt">
            <el-input
              v-model="prompt"
              type="textarea"
              :rows="4"
              placeholder="请输入对图片的分析需求（如：描述图片内容、提取图片中的文字、分析图片主题等）..."
              resize="vertical"
              :disabled="loading"
            />
          </el-form-item>

          <!-- 操作按钮组 -->
          <el-form-item>
            <el-button
              type="primary"
              @click="handleAnalyze"
              :loading="loading"
              size="default"
              :disabled="loading"
            >
              {{ loading ? "分析中..." : "开始分析图片" }}
            </el-button>
            <el-button @click="handleReset" size="default" :disabled="loading">
              清空
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 结果分隔线（条件显示） -->
      <el-divider v-if="streamResult || loading" />

      <!-- 分析结果展示区 -->
      <div v-if="streamResult || loading" class="result-section">
        <h3>分析结果（实时更新）</h3>
        <!-- 图片预览（仅当输入了有效URL时显示） -->
        <div v-if="imageUrl" class="image-preview">
          <el-image
            :src="imageUrl"
            alt="图片预览"
            :preview-src-list="[imageUrl]"
            fit="contain"
          >
            <template #error>
              <div class="image-error">图片加载失败，请检查URL</div>
            </template>
          </el-image>
        </div>

        <!-- 流式结果渲染 -->
        <div class="result-content" v-if="streamResult">
          <XMarkdown :markdown="streamResult" theme="github" />
        </div>

        <!-- 加载状态 -->
        <div class="loading-content" v-else-if="loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          正在分析图片并生成结果，请稍候...
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import { XMarkdown } from "vue-element-plus-x";
// 导入图片分析流式API
import { analyzeImageByUrl } from "../api/analysis";

// 响应式数据
const loading = ref(false);
const imageUrl = ref(""); // 图片OSS地址
const prompt = ref("请描述这张图片的内容，并分析其主题"); // 分析需求
const streamResult = ref(""); // 流式分析结果（Markdown格式）

/**
 * 处理图片分析
 */
const handleAnalyze = async () => {
  // 校验输入
  if (!imageUrl.value.trim()) {
    ElMessage.warning("请输入图片的OSS地址");
    return;
  }
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入分析需求");
    return;
  }

  try {
    // 重置状态
    loading.value = true;
    streamResult.value = "";

    // 调用图片分析流式API
    await analyzeImageByUrl(
      prompt.value,
      imageUrl.value,
      (chunk) => {
        // 实时拼接流式结果
        streamResult.value += chunk;
      },
      () => {
        // 分析完成回调
        ElMessage.success("图片分析完成");
      },
      (error) => {
        // 错误回调
        ElMessage.error(`分析失败: ${error.message}`);
      }
    );
  } finally {
    // 结束加载状态
    loading.value = false;
  }
};

/**
 * 清空输入和结果
 */
const handleReset = () => {
  imageUrl.value = "";
  prompt.value = "";
  streamResult.value = "";
};
</script>

<style scoped>
/* 复用流式页面基础样式，保持风格统一 */
.image-analysis {
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  display: block;
}

.image-analysis :deep(.el-card) {
  width: 100%;
  max-width: none;
  min-height: calc(100vh - 16px);
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 8px;
}

.image-analysis :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.image-analysis :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
}

/* 表单样式 */
.image-form {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-analysis .el-form-item {
  width: 100%;
  margin-bottom: 20px;
}

.image-analysis :deep(.el-form-item__content) {
  width: 100%;
  flex: 1;
}

.image-analysis :deep(.el-input) {
  width: 100%;
}

.image-analysis :deep(.el-textarea__inner) {
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

/* 标题样式 */
.card-header {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

/* 结果区域样式 */
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

/* 图片预览样式 */
.image-preview {
  margin-bottom: 20px;
  max-width: 500px; /* 限制图片最大宽度 */
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
  box-sizing: border-box;
}

.image-analysis :deep(.el-image) {
  width: 100%;
  height: auto;
  max-height: 400px; /* 限制图片最大高度 */
}

.image-error {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #f56c6c;
  font-size: 14px;
}

/* 分析结果内容样式 */
.result-content {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  width: 100%;
  font-size: 14px;
  border: 1px solid #e4e7ed;
  min-height: 120px;
}

/* 按钮组样式 */
.image-analysis :deep(.el-form-item):last-child {
  margin-bottom: 0;
}

.image-analysis :deep(.el-button) {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 6px;
  margin-right: 10px;
}

.image-analysis :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

.image-analysis :deep(.el-divider) {
  margin: 20px 0;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 加载状态样式 */
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
