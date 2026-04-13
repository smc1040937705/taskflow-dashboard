import axios from 'axios'
import { ElMessage } from 'element-plus'

jest.mock('axios')
jest.mock('element-plus', () => ({
  ElMessage: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  }
}))

const createMockAxiosInstance = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
})

let mockAxiosInstance

describe('API Module', () => {
  beforeEach(() => {
    mockAxiosInstance = createMockAxiosInstance()
    axios.create.mockReturnValue(mockAxiosInstance)
    jest.clearAllMocks()
  })

  describe('Response Interceptor Error Handling', () => {
    let responseInterceptor

    const setupInterceptor = () => {
      jest.isolateModules(() => {
        require('@/api/index')
        const calls = mockAxiosInstance.interceptors.response.use.mock.calls
        if (calls.length > 0) {
          responseInterceptor = {
            success: calls[0][0],
            error: calls[0][1]
          }
        }
      })
    }

    beforeEach(() => {
      setupInterceptor()
    })

    it('should call ElMessage.error with error message from response', async () => {
      const error = {
        response: {
          data: { message: '用户名已存在' }
        }
      }

      try {
        await responseInterceptor.error(error)
      } catch (e) {
        // Expected to throw
      }

      expect(ElMessage.error).toHaveBeenCalledWith('用户名已存在')
    })

    it('should call ElMessage.error with default message when no message in response', async () => {
      const error = {
        response: {
          data: {}
        }
      }

      try {
        await responseInterceptor.error(error)
      } catch (e) {
        // Expected to throw
      }

      expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
    })

    it('should call ElMessage.error with default message when no response', async () => {
      const error = {}

      try {
        await responseInterceptor.error(error)
      } catch (e) {
        // Expected to throw
      }

      expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
    })

    it('should reject the error after showing message', async () => {
      const error = {
        response: {
          data: { message: '服务器错误' }
        }
      }

      await expect(responseInterceptor.error(error)).rejects.toEqual(error)
    })

    it('should return response.data for successful response', () => {
      const response = {
        data: { id: 1, name: 'test' }
      }

      const result = responseInterceptor.success(response)

      expect(result).toEqual({ id: 1, name: 'test' })
    })
  })

  describe('Request Interceptor', () => {
    let requestInterceptor

    const setupInterceptor = () => {
      jest.isolateModules(() => {
        require('@/api/index')
        const calls = mockAxiosInstance.interceptors.request.use.mock.calls
        if (calls.length > 0) {
          requestInterceptor = {
            success: calls[0][0],
            error: calls[0][1]
          }
        }
      })
    }

    beforeEach(() => {
      setupInterceptor()
    })

    it('should return config unchanged for successful request', () => {
      const config = {
        url: '/users',
        method: 'get',
        headers: {}
      }

      const result = requestInterceptor.success(config)

      expect(result).toEqual(config)
    })

    it('should reject error for failed request', async () => {
      const error = new Error('Request failed')

      await expect(requestInterceptor.error(error)).rejects.toThrow('Request failed')
    })
  })

  describe('Axios Instance Configuration', () => {
    it('should create axios instance with correct config', () => {
      jest.isolateModules(() => {
        require('@/api/index')
        expect(axios.create).toHaveBeenCalledWith({
          baseURL: '/api',
          timeout: 10000
        })
      })
    })

    it('should setup request interceptor', () => {
      jest.isolateModules(() => {
        require('@/api/index')
        expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      })
    })

    it('should setup response interceptor', () => {
      jest.isolateModules(() => {
        require('@/api/index')
        expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
      })
    })
  })

  describe('userApi', () => {
    let userApi

    beforeEach(() => {
      jest.isolateModules(() => {
        userApi = require('@/api/index').userApi
      })
    })

    describe('createUser', () => {
      it('should call POST /users with data', async () => {
        const userData = { username: 'testuser', email: 'test@example.com' }
        mockAxiosInstance.post.mockResolvedValue({ data: { id: 1, ...userData } })

        const result = await userApi.createUser(userData)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', userData)
        expect(result).toEqual({ data: { id: 1, ...userData } })
      })

      it('should handle create user error', async () => {
        const userData = { username: 'testuser' }
        const error = new Error('Username already exists')
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(userApi.createUser(userData)).rejects.toThrow('Username already exists')
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', userData)
      })

      it('should handle validation error with details', async () => {
        const validationError = {
          response: {
            status: 400,
            data: {
              message: 'Validation failed',
              errors: ['Username is required', 'Email is invalid']
            }
          }
        }
        mockAxiosInstance.post.mockRejectedValue(validationError)

        await expect(userApi.createUser({})).rejects.toEqual(validationError)
      })
    })

    describe('getUserById', () => {
      it('should call GET /users/:id', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { id: 1, username: 'testuser' } })

        const result = await userApi.getUserById(1)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/1')
        expect(result).toEqual({ data: { id: 1, username: 'testuser' } })
      })

      it('should handle user not found error', async () => {
        const error = { response: { data: { message: 'User not found' } } }
        mockAxiosInstance.get.mockRejectedValue(error)

        await expect(userApi.getUserById(999)).rejects.toEqual(error)
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/999')
      })
    })

    describe('getAllUsers', () => {
      it('should call GET /users with params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await userApi.getAllUsers({ page: 1, size: 10 })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: { page: 1, size: 10 } })
        expect(result).toEqual({ data: [] })
      })

      it('should call GET /users without params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await userApi.getAllUsers()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: undefined })
      })
    })

    describe('searchUsers', () => {
      it('should call GET /users/search with keyword and params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await userApi.searchUsers('test', { page: 1 })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/search', { params: { keyword: 'test', page: 1 } })
        expect(result).toEqual({ data: [] })
      })

      it('should call GET /users/search with only keyword', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await userApi.searchUsers('john')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/search', { params: { keyword: 'john' } })
      })
    })

    describe('updateUser', () => {
      it('should call PUT /users/:id with data', async () => {
        const updateData = { email: 'new@example.com' }
        mockAxiosInstance.put.mockResolvedValue({ data: { id: 1, ...updateData } })

        const result = await userApi.updateUser(1, updateData)

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', updateData)
        expect(result).toEqual({ data: { id: 1, ...updateData } })
      })

      it('should handle update error', async () => {
        const error = { response: { status: 403, data: { message: 'Forbidden' } } }
        mockAxiosInstance.put.mockRejectedValue(error)

        await expect(userApi.updateUser(1, {})).rejects.toEqual(error)
      })
    })

    describe('deleteUser', () => {
      it('should call DELETE /users/:id', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} })

        const result = await userApi.deleteUser(1)

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1')
        expect(result).toEqual({ data: {} })
      })

      it('should handle delete error', async () => {
        const error = { response: { status: 404, data: { message: 'User not found' } } }
        mockAxiosInstance.delete.mockRejectedValue(error)

        await expect(userApi.deleteUser(999)).rejects.toEqual(error)
      })
    })

    describe('addBalance', () => {
      it('should call POST /users/:id/balance/add with amount param', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { balance: 200 } })

        const result = await userApi.addBalance(1, 100)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/1/balance/add', null, { params: { amount: 100 } })
        expect(result).toEqual({ data: { balance: 200 } })
      })

      it('should handle negative amount', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { balance: 50 } })

        await userApi.addBalance(1, -50)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/1/balance/add', null, { params: { amount: -50 } })
      })

      it('should handle zero amount', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { balance: 100 } })

        await userApi.addBalance(1, 0)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/1/balance/add', null, { params: { amount: 0 } })
      })
    })

    describe('changeRole', () => {
      it('should call PUT /users/:id/role with role param', async () => {
        mockAxiosInstance.put.mockResolvedValue({ data: { role: 'ADMIN' } })

        const result = await userApi.changeRole(1, 'ADMIN')

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1/role', null, { params: { role: 'ADMIN' } })
        expect(result).toEqual({ data: { role: 'ADMIN' } })
      })

      it('should handle different roles', async () => {
        mockAxiosInstance.put.mockResolvedValue({ data: { role: 'MANAGER' } })

        await userApi.changeRole(2, 'MANAGER')

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/2/role', null, { params: { role: 'MANAGER' } })
      })
    })

    describe('redeemPoints', () => {
      it('should call POST /users/:id/loyalty/redeem with points param', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { points: 50 } })

        const result = await userApi.redeemPoints(1, 100)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/1/loyalty/redeem', null, { params: { points: 100 } })
        expect(result).toEqual({ data: { points: 50 } })
      })

      it('should handle insufficient points error', async () => {
        const error = { response: { status: 400, data: { message: 'Insufficient points' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(userApi.redeemPoints(1, 10000)).rejects.toEqual(error)
      })
    })

    describe('getActiveUserCount', () => {
      it('should call GET /users/active/count', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { count: 10 } })

        const result = await userApi.getActiveUserCount()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/active/count')
        expect(result).toEqual({ data: { count: 10 } })
      })
    })
  })

  describe('productApi', () => {
    let productApi

    beforeEach(() => {
      jest.isolateModules(() => {
        productApi = require('@/api/index').productApi
      })
    })

    describe('createProduct', () => {
      it('should call POST /products with data', async () => {
        const productData = { name: 'Product 1', price: 100 }
        mockAxiosInstance.post.mockResolvedValue({ data: { id: 1, ...productData } })

        const result = await productApi.createProduct(productData)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products', productData)
        expect(result).toEqual({ data: { id: 1, ...productData } })
      })

      it('should handle create product error', async () => {
        const error = { response: { status: 400, data: { message: 'Invalid product data' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(productApi.createProduct({})).rejects.toEqual(error)
      })
    })

    describe('getProductById', () => {
      it('should call GET /products/:id', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { id: 1, name: 'Product 1' } })

        const result = await productApi.getProductById(1)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/1')
        expect(result).toEqual({ data: { id: 1, name: 'Product 1' } })
      })

      it('should handle product not found', async () => {
        const error = { response: { status: 404, data: { message: 'Product not found' } } }
        mockAxiosInstance.get.mockRejectedValue(error)

        await expect(productApi.getProductById(999)).rejects.toEqual(error)
      })
    })

    describe('getAllProducts', () => {
      it('should call GET /products with params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await productApi.getAllProducts({ category: 'Electronics' })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', { params: { category: 'Electronics' } })
        expect(result).toEqual({ data: [] })
      })

      it('should call GET /products without params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await productApi.getAllProducts()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products', { params: undefined })
      })
    })

    describe('searchProducts', () => {
      it('should call GET /products/search with keyword and params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await productApi.searchProducts('phone', { minPrice: 100 })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/search', { params: { keyword: 'phone', minPrice: 100 } })
        expect(result).toEqual({ data: [] })
      })

      it('should call GET /products/search with only keyword', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await productApi.searchProducts('laptop')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/search', { params: { keyword: 'laptop' } })
      })
    })

    describe('updateProduct', () => {
      it('should call PUT /products/:id with data', async () => {
        const updateData = { price: 150 }
        mockAxiosInstance.put.mockResolvedValue({ data: { id: 1, ...updateData } })

        const result = await productApi.updateProduct(1, updateData)

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/products/1', updateData)
        expect(result).toEqual({ data: { id: 1, ...updateData } })
      })

      it('should handle update error', async () => {
        const error = { response: { status: 403, data: { message: 'Forbidden' } } }
        mockAxiosInstance.put.mockRejectedValue(error)

        await expect(productApi.updateProduct(1, {})).rejects.toEqual(error)
      })
    })

    describe('deleteProduct', () => {
      it('should call DELETE /products/:id', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: {} })

        const result = await productApi.deleteProduct(1)

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/products/1')
        expect(result).toEqual({ data: {} })
      })

      it('should handle delete error', async () => {
        const error = { response: { status: 404, data: { message: 'Product not found' } } }
        mockAxiosInstance.delete.mockRejectedValue(error)

        await expect(productApi.deleteProduct(999)).rejects.toEqual(error)
      })
    })

    describe('addStock', () => {
      it('should call POST /products/:id/stock/add with quantity param', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { stock: 20 } })

        const result = await productApi.addStock(1, 10)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products/1/stock/add', null, { params: { quantity: 10 } })
        expect(result).toEqual({ data: { stock: 20 } })
      })

      it('should handle negative quantity', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { stock: 5 } })

        await productApi.addStock(1, -5)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/products/1/stock/add', null, { params: { quantity: -5 } })
      })
    })

    describe('getLowStockProducts', () => {
      it('should call GET /products/low-stock with threshold param', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await productApi.getLowStockProducts(5)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/low-stock', { params: { threshold: 5 } })
        expect(result).toEqual({ data: [] })
      })

      it('should handle different threshold values', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await productApi.getLowStockProducts(10)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/low-stock', { params: { threshold: 10 } })
      })
    })

    describe('getBestSelling', () => {
      it('should call GET /products/best-selling with limit param', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await productApi.getBestSelling(10)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/best-selling', { params: { limit: 10 } })
        expect(result).toEqual({ data: [] })
      })

      it('should handle different limit values', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await productApi.getBestSelling(5)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/best-selling', { params: { limit: 5 } })
      })
    })
  })

  describe('orderApi', () => {
    let orderApi

    beforeEach(() => {
      jest.isolateModules(() => {
        orderApi = require('@/api/index').orderApi
      })
    })

    describe('createOrder', () => {
      it('should call POST /orders with params', async () => {
        const orderData = { userId: 1, items: [], shippingAddress: 'Test' }
        mockAxiosInstance.post.mockResolvedValue({ data: { id: 1 } })

        const result = await orderApi.createOrder(orderData)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders', null, { params: orderData })
        expect(result).toEqual({ data: { id: 1 } })
      })

      it('should handle create order error', async () => {
        const error = { response: { status: 400, data: { message: 'Invalid order data' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(orderApi.createOrder({})).rejects.toEqual(error)
      })
    })

    describe('getOrderById', () => {
      it('should call GET /orders/:id', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { id: 1, status: 'PENDING' } })

        const result = await orderApi.getOrderById(1)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/1')
        expect(result).toEqual({ data: { id: 1, status: 'PENDING' } })
      })

      it('should handle order not found', async () => {
        const error = { response: { status: 404, data: { message: 'Order not found' } } }
        mockAxiosInstance.get.mockRejectedValue(error)

        await expect(orderApi.getOrderById(999)).rejects.toEqual(error)
      })
    })

    describe('getOrdersByUser', () => {
      it('should call GET /orders/user/:userId with params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await orderApi.getOrdersByUser(1, { status: 'PAID' })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/user/1', { params: { status: 'PAID' } })
        expect(result).toEqual({ data: [] })
      })

      it('should call GET /orders/user/:userId without params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await orderApi.getOrdersByUser(1)

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/user/1', { params: undefined })
      })
    })

    describe('getAllOrders', () => {
      it('should call GET /orders with params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        const result = await orderApi.getAllOrders({ page: 1 })

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders', { params: { page: 1 } })
        expect(result).toEqual({ data: [] })
      })

      it('should call GET /orders without params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: [] })

        await orderApi.getAllOrders()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders', { params: undefined })
      })
    })

    describe('payOrder', () => {
      it('should call POST /orders/:id/pay with paymentMethod param', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { status: 'PAID' } })

        const result = await orderApi.payOrder(1, 'CREDIT_CARD')

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/pay', null, { params: { paymentMethod: 'CREDIT_CARD' } })
        expect(result).toEqual({ data: { status: 'PAID' } })
      })

      it('should handle different payment methods', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { status: 'PAID' } })

        await orderApi.payOrder(1, 'PAYPAL')

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/pay', null, { params: { paymentMethod: 'PAYPAL' } })
      })

      it('should handle payment error', async () => {
        const error = { response: { status: 400, data: { message: 'Payment failed' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(orderApi.payOrder(1, 'CREDIT_CARD')).rejects.toEqual(error)
      })
    })

    describe('shipOrder', () => {
      it('should call POST /orders/:id/ship with trackingNumber and courier params', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { status: 'SHIPPED' } })

        const result = await orderApi.shipOrder(1, 'TRACK123', 'FedEx')

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/ship', null, { params: { trackingNumber: 'TRACK123', courier: 'FedEx' } })
        expect(result).toEqual({ data: { status: 'SHIPPED' } })
      })

      it('should handle ship error', async () => {
        const error = { response: { status: 400, data: { message: 'Cannot ship order' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(orderApi.shipOrder(1, 'TRACK123', 'FedEx')).rejects.toEqual(error)
      })
    })

    describe('deliverOrder', () => {
      it('should call POST /orders/:id/deliver', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { status: 'DELIVERED' } })

        const result = await orderApi.deliverOrder(1)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/deliver')
        expect(result).toEqual({ data: { status: 'DELIVERED' } })
      })

      it('should handle deliver error', async () => {
        const error = { response: { status: 400, data: { message: 'Cannot deliver order' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(orderApi.deliverOrder(1)).rejects.toEqual(error)
      })
    })

    describe('completeOrder', () => {
      it('should call POST /orders/:id/complete', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { status: 'COMPLETED' } })

        const result = await orderApi.completeOrder(1)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/complete')
        expect(result).toEqual({ data: { status: 'COMPLETED' } })
      })

      it('should handle complete error', async () => {
        const error = { response: { status: 400, data: { message: 'Cannot complete order' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(orderApi.completeOrder(1)).rejects.toEqual(error)
      })
    })

    describe('cancelOrder', () => {
      it('should call POST /orders/:id/cancel with reason param', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: { status: 'CANCELLED' } })

        const result = await orderApi.cancelOrder(1, 'Customer request')

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/orders/1/cancel', null, { params: { reason: 'Customer request' } })
        expect(result).toEqual({ data: { status: 'CANCELLED' } })
      })

      it('should handle cancel error', async () => {
        const error = { response: { status: 400, data: { message: 'Cannot cancel order' } } }
        mockAxiosInstance.post.mockRejectedValue(error)

        await expect(orderApi.cancelOrder(1, 'reason')).rejects.toEqual(error)
      })
    })

    describe('getRevenue', () => {
      it('should call GET /orders/revenue with date params', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { revenue: 10000 } })

        const result = await orderApi.getRevenue('2024-01-01', '2024-12-31')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/revenue', { params: { startDate: '2024-01-01', endDate: '2024-12-31' } })
        expect(result).toEqual({ data: { revenue: 10000 } })
      })
    })

    describe('getStatistics', () => {
      it('should call GET /orders/statistics', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { total: 100 } })

        const result = await orderApi.getStatistics()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/statistics')
        expect(result).toEqual({ data: { total: 100 } })
      })
    })

    describe('getAverageOrderValue', () => {
      it('should call GET /orders/average-value', async () => {
        mockAxiosInstance.get.mockResolvedValue({ data: { average: 250 } })

        const result = await orderApi.getAverageOrderValue()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/orders/average-value')
        expect(result).toEqual({ data: { average: 250 } })
      })
    })
  })

  describe('Error Handling', () => {
    let userApi

    beforeEach(() => {
      jest.isolateModules(() => {
        userApi = require('@/api/index').userApi
      })
    })

    it('should handle network error', async () => {
      const networkError = new Error('Network Error')
      networkError.code = 'ERR_NETWORK'
      mockAxiosInstance.get.mockRejectedValue(networkError)

      await expect(userApi.getUserById(1)).rejects.toThrow('Network Error')
    })

    it('should handle timeout error', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      mockAxiosInstance.get.mockRejectedValue(timeoutError)

      await expect(userApi.getUserById(1)).rejects.toThrow('timeout of 10000ms exceeded')
    })

    it('should handle 401 unauthorized error', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }
      mockAxiosInstance.get.mockRejectedValue(authError)

      await expect(userApi.getUserById(1)).rejects.toEqual(authError)
    })

    it('should handle 404 not found error', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      }
      mockAxiosInstance.get.mockRejectedValue(notFoundError)

      await expect(userApi.getUserById(999)).rejects.toEqual(notFoundError)
    })

    it('should handle 500 server error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }
      mockAxiosInstance.post.mockRejectedValue(serverError)

      await expect(userApi.createUser({})).rejects.toEqual(serverError)
    })

    it('should handle error without response data', async () => {
      const error = new Error('Unknown error')
      mockAxiosInstance.get.mockRejectedValue(error)

      await expect(userApi.getUserById(1)).rejects.toThrow('Unknown error')
    })
  })

  describe('priceCalculator', () => {
    let priceCalculator

    beforeEach(() => {
      jest.isolateModules(() => {
        priceCalculator = require('@/api/index').priceCalculator
      })
    })

    describe('calculateDiscount', () => {
      it('should calculate discount percentage correctly', () => {
        const result = priceCalculator.calculateDiscount(100, 80)
        expect(result).toBe(20)
      })

      it('should return 0 when discount price is not provided', () => {
        expect(priceCalculator.calculateDiscount(100, null)).toBe(0)
        expect(priceCalculator.calculateDiscount(100, undefined)).toBe(0)
      })

      it('should return 0 when discount price is higher than or equal to regular price', () => {
        expect(priceCalculator.calculateDiscount(100, 120)).toBe(0)
        expect(priceCalculator.calculateDiscount(100, 100)).toBe(0)
      })

      it('should round the discount percentage', () => {
        expect(priceCalculator.calculateDiscount(100, 75)).toBe(25)
        expect(priceCalculator.calculateDiscount(99, 49)).toBe(51)
      })
    })

    describe('calculateTotal', () => {
      it('should calculate total using regular price', () => {
        const items = [
          { price: 100, discountPrice: 0, quantity: 2 },
          { price: 50, discountPrice: 0, quantity: 1 }
        ]
        expect(priceCalculator.calculateTotal(items)).toBe(250)
      })

      it('should use discount price when available', () => {
        const items = [
          { price: 100, discountPrice: 80, quantity: 2 },
          { price: 50, discountPrice: 40, quantity: 1 }
        ]
        expect(priceCalculator.calculateTotal(items)).toBe(200)
      })

      it('should return 0 for empty items', () => {
        expect(priceCalculator.calculateTotal([])).toBe(0)
      })

      it('should handle mixed discount and regular prices', () => {
        const items = [
          { price: 100, discountPrice: 80, quantity: 2 },
          { price: 50, discountPrice: 0, quantity: 1 }
        ]
        expect(priceCalculator.calculateTotal(items)).toBe(210)
      })
    })

    describe('formatPrice', () => {
      it('should format price with 2 decimal places', () => {
        expect(priceCalculator.formatPrice(100)).toBe('100.00')
        expect(priceCalculator.formatPrice(99.9)).toBe('99.90')
        expect(priceCalculator.formatPrice(99.999)).toBe('100.00')
      })
    })

    describe('isInStock', () => {
      it('should return true when stock is positive', () => {
        expect(priceCalculator.isInStock(1)).toBe(true)
        expect(priceCalculator.isInStock(100)).toBe(true)
      })

      it('should return falsy value when stock is 0, null or undefined', () => {
        expect(priceCalculator.isInStock(0)).toBeFalsy()
        expect(priceCalculator.isInStock(null)).toBeFalsy()
        expect(priceCalculator.isInStock(undefined)).toBeFalsy()
      })
    })
  })

  describe('orderStatusFormatter', () => {
    let orderStatusFormatter

    beforeEach(() => {
      jest.isolateModules(() => {
        orderStatusFormatter = require('@/api/index').orderStatusFormatter
      })
    })

    describe('getStatusInfo', () => {
      it('should return correct status info for all statuses', () => {
        expect(orderStatusFormatter.getStatusInfo('PENDING')).toEqual({ label: '待支付', color: 'warning' })
        expect(orderStatusFormatter.getStatusInfo('PAID')).toEqual({ label: '已支付', color: 'primary' })
        expect(orderStatusFormatter.getStatusInfo('SHIPPED')).toEqual({ label: '已发货', color: '' })
        expect(orderStatusFormatter.getStatusInfo('DELIVERED')).toEqual({ label: '已送达', color: 'success' })
        expect(orderStatusFormatter.getStatusInfo('CANCELLED')).toEqual({ label: '已取消', color: 'danger' })
        expect(orderStatusFormatter.getStatusInfo('COMPLETED')).toEqual({ label: '已完成', color: 'success' })
      })

      it('should return default info for unknown status', () => {
        expect(orderStatusFormatter.getStatusInfo('UNKNOWN')).toEqual({ label: 'UNKNOWN', color: '' })
      })
    })

    describe('canCancel', () => {
      it('should return true for cancellable statuses', () => {
        expect(orderStatusFormatter.canCancel('PENDING')).toBe(true)
        expect(orderStatusFormatter.canCancel('PAID')).toBe(true)
        expect(orderStatusFormatter.canCancel('PROCESSING')).toBe(true)
      })

      it('should return false for non-cancellable statuses', () => {
        expect(orderStatusFormatter.canCancel('SHIPPED')).toBe(false)
        expect(orderStatusFormatter.canCancel('DELIVERED')).toBe(false)
        expect(orderStatusFormatter.canCancel('CANCELLED')).toBe(false)
        expect(orderStatusFormatter.canCancel('COMPLETED')).toBe(false)
      })
    })

    describe('canShip', () => {
      it('should return true for shippable statuses', () => {
        expect(orderStatusFormatter.canShip('PAID')).toBe(true)
        expect(orderStatusFormatter.canShip('PROCESSING')).toBe(true)
      })

      it('should return false for non-shippable statuses', () => {
        expect(orderStatusFormatter.canShip('PENDING')).toBe(false)
        expect(orderStatusFormatter.canShip('SHIPPED')).toBe(false)
        expect(orderStatusFormatter.canShip('DELIVERED')).toBe(false)
        expect(orderStatusFormatter.canShip('CANCELLED')).toBe(false)
        expect(orderStatusFormatter.canShip('COMPLETED')).toBe(false)
      })
    })
  })
})
