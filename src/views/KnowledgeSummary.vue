<template>
  <div class="knowledge-summary">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>知识点总结</span>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="课程内容">
          <el-input
            v-model="form.courseContent"
            type="textarea"
            :rows="8"
            placeholder="请输入课程内容..."
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSummarize"
            :loading="summaryLoading"
          >
            生成课程总结
          </el-button>
          <el-button
            type="success"
            @click="handleMindMap"
            :loading="mindMapLoading"
          >
            生成思维导图
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <el-tabs v-model="activeTab" v-if="summary || mindMap">
        <el-tab-pane label="课程总结" name="summary" v-if="summary">
          <div class="summary-section">
            <h3>课程总结</h3>
            <div class="content">
              {{ summary }}
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="思维导图" name="mindmap" v-if="mindMap">
          <div class="mindmap-section">
            <h3>思维导图</h3>
            <div class="content">
              {{ mindMap }}
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { summarizeCourse, generateMindMap } from "../api/ai";
import type { SummaryRequest } from "../types";

const summaryLoading = ref(false);
const mindMapLoading = ref(false);
const summary = ref("");
const mindMap = ref("");
const activeTab = ref("summary");

const form = reactive<SummaryRequest>({
  courseContent: "",
});

const handleSummarize = async () => {
  if (!form.courseContent) {
    ElMessage.warning("请输入课程内容");
    return;
  }

  try {
    summaryLoading.value = true;
    const res = await summarizeCourse(form);
    summary.value = res.data;
    activeTab.value = "summary";
    ElMessage.success("总结成功");
  } catch (error) {
    console.error("总结失败:", error);
  } finally {
    summaryLoading.value = false;
  }
};

const handleMindMap = async () => {
  if (!form.courseContent) {
    ElMessage.warning("请输入课程内容");
    return;
  }

  try {
    mindMapLoading.value = true;
    const res = await generateMindMap(form);
    mindMap.value = res.data;
    activeTab.value = "mindmap";
    ElMessage.success("思维导图生成成功");
  } catch (error) {
    console.error("思维导图生成失败:", error);
  } finally {
    mindMapLoading.value = false;
  }
};

const handleReset = () => {
  form.courseContent = "";
  summary.value = "";
  mindMap.value = "";
};
</script>

<style scoped>
.knowledge-summary {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.summary-section,
.mindmap-section {
  margin-top: 10px;
}

.summary-section h3,
.mindmap-section h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.content {
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
