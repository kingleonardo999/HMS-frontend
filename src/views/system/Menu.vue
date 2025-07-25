<template>
  <div class="menu">
    <div class="search">
      <span>菜品类型：</span>
      <el-select v-model="typeId" placeholder="菜品类型" style="width: 150px" size="small" @change="handleSearch">
        <el-option
          v-for="type in menuTypeList"
          :key="type.id"
          :label="type.type"
          :value="type.id"
        />
      </el-select>
      <el-button style="margin-left: 10px;" @click="resetSearch" type="success" size="small">重置</el-button>
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>

    <!-- 菜品卡片网格 -->
    <div class="menu-grid" v-loading="loading" :style="{ minHeight: gridMinHeight }">
      <div 
        v-for="item in showList" 
        :key="item.id" 
        class="menu-card"
      >
        <div class="menu-image">
          <img 
            :src="getDisplayImageUrl(item.img)" 
            :alt="item.name"
            @error="handleImageError"
          />
        </div>
        <div class="menu-info">
          <div class="menu-name-price">
            <div class="menu-name" :title="item.name">{{ item.name }}</div>
            <div class="menu-price">¥{{ item.price }}</div>
          </div>
        </div>
        <div class="menu-actions">
          <el-button size="small" @click="handleEdit(item)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(item)">
            删除
          </el-button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="showList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无菜品数据" />
      </div>
    </div>

    <el-pagination 
      style="margin-top: 16px;" 
      small 
      background 
      layout="prev, pager, next" 
      :total="total" 
      :page-size="pageSize"
      v-model:current-page="pageIndex" 
      @current-change="handlePageChange"
      v-if="total > 0"
    />

    <!-- 添加/编辑菜品组件 -->
    <EditMenu ref="editRef" @sync-list="getMenuData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { $list, $delete, $menuType } from '../../api/menu'
import { processImageUrlSync } from '../../utils/file'
import EditMenu from '../../components/system/EditMenu.vue'

// 列表显示的菜品数据结构（来自后端）
interface MenuListItem {
  id: number
  name: string
  price: number
  img: string
}

interface MenuType {
  id: number
  type: string
}

const typeId = ref<number>()

// 响应式数据
const loading = ref(false)
const showList = ref<MenuListItem[]>([])
const menuTypeList = ref<MenuType[]>([])

// 分页数据
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)

// 编辑组件引用
const editRef = ref()

// 处理图片URL显示
const getDisplayImageUrl = processImageUrlSync

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder-image.jpg' // 可以设置一个默认图片
}

// 计算网格最小高度
const gridMinHeight = computed(() => {
  if (showList.value.length === 0) {
    return '240px' // 空状态时的高度
  }
  
  // 计算需要的行数
  const rows = Math.ceil(showList.value.length / 5)
  const cardHeight = 240 // 卡片高度
  const gap = 16 // 间隙
  
  // 计算总高度：行数 * 卡片高度 + (行数-1) * 间隙
  const totalHeight = rows * cardHeight + (rows - 1) * gap
  return `${totalHeight}px`
})

// 获取菜品列表
const getMenuData = async () => {
  try {
    loading.value = true
    
    const result = await $list({
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
      typeId: typeId.value
    })
    if (result.success) {
      showList.value = result.data || []
      total.value = result.total || 0
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
  typeId.value = undefined
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
  editRef.value.initFormData(menuTypeList.value)
}

// 编辑菜品
const handleEdit = async (row: MenuListItem) => {
  editRef.value.initFormData(menuTypeList.value, row)
}

// 删除菜品
const handleDelete = async (row: MenuListItem) => {
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

/* 菜品网格样式 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin: 20px 16px;
  min-height: auto; /* 改为auto，根据内容自适应 */
}

.menu-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background: #fff;
  height: 240px; /* 固定高度，确保两行能完全显示 */
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.menu-image {
  width: 100%;
  height: 160px; /* 增加图片高度，给图片更多空间 */
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
    border-radius: 7px 7px 0 0; /* 图片圆角与外边框一致 */
  }
  
  &:hover img {
    transform: scale(1.05);
  }
}

.menu-info {
  padding: 10px 12px; /* 稍微增加内边距 */
  flex: 1; /* 自动占用剩余空间 */
  
  .menu-name-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .menu-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      margin-right: 8px;
    }
    
    .menu-price {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;
      white-space: nowrap;
    }
  }
}

.menu-actions {
  padding: 8px 12px; /* 保持按钮区域紧凑 */
  display: flex;
  gap: 8px;
  
  .el-button {
    flex: 1;
    font-size: 12px; /* 减小按钮字体 */
    padding: 4px 8px; /* 减小按钮内边距 */
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px; /* 与卡片高度一致 */
}

.el-pagination {
  margin-left: 10px;
}
</style>