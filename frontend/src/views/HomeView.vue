<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统概览</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="用户总数" :value="userCount">
                <template #suffix>人</template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="订单总数" :value="orderCount">
                <template #suffix>单</template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="总营收" :value="revenue" precision="2">
                <template #prefix>¥</template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="平均客单价" :value="avgOrderValue" precision="2">
                <template #prefix>¥</template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>订单状态分布</span>
          </template>
          <el-table :data="orderStats" style="width: 100%">
            <el-table-column prop="name" label="状态" />
            <el-table-column prop="value" label="数量" align="right" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>热销商品</span>
          </template>
          <el-table :data="bestSelling" style="width: 100%">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="salesCount" label="销量" align="right" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { orderApi, productApi, userApi } from '../api'

export default {
  name: 'HomeView',
  setup() {
    const userCount = ref(0)
    const orderCount = ref(0)
    const revenue = ref(0)
    const avgOrderValue = ref(0)
    const orderStats = ref([])
    const bestSelling = ref([])

    const loadData = async () => {
      try {
        userCount.value = await userApi.getActiveUserCount() || 0
        
        const stats = await orderApi.getStatistics() || {}
        orderStats.value = Object.entries(stats).map(([key, value]) => ({
          name: key,
          value
        }))
        orderCount.value = Object.values(stats).reduce((a, b) => a + b, 0)

        avgOrderValue.value = await orderApi.getAverageOrderValue() || 0

        bestSelling.value = await productApi.getBestSelling(5) || []
      } catch (e) {
        console.error(e)
        userCount.value = 0
        orderCount.value = 0
        avgOrderValue.value = 0
        orderStats.value = []
        bestSelling.value = []
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      userCount,
      orderCount,
      revenue,
      avgOrderValue,
      orderStats,
      bestSelling
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>