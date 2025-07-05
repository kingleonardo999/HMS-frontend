<template>
  <div class="roomtype">
    <div class="search">
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="showList" style="width: 100%">
    <el-table-column prop="roomTypeId" label="编号" width="100" />
    <el-table-column prop="roomTypeName" label="房型" width="150"/>
    <el-table-column prop="roomTypePrice" label="价格" width="100"/>
    <el-table-column prop="bedNum" label="床位" width="100"/>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.row.roomTypeId)">
          编辑
        </el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.row.roomTypeId)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" 
  :total="list.length" v-model:current-page="pageIndex" />
  <EditRoomType ref="editRef" @sync-list="loadList"></EditRoomType>
  </div>
</template>

<script setup lang="ts">
import { $list, $delete, $getDetail } from '../../api/roomType';
import { computed, onMounted, ref } from 'vue';
import EditRoomType from '../../components/room/EditRoomType.vue';
import { ElMessage, ElMessageBox } from 'element-plus';


interface RoomType {
  roomTypeId: number;
  roomTypeName: string;
  roomTypePrice: number;
  typeDescription: string;
  bedNum: number;
}

let list = ref<RoomType[]>([]); // 房型列表
let pageIndex = ref<number>(1); // 当前页码
let pageSize = 10; // 每页条数

let showList = computed(() => {
  return list.value.slice((pageIndex.value - 1) * pageSize, pageIndex.value * pageSize);
});

// 获取房型列表
const loadList = async () => {
  let ret = await $list();
  if (ret.success) {
    list.value = ret.data;
  }
};

// 添加房型
const handleAdd = () => {
  editRef.value.initFormData(); // 初始化 formData 为空
  editRef.value.drawer = true;
};

// 编辑房型
const handleEdit = async (roomTypeId: number) => {
  let ret = await $getDetail({roomTypeId: roomTypeId});
  if (ret.success) {
    editRef.value.initFormData(ret.data); // 使用初始化方法设置 formData
    editRef.value.drawer = true;
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
};

// 删除房型
const handleDelete = (roomTypeId: number) => {
  ElMessageBox.confirm(
    '确定删除该房型吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      // 确定删除，调用接口
      let ret = await $delete({'roomTypeId': roomTypeId});
      if (ret.success) {
        ElMessage({
          type: 'success',
          message: ret.message,
        });
        // 重新加载房型列表
        loadList();
      } else {
        ElMessage({
          type: 'error',
          message: ret.message,
        });
      }
    })
    .catch(() => {
      // 取消退出，不做任何操作
    });
};

// 定义编辑组件ref
let editRef = ref();

onMounted(() => {
  loadList();
});
</script>

<style lang="scss" scoped>
.search {
  margin-top: 5px;
  margin-left: 5px;
}
</style>