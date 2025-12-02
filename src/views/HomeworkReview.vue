<template>
  <div class="homework-review">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>作业点评</span>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="任务描述">
          <el-input
            v-model="form.taskDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述..."
          />
        </el-form-item>

        <el-form-item label="学生答案">
          <el-input
            v-model="form.studentAnswer"
            type="textarea"
            :rows="8"
            placeholder="请输入学生的答案或代码..."
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleReview" :loading="loading">
            开始点评
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div v-if="result" class="result-section">
        <h3>点评结果</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="得分">
            <el-tag :type="getScoreType(result.score)" size="large">
              {{ result.score }} 分
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总体评价">
            {{ result.summary }}
          </el-descriptions-item>
          <el-descriptions-item label="优点">
            <div class="multiline-text">{{ result.strengths }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="不足">
            <div class="multiline-text">{{ result.weaknesses }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="改进建议">
            <div class="multiline-text">{{ result.suggestions }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { reviewHomework } from "../api/ai";
import type { ReviewRequest, ReviewResult } from "../types";

const loading = ref(false);
const result = ref<ReviewResult | null>(null);

const form = reactive<ReviewRequest>({
  taskDescription: "",
  studentAnswer: "",
});

const handleReview = async () => {
  if (!form.taskDescription || !form.studentAnswer) {
    ElMessage.warning("请填写完整信息");
    return;
  }

  try {
    loading.value = true;
    const res = await reviewHomework(form);
    result.value = res.data;
    ElMessage.success("点评成功");
  } catch (error) {
    console.error("点评失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  form.taskDescription = "";
  form.studentAnswer = "";
  result.value = null;
};

const getScoreType = (score: number) => {
  if (score >= 90) return "success";
  if (score >= 80) return "primary";
  if (score >= 70) return "warning";
  return "danger";
};
</script>

<style scoped>
.homework-review {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.result-section {
  margin-top: 20px;
}

.result-section h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.multiline-text {
  white-space: pre-wrap;
  line-height: 1.8;
}
</style>
