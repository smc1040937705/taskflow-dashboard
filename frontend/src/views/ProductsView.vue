<template>
  <div class="products">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>商品管理</span>
          <el-button type="primary" @click="showAddDialog = true">新增商品</el-button>
        </div>
      </template>

      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品..."
        style="width: 300px; margin-bottom: 20px"
        clearable
        @input="searchProducts"
      />

      <el-table :data="products" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ formatPrice(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="discountPrice" label="折扣价" width="120">
          <template #default="{ row }">
            <span v-if="row.discountPrice && row.discountPrice > 0" style="color: #f56c6c">
              ¥{{ formatPrice(row.discountPrice) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock > 10 ? 'success' : 'danger'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editProduct(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteProduct(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="loadProducts"
        @current-change="loadProducts"
      />
    </el-card>

    <el-dialog v-model="showAddDialog" title="新增商品" width="600px">
      <el-form :model="productForm" label-width="100px">
        <el-form-item label="商品名称" required>
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input-number v-model="productForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="折扣价">
          <el-input-number v-model="productForm.discountPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" required>
          <el-input-number v-model="productForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="productForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi, priceCalculator } from '../api'

export default {
  name: 'ProductsView',
  setup() {
    const products = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const searchKeyword = ref('')
    const showAddDialog = ref(false)
    const productForm = ref({
      name: '',
      price: 0,
      discountPrice: null,
      stock: 0,
      description: ''
    })

    const formatPrice = priceCalculator.formatPrice

    const loadProducts = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        const result = await productApi.getAllProducts(params)
        products.value = result.content
        total.value = result.totalElements
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const searchProducts = async () => {
      if (!searchKeyword.value) {
        loadProducts()
        return
      }
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        const result = await productApi.searchProducts(searchKeyword.value, params)
        products.value = result.content
        total.value = result.totalElements
      } finally {
        loading.value = false
      }
    }

    const submitProduct = async () => {
      try {
        await productApi.createProduct(productForm.value)
        ElMessage.success('创建成功')
        showAddDialog.value = false
        loadProducts()
      } catch (e) {
        console.error(e)
      }
    }

    const editProduct = () => {
      ElMessage.info('编辑功能')
    }

    const deleteProduct = async (id) => {
      try {
        await ElMessageBox.confirm('确定删除此商品?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await productApi.deleteProduct(id)
        ElMessage.success('删除成功')
        loadProducts()
      } catch {
        ElMessage.info('已取消删除')
      }
    }

    onMounted(() => {
      loadProducts()
    })

    return {
      products,
      loading,
      currentPage,
      pageSize,
      total,
      searchKeyword,
      showAddDialog,
      productForm,
      formatPrice,
      loadProducts,
      searchProducts,
      submitProduct,
      editProduct,
      deleteProduct
    }
  }
}
</script>

<style scoped>
.products {
  padding: 20px;
}
</style>