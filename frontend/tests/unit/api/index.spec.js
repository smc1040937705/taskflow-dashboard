import { userApi, productApi, orderApi, priceCalculator, orderStatusFormatter } from '@/api/index'

// Mock element-plus
jest.mock('element-plus', () => ({
  ElMessage: {
    error: jest.fn()
  }
}))

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
  return mockAxios
})

describe('API Module', () => {
  let mockApi

  beforeEach(() => {
    jest.clearAllMocks()
    // Get the mocked axios instance
    const axios = require('axios')
    mockApi = axios
  })

  describe('User API', () => {
    describe('createUser', () => {
      it('should call POST /users with user data', async () => {
        const userData = { username: 'test', email: 'test@example.com' }
        mockApi.post.mockResolvedValue({ id: 1, ...userData })
        await userApi.createUser(userData)
        expect(mockApi.post).toHaveBeenCalledWith('/users', userData)
      })

      it('should return response data on success', async () => {
        const userData = { username: 'test' }
        const responseData = { id: 1, ...userData }
        mockApi.post.mockResolvedValue(responseData)
        const result = await userApi.createUser(userData)
        expect(result).toEqual(responseData)
      })
    })

    describe('getUserById', () => {
      it('should call GET /users/:id', async () => {
        mockApi.get.mockResolvedValue({ id: 1, username: 'test' })
        await userApi.getUserById(1)
        expect(mockApi.get).toHaveBeenCalledWith('/users/1')
      })

      it('should return user data', async () => {
        const user = { id: 1, username: 'test' }
        mockApi.get.mockResolvedValue(user)
        const result = await userApi.getUserById(1)
        expect(result).toEqual(user)
      })
    })

    describe('getAllUsers', () => {
      it('should call GET /users with params', async () => {
        const params = { page: 1, size: 10 }
        mockApi.get.mockResolvedValue({ data: [] })
        await userApi.getAllUsers(params)
        expect(mockApi.get).toHaveBeenCalledWith('/users', { params })
      })
    })

    describe('searchUsers', () => {
      it('should call GET /users/search with keyword and params', async () => {
        const params = { page: 1 }
        mockApi.get.mockResolvedValue({ data: [] })
        await userApi.searchUsers('test', params)
        expect(mockApi.get).toHaveBeenCalledWith('/users/search', { params: { keyword: 'test', ...params } })
      })
    })

    describe('updateUser', () => {
      it('should call PUT /users/:id with data', async () => {
        const userData = { email: 'new@example.com' }
        mockApi.put.mockResolvedValue({ data: { id: 1, ...userData } })
        await userApi.updateUser(1, userData)
        expect(mockApi.put).toHaveBeenCalledWith('/users/1', userData)
      })
    })

    describe('deleteUser', () => {
      it('should call DELETE /users/:id', async () => {
        mockApi.delete.mockResolvedValue({ data: {} })
        await userApi.deleteUser(1)
        expect(mockApi.delete).toHaveBeenCalledWith('/users/1')
      })
    })

    describe('addBalance', () => {
      it('should call POST /users/:id/balance/add with amount param', async () => {
        mockApi.post.mockResolvedValue({ data: { balance: 150 } })
        await userApi.addBalance(1, 50)
        expect(mockApi.post).toHaveBeenCalledWith('/users/1/balance/add', null, { params: { amount: 50 } })
      })
    })

    describe('changeRole', () => {
      it('should call PUT /users/:id/role with role param', async () => {
        mockApi.put.mockResolvedValue({ data: { role: 'ADMIN' } })
        await userApi.changeRole(1, 'ADMIN')
        expect(mockApi.put).toHaveBeenCalledWith('/users/1/role', null, { params: { role: 'ADMIN' } })
      })
    })

    describe('redeemPoints', () => {
      it('should call POST /users/:id/loyalty/redeem with points param', async () => {
        mockApi.post.mockResolvedValue({ data: { loyaltyPoints: 400 } })
        await userApi.redeemPoints(1, 100)
        expect(mockApi.post).toHaveBeenCalledWith('/users/1/loyalty/redeem', null, { params: { points: 100 } })
      })
    })

    describe('getActiveUserCount', () => {
      it('should call GET /users/active/count', async () => {
        mockApi.get.mockResolvedValue({ data: 10 })
        await userApi.getActiveUserCount()
        expect(mockApi.get).toHaveBeenCalledWith('/users/active/count')
      })
    })
  })

  describe('Product API', () => {
    describe('createProduct', () => {
      it('should call POST /products with product data', async () => {
        const productData = { name: 'Test Product', price: 100 }
        mockApi.post.mockResolvedValue({ data: { id: 1, ...productData } })
        await productApi.createProduct(productData)
        expect(mockApi.post).toHaveBeenCalledWith('/products', productData)
      })
    })

    describe('getProductById', () => {
      it('should call GET /products/:id', async () => {
        mockApi.get.mockResolvedValue({ data: { id: 1, name: 'Product' } })
        await productApi.getProductById(1)
        expect(mockApi.get).toHaveBeenCalledWith('/products/1')
      })
    })

    describe('getAllProducts', () => {
      it('should call GET /products with params', async () => {
        mockApi.get.mockResolvedValue({ data: [] })
        await productApi.getAllProducts({ page: 1 })
        expect(mockApi.get).toHaveBeenCalledWith('/products', { params: { page: 1 } })
      })
    })

    describe('searchProducts', () => {
      it('should call GET /products/search with keyword and params', async () => {
        mockApi.get.mockResolvedValue({ data: [] })
        await productApi.searchProducts('test', { page: 1 })
        expect(mockApi.get).toHaveBeenCalledWith('/products/search', { params: { keyword: 'test', page: 1 } })
      })
    })

    describe('updateProduct', () => {
      it('should call PUT /products/:id with data', async () => {
        const productData = { name: 'Updated' }
        mockApi.put.mockResolvedValue({ data: { id: 1, ...productData } })
        await productApi.updateProduct(1, productData)
        expect(mockApi.put).toHaveBeenCalledWith('/products/1', productData)
      })
    })

    describe('deleteProduct', () => {
      it('should call DELETE /products/:id', async () => {
        mockApi.delete.mockResolvedValue({ data: {} })
        await productApi.deleteProduct(1)
        expect(mockApi.delete).toHaveBeenCalledWith('/products/1')
      })
    })

    describe('addStock', () => {
      it('should call POST /products/:id/stock/add with quantity param', async () => {
        mockApi.post.mockResolvedValue({ data: { stock: 150 } })
        await productApi.addStock(1, 50)
        expect(mockApi.post).toHaveBeenCalledWith('/products/1/stock/add', null, { params: { quantity: 50 } })
      })
    })

    describe('getLowStockProducts', () => {
      it('should call GET /products/low-stock with threshold param', async () => {
        mockApi.get.mockResolvedValue({ data: [] })
        await productApi.getLowStockProducts(10)
        expect(mockApi.get).toHaveBeenCalledWith('/products/low-stock', { params: { threshold: 10 } })
      })
    })

    describe('getBestSelling', () => {
      it('should call GET /products/best-selling with limit param', async () => {
        mockApi.get.mockResolvedValue({ data: [] })
        await productApi.getBestSelling(5)
        expect(mockApi.get).toHaveBeenCalledWith('/products/best-selling', { params: { limit: 5 } })
      })
    })
  })

  describe('Order API', () => {
    describe('createOrder', () => {
      it('should call POST /orders with data as params', async () => {
        const orderData = { userId: 1, items: [] }
        mockApi.post.mockResolvedValue({ data: { id: 1, ...orderData } })
        await orderApi.createOrder(orderData)
        expect(mockApi.post).toHaveBeenCalledWith('/orders', null, { params: orderData })
      })
    })

    describe('getOrderById', () => {
      it('should call GET /orders/:id', async () => {
        mockApi.get.mockResolvedValue({ data: { id: 1 } })
        await orderApi.getOrderById(1)
        expect(mockApi.get).toHaveBeenCalledWith('/orders/1')
      })
    })

    describe('getOrdersByUser', () => {
      it('should call GET /orders/user/:userId with params', async () => {
        mockApi.get.mockResolvedValue({ data: [] })
        await orderApi.getOrdersByUser(1, { page: 1 })
        expect(mockApi.get).toHaveBeenCalledWith('/orders/user/1', { params: { page: 1 } })
      })
    })

    describe('getAllOrders', () => {
      it('should call GET /orders with params', async () => {
        mockApi.get.mockResolvedValue({ data: [] })
        await orderApi.getAllOrders({ page: 1 })
        expect(mockApi.get).toHaveBeenCalledWith('/orders', { params: { page: 1 } })
      })
    })

    describe('payOrder', () => {
      it('should call POST /orders/:id/pay with paymentMethod param', async () => {
        mockApi.post.mockResolvedValue({ data: { status: 'PAID' } })
        await orderApi.payOrder(1, 'CREDIT_CARD')
        expect(mockApi.post).toHaveBeenCalledWith('/orders/1/pay', null, { params: { paymentMethod: 'CREDIT_CARD' } })
      })
    })

    describe('shipOrder', () => {
      it('should call POST /orders/:id/ship with tracking params', async () => {
        mockApi.post.mockResolvedValue({ data: { status: 'SHIPPED' } })
        await orderApi.shipOrder(1, 'TRACK123', 'UPS')
        expect(mockApi.post).toHaveBeenCalledWith('/orders/1/ship', null, { params: { trackingNumber: 'TRACK123', courier: 'UPS' } })
      })
    })

    describe('deliverOrder', () => {
      it('should call POST /orders/:id/deliver', async () => {
        mockApi.post.mockResolvedValue({ data: { status: 'DELIVERED' } })
        await orderApi.deliverOrder(1)
        expect(mockApi.post).toHaveBeenCalledWith('/orders/1/deliver')
      })
    })

    describe('completeOrder', () => {
      it('should call POST /orders/:id/complete', async () => {
        mockApi.post.mockResolvedValue({ data: { status: 'COMPLETED' } })
        await orderApi.completeOrder(1)
        expect(mockApi.post).toHaveBeenCalledWith('/orders/1/complete')
      })
    })

    describe('cancelOrder', () => {
      it('should call POST /orders/:id/cancel with reason param', async () => {
        mockApi.post.mockResolvedValue({ data: { status: 'CANCELLED' } })
        await orderApi.cancelOrder(1, 'Customer request')
        expect(mockApi.post).toHaveBeenCalledWith('/orders/1/cancel', null, { params: { reason: 'Customer request' } })
      })
    })

    describe('getRevenue', () => {
      it('should call GET /orders/revenue with date range params', async () => {
        mockApi.get.mockResolvedValue({ data: 1000 })
        await orderApi.getRevenue('2024-01-01', '2024-01-31')
        expect(mockApi.get).toHaveBeenCalledWith('/orders/revenue', { params: { startDate: '2024-01-01', endDate: '2024-01-31' } })
      })
    })

    describe('getStatistics', () => {
      it('should call GET /orders/statistics', async () => {
        mockApi.get.mockResolvedValue({ data: {} })
        await orderApi.getStatistics()
        expect(mockApi.get).toHaveBeenCalledWith('/orders/statistics')
      })
    })

    describe('getAverageOrderValue', () => {
      it('should call GET /orders/average-value', async () => {
        mockApi.get.mockResolvedValue({ data: 100 })
        await orderApi.getAverageOrderValue()
        expect(mockApi.get).toHaveBeenCalledWith('/orders/average-value')
      })
    })
  })

  describe('Price Calculator', () => {
    describe('calculateDiscount', () => {
      it('should calculate discount percentage correctly', () => {
        const discount = priceCalculator.calculateDiscount(100, 80)
        expect(discount).toBe(20)
      })

      it('should return 0 when no discount', () => {
        const discount = priceCalculator.calculateDiscount(100, 100)
        expect(discount).toBe(0)
      })

      it('should return 0 when discountPrice is greater than price', () => {
        const discount = priceCalculator.calculateDiscount(100, 120)
        expect(discount).toBe(0)
      })

      it('should return 0 when discountPrice is 0', () => {
        const discount = priceCalculator.calculateDiscount(100, 0)
        expect(discount).toBe(0)
      })

      it('should return 0 when discountPrice is null/undefined', () => {
        expect(priceCalculator.calculateDiscount(100, null)).toBe(0)
        expect(priceCalculator.calculateDiscount(100, undefined)).toBe(0)
      })
    })

    describe('calculateTotal', () => {
      it('should calculate total with regular price', () => {
        const items = [
          { price: 100, discountPrice: 0, quantity: 2 },
          { price: 50, discountPrice: 0, quantity: 1 }
        ]
        expect(priceCalculator.calculateTotal(items)).toBe(250)
      })

      it('should calculate total with discount price', () => {
        const items = [
          { price: 100, discountPrice: 80, quantity: 2 },
          { price: 50, discountPrice: 40, quantity: 1 }
        ]
        expect(priceCalculator.calculateTotal(items)).toBe(200)
      })

      it('should return 0 for empty array', () => {
        expect(priceCalculator.calculateTotal([])).toBe(0)
      })

      it('should handle mixed items with and without discount', () => {
        const items = [
          { price: 100, discountPrice: 80, quantity: 1 },
          { price: 50, discountPrice: 0, quantity: 2 }
        ]
        expect(priceCalculator.calculateTotal(items)).toBe(180)
      })
    })

    describe('formatPrice', () => {
      it('should format price with 2 decimal places', () => {
        expect(priceCalculator.formatPrice(100)).toBe('100.00')
        expect(priceCalculator.formatPrice(100.5)).toBe('100.50')
        expect(priceCalculator.formatPrice(100.555)).toBe('100.56')
      })

      it('should handle string input', () => {
        expect(priceCalculator.formatPrice('100.5')).toBe('100.50')
      })
    })

    describe('isInStock', () => {
      it('should return true when stock > 0', () => {
        expect(priceCalculator.isInStock(10)).toBe(true)
        expect(priceCalculator.isInStock(1)).toBe(true)
      })

      it('should return falsy when stock is 0', () => {
        expect(priceCalculator.isInStock(0)).toBeFalsy()
      })

      it('should return falsy when stock is negative', () => {
        expect(priceCalculator.isInStock(-1)).toBeFalsy()
      })

      it('should return falsy when stock is null/undefined', () => {
        expect(priceCalculator.isInStock(null)).toBeFalsy()
        expect(priceCalculator.isInStock(undefined)).toBeFalsy()
      })
    })
  })

  describe('Order Status Formatter', () => {
    describe('getStatusInfo', () => {
      it('should return correct info for PENDING status', () => {
        const info = orderStatusFormatter.getStatusInfo('PENDING')
        expect(info.label).toBe('待支付')
        expect(info.color).toBe('warning')
      })

      it('should return correct info for PAID status', () => {
        const info = orderStatusFormatter.getStatusInfo('PAID')
        expect(info.label).toBe('已支付')
        expect(info.color).toBe('primary')
      })

      it('should return correct info for DELIVERED status', () => {
        const info = orderStatusFormatter.getStatusInfo('DELIVERED')
        expect(info.label).toBe('已送达')
        expect(info.color).toBe('success')
      })

      it('should return correct info for CANCELLED status', () => {
        const info = orderStatusFormatter.getStatusInfo('CANCELLED')
        expect(info.label).toBe('已取消')
        expect(info.color).toBe('danger')
      })

      it('should return status as label for unknown status', () => {
        const info = orderStatusFormatter.getStatusInfo('UNKNOWN')
        expect(info.label).toBe('UNKNOWN')
        expect(info.color).toBe('')
      })
    })

    describe('canCancel', () => {
      it('should return true for PENDING status', () => {
        expect(orderStatusFormatter.canCancel('PENDING')).toBe(true)
      })

      it('should return true for PAID status', () => {
        expect(orderStatusFormatter.canCancel('PAID')).toBe(true)
      })

      it('should return true for PROCESSING status', () => {
        expect(orderStatusFormatter.canCancel('PROCESSING')).toBe(true)
      })

      it('should return false for SHIPPED status', () => {
        expect(orderStatusFormatter.canCancel('SHIPPED')).toBe(false)
      })

      it('should return false for DELIVERED status', () => {
        expect(orderStatusFormatter.canCancel('DELIVERED')).toBe(false)
      })

      it('should return false for CANCELLED status', () => {
        expect(orderStatusFormatter.canCancel('CANCELLED')).toBe(false)
      })

      it('should return false for COMPLETED status', () => {
        expect(orderStatusFormatter.canCancel('COMPLETED')).toBe(false)
      })
    })

    describe('canShip', () => {
      it('should return true for PAID status', () => {
        expect(orderStatusFormatter.canShip('PAID')).toBe(true)
      })

      it('should return true for PROCESSING status', () => {
        expect(orderStatusFormatter.canShip('PROCESSING')).toBe(true)
      })

      it('should return false for PENDING status', () => {
        expect(orderStatusFormatter.canShip('PENDING')).toBe(false)
      })

      it('should return false for SHIPPED status', () => {
        expect(orderStatusFormatter.canShip('SHIPPED')).toBe(false)
      })

      it('should return false for DELIVERED status', () => {
        expect(orderStatusFormatter.canShip('DELIVERED')).toBe(false)
      })

      it('should return false for CANCELLED status', () => {
        expect(orderStatusFormatter.canShip('CANCELLED')).toBe(false)
      })
    })
  })
})
