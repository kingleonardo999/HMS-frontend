<template>
  <el-drawer
    size="50%"
    v-model="drawer"
    :title="isEditing ? '修改房间' : '添加房间'"
    direction="rtl"
    :before-close="handleDrawerClose"
  >
    <el-form
      size="small"
      ref="formRef"
      :model="formData"
      status-icon
      :rules="rules"
      label-width="70px"
    >
      <el-form-item v-if="!isEditing" label="房号" prop="roomId">
        <el-input v-model="formData.roomId" />
      </el-form-item>
      <el-form-item label="类型" prop="roomTypeId">
        <el-select v-model="formData.roomTypeId" placeholder="请选择房间类型">
          <el-option
            v-for="item in roomTypeList"
            :key="item.roomTypeId"
            :label="item.roomTypeName"
            :value="item.roomTypeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="roomStatusId">
        <el-select v-model="formData.roomStatusId" placeholder="请选择房间状态">
            <el-option
            v-for="item in roomStatusListCreate"
            :key="item.statusId"
            :label="item.statusName"
            :value="item.statusId"
            />
        </el-select>
      </el-form-item>
      <el-form-item label="描述" prop="roomDescription">
          <div style="border: 1px solid #ddd;">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            mode="default"
          />
          <Editor
            v-if="showEditor"
            style="height: 330px; width: 100%;"
            v-model="formData.roomDescription"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
            @onDestroyed="handleDestroyed"
          />
          </div>
        </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">{{ isEditing ? '修改' : '添加' }}</el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref, onBeforeUnmount, shallowRef, nextTick } from 'vue';
import { $add, $update } from '../../api/room';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { createRichTextEditorConfig } from '../../utils/file';

const emit = defineEmits(['sync-list']);

// 富文本编辑器
const editorRef = shallowRef()
const showEditor = ref(true)
const editorConfig = createRichTextEditorConfig()

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

const handleDestroyed = () => {
  editorRef.value = null
}

// 抽屉变量
const drawer = ref(false);

// 是否处于编辑状态
const isEditing = ref(false);

// 空表单对象
const emptyForm = {
  roomId: undefined,
  roomTypeId: undefined,
  roomStatusId: undefined,
  roomDescription: '',
};

// 保存原始房间数据，用于"取消"操作时恢复
const originalRoomData = ref();

// 关闭抽屉处理
const handleDrawerClose = (done: () => void) => {
  // 销毁编辑器实例
  destroyEditor()
  // 清理表单数据
  cleanupForm()
  // 执行关闭
  done()
}

// 销毁编辑器
const destroyEditor = () => {
  if (editorRef.value) {
    try {
      editorRef.value.destroy()
    } catch (error) {
      console.warn('编辑器销毁失败:', error)
    }
    editorRef.value = null
  }
  // 重新创建编辑器
  showEditor.value = false
  nextTick(() => {
    showEditor.value = true
  })
}

// 清理表单
const cleanupForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.value = { ...emptyForm }
  originalRoomData.value = null
  isEditing.value = false
  drawer.value = false
}

// 关闭抽屉
const closeDrawer = () => {
  handleDrawerClose(() => {})
}

// 定义表单数据类型
interface EditRoom {
  roomId: number | undefined;
  roomTypeId: number | undefined;
  roomStatusId: number | undefined;
  roomDescription: string;
}

// 定义一个响应式对象，绑定表单数据
const formData = ref<EditRoom>({
  roomId: undefined,
  roomTypeId: undefined,
  roomStatusId: undefined,
  roomDescription: '',
});

// 定义一个ref对象，绑定表单
const formRef = ref<FormInstance>();

// 验证房间号，必须为数字，且非0开头的三位或四位数字
const roomIdRule = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入房间号'));
  } else if (!/^[1-9]\d{2,3}$/.test(value)) {
    callback(new Error('房间号必须为三位或四位数字，且不能以0开头'));
  } else {
    callback();
  }
};

// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  roomId: [{ required: true, validator: roomIdRule, trigger: 'blur' }],
  roomTypeId: [{ required: true, message: '请选择房间类型', trigger: 'blur' }],
  roomStatusId: [{ required: true, message: '请选择房间状态', trigger: 'blur' }],
});

// 定义房间类型
interface RoomType {
  roomTypeId: number;
  roomTypeName: string;
}

interface RoomStatus {
  statusId: number;
  statusName: string;
}

// 定义房间类型列表
const props = defineProps({
  roomTypeList: Array<RoomType>, // 通过 props 接收房间类型列表
  roomStatusList: Array<RoomStatus>, // 通过 props 接收房间状态列表
  roomStatusListCreate: Array<RoomStatus>, // 通过 props 接收房间状态列表
});
// 初始化表单数据
const initFormData = (data?: EditRoom) => {
  // 先销毁现有编辑器
  destroyEditor()
  
  if (data) {
    // 深拷贝一份数据，以便在取消时恢复
    originalRoomData.value = JSON.parse(JSON.stringify(data));
    formData.value = { ...data };
    isEditing.value = true; // 如果传入了数据，则设置为编辑模式
  } else {
    originalRoomData.value = { ...emptyForm };
    formData.value = { ...emptyForm };
    isEditing.value = false; // 如果没有传入数据，则设置为添加模式
  }
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      if (isEditing.value) {
        // 修改房间
        let ret = await $update(formData.value);
        if (ret.success) {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'success',
          });
          // 通知父组件更新列表
          emit('sync-list');
          // 关闭抽屉
          closeDrawer();
        } else {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'error',
          });
        }
      } else {
        let ret = await $add(formData.value);
        if (ret.success) {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'success',
          });
          // 通知父组件更新列表
          emit('sync-list');
          // 关闭抽屉
          closeDrawer();
        } else {
          ElNotification({
            title: '提示',
            message: ret.message,
            type: 'error',
          });
        }
      }
    }
  });
};

// 重置表单（取消按钮的处理逻辑）
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  
  if (isEditing.value && originalRoomData.value) {
    // 在编辑模式下，恢复原始数据
    formData.value = { ...originalRoomData.value };
  } else {
    // 在添加模式下，清空表单
    formData.value = { ...emptyForm };
  }
  
  // 重置编辑器内容
  if (editorRef.value) {
    if (isEditing.value && originalRoomData.value) {
      editorRef.value.setHtml(originalRoomData.value.roomDescription || '');
    } else {
      editorRef.value.setHtml('');
    }
  }
};

// 组件卸载前清理
onBeforeUnmount(() => {
  destroyEditor()
})

// 导出
defineExpose({
  drawer,
  initFormData,
});
</script>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>