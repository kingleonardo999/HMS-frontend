<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑菜品' : '新增菜品'"
    width="750px"
    :before-close="closeDialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="menu-form"
    >
      <el-row :gutter="30">
        <!-- 左侧：菜品信息 -->
        <el-col :span="12">
          <el-form-item label="菜品名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入菜品名称"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="菜品类型" prop="typeId">
            <el-select v-model="formData.typeId" placeholder="请选择菜品类型" style="width: 100%">
              <el-option
                v-for="type in menuTypeList"
                :key="type.id"
                :label="type.type"
                :value="type.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="价格" prop="price">
            <el-input-number
              v-model="formData.price"
              :min="1"
              :precision="0"
              :step="1"
              placeholder="价格"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <!-- 右侧：菜品图片 -->
        <el-col :span="12">
          <el-form-item label="菜品图片" prop="imgId">
            <div class="upload-section-vertical">
              <el-upload
                class="avatar-uploader-compact"
                :action="baseURL_dev + '/uploads/img'"
                :show-file-list="false"
                :on-success="uploadSuccess"
                :before-upload="beforeUpload"
                :headers="uploadHeaders"
                accept="image/*"
              >
                <img v-if="imageUrl" :src="imageUrl" class="avatar-compact" />
                <div v-else class="avatar-uploader-icon-compact">
                  <el-icon><Plus /></el-icon>
                </div>
              </el-upload>
              <div class="upload-tips-compact">
                <p>点击选择图片</p>
                <p>支持 jpg、png</p>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 描述单独一行 -->
      <el-form-item label="描述" prop="desc">
        <el-input
          v-model="formData.desc"
          type="textarea"
          placeholder="请输入菜品描述"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import { ElMessage, type FormInstance, type FormRules, type UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { $add, $update, $getDetail } from '../../api/menu';
import { baseURL_dev } from '../../config/baseURL';
import { createUploadSuccessHandler, beforeUploadHandler, getUploadHeaders, processImageUrlSync } from '../../utils/file';

const emit = defineEmits(['sync-list']);

// 对话框可见性
const dialogVisible = ref(false);

// 是否处于编辑状态
const isEdit = ref(false);

// 加载状态
const submitLoading = ref(false);

// 菜单类型列表
const menuTypeList = ref<MenuType[]>([]);

// 定义菜品数据类型
interface MenuData {
  id?: number;
  name: string;
  typeId: string;
  price: number;
  imgId?: number;
  imgUrl?: string;
  desc?: string;
  typeName?: string;
}

// 列表显示的菜品数据结构（来自后端）
interface MenuListItem {
  id: number;
  name: string;
  price: number;
  img: string;
}

interface MenuType {
  id: number;
  type: string;
}

// 表单数据
const formData = reactive<MenuData>({
  name: '',
  typeId: '',
  price: 0,
  imgId: undefined,
  desc: ''
});

// 图片相关
const imageUrl = ref('');

// 表单引用
const formRef = ref<FormInstance>();

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' }
  ],
  typeId: [
    { required: true, message: '请选择菜品类型', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 1, message: '价格必须大于0', trigger: 'blur' }
  ]
};

// 空表单对象
const emptyForm: MenuData = {
  name: '',
  typeId: '',
  price: 0,
  imgId: undefined,
  desc: ''
};

// 保存原始数据，用于"取消"操作时恢复
const originalData = ref<MenuData | null>(null);

// 上传相关方法
const beforeUpload: UploadProps['beforeUpload'] = beforeUploadHandler;

const uploadSuccess = createUploadSuccessHandler(reactive({ value: formData }), imageUrl);

const uploadHeaders = getUploadHeaders();

// 处理图片URL显示
const getDisplayImageUrl = processImageUrlSync;

// 初始化表单数据
const initFormData = async (menuTypes: MenuType[], data?: MenuListItem | MenuData) => {
  menuTypeList.value = menuTypes;
  
  if (data) {
    // 编辑模式
    isEdit.value = true;
    
    // 如果是列表项数据，需要获取完整的菜品信息
    if ('img' in data && !('typeId' in data)) {
      try {
        const result = await $getDetail({ id: data.id });
        if (result.success && result.data) {
          const fullData = result.data;
          // 确保包含id字段
          fullData.id = data.id;
          originalData.value = JSON.parse(JSON.stringify(fullData));
          Object.assign(formData, fullData);
          
          // 处理图片URL显示 - 如果有img字段，使用img字段并处理URL
          if (data.img) {
            // 判断是否为完整URL
            if (data.img.startsWith('http://') || data.img.startsWith('https://')) {
              imageUrl.value = data.img;
            } else {
              // 如果不是完整URL，拼接baseURL
              imageUrl.value = baseURL_dev + '/' + data.img.replace(/^\//, '');
            }
          } else if (fullData.imgId && fullData.imgUrl) {
            imageUrl.value = getDisplayImageUrl(fullData.imgUrl);
          } else {
            imageUrl.value = '';
          }
        }
      } catch (error) {
        ElMessage.error('获取菜品详情失败');
        return;
      }
    } else {
      // 完整的菜品数据
      originalData.value = JSON.parse(JSON.stringify(data));
      Object.assign(formData, data);
      
      // 确保编辑时包含id字段
      if (data.id) {
        formData.id = data.id;
      }
      
      // 处理图片URL显示
      if ((data as MenuData).imgId && (data as MenuData).imgUrl) {
        imageUrl.value = getDisplayImageUrl((data as MenuData).imgUrl!);
      } else {
        imageUrl.value = '';
      }
    }
  } else {
    // 添加模式
    originalData.value = { ...emptyForm };
    Object.assign(formData, emptyForm);
    isEdit.value = false;
    imageUrl.value = '';
  }
  
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
  resetFormData();
};

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, emptyForm);
  originalData.value = null;
  isEdit.value = false;
  imageUrl.value = '';
  
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

// 取消按钮处理
const handleCancel = () => {
  if (isEdit.value && originalData.value) {
    // 在编辑模式下，恢复原始数据
    Object.assign(formData, originalData.value);
    
    // 恢复图片显示
    if (originalData.value.imgId && originalData.value.imgUrl) {
      imageUrl.value = getDisplayImageUrl(originalData.value.imgUrl);
    } else {
      imageUrl.value = '';
    }
  } else {
    // 在添加模式下，清空表单
    Object.assign(formData, emptyForm);
    imageUrl.value = '';
  }
  
  dialogVisible.value = false;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    let result;
    if (isEdit.value) {
      // 编辑模式：确保包含所有必要字段包括imgId
      const updateData = {
        id: formData.id,
        name: formData.name,
        typeId: formData.typeId,
        price: formData.price,
        imgId: formData.imgId, // 确保传递imgId
        desc: formData.desc
      };
      result = await $update(updateData);
    } else {
      result = await $add(formData);
    }

    if (result.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      // 通知父组件更新列表
      emit('sync-list');
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 导出方法供父组件调用
defineExpose({
  dialogVisible,
  initFormData,
});
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-section-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-uploader-compact {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 8px;

  &:hover {
    border-color: #409eff;
  }
}

.avatar-uploader-icon-compact {
  font-size: 24px;
  color: #8c939d;
  width: 110px;
  height: 110px;
  text-align: center;
  line-height: 110px;
}

.avatar-compact {
  width: 110px;
  height: 110px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
}

.upload-tips-compact {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  text-align: center;

  p {
    margin: 0 0 4px 0;
    
    &:first-child {
      font-weight: 500;
    }
  }
}
</style>
