<template>
  <div class="home">
    <div class="content-wrapper">
      <!-- 左侧图表 -->
      <div class="chart-section">
        <div ref="chartRef" class="chart-container" width="50%" height="100%"></div>
      </div>

      <!-- 右侧排行榜 -->
      <div class="ranking-section">
        <div class="ranking-header">
          <h3>🏆 热门房间排行</h3>
          <p>销售次数最多的房间TOP3</p>
        </div>
        <div class="ranking-list">
          <div v-if="top3Rooms.length === 0" class="empty-state">
            <p>暂无热门房间数据</p>
          </div>
          <div v-else v-for="(item, index) in top3Rooms" :key="item.roomId" class="ranking-item"
            :class="`rank-${index + 1}`" @click="showRoomDetail(item)">
            <div class="rank-number">
              <span class="rank-badge">{{ index + 1 }}</span>
            </div>
            <div class="room-info">
              <h4>{{ item.roomId }}</h4>
              <p class="price">￥{{ item.roomTypePrice }}/晚</p>
              <p class="sales">销售次数: {{ item.count }}</p>
              <p class="sales">销售额: ￥{{ item.totalMoney }}</p>
            </div>
            <div class="rank-icon">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 房间详情弹窗 -->
      <el-dialog v-model="dialogVisible" title="房间详细信息" width="50%">
        <div v-if="roomDetail" class="room-detail">
          <div class="detail-row">
            <label>房型名称：</label>
            <span>{{ roomDetail.roomTypeName }}</span>
          </div>
          <div class="detail-row">
            <label>房型价格：</label>
            <span>￥{{ roomDetail.roomTypePrice }}/晚</span>
          </div>
            <div class="detail-row">
            <label>房型描述：</label>
            <span v-html="roomDetail.roomDescription" style="text-align: left;"></span>
            </div>
          <div class="detail-row">
            <label>销售次数：</label>
            <span>{{ roomDetail.count }}</span>
          </div>
          <div class="detail-row">
            <label>销售总额：</label>
            <span>￥{{ roomDetail.totalMoney }}</span>
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible=false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import * as echarts from 'echarts';
import { $list, $top3 } from '../api/billing';
import { ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

type Sales = {
  roomTypeName: string,
  totalMoney: number,
}

// Billing结构体
interface Billing {
  roomId: string;
  totalMoney: number;
  count: number;
  roomTypeName: string;
  roomTypePrice: number;
  roomDescription: string;
}

let totalTypePrice = ref<Sales[]>([])
const top3Rooms = ref<Billing[]>([]);
const dialogVisible = ref(false);
const roomDetail = ref<Billing | null>(null);
const chartRef = ref<HTMLElement>()

// 获取热门房间排行
const loadTop3 = async () => {
  try {
    const ret = await $top3();
    if (ret && ret.success && ret.data) {
      // 按count降序排序
      top3Rooms.value = [...ret.data].sort((a, b) => b.count - a.count);
    } else {
      ElMessage({
        type: 'warning',
        message: '暂无热门房间数据',
      });
      top3Rooms.value = [];
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取热门房间数据失败',
    });
    top3Rooms.value = [];
  }
}
// 计算总销售额
const totalSales = computed(() => {
  return totalTypePrice.value.reduce((sum, item) => sum + item.totalMoney, 0);
});

const loadTypePrice = async () => {
  try {
    let ret = await $list();
    if (ret && ret.success && ret.data) {
      totalTypePrice.value = ret.data;
      showChart();
    } else {
      ElMessage({
        type: 'warning',
        message: '暂无房型销售额数据',
      });
      totalTypePrice.value = [];
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '加载数据失败，请稍后重试',
    });
    totalTypePrice.value = [];
  }
}

const showChart = () => {
  if (!chartRef.value) return;

  // 检查数据是否存在
  if (!totalTypePrice.value || totalTypePrice.value.length === 0) {
    return;
  }

  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(chartRef.value);

  // 绘制图表
  myChart.setOption({
    title: {
      text: '房型销售额统计',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        const data = params[0];
        return `${data.name}<br/>销售额: ￥${data.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: totalTypePrice.value.map(item => item.roomTypeName),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '￥{value}'
      }
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: totalTypePrice.value.map(item => item.totalMoney),
        itemStyle: {
          color: function (params: any) {
            const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'];
            return colors[params.dataIndex % colors.length];
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  });

  // 响应式调整
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

// 显示房间详情
const showRoomDetail = (item: Billing) => {
  roomDetail.value = item;
  dialogVisible.value = true;
}

onMounted(() => {
  loadTypePrice();
  loadTop3();
});
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  height: 100%;
}

.chart-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.ranking-section {
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.ranking-header {
  text-align: center;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 20px;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.ranking-list {
  flex: 1;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
  font-size: 14px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  &.rank-1 {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: white;

    .rank-badge {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &.rank-2 {
    background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
    color: white;

    .rank-badge {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  &.rank-3 {
    background: linear-gradient(135deg, #CD7F32, #B8860B);
    color: white;

    .rank-badge {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.rank-number {
  margin-right: 15px;

  .rank-badge {
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 50%;
    background: #f0f0f0;
    font-weight: bold;
    font-size: 16px;
  }
}

.room-info {
  flex: 1;

  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: bold;
  }

  p {
    margin: 0 0 4px 0;
    font-size: 12px;
    opacity: 0.9;

    &.price {
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.rank-icon {
  margin-left: 10px;
  opacity: 0.7;
}

// 弹窗样式
.room-detail {
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    label {
      font-weight: bold;
      color: #333;
      min-width: 100px;
    }

    span {
      color: #666;
      text-align: right;
    }
  }
}

.dialog-footer {
  text-align: center;
}

// 响应式设计
@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .ranking-section {
    width: 100%;
    height: 300px;
  }

  .ranking-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
  }

  .ranking-item {
    min-width: 280px;
    margin-bottom: 0;
  }
}
</style>