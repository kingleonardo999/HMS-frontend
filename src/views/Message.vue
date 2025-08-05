<template>
  <div class="message">
    <div class="header">
      <h2>系统消息</h2>
      <el-button 
        v-if="isAdmin" 
        type="primary" 
        @click="handleAdd"
        :icon="Plus"
      >
        发布消息
      </el-button>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" v-loading="loading">
      <div 
        v-for="item in messageList" 
        :key="item.id" 
        class="message-item"
        @click="handleViewMessage(item)"
      >
        <div class="message-header">
          <div class="message-title">
            <el-icon class="message-icon"><Message /></el-icon>
            {{ item.title }}
          </div>
          <div class="message-actions">
            <span class="message-time">{{ formatTime(item.createAt) }}</span>
            <el-button 
              type="danger" 
              size="small" 
              @click.stop="handleDelete(item)"
              :icon="Delete"
            >
              删除
            </el-button>
          </div>
        </div>
        <div class="message-preview">
          {{ getPreviewContent(item.content) }}
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="messageList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无消息" />
      </div>
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentMessage?.title"
      width="600px"
    >
      <div class="message-detail">
        <div class="message-meta">
          <span class="publish-time">发布时间：{{ formatTime(currentMessage?.createAt) }}</span>
        </div>
        <div class="message-content">
          {{ currentMessage?.content }}
        </div>
      </div>
    </el-dialog>

    <!-- 添加消息对话框 -->
    <el-dialog
      v-model="addVisible"
      title="发布消息"
      width="600px"
      :before-close="handleAddClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="消息标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入消息标题"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            placeholder="请输入消息内容"
            :rows="6"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleAddClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            发布
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Delete, Message } from '@element-plus/icons-vue';
import { $list, $add, $delete } from '../api/message';
import useUserStore from '../store/user';

// 用户信息
const userStore = useUserStore();

// 判断是否为管理员
const isAdmin = computed(() => {
  return userStore.user?.roleName === 'admin'; // 根据角色名判断
});

// 消息数据类型
interface MessageItem {
  id: number;
  title: string;
  content: string;
  createAt: string;
}

// 表单数据类型
interface FormData {
  title: string;
  content: string;
}

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const messageList = ref<MessageItem[]>([]);
const detailVisible = ref(false);
const addVisible = ref(false);
const currentMessage = ref<MessageItem | null>(null);

// 表单数据
const formData = reactive<FormData>({
  title: '',
  content: ''
});

// 表单引用
const formRef = ref<FormInstance>();

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' }
  ]
};

// 获取消息列表
const getMessageList = async () => {
  loading.value = true;
  try {
    const result = await $list({});
    if (result.success) {
      messageList.value = result.data || [];
    } else {
      ElMessage.error(result.message || '获取消息列表失败');
    }
  } catch (error) {
    console.error('获取消息列表失败:', error);
    ElMessage.error('获取消息列表失败');
  } finally {
    loading.value = false;
  }
};

// 查看消息详情
const handleViewMessage = (item: MessageItem) => {
  currentMessage.value = item;
  detailVisible.value = true;
};

// 添加消息
const handleAdd = () => {
  resetForm();
  addVisible.value = true;
};

// 删除消息
const handleDelete = async (item: MessageItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除消息 "${item.title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const result = await $delete({ id: item.id });
    if (result.success) {
      ElMessage.success('删除成功');
      getMessageList(); // 重新获取列表
    } else {
      ElMessage.error(result.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    const result = await $add({
      loginId: userStore.user?.loginId || 'admin',
      title: formData.title,
      content: formData.content
    });

    if (result.success) {
      ElMessage.success('发布成功');
      addVisible.value = false;
      getMessageList(); // 重新获取列表
    } else {
      ElMessage.error(result.message || '发布失败');
    }
  } catch (error) {
    console.error('发布失败:', error);
    ElMessage.error('发布失败');
  } finally {
    submitLoading.value = false;
  }
};

// 关闭添加对话框
const handleAddClose = () => {
  addVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formData.title = '';
  formData.content = '';
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 格式化时间
const formatTime = (timeStr: string | undefined) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取内容预览
const getPreviewContent = (content: string) => {
  if (!content) return '';
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

// 页面加载时获取数据
onMounted(() => {
  getMessageList();
});
</script>

<style lang="scss" scoped>
.message {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    color: #303133;
    font-size: 18px;
  }
}

.message-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.message-item {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;

  .message-icon {
    margin-right: 8px;
    color: #409eff;
    font-size: 18px;
  }
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-preview {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-left: 26px; // 与图标对齐
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.message-detail {
  .message-meta {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;

    .publish-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .message-content {
    color: #303133;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  .message {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;

    h2 {
      text-align: center;
    }
  }

  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .message-actions {
    align-self: flex-end;
  }

  .message-preview {
    margin-left: 0;
  }
}
</style>