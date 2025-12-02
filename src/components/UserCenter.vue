<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <div class="user-center-trigger">
      <el-avatar :size="32" :icon="UserFilled" />
      <span class="username">{{ username }}</span>
      <el-icon><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-if="!authStore.isLoggedIn.value"
          command="login"
          :icon="UserFilled"
        >
          登录
        </el-dropdown-item>
        <el-dropdown-item
          v-if="authStore.isLoggedIn.value"
          command="logout"
          :icon="SwitchButton"
        >
          登出
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 登录对话框 -->
  <el-dialog
    v-model="loginDialogVisible"
    title="用户登录"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form :model="loginForm" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="loginDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleLogin" :loading="loginLoading">
        登录
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { UserFilled, ArrowDown, SwitchButton } from "@element-plus/icons-vue";
import { login } from "../api/auth";
import { setToken, logout as authLogout, setUserInfo } from "../utils/auth";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const loginDialogVisible = ref(false);
const loginLoading = ref(false);
const loginForm = ref({
  username: "",
  password: "",
});

const username = computed(() => {
  return authStore.isLoggedIn.value
    ? authStore.userInfo.value?.username || "用户"
    : "未登录";
});

const handleCommand = (command: string) => {
  if (command === "login") {
    loginDialogVisible.value = true;
  } else if (command === "logout") {
    handleLogout();
  }
};

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }

  try {
    loginLoading.value = true;
    const res = await login(loginForm.value);
    setToken(res.data.token);
    const userInfo = { username: loginForm.value.username };
    setUserInfo(userInfo);
    authStore.setLoggedIn(true);
    authStore.setUserInfo(userInfo);
    ElMessage.success("登录成功");
    loginDialogVisible.value = false;
    loginForm.value = { username: "", password: "" };
  } catch (error) {
    console.error("登录失败:", error);
  } finally {
    loginLoading.value = false;
  }
};

const handleLogout = () => {
  authLogout();
  authStore.setLoggedIn(false);
  authStore.setUserInfo(null);
  ElMessage.success("已登出");
};
</script>

<style scoped>
.user-center-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-center-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  color: white;
  font-size: 14px;
}
</style>

