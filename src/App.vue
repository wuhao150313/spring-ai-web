<template>
  <div id="app" class="app-container">
    <el-header class="header-style">
      <div class="header-content">
        <h1>AI 学习助手</h1>
      </div>
      <div class="header-right">
        <UserCenter />
      </div>
    </el-header>
    <div class="main-content">
      <Chat />
    </div>
  </div>
</template>

<script setup lang="ts">
import Chat from "./views/Chat.vue";
import UserCenter from "./components/UserCenter.vue";
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.header-style {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.header-content h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
