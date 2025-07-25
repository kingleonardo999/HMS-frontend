<template>
  <div class="order">
    <div class="search">
      <span>顾客：</span>
      <el-input v-model="guestName" placeholder="" style="width: 100px;" size="small" />
      <el-button style="margin-left: 10px;" @click="loadList" type="success" size="small">查询</el-button>
      <el-button style="margin-left: 10px;" @click="export2xlsx" type="success" size="small">导出为Excel</el-button>
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="orderId" label="订单号" width="130" />
      <el-table-column prop="identityId" label="身份证号" width="180" />
      <el-table-column prop="guestName" label="姓名" width="70" />
      <el-table-column prop="guestPhone" label="电话" width="110" />
      <el-table-column prop="roomTypeName" label="房型" width="90" />
      <el-table-column prop="roomId" label="房号" width="60" />
      <el-table-column prop="guestNum" label="人数" width="60" />
      <el-table-column prop="totalMoney" label="总金额" width="80">
        <template #default="scope">
          ￥{{ scope.row.totalMoney }}
        </template>
      </el-table-column>
      <el-table-column prop="resideDate" label="入住日期" width="140">
        <template #default="scope">
          {{ formatDate(scope.row.resideDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="leaveDate" label="退房日期" width="140">
        <template #default="scope">
          {{ formatDate(scope.row.leaveDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row.orderId)">
            编辑
          </el-button>
          <el-button size="small" type="success"
            @click="handleCheck(scope.row.orderId, scope.row.resideDate, scope.row.leaveDate, scope.row.totalMoney)">
            入住
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" :total="total"
      v-model:current-page="pageIndex" @current-change="loadList" />
    <EditOrder ref="editRef" @sync-list="loadList" :roomTypeList="roomTypeList">
    </EditOrder>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { $list, $getDetail, $liveIn } from '../../api/order'
import { $list as $roomTypeList } from '../../api/roomType'
import { exportObjectsToExcel } from '../../utils/xlsx'
import EditOrder from '../../components/custom/EditOrder.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type Order = {
  orderId: string,
  identityId: string,
  guestName: string,
  guestPhone: string,
  roomTypeName: string,
  roomTypePrice: number,
  roomId: number,
  resideState: string,
  guestNum: number,
  resideDate: string,
  leaveDate: string,
  totalMoney: number
}

const list = ref<Order[]>([])

const guestName = ref('')
// 当前页码
const pageIndex = ref<number>(1);
// 每页条数
const pageSize = ref<number>(10);
// 总数量
const total = ref<number>(0);

let roomTypeList = ref<{ roomTypeId: number; roomTypeName: string; roomTypePrice: number }[]>([]);

const loadList = async () => {
  const ret = await $list({
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    guestName: guestName.value
  })
  if (ret.success) {
    list.value = ret.data
    total.value = ret.count
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
}

// 导出为Excel文件
const export2xlsx = async () => {
  try {
    let exportData: Order[] = [];
    let ret = await $list({
      pageIndex: 1,
      pageSize: total.value, // 使用总数量作为pageSize
      guestName: guestName.value
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
      // 动态生成表头配置 - 基于表格列定义
      const headers = [
        { key: 'orderId', label: '订单号' },
        { key: 'identityId', label: '身份证号' },
        { key: 'guestName', label: '姓名' },
        { key: 'guestPhone', label: '电话' },
        { key: 'roomTypeName', label: '房型' },
        { key: 'roomId', label: '房号' },
        { key: 'guestNum', label: '人数' },
        { key: 'totalMoney', label: '总金额' },
        { key: 'resideDate', label: '入住日期' },
        { key: 'leaveDate', label: '退房日期' },
      ];

      // 动态转换数据格式
      const data = exportData.map((item: any) => {
        const flattenedItem: Record<string, any> = {};

        // 处理基础字段
        flattenedItem.orderId = item.orderId;
        flattenedItem.identityId = item.identityId;
        flattenedItem.guestName = item.guestName;
        flattenedItem.guestPhone = item.guestPhone;
        flattenedItem.roomTypeName = item.roomTypeName;
        flattenedItem.roomId = item.roomId;
        flattenedItem.guestNum = item.guestNum;
        flattenedItem.totalMoney = item.totalMoney;
        flattenedItem.resideDate = formatDate(item.resideDate);
        flattenedItem.leaveDate = formatDate(item.leaveDate);

        return flattenedItem;
      });

      // 生成文件名 - 包含筛选条件
      let fileName = '订单列表';
      const filterConditions: string[] = [];

      if (guestName.value.trim() !== '') {
        filterConditions.push(`${guestName.value}`);
      }

      if (filterConditions.length > 0) {
        fileName += `_${filterConditions.join('_')}`;
      }

      // 导出Excel
      exportObjectsToExcel(headers, data, fileName);

      ElMessage({
        type: 'success',
        message: `成功导出 ${data.length} 条订单数据`,
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

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''; // 如果日期字符串为空，返回空字符串
  const date = new Date(dateStr);
  // yy-mm-dd hh:mm
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 定义编辑组件ref
let editRef = ref();

// 添加
const handleAdd = () => {
  editRef.value.initFormData(); // 初始化 formData 为空
  editRef.value.drawer = true;
};

// 编辑
const handleEdit = async (id: string) => {
  let ret = await $getDetail({ id: id });
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

// 删除
const handleCheck = (id: string, reside: string, leave: string, totalMoney: number) => {
  const currentDate = new Date();
  const resideDate = new Date(reside);

  // 检查入住日期是否比当前日期晚
  if (resideDate > currentDate) {
    ElMessage({
      type: 'warning',
      message: '未到入住时间，请等待',
    });
    return;
  }

  // 检查退房日期是否比当前日期晚
  const leaveDate = new Date(leave);
  if (leaveDate < currentDate) {
    ElMessage({
      type: 'warning',
      message: '退房时间已过，请编辑退房日期',
    });
    return;
  }

  // 确认入住
  ElMessageBox.confirm(
    `共计${totalMoney}元，确定入住吗？`,
    '确认入住',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    let ret = await $liveIn({ id: id, totalMoney: totalMoney });
    if (ret.success) {
      ElMessage({
        type: 'success',
        message: '入住成功',
      });
      loadList(); // 刷新列表
    } else {
      ElMessage({
        type: 'error',
        message: ret.message,
      });
    }
  }).catch(() => {
    // 用户取消
  });
};

// 加载房型列表
const loadRoomTypeList = async () => {
  let ret = await $roomTypeList();
  if (ret.success) {
    roomTypeList.value = ret.data;
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
    });
  }
};

onMounted(() => {
  loadList()
  loadRoomTypeList()
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
</style>