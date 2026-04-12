import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const message = error.response?.data?.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export const userApi = {
  createUser(data) {
    return api.post('/users', data)
  },
  getUserById(id) {
    return api.get(`/users/${id}`)
  },
  getAllUsers(params) {
    return api.get('/users', { params })
  },
  searchUsers(keyword, params) {
    return api.get('/users/search', { params: { keyword, ...params } })
  },
  updateUser(id, data) {
    return api.put(`/users/${id}`, data)
  },
  deleteUser(id) {
    return api.delete(`/users/${id}`)
  },
  addBalance(id, amount) {
    return api.post(`/users/${id}/balance/add`, null, { params: { amount } })
  },
  changeRole(id, role) {
    return api.put(`/users/${id}/role`, null, { params: { role } })
  },
  redeemPoints(id, points) {
    return api.post(`/users/${id}/loyalty/redeem`, null, { params: { points } })
  },
  getActiveUserCount() {
    return api.get('/users/active/count')
  }
}

export const productApi = {
  createProduct(data) {
    return api.post('/products', data)
  },
  getProductById(id) {
    return api.get(`/products/${id}`)
  },
  getAllProducts(params) {
    return api.get('/products', { params })
  },
  searchProducts(keyword, params) {
    return api.get('/products/search', { params: { keyword, ...params } })
  },
  updateProduct(id, data) {
    return api.put(`/products/${id}`, data)
  },
  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  },
  addStock(id, quantity) {
    return api.post(`/products/${id}/stock/add`, null, { params: { quantity } })
  },
  getLowStockProducts(threshold) {
    return api.get('/products/low-stock', { params: { threshold } })
  },
  getBestSelling(limit) {
    return api.get('/products/best-selling', { params: { limit } })
  }
}

export const orderApi = {
  createOrder(data) {
    return api.post('/orders', null, { params: data })
  },
  getOrderById(id) {
    return api.get(`/orders/${id}`)
  },
  getOrdersByUser(userId, params) {
    return api.get(`/orders/user/${userId}`, { params })
  },
  getAllOrders(params) {
    return api.get('/orders', { params })
  },
  payOrder(id, paymentMethod) {
    return api.post(`/orders/${id}/pay`, null, { params: { paymentMethod } })
  },
  shipOrder(id, trackingNumber, courier) {
    return api.post(`/orders/${id}/ship`, null, { params: { trackingNumber, courier } })
  },
  deliverOrder(id) {
    return api.post(`/orders/${id}/deliver`)
  },
  completeOrder(id) {
    return api.post(`/orders/${id}/complete`)
  },
  cancelOrder(id, reason) {
    return api.post(`/orders/${id}/cancel`, null, { params: { reason } })
  },
  getRevenue(startDate, endDate) {
    return api.get('/orders/revenue', { params: { startDate, endDate } })
  },
  getStatistics() {
    return api.get('/orders/statistics')
  },
  getAverageOrderValue() {
    return api.get('/orders/average-value')
  }
}

export const priceCalculator = {
  calculateDiscount(price, discountPrice) {
    if (!discountPrice || discountPrice >= price) {
      return 0
    }
    return Math.round((1 - discountPrice / price) * 100)
  },

  calculateTotal(items) {
    return items.reduce((sum, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price
      return sum + (price * item.quantity)
    }, 0)
  },

  formatPrice(price) {
    return Number(price).toFixed(2)
  },

  isInStock(stock) {
    return stock && stock > 0
  }
}

export const orderStatusFormatter = {
  statusMap: {
    'PENDING': { label: '待支付', color: 'warning' },
    'PAID': { label: '已支付', color: 'primary' },
    'PROCESSING': { label: '处理中', color: 'info' },
    'SHIPPED': { label: '已发货', color: '' },
    'DELIVERED': { label: '已送达', color: 'success' },
    'CANCELLED': { label: '已取消', color: 'danger' },
    'COMPLETED': { label: '已完成', color: 'success' }
  },

  getStatusInfo(status) {
    return this.statusMap[status] || { label: status, color: '' }
  },

  canCancel(status) {
    return ['PENDING', 'PAID', 'PROCESSING'].includes(status)
  },

  canShip(status) {
    return ['PAID', 'PROCESSING'].includes(status)
  }
}

export default api