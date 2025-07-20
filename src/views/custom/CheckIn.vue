<template>
  <div class="checkin">
    <div class="search">
      <span>顾客：</span>
      <el-input v-model="guestName" placeholder="" style="width: 100px;" size="small" />
      <span style="margin-left: 10px;">状态：</span>
      <el-select v-model="resideState" placeholder="状态" style="width: 70px;" size="small">
        <el-option v-for="item in resideStateList" :key="item.id" :label="item.stateName" :value="item.id" />
      </el-select>
      <el-button style="margin-left: 10px;" @click="loadList" type="success" size="small">查询</el-button>
      <el-button style="margin-left: 10px;" @click="export2xlsx" type="success" size="small">导出为Excel</el-button>
      <el-button type="primary" size="small" @click="handleAdd">添加</el-button>
    </div>
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="id" label="ID" width="40" />
      <el-table-column prop="identityId" label="身份证号" width="180" />
      <el-table-column prop="guestName" label="姓名" width="70" />
      <el-table-column prop="guestPhone" label="电话" width="110" />
      <el-table-column prop="roomTypeName" label="房型" width="90" />
      <el-table-column prop="roomTypePrice" label="价格" width="60" />
      <el-table-column prop="roomId" label="房号" width="60" />
      <el-table-column prop="resideState" label="状态" width="70" />
      <el-table-column prop="deposit" label="押金" width="60" />
      <el-table-column prop="guestNum" label="人数" width="60" />
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
          <el-button v-if="scope.row.resideState == '未结账'" size="small" @click="handleEdit(scope.row.id)">
            编辑
          </el-button>
          <el-button v-if="scope.row.resideState == '未结账'" size="small" type="success" @click="handleCheck(scope.row.id, scope.row.roomTypePrice, scope.row.resideDate, scope.row.leaveDate)">
            结账
          </el-button>
          <el-button v-if="scope.row.resideState == '已结账'" size="small" type="danger" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination style="margin-top: 5px;" small background layout="prev, pager, next" :total="total"
      v-model:current-page="pageIndex" @current-change="loadList" />
    <EditCustom ref="editRef" @sync-list="loadList" :roomTypeList="roomTypeList">
    </EditCustom>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { $checkout, $delete, $getDetail, $getStatusList, $list } from '../../api/guest';
import { $list as $roomTypeList } from '../../api/roomType';
import { ElMessage, ElMessageBox } from 'element-plus';
import EditCustom from '../../components/custom/EditCustom.vue';
import { exportObjectsToExcel } from '../../utils/xlsx';

interface Guest {
  guestId: number;
  guestName: string;
  guestPhone: string;
}
// 客户列表
let list = ref<Guest[]>([]);
// 结账状态列表
let resideStateList = ref<{ id: number; stateName: string }[]>([]);

// 当前页码
const pageIndex = ref<number>(1);
// 每页条数
const pageSize = ref<number>(10);
// 总数量
const total = ref<number>(0);
// 房间状态
const resideState = ref<number>(0); // 0表示全部
// 顾客姓名
const guestName = ref<string>('');

// 加载入住信息列表
const loadList = async () => {
  let ret = await $list({
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    resideState: resideState.value,
    guestName: guestName.value
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

// 导出为Excel文件
const export2xlsx = async () => {
  try {
    let exportData: Guest[] = [];
    let ret = await $list({
      pageIndex: 1,
      pageSize: total.value, // 使用总数量作为pageSize
      resideState: resideState.value,
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
        { key: 'id', label: '编号' },
        { key: 'identityId', label: '身份证号' },
        { key: 'guestName', label: '姓名' },
        { key: 'guestPhone', label: '电话' },
        { key: 'roomTypeName', label: '房型' },
        { key: 'roomTypePrice', label: '房间价格' },
        { key: 'roomId', label: '房号' },
        { key: 'resideState', label: '状态' },
        { key: 'deposit', label: '押金' },
        { key: 'guestNum', label: '人数' },
        { key: 'resideDate', label: '入住日期' },
        { key: 'leaveDate', label: '退房日期' },
      ];

      // 动态转换数据格式
      const data = exportData.map((item: any) => {
        const flattenedItem: Record<string, any> = {};

        // 处理基础字段
        flattenedItem.id = item.id;
        flattenedItem.identityId = item.identityId;
        flattenedItem.guestName = item.guestName;
        flattenedItem.guestPhone = item.guestPhone;
        flattenedItem.roomTypeName = item.roomTypeName;
        flattenedItem.roomTypePrice = item.roomTypePrice;
        flattenedItem.roomId = item.roomId;
        flattenedItem.resideState = item.resideState;
        flattenedItem.deposit = item.deposit;
        flattenedItem.guestNum = item.guestNum;
        flattenedItem.resideDate = formatDate(item.resideDate);
        flattenedItem.checkOutDate = formatDate(item.checkOutDate);

        return flattenedItem;
      });

      // 生成文件名 - 包含筛选条件
      let fileName = '入住信息列表';
      const filterConditions: string[] = [];

      if (guestName.value.trim() !== '') {
        filterConditions.push(`${guestName.value}`);
      }

      if (resideState.value !== 0) {
        const selectedState = resideStateList.value.find(item => item.id === resideState.value);
        if (selectedState) {
          filterConditions.push(`${selectedState.stateName}`);
        }
      }

      if (filterConditions.length > 0) {
        fileName += `_${filterConditions.join('_')}`;
      }

      // 导出Excel
      exportObjectsToExcel(headers, data, fileName);

      ElMessage({
        type: 'success',
        message: `成功导出 ${data.length} 条入住信息数据`,
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

// 结账状态
const loadResideStateList = async () => {
  let ret = await $getStatusList({});
  if (ret.success) {
    resideStateList.value = ret.data;
    resideStateList.value.unshift({ id: 0, stateName: '全部' });
  } else {
    ElMessage({
      type: 'error',
      message: ret.message,
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

// 添加客户
const handleAdd = () => {
  editRef.value.initFormData(); // 初始化 formData 为空
  editRef.value.drawer = true;
};

// 编辑客户
const handleEdit = async (id: number) => {
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

// 删除客户
const handleDelete = (id: number) => {
  ElMessageBox.confirm(
    '确定删除该入住信息吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      let ret = await $delete({ id: id });
      if (ret.success) {
        ElMessage({
          type: 'success',
          message: ret.message,
        });
        // 重新加载入住信息列表
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

// 结账
const handleCheck = (id: number, price: number, resideDate: string, checkOutDate: string) => {
  if (!checkOutDate) {
        ElMessage({
          type: 'error',
          message: '请先选择退房日期',
        });
        return;
      }
      // 计算结账金额，按天数计算，不满一天按一天计算
      let days = Math.ceil((new Date(checkOutDate).getTime() - new Date(resideDate).getTime()) / (1000 * 60 * 60 * 24));
      let totalMoney = days * price;
  ElMessageBox.confirm(
    '共计' + totalMoney + '元，确定结账吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      let ret = await $checkout({ id: id , totalMoney: totalMoney });
      if (ret.success) {
        ElMessage({
          type: 'success',
          message: ret.message,
        });
        // 重新加载入住信息列表
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
}

let roomTypeList = ref<{ roomTypeId: number; roomTypeName: string }[]>([]);
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
  loadList();
  loadRoomTypeList();
  loadResideStateList();
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