<template>
  <div class="menu">
    <div class="search">
      <span>菜品类型：</span>
      <el-select v-model="searchForm.typeId" placeholder="菜品类型" style="width: 150px" size="small">
        <el-option
          v-for="type in menuTypeList"
          :key="type.id"
          :label="type.type"
          :value="type.id"
        />
      </el-select>
      <el-button style="margin-left: 10px;" @click="handleSearch" type="success" size="small">查询</el-button>
      <el-button style="margin-left: 10px;" @click="resetSearch" type="success" size="small">重置</el-button>
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>

    <el-table 
      :data="showList" 
      style="width: 100%" 
      v-loading="loading"
    >
      <el-table-column prop="name" label="菜品名称" width="200" />
      <el-table-column prop="typeName" label="菜品类型" width="120" />
      <el-table-column prop="price" label="价格" width="100" align="center">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="描述" min-width="200" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination 
      style="margin-top: 5px;" 
      small 
      background 
      layout="prev, pager, next" 
      :total="total" 
      v-model:current-page="pageIndex" 
      @current-change="handlePageChange"
      v-if="total > 0"
    />

    <!-- 添加/编辑菜品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜品' : '新增菜品'"
      width="750px"
      :before-close="handleDialogClose"
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
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { $list, $add, $update, $delete, $getDetail, $menuType } from '../../api/menu'
import { baseURL_dev } from '../../config/baseURL'
import { createUploadSuccessHandler, beforeUploadHandler, getUploadHeaders, processImageUrlSync } from '../../utils/file'

interface MenuData {
  id?: number
  name: string
  typeId: string
  price: number
  imgId?: number
  imgUrl?: string
  desc?: string
  typeName?: string
}

interface MenuType {
  id: number
  type: string
}

interface SearchForm {
  typeId: string
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const showList = ref<MenuData[]>([])
const menuTypeList = ref<MenuType[]>([])

// 图片上传相关
const imageUrl = ref('')

// 分页数据
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive<SearchForm>({
  typeId: ''
})

// 表单数据
const formData = reactive<MenuData>({
  name: '',
  typeId: '',
  price: 0,
  imgId: undefined,
  desc: ''
})

// 上传相关方法
const beforeUpload: UploadProps['beforeUpload'] = beforeUploadHandler

const uploadSuccess = createUploadSuccessHandler(reactive({ value: formData }), imageUrl)

const uploadHeaders = getUploadHeaders()

// 处理图片URL显示
const getDisplayImageUrl = processImageUrlSync

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' }
  ],
  typeId: [
    { required: true, message: '请选择菜品类型', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (value <= 0) {
          callback(new Error('价格必须是正数'))
        } else if (!Number.isInteger(value)) {
          callback(new Error('价格必须是整数'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 获取菜品列表
const getMenuData = async () => {
  try {
    loading.value = true
    const params = {
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
      ...(searchForm.typeId && { typeId: parseInt(searchForm.typeId) })
    }
    
    const result = await $list()
    if (result.success) {
      showList.value = result.data?.records || result.data || []
      total.value = result.data?.total || showList.value.length
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    ElMessage.error('获取菜品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取菜品类型列表
const getMenuTypeList = async () => {
  try {
    const result = await $menuType({})
    if (result.success) {
      menuTypeList.value = result.data || []
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('获取菜品类型失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pageIndex.value = 1
  getMenuData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.typeId = ''
  pageIndex.value = 1
  getMenuData()
}

// 分页处理
const handlePageChange = (page: number) => {
  pageIndex.value = page
  getMenuData()
}

// 添加菜品
const handleAdd = () => {
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 编辑菜品
const handleEdit = (row: MenuData) => {
  isEdit.value = true
  Object.assign(formData, row)
  
  // 处理图片URL显示
  if (row.imgId && row.imgUrl) {
    imageUrl.value = getDisplayImageUrl(row.imgUrl)
  } else {
    imageUrl.value = ''
  }
  
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 删除菜品
const handleDelete = async (row: MenuData) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除菜品 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await $delete({ id: row.id })
    if (result.success) {
      ElMessage.success('删除成功')
      getMenuData()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    name: '',
    typeId: '',
    price: 0,
    imgId: undefined,
    desc: ''
  })
  imageUrl.value = ''
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  resetFormData()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    let result
    if (isEdit.value) {
      // POST /menu/update
      result = await $update(formData)
    } else {
      // POST /menu/add
      result = await $add(formData)
    }

    if (result.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      getMenuData()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  getMenuData()
  getMenuTypeList()
})
</script>

<style lang="scss" scoped>
.search {
  margin-top: 5px;
  margin-left: 5px;

  span {
    font-size: 14px;
    font: "Noto Sans SC";
    color: #909399;
    margin-left: 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-section {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.upload-section-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
  }
}

.avatar-uploader-large {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 10px;

  &:hover {
    border-color: #409eff;
  }
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

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar-uploader-icon-large {
  font-size: 32px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
  line-height: 150px;
}

.avatar-uploader-icon-compact {
  font-size: 24px;
  color: #8c939d;
  width: 110px;
  height: 110px;
  text-align: center;
  line-height: 110px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
  border-radius: 4px;
}

.avatar-large {
  width: 150px;
  height: 150px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
}

.avatar-compact {
  width: 110px;
  height: 110px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
}

.upload-tips {
  flex: 1;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;

  p {
    margin: 0 0 5px 0;
    
    &:first-child {
      color: #606266;
      font-weight: 500;
    }
  }
}

.upload-tips-vertical {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  text-align: center;

  p {
    margin: 0 0 5px 0;
    
    &:first-child {
      color: #606266;
      font-weight: 500;
    }
  }
}

.upload-tips-compact {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  text-align: center;

  p {
    margin: 0 0 4px 0;
    
    &:first-child {
      color: #606266;
      font-weight: 500;
    }
  }
}
</style>