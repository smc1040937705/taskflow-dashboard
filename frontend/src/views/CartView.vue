<template>
  <div class="cart">
    <el-card>
      <template #header>
        <span>购物车</span>
      </template>

      <el-empty v-if="cartItems.length === 0" description="购物车是空的" />

      <el-table v-else :data="cartItems" style="margin-bottom: 20px">
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价" width="120">
          <template #default="{ row }">
            <span v-if="row.discountPrice && row.discountPrice > 0" style="color: #f56c6c">
              ¥{{ formatPrice(row.discountPrice) }}
            </span>
            <span v-else>¥{{ formatPrice(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              :max="row.stock"
              @change="updateQuantity(row.id, row.quantity)"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="150" align="right">
          <template #default="{ row }">
            ¥{{ formatPrice(getItemTotal(row)) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button size="small" type="danger" text @click="removeItem(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="total-section">
          <span>共 {{ itemCount }} 件商品</span>
          <span style="margin-left: 20px; font-size: 18px">
            合计: <strong style="color: #f56c6c; font-size: 20px">¥{{ formatPrice(cartTotal) }}</strong>
          </span>
        </div>
        <div class="action-section">
          <el-button type="danger" @click="clearCart">清空购物车</el-button>
          <el-button type="primary" size="large" @click="checkout">
            结算
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { priceCalculator } from '../api'

export default {
  name: 'CartView',
  setup() {
    const store = useStore()
    const formatPrice = priceCalculator.formatPrice

    const cartItems = computed(() => store.getters['cart/cartItems'])
    const itemCount = computed(() => store.getters['cart/cartItemCount'])
    const cartTotal = computed(() => store.getters['cart/cartTotal'])

    const getItemTotal = (item) => {
      const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price
      return price * item.quantity
    }

    const updateQuantity = (productId, quantity) => {
      store.dispatch('cart/updateQuantity', { productId, quantity })
    }

    const removeItem = (productId) => {
      store.dispatch('cart/removeFromCart', productId)
      ElMessage.success('已移除')
    }

    const clearCart = () => {
      store.dispatch('cart/clearCart')
      ElMessage.success('购物车已清空')
    }

    const checkout = () => {
      ElMessage.success('结算功能')
    }

    return {
      cartItems,
      itemCount,
      cartTotal,
      formatPrice,
      getItemTotal,
      updateQuantity,
      removeItem,
      clearCart,
      checkout
    }
  }
}
</script>

<style scoped>
.cart {
  padding: 20px;
}
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
.total-section {
  display: flex;
  align-items: center;
}
.action-section {
  display: flex;
  gap: 15px;
  align-items: center;
}
</style>