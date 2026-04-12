<template>
  <div class="orders">
    <el-card>
      <template #header>
        <span>订单管理</span>
      </template>

      <el-table :data="orders" v-loading="loading">
        <el-table-column prop="orderNumber" label="订单号" width="180" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ formatPrice(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING'"
              size="small"
              type="primary"
              @click="payOrder(row.id)"
            >
              支付
            </el-button>
            <el-button
              v-if="canShip(row.status)"
              size="small"
              type="success"
              @click="shipOrder(row.id)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === 'SHIPPED'"
              size="small"
              type="success"
              @click="deliverOrder(row.id)"
            >
              送达
            </el-button>
            <el-button
              v-if="row.status === 'DELIVERED'"
              size="small"
              type="success"
              @click="completeOrder(row.id)"
            >
              完成
            </el-button>
            <el-button
              v-if="canCancel(row.status)"
              size="small"
              type="danger"
              @click="cancelOrder(row.id)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="loadOrders"
        @current-change="loadOrders"
      />
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi, priceCalculator, orderStatusFormatter } from '../api'

export default {
  name: 'OrdersView',
  setup() {
    const orders = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const formatPrice = priceCalculator.formatPrice
    const { getStatusInfo, canCancel, canShip } = orderStatusFormatter

    const getStatusType = (status) => {
      return getStatusInfo(status).color
    }

    const getStatusLabel = (status) => {
      return getStatusInfo(status).label
    }

    const loadOrders = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        const result = await orderApi.getAllOrders(params)
        orders.value = result.content
        total.value = result.totalElements
      } finally {
        loading.value = false
      }
    }

    const payOrder = async (id) => {
      try {
        await orderApi.payOrder(id, 'CREDIT_CARD')
        ElMessage.success('支付成功')
        loadOrders()
      } catch (e) {
        console.error(e)
      }
    }

    const shipOrder = async (id) => {
      const trackingNumber = 'SF' + Date.now()
      try {
        await orderApi.shipOrder(id, trackingNumber, '顺丰快递')
        ElMessage.success('发货成功')
        loadOrders()
      } catch (e) {
        console.error(e)
      }
    }

    const deliverOrder = async (id) => {
      try {
        await orderApi.deliverOrder(id)
        ElMessage.success('订单已送达')
        loadOrders()
      } catch (e) {
        console.error(e)
      }
    }

    const completeOrder = async (id) => {
      try {
        await orderApi.completeOrder(id)
        ElMessage.success('订单已完成')
        loadOrders()
      } catch (e) {
        console.error(e)
      }
    }

    const cancelOrder = async (id) => {
      try {
        await ElMessageBox.confirm('确定取消此订单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await orderApi.cancelOrder(id, '用户取消')
        ElMessage.success('取消成功')
        loadOrders()
      } catch {
        ElMessage.info('已取消')
      }
    }

    onMounted(() => {
      loadOrders()
    })

    return {
      orders,
      loading,
      currentPage,
      pageSize,
      total,
      formatPrice,
      getStatusType,
      getStatusLabel,
      canCancel,
      canShip,
      loadOrders,
      payOrder,
      shipOrder,
      deliverOrder,
      completeOrder,
      cancelOrder
    }
  }
}
</script>

<style scoped>
.orders {
  padding: 20px;
}
</style>