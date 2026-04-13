import { config } from '@vue/test-utils'

config.global.mocks = {
  $router: {
    push: jest.fn()
  },
  $route: {
    params: {},
    query: {}
  }
}

jest.mock('element-plus', () => ({
  ElMessage: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  }
}))
