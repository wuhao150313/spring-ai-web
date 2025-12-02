<template>
  <div class="course-recommend">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程推荐</span>
        </div>
      </template>

      <el-form :model="form" label-width="120px">
        <el-form-item label="当前水平">
          <el-select v-model="form.userLevel" placeholder="请选择当前水平">
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>

        <el-form-item label="已完成课程">
          <el-input
            v-model="completedCoursesInput"
            type="textarea"
            :rows="4"
            placeholder="请输入已完成的课程,每行一个课程名称"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleRecommend" :loading="loading">
            获取推荐
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div v-if="courses.length > 0" class="courses-section">
        <h3>推荐课程</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(course, index) in courses"
            :key="index"
            :timestamp="'推荐 ' + (index + 1)"
            placement="top"
          >
            <el-card>
              <h4>{{ course }}</h4>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { recommendCourses } from "../api/ai";
import type { RecommendRequest } from "../types";

const loading = ref(false);
const courses = ref<string[]>([]);
const completedCoursesInput = ref("");

const form = reactive<RecommendRequest>({
  userLevel: "",
  completedCourses: [],
});

const handleRecommend = async () => {
  if (!form.userLevel) {
    ElMessage.warning("请选择当前水平");
    return;
  }

  // 解析已完成课程
  form.completedCourses = completedCoursesInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  try {
    loading.value = true;
    const res = await recommendCourses(form);
    courses.value = res.data;
    ElMessage.success("推荐成功");
  } catch (error) {
    console.error("推荐失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  form.userLevel = "";
  form.completedCourses = [];
  completedCoursesInput.value = "";
  courses.value = [];
};
</script>

<style scoped>
.course-recommend {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.courses-section {
  margin-top: 20px;
}

.courses-section h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.el-timeline-item h4 {
  margin: 0;
  font-size: 16px;
}
</style>
