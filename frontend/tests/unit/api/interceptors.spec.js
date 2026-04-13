import { ElMessage } from 'element-plus'

// Mock element-plus
jest.mock('element-plus', () => ({
  ElMessage: {
    error: jest.fn()
  }
}))

// Mock axios
const mockInterceptors = {
  request: { use: jest.fn() },
  response: { use: jest.fn() }
}

const mockAxios = {
  interceptors: mockInterceptors,
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxios)
}))

describe('API Interceptors', () => {
  let requestSuccessHandler
  let requestErrorHandler
  let responseSuccessHandler
  let responseErrorHandler

  beforeAll(() => {
    // 捕获拦截器处理器
    mockInterceptors.request.use.mockImplementation((onFulfilled, onRejected) => {
      requestSuccessHandler = onFulfilled
      requestErrorHandler = onRejected
    })
    
    mockInterceptors.response.use.mockImplementation((onFulfilled, onRejected) => {
      responseSuccessHandler = onFulfilled
      responseErrorHandler = onRejected
    })

    // 加载模块以获取拦截器
    require('@/api/index')
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Request Interceptor', () => {
    describe('Success Handler', () => {
      it('should pass through config unchanged', () => {
        const config = { url: '/test', method: 'GET', headers: {} }
        const result = requestSuccessHandler(config)
        expect(result).toBe(config)
      })

      it('should handle config with data', () => {
        const config = { 
          url: '/users', 
          method: 'POST', 
          data: { name: 'test' },
          headers: { 'Content-Type': 'application/json' }
        }
        const result = requestSuccessHandler(config)
        expect(result).toBe(config)
        expect(result.data).toEqual({ name: 'test' })
      })
    })

    describe('Error Handler', () => {
      it('should reject with error when request fails', async () => {
        const error = new Error('Network Error')
        await expect(requestErrorHandler(error)).rejects.toBe(error)
      })

      it('should reject with timeout error', async () => {
        const timeoutError = new Error('Request timeout')
        await expect(requestErrorHandler(timeoutError)).rejects.toBe(timeoutError)
      })
    })
  })

  describe('Response Interceptor', () => {
    describe('Success Handler', () => {
      it('should return response.data', () => {
        const response = { data: { id: 1, name: 'test' }, status: 200, headers: {} }
        const result = responseSuccessHandler(response)
        expect(result).toEqual({ id: 1, name: 'test' })
      })

      it('should handle empty response data', () => {
        const response = { data: null, status: 204, headers: {} }
        const result = responseSuccessHandler(response)
        expect(result).toBeNull()
      })

      it('should handle array response data', () => {
        const response = { data: [{ id: 1 }, { id: 2 }], status: 200, headers: {} }
        const result = responseSuccessHandler(response)
        expect(result).toEqual([{ id: 1 }, { id: 2 }])
      })

      it('should handle primitive response data', () => {
        const response = { data: 'success', status: 200, headers: {} }
        const result = responseSuccessHandler(response)
        expect(result).toBe('success')
      })

      it('should handle numeric response data', () => {
        const response = { data: 12345, status: 200, headers: {} }
        const result = responseSuccessHandler(response)
        expect(result).toBe(12345)
      })

      it('should handle boolean response data', () => {
        const response = { data: true, status: 200, headers: {} }
        const result = responseSuccessHandler(response)
        expect(result).toBe(true)
      })
    })

    describe('Error Handler - ElMessage Error Notifications', () => {
      it('should show error message from response.data.message', async () => {
        const error = {
          response: {
            status: 400,
            data: { message: '用户不存在' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('用户不存在')
      })

      it('should show default error message when response.data has no message', async () => {
        const error = {
          response: {
            status: 500,
            data: { code: 'INTERNAL_ERROR' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should show default error message when response.data is empty', async () => {
        const error = {
          response: {
            status: 500,
            data: {}
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should show default error message when response is undefined', async () => {
        const error = new Error('Network Error')
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should show default error message when response.data is undefined', async () => {
        const error = {
          response: {
            status: 500
            // data is undefined
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should handle 401 unauthorized error with message', async () => {
        const error = {
          response: {
            status: 401,
            data: { message: '未授权访问' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('未授权访问')
      })

      it('should handle 403 forbidden error with message', async () => {
        const error = {
          response: {
            status: 403,
            data: { message: '权限不足' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('权限不足')
      })

      it('should handle 404 not found error with message', async () => {
        const error = {
          response: {
            status: 404,
            data: { message: '资源不存在' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('资源不存在')
      })

      it('should handle 500 server error with message', async () => {
        const error = {
          response: {
            status: 500,
            data: { message: '服务器内部错误' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('服务器内部错误')
      })

      it('should handle 502 bad gateway error', async () => {
        const error = {
          response: {
            status: 502,
            data: { message: '网关错误' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('网关错误')
      })

      it('should handle 503 service unavailable error', async () => {
        const error = {
          response: {
            status: 503,
            data: { message: '服务不可用' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('服务不可用')
      })

      it('should handle network error without response object', async () => {
        const networkError = new Error('Network Error')
        networkError.code = 'ECONNABORTED'
        
        responseErrorHandler(networkError).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should handle timeout error', async () => {
        const timeoutError = new Error('timeout of 10000ms exceeded')
        timeoutError.code = 'ECONNABORTED'
        
        responseErrorHandler(timeoutError).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should handle validation error with multiple messages', async () => {
        const error = {
          response: {
            status: 422,
            data: { message: '字段验证失败：用户名不能为空' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('字段验证失败：用户名不能为空')
      })

      it('should handle error with null message', async () => {
        const error = {
          response: {
            status: 400,
            data: { message: null }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should handle error with empty string message', async () => {
        const error = {
          response: {
            status: 400,
            data: { message: '' }
          }
        }
        
        responseErrorHandler(error).catch(() => {})
        
        expect(ElMessage.error).toHaveBeenCalledTimes(1)
        expect(ElMessage.error).toHaveBeenCalledWith('请求失败')
      })

      it('should reject with the error object after showing message', async () => {
        const error = {
          response: {
            status: 400,
            data: { message: '验证失败' }
          }
        }
        
        await expect(responseErrorHandler(error)).rejects.toBe(error)
        expect(ElMessage.error).toHaveBeenCalledWith('验证失败')
      })
    })
  })

  describe('Integration', () => {
    it('should properly chain request and response interceptors', () => {
      // 验证请求拦截器有两个处理器（成功和错误）
      expect(typeof requestSuccessHandler).toBe('function')
      expect(typeof requestErrorHandler).toBe('function')
      
      // 验证响应拦截器有两个处理器（成功和错误）
      expect(typeof responseSuccessHandler).toBe('function')
      expect(typeof responseErrorHandler).toBe('function')
    })

    it('should handle complete request-response cycle', () => {
      // 模拟请求配置
      const config = { url: '/test', method: 'GET' }
      const processedConfig = requestSuccessHandler(config)
      expect(processedConfig).toBe(config)
      
      // 模拟成功响应
      const response = { data: { success: true }, status: 200 }
      const result = responseSuccessHandler(response)
      expect(result).toEqual({ success: true })
    })

    it('should handle complete request-error cycle', async () => {
      // 模拟请求配置
      const config = { url: '/test', method: 'GET' }
      requestSuccessHandler(config)
      
      // 模拟错误响应
      const error = {
        response: {
          status: 400,
          data: { message: '请求参数错误' }
        }
      }
      
      await expect(responseErrorHandler(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledTimes(1)
      expect(ElMessage.error).toHaveBeenCalledWith('请求参数错误')
    })
  })
})
