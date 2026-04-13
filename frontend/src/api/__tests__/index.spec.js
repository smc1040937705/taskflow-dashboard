import axios from 'axios'
import { ElMessage } from 'element-plus'
import { userApi, productApi, orderApi, priceCalculator, orderStatusFormatter } from '../index'

jest.mock('axios')
jest.mock('element-plus', () => ({
  ElMessage: {
    error: jest.fn()
  }
}))

describe('API module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('userApi', () => {
    it('createUser calls post with correct url and data', async () => {
      const mockData = { username: 'test', email: 'test@example.com' }
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: { id: 1, ...mockData } }),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await userApi.createUser(mockData)
    })

    it('getUserById calls get with correct url', async () => {
      const mockResponse = { data: { id: 1, username: 'test' } }
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await userApi.getUserById(1)
    })

    it('updateUser calls put with correct url and data', async () => {
      const mockData = { email: 'new@example.com' }
      axios.create.mockReturnValue({
        put: jest.fn().mockResolvedValue({ data: { id: 1, ...mockData } }),
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await userApi.updateUser(1, mockData)
    })

    it('deleteUser calls delete with correct url', async () => {
      axios.create.mockReturnValue({
        delete: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await userApi.deleteUser(1)
    })
  })

  describe('productApi', () => {
    it('createProduct calls post with correct url', async () => {
      const mockData = { name: 'Test Product', price: 100 }
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: { id: 1, ...mockData } }),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await productApi.createProduct(mockData)
    })

    it('getAllProducts calls get with params', async () => {
      const mockParams = { page: 1, size: 10 }
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: [] }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await productApi.getAllProducts(mockParams)
    })

    it('searchProducts calls get with keyword', async () => {
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: [] }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await productApi.searchProducts('keyword', { page: 1 })
    })
  })

  describe('orderApi', () => {
    it('createOrder calls post with correct params', async () => {
      const mockData = { userId: 1, items: [] }
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: { id: 1 } }),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await orderApi.createOrder(mockData)
    })

    it('payOrder calls post with payment method', async () => {
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await orderApi.payOrder(1, 'WECHAT')
    })

    it('cancelOrder calls post with reason', async () => {
      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
      })
      
      await orderApi.cancelOrder(1, 'Changed mind')
    })
  })

  describe('priceCalculator', () => {
    it('calculateDiscount returns correct percentage', () => {
      expect(priceCalculator.calculateDiscount(100, 80)).toBe(20)
    })

    it('calculateDiscount returns 0 when no discount', () => {
      expect(priceCalculator.calculateDiscount(100, 0)).toBe(0)
      expect(priceCalculator.calculateDiscount(100, 100)).toBe(0)
      expect(priceCalculator.calculateDiscount(100, 120)).toBe(0)
    })

    it('calculateTotal sums items correctly', () => {
      const items = [
        { price: 100, discountPrice: 80, quantity: 2 },
        { price: 200, discountPrice: 0, quantity: 1 }
      ]
      expect(priceCalculator.calculateTotal(items)).toBe(360)
    })

    it('formatPrice returns two decimal places', () => {
      expect(priceCalculator.formatPrice(100)).toBe('100.00')
      expect(priceCalculator.formatPrice(9.9)).toBe('9.90')
    })

    it('isInStock returns correct boolean', () => {
      expect(priceCalculator.isInStock(5)).toBe(true)
      expect(priceCalculator.isInStock(0)).toBe(false)
      expect(priceCalculator.isInStock(null)).toBe(false)
    })
  })

  describe('orderStatusFormatter', () => {
    it('getStatusInfo returns correct label and color', () => {
      expect(orderStatusFormatter.getStatusInfo('PENDING')).toEqual({ label: '待支付', color: 'warning' })
      expect(orderStatusFormatter.getStatusInfo('PAID')).toEqual({ label: '已支付', color: 'primary' })
      expect(orderStatusFormatter.getStatusInfo('DELIVERED')).toEqual({ label: '已送达', color: 'success' })
    })

    it('getStatusInfo returns default for unknown status', () => {
      expect(orderStatusFormatter.getStatusInfo('UNKNOWN')).toEqual({ label: 'UNKNOWN', color: '' })
    })

    it('canCancel returns correct boolean', () => {
      expect(orderStatusFormatter.canCancel('PENDING')).toBe(true)
      expect(orderStatusFormatter.canCancel('PAID')).toBe(true)
      expect(orderStatusFormatter.canCancel('PROCESSING')).toBe(true)
      expect(orderStatusFormatter.canCancel('SHIPPED')).toBe(false)
      expect(orderStatusFormatter.canCancel('DELIVERED')).toBe(false)
    })

    it('canShip returns correct boolean', () => {
      expect(orderStatusFormatter.canShip('PAID')).toBe(true)
      expect(orderStatusFormatter.canShip('PROCESSING')).toBe(true)
      expect(orderStatusFormatter.canShip('PENDING')).toBe(false)
      expect(orderStatusFormatter.canShip('SHIPPED')).toBe(false)
    })
  })
})