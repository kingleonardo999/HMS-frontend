<template>
  <div class="home">
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { $totalTypePrice } from '../api/billing';

type Sales = {
  roomTypeName: string,
  roomTypePrice: number,
  totalMoney: number,
  count: number,
  roomTypeId: number,
}
let totalTypePrice = ref<Sales[]>([])

const loadTypePrice = async () => {
  let ret = await $totalTypePrice();

  if (ret.success) {
    totalTypePrice.value = ret.data;
    showChart();
  }
}

const showChart = () => {
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.querySelector('.home') as HTMLElement);
  // 绘制图表
  myChart.setOption({
    title: {
      text: '房型销售额信息'
    },
    tooltip: {},
    xAxis: {
      data: totalTypePrice.value.map(item => item.roomTypeName)
    },
    yAxis: {},
    series: [
      {
        name: '销量',
        type: 'bar',
        data: totalTypePrice.value.map(item => item.totalMoney)
      }
    ]
  });
}

onMounted(() => {
  loadTypePrice();
});
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
}
</style>