<template>
  <div class="room">
    <div class="search">
      <span>房型：</span>
      <el-select v-model="roomTypeId" placeholder="房型" style="width: 150px" size="small">
        <el-option v-for="item in roomTypeList_sql" :key="item.roomTypeId" :label="item.roomTypeName"
          :value="item.roomTypeId" />
      </el-select>
      <span style="margin-left: 10px;">状态：</span>
      <el-select v-model="roomStatusId" placeholder="状态" style="width: 150px;" size="small">
        <el-option v-for="item in roomStatusList_sql" :key="item.statusId" :label="item.statusName"
          :value="item.statusId" />
      </el-select>
      <el-button style="margin-left: 10px;" @click="loadList" type="success" size="small">查询</el-button>
      <el-button style="margin-left: 10px;" @click="export2xlsx" type="success" size="small">导出为Excel</el-button>
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="roomId" label="房号" width="100" />
      <el-table-column prop="roomTypeName" label="房型" width="150" />
      <el-table-column prop="roomTypePrice" label="价格" width="100" />
      <el-table-column prop="bedNum" label="床位" width="100" />
      <el-table-column prop="roomStatusName" label="状态" width="100" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row.roomId)">
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.roomId)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" 
    :total="total" v-model:current-page="pageIndex" @current-change="loadList" />
    <EditRoom ref="editRef" @sync-list="loadList" :roomTypeList="roomTypeList" :roomStatusList="roomStatusList"
      :roomStatusListCreate="roomStatusListCreate">
    </EditRoom>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { $list, $delete, $getDetail, $statusList } from '../../api/room';
import { $list as $listRoomType } from '../../api/roomType';
import { ElMessage, ElMessageBox } from 'element-plus';
import EditRoom from '../../components/room/EditRoom.vue';
import { exportObjectsToExcel } from '../../utils/xlsx';

// 导出为Excel
const export2xlsx = async () => {
  try {
    let exportData: Room[] = [];
    let ret = await $list({
      pageIndex: 1,
      pageSize: total.value, // 使用总数量作为pageSize
      roomTypeId: roomTypeId.value,
      roomStatusId: roomStatusId.value
    });

    if (ret.success) {
      exportData = ret.data;
    } else {
      ElMessage({
        type: 'error',
        message: ret.message,
      });
      return;
    }

    if (exportData.length > 0) {
      // 动态生成表头配置 - 基于表格列定义，增加描述字段
      const headers = [
        { key: 'roomId', label: '房号' },
        { key: 'roomTypeName', label: '房型' },
        { key: 'roomTypePrice', label: '价格' },
        { key: 'bedNum', label: '床位' },
        { key: 'roomStatusName', label: '状态' },
        { key: 'roomDescription', label: '描述' },
      ];

      // 动态转换数据格式 - 扁平化嵌套对象
      const data = exportData.map((item: Room) => {
        const flattenedItem: Record<string, any> = {};

        // 处理基础字段
        flattenedItem.roomId = item.roomId;
        flattenedItem.roomStatusName = item.roomStatusName;
        flattenedItem.roomTypeId = item.roomTypeId;
        flattenedItem.roomTypeName = item.roomTypeName;
        flattenedItem.roomTypePrice = item.roomTypePrice;
        flattenedItem.bedNum = item.bedNum;
        flattenedItem.roomDescription = item.roomDescription;

        return flattenedItem;
      });

      // 生成文件名 - 包含筛选条件
      let fileName = '房间列表';
      const filterConditions: string[] = [];

      if (roomTypeId.value !== 0) {
        const selectedRoomType = roomTypeList_sql.value.find(item => item.roomTypeId === roomTypeId.value);
        if (selectedRoomType) {
          filterConditions.push(`${selectedRoomType.roomTypeName}`);
        }
      }

      if (roomStatusId.value !== 0) {
        const selectedRoomStatus = roomStatusList_sql.value.find(item => item.statusId === roomStatusId.value);
        if (selectedRoomStatus) {
          filterConditions.push(`${selectedRoomStatus.statusName}`);
        }
      }

      if (filterConditions.length > 0) {
        fileName += `_${filterConditions.join('_')}`;
      }

      // 导出Excel
      exportObjectsToExcel(headers, data, fileName);

      ElMessage({
        type: 'success',
        message: `成功导出 ${data.length} 条房间数据`,
      });
    } else {
      ElMessage({
        type: 'warning',
        message: '当前筛选条件下没有数据可导出',
      });
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '导出失败，请重试',
    });
  }
};

interface Room {
  roomId: number;
  roomTypeId: number;
  roomTypeName: string;
  roomTypePrice: number;
  bedNum: number;
  roomStatusId: number;
  roomStatusName: string;
  roomDescription: string;
}

// 房间列表
let list = ref<Room[]>([]);

// 当前页码
let pageIndex = ref<number>(1);
// 每页条数
let pageSize = ref<number>(10);
// 总数量
let total = ref<number>(0);
// 房间类型ID
let roomTypeId = ref<number>(0);

// 房间类型列表
const roomTypeList = ref<{ roomTypeId: number; roomTypeName: string }[]>([]);
const roomTypeList_sql = ref<{ roomTypeId: number; roomTypeName: string }[]>([]);
// 房间状态列表
type RoomStatus = {
  statusId: number;
  statusName: string
};
// 房间状态
let roomStatusId = ref<number>(0);
const roomStatusList = ref<RoomStatus[]>([]);
const roomStatusList_sql = ref<RoomStatus[]>([]);
const roomStatusListCreate = ref<RoomStatus[]>([]);

// 房间状态列表
const loadRoomStatusList = async () => {
  let ret = await $statusList();
  if (ret.success) {
    roomStatusList.value = ret.data;
    // 深拷贝
    roomStatusList_sql.value = JSON.parse(JSON.stringify(ret.data));
    roomStatusList_sql.value.unshift({ statusId: 0, statusName: '全部' }); // 添加默认选项
    roomStatusListCreate.value = JSON.parse(JSON.stringify(ret.data));
    roomStatusListCreate.value = roomStatusListCreate.value.filter((item) => item.statusName !== '已入住' && item.statusName !== '已预定'); // 过滤掉已入住和已预定状态
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
};

// 加载房间类型列表
const loadRoomTypeList = async () => {
  let ret = await $listRoomType();
  if (ret.success) {
    roomTypeList.value = ret.data;
    // 深拷贝
    roomTypeList_sql.value = JSON.parse(JSON.stringify(ret.data));
    roomTypeList_sql.value.unshift({ roomTypeId: 0, roomTypeName: '全部' }); // 添加默认选项
  }
};

// 加载房间列表
const loadList = async () => {
  let ret = await $list({
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    roomTypeId: roomTypeId.value,
    roomStatusId: roomStatusId.value
  });
  if (ret.success) {
    list.value = ret.data;
    total.value = ret.count;
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
}

// 定义编辑组件ref
let editRef = ref();

// 添加房间
const handleAdd = () => {
  editRef.value.initFormData(); // 初始化 formData 为空
  editRef.value.drawer = true;
};

// 编辑房间
const handleEdit = async (roomId: number) => {
  let ret = await $getDetail({ roomId: roomId });
  if (ret.success) {
    console.log(ret.data);
    editRef.value.initFormData(ret.data); // 使用初始化方法设置 formData
    editRef.value.drawer = true;
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
};

// 删除房间
const handleDelete = (roomId: number) => {
  ElMessageBox.confirm(
    '确定删除该房间吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      // 判断房间是否为空闲
      let roomStatus = list.value.find((item) => item.roomId === roomId)?.roomStatusName;
      if (roomStatus !== '空闲') {
        ElMessage({
          type: 'error',
          message: '只能删除空闲状态的房间',
        });
        return;
      }
      // 确定删除，调用接口
      let ret = await $delete({ 'roomId': roomId });
      if (ret.success) {
        ElMessage({
          type: 'success',
          message: ret.message,
        });
        // 重新加载房间列表
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

onMounted(() => {
  loadRoomStatusList();
  loadRoomTypeList();
  loadList();
});
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
</style>