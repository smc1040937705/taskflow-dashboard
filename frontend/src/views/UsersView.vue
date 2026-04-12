<template>
  <div class="users">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>用户管理</span>
          <el-button type="primary" @click="showAddDialog = true">新增用户</el-button>
        </div>
      </template>

      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户..."
        style="width: 300px; margin-bottom: 20px"
        clearable
        @input="searchUsers"
      />

      <el-table :data="users" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="balance" label="余额" width="100">
          <template #default="{ row }">
            ¥{{ formatPrice(row.balance) }}
          </template>
        </el-table-column>
        <el-table-column prop="loyaltyPoints" label="积分" width="100" align="center" />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'primary'">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button size="small">操作<el-icon class="el-icon--right"><arrow-down /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="addBalance(row.id)">充值</el-dropdown-item>
                  <el-dropdown-item @click="changeRole(row.id)">修改角色</el-dropdown-item>
                  <el-dropdown-item @click="redeemPoints(row.id)">兑换积分</el-dropdown-item>
                  <el-dropdown-item divided @click="deleteUser(row.id)" type="danger">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="loadUsers"
        @current-change="loadUsers"
      />
    </el-card>

    <el-dialog v-model="showAddDialog" title="新增用户" width="500px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="userForm.password" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitUser">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi, priceCalculator } from '../api'

export default {
  name: 'UsersView',
  components: { ArrowDown },
  setup() {
    const users = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const searchKeyword = ref('')
    const showAddDialog = ref(false)
    const userForm = ref({
      username: '',
      email: '',
      password: 'Test123456'
    })

    const formatPrice = priceCalculator.formatPrice

    const loadUsers = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        const result = await userApi.getAllUsers(params)
        users.value = result.content
        total.value = result.totalElements
      } finally {
        loading.value = false
      }
    }

    const searchUsers = async () => {
      if (!searchKeyword.value) {
        loadUsers()
        return
      }
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        const result = await userApi.searchUsers(searchKeyword.value, params)
        users.value = result.content
        total.value = result.totalElements
      } finally {
        loading.value = false
      }
    }

    const submitUser = async () => {
      try {
        await userApi.createUser(userForm.value)
        ElMessage.success('创建成功')
        showAddDialog.value = false
        loadUsers()
      } catch (e) {
        console.error(e)
      }
    }

    const addBalance = async (userId) => {
      const { value: amount } = await ElMessageBox.prompt('请输入充值金额', '充值', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          if (!value || isNaN(value) || Number(value) <= 0) {
            return '请输入有效的金额'
          }
          return true
        }
      })
      try {
        await userApi.addBalance(userId, Number(amount))
        ElMessage.success('充值成功')
        loadUsers()
      } catch (e) {
        console.error(e)
      }
    }

    const changeRole = async (userId) => {
      try {
        await userApi.changeRole(userId, 'MANAGER')
        ElMessage.success('修改成功')
        loadUsers()
      } catch (e) {
        console.error(e)
      }
    }

    const redeemPoints = async (userId) => {
      const { value: points } = await ElMessageBox.prompt('请输入兑换积分数量', '兑换积分', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          if (!value || isNaN(value) || Number(value) <= 0) {
            return '请输入有效的积分数量'
          }
          return true
        }
      })
      try {
        await userApi.redeemPoints(userId, Number(points))
        ElMessage.success('兑换成功')
        loadUsers()
      } catch (e) {
        console.error(e)
      }
    }

    const deleteUser = async (id) => {
      try {
        await ElMessageBox.confirm('确定删除此用户?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userApi.deleteUser(id)
        ElMessage.success('删除成功')
        loadUsers()
      } catch {
        ElMessage.info('已取消删除')
      }
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      currentPage,
      pageSize,
      total,
      searchKeyword,
      showAddDialog,
      userForm,
      formatPrice,
      loadUsers,
      searchUsers,
      submitUser,
      addBalance,
      changeRole,
      redeemPoints,
      deleteUser,
      ArrowDown
    }
  }
}
</script>

<style scoped>
.users {
  padding: 20px;
}
</style>