<template>
  <el-config-provider :locale="locale">
    <div id="app">
      <el-container>
        <el-header>
          <el-menu :default-active="activeRoute" mode="horizontal" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/products">商品列表</el-menu-item>
            <el-menu-item index="/orders">订单管理</el-menu-item>
            <el-menu-item index="/users">用户管理</el-menu-item>
            <el-menu-item index="/cart">
              <el-badge :value="cartCount" class="item">
                购物车
              </el-badge>
            </el-menu-item>
          </el-menu>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
        <el-footer style="text-align: center; color: #999">
          E-Commerce Demo Application
        </el-footer>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const store = useStore()

    const activeRoute = computed(() => route.path)
    const cartCount = computed(() => store.getters.cartItemCount)

    return {
      locale: zhCn,
      activeRoute,
      cartCount
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background-color: #409EFF;
  color: white;
  padding: 0;
}

.el-menu {
  border-bottom: none;
}

.el-main {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}
</style>