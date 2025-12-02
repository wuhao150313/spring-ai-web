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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header-style {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.header-style::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.header-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.header-content h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1::before {
  content: '🤖';
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.header-right {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 64px);
  background: transparent;
}
</style>
