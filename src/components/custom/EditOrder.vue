<template>
  <el-drawer size="20%" v-model="drawer" :title="isEditing ? '修改订单' : '添加订单'" direction="rtl"
    :before-close="handleDrawerClose">
    <el-form size="small" ref="formRef" :model="formData" status-icon :rules="rules" label-width="70px">
      <el-form-item v-if="!isEditing" label="身份证号" prop="identityId">
        <el-input v-model="formData.identityId" />
      </el-form-item>
      <el-form-item v-if="!isEditing" label="顾客姓名" prop="guestName">
        <el-input v-model="formData.guestName" />
      </el-form-item>
      <el-form-item label="顾客电话" prop="guestPhone">
        <el-input v-model="formData.guestPhone" />
      </el-form-item>
      <el-form-item label="房间类型" prop="roomTypeId">
        <el-select v-model="formData.roomTypeId" placeholder="请选择房间类型" @change="onRoomTypeChange" :disabled="isEditing">
          <el-option v-for="item in roomTypeList" :key="item.roomTypeId" :label="item.roomTypeName"
        :value="item.roomTypeId" />
        </el-select>
      </el-form-item>
      <el-form-item label="房间号" prop="roomId">
        <el-select v-model="formData.roomId" placeholder="请选择房间号" >
          <el-option v-for="item in roomList" :key="item.roomId" :label="item.roomId" :value="item.roomId" />
        </el-select>
      </el-form-item>
      <el-form-item label="入住日期" prop="resideDate">
        <div class="block">
          <el-date-picker v-model="formData.resideDate" type="datetime" placeholder="请选择入住日期" style="width: 100%" @change="calculateTotalMoney" :disabled="isEditing" />
        </div>
      </el-form-item>
      <el-form-item label="退房日期" prop="leaveDate">
        <div class="block">
          <el-date-picker v-model="formData.leaveDate" type="datetime" placeholder="请选择退房日期" style="width: 100%" @change="calculateTotalMoney" />
        </div>
      </el-form-item>
      <el-form-item label="入住人数" prop="guestNum">
        <el-input v-model.number="formData.guestNum" />
      </el-form-item>
      <el-form-item label="总金额" prop="totalMoney">
        <el-input v-model.number="formData.totalMoney" readonly />
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
import { reactive, ref } from 'vue';
import { $add, $update } from '../../api/order';
import { $getRoomList } from '../../api/guest';
import '@wangeditor/editor/dist/css/style.css' // 引入 css

const emit = defineEmits(['sync-list']);

// 抽屉变量
const drawer = ref(false);

// 是否处于编辑状态
const isEditing = ref(false);

// 空表单对象
const emptyForm = {
  id: undefined,
  identityId: undefined,
  guestName: '',
  guestPhone: '',
  roomTypeId: undefined,
  roomId: '',
  resideDate: '',
  guestNum: undefined,
  leaveDate: undefined,
  totalMoney: 0,
  roomTypePrice: 0,
};

// 保存原始顾客数据，用于"取消"操作时恢复
const originalCustomData = ref();

// 关闭抽屉处理
const handleDrawerClose = (done: () => void) => {
  // 清理表单数据
  cleanupForm()
  // 清空房间列表
  roomList.value = [];
  // 执行关闭
  done()
}

// 清理表单
const cleanupForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.value = { ...emptyForm }
  originalCustomData.value = null
  isEditing.value = false
  drawer.value = false
}

// 关闭抽屉
const closeDrawer = () => {
  handleDrawerClose(() => { })
}

// 定义表单数据类型
interface EditCustom {
  id: number | undefined;
  identityId: number | undefined;
  guestName: string;
  guestPhone: string;
  roomTypeId: number | undefined;
  roomId: string;
  resideDate: string;
  guestNum: number | undefined;
  leaveDate?: string; // 可选属性
  totalMoney: number;
  roomTypePrice: number;
}

// 定义一个响应式对象，绑定表单数据
const formData = ref<EditCustom>({
  id: undefined,
  identityId: undefined,
  guestName: '',
  guestPhone: '',
  roomTypeId: undefined,
  roomId: '',
  resideDate: '',
  guestNum: undefined,
  leaveDate: undefined,
  totalMoney: 0,
  roomTypePrice: 0,
});

// 定义一个ref对象，绑定表单
const formRef = ref<FormInstance>();

// 验证身份证
const validateIdentityId = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入身份证号'));
  } else if (!/^\d{17}[0-9xX]$/.test(value)) {
    callback(new Error('身份证号格式不正确'));
  } else {
    callback();
  }
};

const validatePhone = (rule: any, value: string, callback: any) => {
  const phoneRegex = /^1\d{10}$/; // 正则表达式
  if (value === '') {
    callback(new Error('请输入电话号码'));
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入有效的电话号码'));
  } else {
    callback();
  }
};

const validateGuestNum = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入入住人数'));
  } else if (!/^[1-9]\d*$/.test(value)) {
    callback(new Error('请输入正整数'));
  } else {
    callback();
  }
};

const validateResideDate = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请选择入住日期'));
  } else {
    const selectedDate = new Date(value);
    const currentDate = new Date();
    
    // 只在新建订单时验证日期不能早于当前时间
    if (!isEditing.value && selectedDate < currentDate) {
      callback(new Error('入住日期不能早于当前时间'));
    } else {
      callback();
    }
  }
};

const validateCheckOutDate = (rule: any, value: any, callback: any) => {
  if (!value) {
    // 允许为空
    callback();
  } else if (!formData.value.resideDate) {
    callback(new Error('请先选择入住日期'));
  } else if (new Date(value) <= new Date(formData.value.resideDate)) {
    callback(new Error('退房日期必须晚于入住日期'));
  } else {
    callback();
  }
};

// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  identityId: [{ required: true, validator: validateIdentityId, trigger: 'blur' }],
  guestName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  guestPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  roomTypeId: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  roomId: [{ required: true, message: '请选择房间号', trigger: 'change' }],
  resideDate: [{ required: true, validator: validateResideDate, trigger: 'change' }],
  guestNum: [{ required: true, validator: validateGuestNum, trigger: 'blur' }],
  leaveDate: [{ required: true, validator: validateCheckOutDate, trigger: 'change' }],
});

// 定义房间类型
interface RoomType {
  roomTypeId: number;
  roomTypeName: string;
  roomTypePrice?: number;
}

interface Room {
  roomId: string;
}

let roomList = ref<Room[]>([]);

// 定义房间类型列表
const props = defineProps({
  roomTypeList: Array<RoomType>, // 通过 props 接收房间类型列表
});
// 初始化表单数据
const initFormData = (data?: EditCustom) => {

  if (data) {
    // 深拷贝一份数据，以便在取消时恢复
    originalCustomData.value = JSON.parse(JSON.stringify(data));
    formData.value = { ...data };
    isEditing.value = true; // 如果传入了数据，则设置为编辑模式
    loadRoomList(data.roomTypeId!);
  } else {
    originalCustomData.value = { ...emptyForm };
    formData.value = { ...emptyForm };
    isEditing.value = false; // 如果没有传入数据，则设置为添加模式
  }
};

// 获取房型对应的房间列表
const loadRoomList = async (roomTypeId: number) => {
  let ret = await $getRoomList({ roomTypeId: roomTypeId });
  if (ret.success) {
    roomList.value = ret.data;
  }
};

// 房型改变时的处理
const onRoomTypeChange = (roomTypeId: number) => {
  // 清空房间选择
  formData.value.roomId = '';
  // 加载对应房间列表
  loadRoomList(roomTypeId);
  // 更新房型价格
  const selectedRoomType = props.roomTypeList?.find(item => item.roomTypeId === roomTypeId);
  if (selectedRoomType) {
    formData.value.roomTypePrice = selectedRoomType.roomTypePrice || 0;
  }
  // 重新计算总金额
  calculateTotalMoney();
};

// 计算总金额
const calculateTotalMoney = () => {
  if (formData.value.resideDate && formData.value.leaveDate && formData.value.roomTypePrice > 0) {
    const resideDate = new Date(formData.value.resideDate);
    const leaveDate = new Date(formData.value.leaveDate);
    
    if (leaveDate > resideDate) {
      // 计算天数，不满一天按一天计算
      const days = Math.ceil((leaveDate.getTime() - resideDate.getTime()) / (1000 * 60 * 60 * 24));
      formData.value.totalMoney = days * formData.value.roomTypePrice;
    } else {
      formData.value.totalMoney = 0;
    }
  } else {
    formData.value.totalMoney = 0;
  }
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      if (isEditing.value) {
        // 修改
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

  if (isEditing.value && originalCustomData.value) {
    // 在编辑模式下，恢复原始数据
    formData.value = { ...originalCustomData.value };
  } else {
    // 在添加模式下，清空表单
    formData.value = { ...emptyForm };
  }
  // 清空房间列表
  roomList.value = [];
};

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