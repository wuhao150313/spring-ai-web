<template>
  <div class="chat-layout">
    <!-- 左侧会话管理侧边栏 -->
    <div class="session-sidebar">
      <div class="sidebar-header">
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleCreateSession"
          :disabled="!authStore.isLoggedIn.value"
          class="new-session-btn"
        >
          新建会话
        </el-button>
      </div>
      <div class="session-list" ref="sessionListContainer">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-card"
          :class="{ active: currentSessionId === session.id }"
          @click="handleSelectSession(session.id!)"
        >
          <div class="session-title">{{ session.title || "新会话" }}</div>
          <div class="session-actions">
            <el-button
              text
              :icon="Edit"
              @click.stop="handleEditSession(session)"
              :disabled="!authStore.isLoggedIn.value"
              size="small"
            />
            <el-button
              text
              :icon="Delete"
              @click.stop="handleDeleteSession(session.id!)"
              :disabled="!authStore.isLoggedIn.value"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 主对话区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in currentMessages"
          :key="index"
          class="message-item"
          :class="{
            'user-message': message.role === 'user',
            'ai-message': message.role === 'assistant',
          }"
        >
          <div class="message-avatar">
            <el-avatar
              v-if="message.role === 'user'"
              :size="40"
              :icon="UserFilled"
            />
          <el-avatar
            v-else
            :size="40"
            :icon="ChatDotRound"
            style="background-color: #409eff"
          />
          </div>
          <div class="message-content">
            <div class="message-text">
              <XMarkdown
                v-if="message.role === 'assistant'"
                :markdown="message.content"
                theme="github"
              />
              <div v-else class="user-text">{{ message.content }}</div>
            </div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>

        <!-- 正在输入指示器 -->
        <div v-if="isStreaming" class="message-item ai-message">
          <div class="message-avatar">
            <el-avatar
              :size="40"
              :icon="ChatDotRound"
              style="background-color: #409eff"
            />
          </div>
          <div class="message-content">
            <div class="message-text">
              <XMarkdown :markdown="streamingContent" theme="github" />
              <span class="typing-indicator">▊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <!-- 配置项 -->
        <div class="input-config">
          <el-checkbox
            v-model="config.deepThinking"
            :disabled="!authStore.isLoggedIn.value"
            label="深度思考"
          />
          <el-checkbox
            v-model="config.webSearch"
            label="联网搜索"
          />
          <el-checkbox
            v-model="config.imageAnalysis"
            label="图片分析"
          />
          <el-upload
            v-model:file-list="fileList"
            :auto-upload="false"
            :limit="1"
            :disabled="!authStore.isLoggedIn.value"
            class="file-upload"
          >
            <el-button :icon="Upload" size="small" :disabled="!authStore.isLoggedIn">
              文件上传
            </el-button>
          </el-upload>
          <el-button
            v-if="authStore.isLoggedIn.value"
            :icon="Setting"
            text
            @click="showModelDialog = true"
            size="small"
          >
            模型设置
          </el-button>
        </div>

        <!-- 图片分析输入（当启用时） -->
        <div v-if="config.imageAnalysis" class="image-input">
          <el-input
            v-model="imageUrl"
            placeholder="请输入图片URL（OSS地址）"
            clearable
          />
        </div>

        <!-- 文本输入 -->
        <div class="input-wrapper">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            :disabled="isStreaming"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact="handleNewLine"
            class="input-textarea"
            resize="none"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              :loading="isStreaming"
              :disabled="!inputText.trim() || isStreaming"
              @click="handleSend"
              class="send-button"
            >
              <el-icon v-if="!isStreaming"><Promotion /></el-icon>
              {{ isStreaming ? "发送中..." : "发送" }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑会话对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑会话"
      width="400px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="会话标题">
          <el-input v-model="editForm.title" placeholder="请输入会话标题" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSession">保存</el-button>
      </template>
    </el-dialog>

    <!-- 模型设置对话框 -->
    <el-dialog
      v-model="showModelDialog"
      title="模型设置"
      width="500px"
    >
      <div v-if="models.length > 0">
        <el-radio-group v-model="selectedModel">
          <el-radio
            v-for="model in models"
            :key="model.name"
            :label="model.name"
          >
            {{ model.label }}
            <span v-if="model.description" class="model-desc">
              - {{ model.description }}
            </span>
          </el-radio>
        </el-radio-group>
      </div>
      <div v-else>加载中...</div>
      <template #footer>
        <el-button @click="showModelDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSwitchModel" :loading="switchingModel">
          切换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  UserFilled,
  ChatDotRound,
  Promotion,
  Plus,
  Edit,
  Delete,
  Upload,
  Setting,
} from "@element-plus/icons-vue";
import { XMarkdown } from "vue-element-plus-x";
import { askQuestionStream } from "../api/stream";
import { webSearch } from "../api/enhanced";
import { analyzeImageByUrl } from "../api/analysis";
import {
  getSessionList,
  createSession,
  updateSessionTitle,
  deleteSession,
  getSessionById,
} from "../api/session";
import { getModelList, switchModel as switchModelApi, getCurrentModel } from "../api/model";
import { useAuthStore } from "../stores/auth";
import type { Message } from "../types/chat";
import type { ChatSessionVO, AIModelVO, CreateSessionDTO } from "../types";

const authStore = useAuthStore();

// 响应式数据
const sessions = ref<ChatSessionVO[]>([]);
const currentSessionId = ref<number | null>(null);
const currentMessages = ref<Message[]>([]);
const inputText = ref("");
const isStreaming = ref(false);
const streamingContent = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const sessionListContainer = ref<HTMLElement | null>(null);

// 配置项
const config = ref({
  deepThinking: false,
  webSearch: false,
  imageAnalysis: false,
});

const imageUrl = ref("");
const fileList = ref<any[]>([]);

// 模型相关
const models = ref<AIModelVO[]>([]);
const selectedModel = ref("");
const showModelDialog = ref(false);
const switchingModel = ref(false);

// 编辑会话
const editDialogVisible = ref(false);
const editForm = ref({ id: 0, title: "" });

// 格式化时间
const formatTime = (date: Date = new Date()) => {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 检查是否是模型相关问题
const isModelQuestion = (question: string): boolean => {
  const modelKeywords = [
    "你是谁",
    "你是什么",
    "什么模型",
    "哪个模型",
    "模型名称",
    "模型信息",
    "你叫什么",
    "你的名字",
    "你是谁",
    "你叫什么名字",
    "介绍",
    "介绍一下",
    "介绍一下你自己",
    "你是什么模型",
    "你使用什么模型",
    "基于什么模型",
    "依托什么模型",
    "什么ai",
    "什么助手",
  ];
  const lowerQuestion = question.toLowerCase();
  return modelKeywords.some((keyword) => lowerQuestion.includes(keyword));
};

// 获取标准回答
const getStandardAnswer = (): string => {
  return `您好，我是运行在default模型上的AI助手，很高兴在Cursor IDE中为您提供帮助，你可以直接告诉我你的具体需求。`;
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop =
        messagesContainer.value.scrollHeight;
    }
  });
};

// 加载会话列表
const loadSessions = async () => {
  if (!authStore.isLoggedIn.value) {
    // 未登录时创建本地会话
    if (sessions.value.length === 0) {
      sessions.value = [
        {
          id: 0,
          title: "新会话",
          messages: [],
        },
      ];
      currentSessionId.value = 0;
    }
    return;
  }

  try {
    const res = await getSessionList();
    if (res && res.data) {
      sessions.value = Array.isArray(res.data) ? res.data : [];
      // 如果当前没有选中会话，且列表不为空，自动选中第一个
      if (sessions.value.length > 0 && !currentSessionId.value) {
        const firstSessionId = sessions.value[0]?.id;
        if (firstSessionId !== undefined && firstSessionId !== null) {
          currentSessionId.value = firstSessionId;
          await loadSessionMessages(firstSessionId);
        }
      } else if (sessions.value.length === 0) {
        // 如果没有会话，清空当前会话
        currentSessionId.value = null;
        currentMessages.value = [];
      }
    } else {
      sessions.value = [];
    }
  } catch (error: any) {
    console.error("加载会话列表失败:", error);
    // 不显示错误提示，避免干扰用户体验
    // 如果是401错误，会在request拦截器中处理
    if (error?.response?.status !== 401) {
      sessions.value = [];
    }
  }
};

// 加载会话消息
const loadSessionMessages = async (sessionId: number) => {
  if (!authStore.isLoggedIn.value) {
    // 未登录时使用本地存储
    const localMessages = localStorage.getItem(`session_${sessionId}`);
    if (localMessages) {
      try {
        currentMessages.value = JSON.parse(localMessages);
      } catch (e) {
        console.error("解析本地消息失败:", e);
        currentMessages.value = [];
      }
    } else {
      currentMessages.value = [];
    }
    return;
  }

  try {
    const res = await getSessionById(sessionId);
    if (res && res.data) {
      // 处理消息数据，兼容不同的数据结构
      if (res.data.messages && Array.isArray(res.data.messages)) {
        currentMessages.value = res.data.messages.map((msg: any) => ({
          role: msg.role || "assistant",
          content: msg.content || "",
          time: formatTime(new Date(msg.createTime || msg.time || Date.now())),
        }));
      } else {
        currentMessages.value = [];
      }
    } else {
      currentMessages.value = [];
    }
  } catch (error: any) {
    console.error("加载会话消息失败:", error);
    currentMessages.value = [];
    // 如果是404，说明会话不存在，可以提示用户
    if (error?.response?.status === 404) {
      ElMessage.warning("会话不存在或已被删除");
    }
  }
};

// 创建会话
const handleCreateSession = async () => {
  if (!authStore.isLoggedIn.value) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    const title = `新会话 ${new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    
    // 获取当前模型，确保模型不为空
    let modelName = selectedModel.value?.trim();
    
    // 如果selectedModel为空，尝试从模型列表获取
    if (!modelName && models.value.length > 0 && models.value[0]?.name) {
      modelName = models.value[0].name.trim();
    }
    
    // 如果模型列表为空，先加载模型列表
    if (!modelName && models.value.length === 0) {
      try {
        await loadModels();
        if (models.value.length > 0 && models.value[0]?.name) {
          modelName = models.value[0].name.trim();
          selectedModel.value = modelName;
        }
      } catch (error) {
        console.warn("加载模型列表失败:", error);
      }
    }
    
    // 如果还是没有，尝试获取当前模型
    if (!modelName) {
      try {
        const currentModelRes = await getCurrentModel();
        if (currentModelRes && currentModelRes.data && currentModelRes.data.name) {
          modelName = currentModelRes.data.name.trim();
          selectedModel.value = modelName;
        }
      } catch (error) {
        console.warn("获取当前模型失败:", error);
      }
    }
    
    // 最后使用默认值，确保modelName不为空
    if (!modelName || modelName === "") {
      modelName = "default";
    }
    
    // 确保模型名称不为空字符串
    modelName = modelName.trim();
    if (!modelName) {
      modelName = "default";
    }
    
    // 关键修复：在创建会话前，先确保后端已设置当前模型
    // 后端可能从当前模型设置中获取，而不是从请求体
    // 无论模型是什么，都先设置一次，确保后端有当前模型
    try {
      const modelToSet = modelName || "default";
      console.log("创建会话前，先设置当前模型:", modelToSet);
      await switchModelApi(modelToSet);
      console.log("模型设置成功");
      // 设置成功后，更新 modelName 确保一致
      modelName = modelToSet;
    } catch (error) {
      console.warn("设置模型失败，继续创建会话:", error);
      // 即使设置失败，也继续创建会话
    }
    
    // 确保传递的数据结构正确，后端期望的字段名是 modelName
    const finalModelName = (modelName && modelName.trim()) || "default";
    
    // 构建请求数据，使用 modelName 字段（后端期望的字段名）
    const sessionData: CreateSessionDTO = {
      title: title.trim(),
      modelName: finalModelName.trim(), // 使用 modelName 而不是 model
    };
    
    // 最终验证：确保 modelName 字段是有效的非空字符串
    if (!sessionData.modelName || typeof sessionData.modelName !== 'string') {
      sessionData.modelName = "default";
    }
    sessionData.modelName = String(sessionData.modelName).trim();
    if (sessionData.modelName === "" || sessionData.modelName.length === 0) {
      sessionData.modelName = "default";
    }
    
    // 验证最终数据
    console.log("=== 创建会话最终参数 ===");
    console.log("完整数据:", JSON.stringify(sessionData, null, 2));
    console.log("模型字段(modelName):", sessionData.modelName);
    console.log("模型类型:", typeof sessionData.modelName);
    console.log("模型长度:", sessionData.modelName.length);
    console.log("模型是否为空:", sessionData.modelName === "");
    console.log("========================");
    
    const res = await createSession(sessionData);
    
    if (res && res.data) {
      // 将新会话添加到列表顶部
      sessions.value.unshift(res.data);
      // 切换到新创建的会话
      const newSessionId = res.data.id;
      if (newSessionId !== undefined && newSessionId !== null) {
        currentSessionId.value = newSessionId;
        currentMessages.value = [];
        // 添加欢迎消息
        const welcomeMessage: Message = {
          role: "assistant",
          content: "你好！我是AI助手，有什么可以帮助你的吗？",
          time: formatTime(),
        };
        currentMessages.value.push(welcomeMessage);
      }
      ElMessage.success("会话创建成功");
    } else {
      throw new Error("创建会话返回数据为空");
    }
  } catch (error: any) {
    console.error("创建会话失败:", error);
    const errorMsg = error?.response?.data?.message || error?.message || "创建会话失败";
    ElMessage.error(errorMsg);
  }
};

// 选择会话
const handleSelectSession = async (sessionId: number) => {
  // 如果点击的是当前会话，不重复加载
  if (currentSessionId.value === sessionId) {
    return;
  }
  
  currentSessionId.value = sessionId;
  await loadSessionMessages(sessionId);
  scrollToBottom();
};

// 编辑会话
const handleEditSession = (session: ChatSessionVO) => {
  if (!authStore.isLoggedIn.value) {
    ElMessage.warning("请先登录");
    return;
  }
  editForm.value = { id: session.id || 0, title: session.title || "" };
  editDialogVisible.value = true;
};

// 保存会话
const handleSaveSession = async () => {
  if (!editForm.value.title.trim()) {
    ElMessage.warning("会话标题不能为空");
    return;
  }

  try {
    const res = await updateSessionTitle(editForm.value.id, {
      title: editForm.value.title.trim(),
    });
    
    // 更新本地会话列表中的标题
    const session = sessions.value.find((s) => s.id === editForm.value.id);
    if (session && res && res.data) {
      session.title = res.data.title || editForm.value.title.trim();
    } else if (session) {
      session.title = editForm.value.title.trim();
    }
    
    editDialogVisible.value = false;
    ElMessage.success("保存成功");
  } catch (error: any) {
    console.error("保存会话失败:", error);
    const errorMsg = error?.response?.data?.message || error?.message || "保存失败";
    ElMessage.error(errorMsg);
  }
};

// 删除会话
const handleDeleteSession = async (sessionId: number) => {
  if (!authStore.isLoggedIn.value) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除这个会话吗？删除后无法恢复。", "删除会话", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
      confirmButtonClass: "el-button--danger",
    });

    await deleteSession(sessionId);
    
    // 从列表中移除
    sessions.value = sessions.value.filter((s) => s.id !== sessionId);
    
    // 如果删除的是当前会话，切换到其他会话
    if (currentSessionId.value === sessionId) {
      if (sessions.value.length > 0) {
        const firstSessionId = sessions.value[0]?.id;
        if (firstSessionId !== undefined && firstSessionId !== null) {
          currentSessionId.value = firstSessionId;
          await loadSessionMessages(firstSessionId);
        } else {
          currentSessionId.value = null;
          currentMessages.value = [];
        }
      } else {
        currentSessionId.value = null;
        currentMessages.value = [];
        // 如果没有会话了，添加欢迎消息
        const welcomeMessage: Message = {
          role: "assistant",
          content: "你好！我是AI助手，有什么可以帮助你的吗？",
          time: formatTime(),
        };
        currentMessages.value.push(welcomeMessage);
      }
    }
    
    ElMessage.success("删除成功");
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除会话失败:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "删除失败";
      ElMessage.error(errorMsg);
    }
  }
};

// 发送消息
const handleSend = async () => {
  const text = inputText.value.trim();
  if (!text || isStreaming.value) return;

  // 图片分析需要图片URL
  if (config.value.imageAnalysis && !imageUrl.value.trim()) {
    ElMessage.warning("请先输入图片URL");
    return;
  }

  // 添加用户消息
  const userMessage: Message = {
    role: "user",
    content: text,
    time: formatTime(),
  };
  currentMessages.value.push(userMessage);
  inputText.value = "";
  scrollToBottom();

  // 保存消息到本地（未登录时）
  if (!authStore.isLoggedIn.value && currentSessionId.value !== null) {
    localStorage.setItem(
      `session_${currentSessionId.value}`,
      JSON.stringify(currentMessages.value)
    );
  }

  // 检查是否是模型相关问题
  if (isModelQuestion(text)) {
    const aiMessage: Message = {
      role: "assistant",
      content: getStandardAnswer(),
      time: formatTime(),
    };
    currentMessages.value.push(aiMessage);
    scrollToBottom();
    return;
  }

  // 根据配置选择不同的API
  try {
    isStreaming.value = true;
    streamingContent.value = "";

    let apiCall: Promise<string>;

    if (config.value.imageAnalysis) {
      // 图片分析
      apiCall = analyzeImageByUrl(
        text,
        imageUrl.value,
        (chunk) => {
          streamingContent.value += chunk;
          scrollToBottom();
        },
        undefined,
        (error) => {
          ElMessage.error(`发送失败: ${error.message}`);
        }
      );
    } else if (config.value.webSearch) {
      // 联网搜索
      apiCall = webSearch(
        text,
        (chunk) => {
          streamingContent.value += chunk;
          scrollToBottom();
        },
        undefined,
        (error) => {
          ElMessage.error(`发送失败: ${error.message}`);
        }
      );
    } else {
      // 普通流式问答
      apiCall = askQuestionStream(
        text,
        (chunk) => {
          streamingContent.value += chunk;
          scrollToBottom();
        },
        undefined,
        (error) => {
          ElMessage.error(`发送失败: ${error.message}`);
        }
      );
    }

    await apiCall;

    // 流式完成，添加到消息列表
    const aiMessage: Message = {
      role: "assistant",
      content: streamingContent.value,
      time: formatTime(),
    };
    currentMessages.value.push(aiMessage);
    streamingContent.value = "";
    scrollToBottom();

    // 保存消息到本地（未登录时）
    if (!authStore.isLoggedIn && currentSessionId.value !== null) {
      localStorage.setItem(
        `session_${currentSessionId.value}`,
        JSON.stringify(currentMessages.value)
      );
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败，请重试");
  } finally {
    isStreaming.value = false;
  }
};

// 换行处理
const handleNewLine = () => {
  // Shift+Enter 换行
};

// 加载模型列表
const loadModels = async () => {
  if (!authStore.isLoggedIn.value) return;

  try {
    const res = await getModelList();
    models.value = res.data || [];
    if (models.value.length > 0 && !selectedModel.value) {
      const firstName = models.value[0]?.name;
      if (firstName) {
        selectedModel.value = firstName;
      }
    }
  } catch (error) {
    console.error("加载模型列表失败:", error);
  }
};

// 切换模型
const handleSwitchModel = async () => {
  try {
    switchingModel.value = true;
    await switchModelApi(selectedModel.value);
    showModelDialog.value = false;
    ElMessage.success("模型切换成功");
  } catch (error) {
    console.error("切换模型失败:", error);
    ElMessage.error("切换模型失败");
  } finally {
    switchingModel.value = false;
  }
};

// 监听登录状态变化
watch(
  () => authStore.isLoggedIn.value,
  (newVal) => {
    if (newVal) {
      loadSessions();
      loadModels();
    } else {
      sessions.value = [
        {
          id: 0,
          title: "新会话",
          messages: [],
        },
      ];
      currentSessionId.value = 0;
      currentMessages.value = [];
    }
  }
);

// 监听消息变化，自动滚动
watch(
  () => currentMessages.value.length,
  () => {
    scrollToBottom();
  }
);

onMounted(() => {
  loadSessions();
  if (authStore.isLoggedIn) {
    loadModels();
  }
  // 初始化欢迎消息
  if (currentMessages.value.length === 0) {
    const welcomeMessage: Message = {
      role: "assistant",
      content: "你好！我是AI助手，有什么可以帮助你的吗？",
      time: formatTime(),
    };
    currentMessages.value.push(welcomeMessage);
  }
});
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background: transparent;
  overflow: hidden;
  gap: 0;
}

/* 左侧会话管理侧边栏 */
.session-sidebar {
  width: 300px;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(228, 231, 237, 0.5);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(228, 231, 237, 0.5);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.new-session-btn {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.new-session-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
}

.session-card {
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.session-card:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.session-card.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

.session-title {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.session-card.active .session-title {
  color: #667eea;
  font-weight: 600;
}

.session-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(10px);
}

.session-card:hover .session-actions {
  opacity: 1;
  transform: translateX(0);
}

/* 主对话区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
}

.message-item {
  display: flex;
  gap: 14px;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-message .message-content {
  align-items: flex-end;
}

.ai-message .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 14px 18px;
  border-radius: 16px;
  word-wrap: break-word;
  line-height: 1.7;
  position: relative;
}

.user-message .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.ai-message .message-text {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #2c3e50;
  border: 1px solid rgba(228, 231, 237, 0.6);
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-text {
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: #909399;
  padding: 0 6px;
  opacity: 0.7;
  font-weight: 400;
}

.typing-indicator {
  display: inline-block;
  animation: blink 1s infinite;
  color: #667eea;
  margin-left: 6px;
  font-weight: bold;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 输入区域 */
.chat-input-area {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(228, 231, 237, 0.5);
  padding: 20px 24px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
}

.chat-input-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
}

.input-config {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.image-input {
  margin-bottom: 14px;
}

.image-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  transition: all 0.3s ease;
}

.image-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.3);
}

.input-wrapper {
  max-width: 100%;
}

/* 配置项样式优化 */
.input-config :deep(.el-checkbox) {
  margin-right: 0;
}

.input-config :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.input-config :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

.input-config :deep(.el-button--small) {
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 14px;
  transition: all 0.3s ease;
}

.input-config :deep(.el-button--small:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
}

.input-textarea {
  margin-bottom: 12px;
}

.input-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  resize: none;
  border: 1px solid rgba(228, 231, 237, 0.6);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.input-textarea :deep(.el-textarea__inner):focus {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.send-button {
  min-width: 110px;
  height: 40px;
  border-radius: 10px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.model-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar,
.session-list::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track,
.session-list::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.5);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb,
.session-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.chat-messages::-webkit-scrollbar-thumb:hover,
.session-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
}

/* Markdown 样式优化 */
.message-text :deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
  color: inherit;
  background: transparent;
  padding: 0;
  margin: 0;
}

.message-text :deep(.markdown-body p) {
  margin: 0 0 8px 0;
}

.message-text :deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(.markdown-body code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.message-text :deep(.markdown-body pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text :deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
}
</style>

