<template>
  <el-drawer
    size="50%"
    v-model="drawer"
    :title="isEditing ? '修改房型' : '添加房型'"
    direction="rtl"
    :before-close="handleDrawerClose"
  >
  <el-form 
      size="small" 
      ref="formRef" 
      :model="formData" 
      status-icon 
      :rules="rules" 
      label-width="60px">
        <el-form-item label="房型" prop="roomTypeName">
          <el-input v-model="formData.roomTypeName" />
        </el-form-item>
        <el-form-item label="价格" prop="roomTypePrice">
          <el-input v-model="formData.roomTypePrice" />
        </el-form-item>
        <el-form-item label="床位" prop="bedNum">
          <el-input v-model="formData.bedNum" />
        </el-form-item>
        <el-form-item label="描述" prop="typeDescription">
          <div style="border: 1px solid #ddd;">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            mode="default"
          />
          <Editor
            v-if="showEditor"
            style="height: 330px; width: 100%;"
            v-model="formData.typeDescription"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
            @onDestroyed="handleDestroyed"
          />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(formRef)">{{isEditing ? '修改' : '添加'}}</el-button>
          <el-button @click="resetForm(formRef)">取消</el-button>
        </el-form-item>
      </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
// 引入组件
import { ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref, onBeforeUnmount, shallowRef, nextTick } from 'vue';
import { $add, $update } from '../../api/roomType';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { createRichTextEditorConfig } from '../../utils/file';

const emit = defineEmits(['sync-list'])

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
const drawer = ref(false)

// 是否处于编辑状态
const isEditing = ref(false);

// 空表单对象
const emptyForm = {
  roomTypeName: '',
  roomTypeId: undefined,
  roomTypePrice: undefined,
  bedNum: undefined,
  typeDescription: '',
};

// 保存原始房型数据，用于"取消"操作时恢复
const originalRoomTypeData = ref();

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
  originalRoomTypeData.value = null
  isEditing.value = false
  drawer.value = false
}

// 关闭抽屉
const closeDrawer = () => {
  handleDrawerClose(() => {})
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  
  if (isEditing.value && originalRoomTypeData.value) {
    // 在编辑模式下，恢复原始数据
    formData.value = { ...originalRoomTypeData.value };
  } else {
    // 在添加模式下，清空表单
    formData.value = { ...emptyForm };
  }
  
  // 重置编辑器内容
  if (editorRef.value) {
    if (isEditing.value && originalRoomTypeData.value) {
      editorRef.value.setHtml(originalRoomTypeData.value.typeDescription || '');
    } else {
      editorRef.value.setHtml('');
    }
  }
};

// 定义表单数据类型
interface RoomTypeFormData {
  roomTypeName: string;
  roomTypeId?: number;
  roomTypePrice?: number;
  bedNum?: number;
  typeDescription?: string;
}

// 定义一个响应式对象，绑定表单数据
const formData = ref<RoomTypeFormData>({
  roomTypeName: '',
  roomTypeId: undefined,
  roomTypePrice: undefined,
  bedNum: undefined,
  typeDescription: undefined,
})

// 定义一个ref对象，绑定表单
const formRef = ref<FormInstance>()

// 验证必须为非负数
const validateNonNegativeInteger = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入非负整数'))
  } else if (!/^\d+$/.test(value)) {
    callback(new Error('请输入非负整数'))
  } else {
    callback()
  }
}

// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  roomTypeName: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  roomTypePrice: [{ required: true, message: '请输入房型价格', trigger: 'blur' }, { validator: validateNonNegativeInteger, trigger: 'blur' }],
  bedNum: [{ required: true, message: '请输入床位数', trigger: 'blur' }, { validator: validateNonNegativeInteger, trigger: 'blur' }],
});

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditing.value) {
          // 修改房型
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
      } catch (error) {
        console.error('提交失败:', error)
        ElNotification({
          title: '提示',
          message: '操作失败，请重试',
          type: 'error',
        });
      }
    }
  });
};

// 初始化表单数据
const initFormData = (data?: RoomTypeFormData) => {
  // 先销毁现有编辑器
  destroyEditor()
  
  if (data) {
    // 深拷贝一份数据，以便在取消时恢复
    originalRoomTypeData.value = JSON.parse(JSON.stringify(data));
    formData.value = { ...data };
    isEditing.value = true;
  } else {
    originalRoomTypeData.value = { ...emptyForm };
    formData.value = { ...emptyForm };
    isEditing.value = false;
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
</style>