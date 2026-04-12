<template>
  <div class="product-detail">
    <el-card v-if="product">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-image
            style="width: 100%; height: 400px"
            :src="product.imageUrl || 'https://picsum.photos/400/400'"
            fit="contain"
          />
        </el-col>
        <el-col :span="12">
          <h1>{{ product.name }}</h1>
          <div class="price-section">
            <span v-if="product.discountPrice && product.discountPrice > 0" class="discount-price">
              ¥{{ formatPrice(product.discountPrice) }}
            </span>
            <span :class="{ 'original-price': product.discountPrice && product.discountPrice > 0 }">
              ¥{{ formatPrice(product.price) }}
            </span>
            <el-tag v-if="hasDiscount" type="danger" style="margin-left: 10px">
              {{ discountPercentage }}% OFF
            </el-tag>
          </div>

          <div class="info-row">
            <span>库存: </span>
            <el-tag :type="product.stock > 10 ? 'success' : 'warning'">
              {{ product.stock }} 件
            </el-tag>
          </div>

          <div class="info-row">
            <span>销量: {{ product.salesCount }}</span>
            <span style="margin-left: 20px">浏览: {{ product.viewCount }}</span>
          </div>

          <div class="description">{{ product.description }}</div>

          <div class="action-section" style="margin-top: 30px">
            <el-input-number v-model="quantity" :min="1" :max="product.stock" size="large" />
            <el-button
              type="primary"
              size="large"
              :disabled="product.stock === 0"
              @click="addToCart"
            >
              加入购物车
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { productApi, priceCalculator } from '../api'

export default {
  name: 'ProductDetailView',
  setup() {
    const route = useRoute()
    const store = useStore()
    const product = ref(null)
    const quantity = ref(1)

    const formatPrice = priceCalculator.formatPrice

    const hasDiscount = computed(() => {
      if (!product.value) return false
      return product.value.discountPrice && product.value.discountPrice > 0 && product.value.discountPrice < product.value.price
    })

    const discountPercentage = computed(() => {
      if (!hasDiscount.value) return 0
      return Math.round((1 - product.value.discountPrice / product.value.price) * 100)
    })

    const loadProduct = async () => {
      try {
        product.value = await productApi.getProductById(route.params.id)
      } catch (e) {
        console.error(e)
      }
    }

    const addToCart = () => {
      for (let i = 0; i < quantity.value; i++) {
        store.dispatch('cart/addToCart', product.value)
      }
      ElMessage.success(`已添加 ${quantity.value} 件商品到购物车`)
    }

    onMounted(() => {
      loadProduct()
    })

    return {
      product,
      quantity,
      formatPrice,
      hasDiscount,
      discountPercentage,
      addToCart
    }
  }
}
</script>

<style scoped>
.product-detail {
  padding: 20px;
}
.price-section {
  margin: 20px 0;
  font-size: 24px;
}
.discount-price {
  color: #f56c6c;
  font-weight: bold;
  margin-right: 10px;
}
.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 18px;
}
.info-row {
  margin: 15px 0;
  font-size: 14px;
  color: #606266;
}
.description {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.8;
}
.action-section {
  display: flex;
  gap: 15px;
  align-items: center;
}
h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
}
</style>