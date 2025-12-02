<template>
  <div id="app" class="flex-layout">
    <el-container class="full-height">
      <el-header class="header-style">
        <div class="header-content">
          <h1>AI 学习助手</h1>
        </div>
      </el-header>
      <el-container class="full-height">
        <el-aside width="200px" class="aside-style">
          <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
            class="menu-style"
          >
            <el-menu-item index="qna">AI 问答</el-menu-item>
            <el-menu-item index="qnaStream">流式问答</el-menu-item>
            <el-menu-item index="enhanced">联网搜索</el-menu-item>
            <el-menu-item index="analysis">图片分析</el-menu-item>
            <el-menu-item index="homework">作业点评</el-menu-item>
            <el-menu-item index="recommend">课程推荐</el-menu-item>
            <el-menu-item index="summary">知识总结</el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main-style">
          <component :is="currentComponent" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from "vue";
import AiQna from "./views/AiQna.vue";
import HomeworkReview from "./views/HomeworkReview.vue";
import CourseRecommend from "./views/CourseRecommend.vue";
import KnowledgeSummary from "./views/KnowledgeSummary.vue";
import AiQnaStream from "./views/AiQnaStream.vue";
import AiQnaEnhanced from "./views/AiQnaEnhanced.vue";
import ImageAnalysis from "./views/ImageAnalysis.vue";

const activeMenu = ref("qna");
const currentComponent = ref(markRaw(AiQna));

const componentMap: Record<string, any> = {
  qna: AiQna,
  qnaStream: AiQnaStream,
  homework: HomeworkReview,
  recommend: CourseRecommend,
  summary: KnowledgeSummary,
  enhanced: AiQnaEnhanced,
  analysis: ImageAnalysis,
};

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
  currentComponent.value = markRaw(componentMap[index]);
};
</script>

<style scoped>
/* 根容器：强制占满视口，关闭自身滚动 */
.flex-layout {
  height: 95vh;
  overflow: hidden;
}

/* 所有Element Plus布局容器：强制Flex布局并占满高度 */
.full-height {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.full-height .el-container {
  flex: 1;
  display: flex;
  flex-direction: row;
}

/* 头部样式 */
.header-style {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
}

/* 侧边栏样式 */
.aside-style {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

/* 菜单样式：去除边框 */
.menu-style {
  border-right: none;
}

/* 主内容区：内部滚动，外部无滚动 */
.main-style {
  background-color: #ffffff;
  padding: 0;
  overflow: auto; /* 仅主内容区内部滚动 */
}

/* 流式问答页面适配：继承主内容区内边距 */
.main-style :deep(.ai-qna-stream) {
  padding: 16px;
}
</style>
