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
import { ref, nextTick, onMounted, watch, computed } from "vue";
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
import { getModelList, switchModel as switchModelApi } from "../api/model";
import { useAuthStore } from "../stores/auth";
import type { Message } from "../types/chat";
import type { ChatSessionVO, AIModelVO } from "../types";

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
  ];
  const lowerQuestion = question.toLowerCase();
  return modelKeywords.some((keyword) => lowerQuestion.includes(keyword));
};

// 获取标准回答
const getStandardAnswer = (): string => {
  return `我是由default模型支持的智能助手，专为Cursor IDE设计，可以帮您解决各类编程难题，请告诉我你需要什么帮助？`;
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
    sessions.value = res.data || [];
    if (sessions.value.length > 0 && !currentSessionId.value) {
      currentSessionId.value = sessions.value[0].id || null;
      loadSessionMessages(currentSessionId.value!);
    }
  } catch (error) {
    console.error("加载会话列表失败:", error);
  }
};

// 加载会话消息
const loadSessionMessages = async (sessionId: number) => {
  if (!authStore.isLoggedIn.value) {
    // 未登录时使用本地存储
    const localMessages = localStorage.getItem(`session_${sessionId}`);
    if (localMessages) {
      currentMessages.value = JSON.parse(localMessages);
    } else {
      currentMessages.value = [];
    }
    return;
  }

  try {
    const res = await getSessionById(sessionId);
    if (res.data?.messages) {
      currentMessages.value = res.data.messages.map((msg: any) => ({
        role: msg.role || "assistant",
        content: msg.content || "",
        time: formatTime(new Date(msg.createTime || Date.now())),
      }));
    } else {
      currentMessages.value = [];
    }
  } catch (error) {
    console.error("加载会话消息失败:", error);
    currentMessages.value = [];
  }
};

// 创建会话
const handleCreateSession = async () => {
  if (!authStore.isLoggedIn.value) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    const res = await createSession({
      title: `新会话 ${new Date().toLocaleString()}`,
    });
    sessions.value.unshift(res.data);
    currentSessionId.value = res.data.id || null;
    currentMessages.value = [];
    ElMessage.success("会话创建成功");
  } catch (error) {
    console.error("创建会话失败:", error);
    ElMessage.error("创建会话失败");
  }
};

// 选择会话
const handleSelectSession = (sessionId: number) => {
  currentSessionId.value = sessionId;
  loadSessionMessages(sessionId);
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
  try {
    await updateSessionTitle(editForm.value.id, {
      title: editForm.value.title,
    });
    const session = sessions.value.find((s) => s.id === editForm.value.id);
    if (session) {
      session.title = editForm.value.title;
    }
    editDialogVisible.value = false;
    ElMessage.success("保存成功");
  } catch (error) {
    console.error("保存会话失败:", error);
    ElMessage.error("保存失败");
  }
};

// 删除会话
const handleDeleteSession = async (sessionId: number) => {
  if (!authStore.isLoggedIn.value) {
    ElMessage.warning("请先登录");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除这个会话吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteSession(sessionId);
    sessions.value = sessions.value.filter((s) => s.id !== sessionId);
    if (currentSessionId.value === sessionId) {
      if (sessions.value.length > 0) {
        currentSessionId.value = sessions.value[0].id || null;
        loadSessionMessages(currentSessionId.value!);
      } else {
        currentSessionId.value = null;
        currentMessages.value = [];
      }
    }
    ElMessage.success("删除成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除会话失败:", error);
      ElMessage.error("删除失败");
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
      selectedModel.value = models.value[0].name;
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
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 左侧会话管理侧边栏 */
.session-sidebar {
  width: 280px;
  min-width: 280px;
  background-color: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.new-session-btn {
  width: 100%;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-card {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-card:hover {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.session-card.active {
  background-color: #e6f4ff;
  border-color: #409eff;
}

.session-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.session-card:hover .session-actions {
  opacity: 1;
}

/* 主对话区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  gap: 6px;
}

.user-message .message-content {
  align-items: flex-end;
}

.ai-message .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
  line-height: 1.6;
}

.user-message .message-text {
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-text {
  background-color: white;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.user-text {
  white-space: pre-wrap;
}

.message-time {
  font-size: 12px;
  color: #909399;
  padding: 0 4px;
}

.typing-indicator {
  display: inline-block;
  animation: blink 1s infinite;
  color: #409eff;
  margin-left: 4px;
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
  background-color: white;
  border-top: 1px solid #e4e7ed;
  padding: 16px 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.input-config {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.image-input {
  margin-bottom: 12px;
}

.input-wrapper {
  max-width: 100%;
}

.input-textarea {
  margin-bottom: 12px;
}

.input-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.send-button {
  min-width: 100px;
}

.model-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar,
.session-list::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track,
.session-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb,
.session-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover,
.session-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
