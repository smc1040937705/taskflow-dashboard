import store from '@/store'
import { ElMessage } from 'element-plus'

jest.mock('element-plus', () => ({
  ElMessage: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  }
}))

describe('Vuex Store', () => {
  beforeEach(() => {
    store.commit('cart/CLEAR_CART')
    store.commit('user/CLEAR_USER')
    store.commit('user/SET_USER_LIST', [])
    store.commit('SET_LOADING', false)
    jest.clearAllMocks()
  })

  describe('Root State', () => {
    it('should have loading state', () => {
      expect(store.state.loading).toBe(false)
    })

    it('should have cart module', () => {
      expect(store.state.cart).toBeDefined()
      expect(store.state.cart.items).toEqual([])
    })

    it('should have user module', () => {
      expect(store.state.user).toBeDefined()
      expect(store.state.user.currentUser).toBeNull()
      expect(store.state.user.userList).toEqual([])
    })
  })

  describe('Root Getters', () => {
    describe('isLoading', () => {
      it('should return false by default', () => {
        expect(store.getters.isLoading).toBe(false)
      })

      it('should return true when loading', () => {
        store.commit('SET_LOADING', true)
        expect(store.getters.isLoading).toBe(true)
      })
    })
  })

  describe('Root Mutations', () => {
    describe('SET_LOADING', () => {
      it('should set loading to true', () => {
        store.commit('SET_LOADING', true)
        expect(store.state.loading).toBe(true)
      })

      it('should set loading to false', () => {
        store.commit('SET_LOADING', true)
        store.commit('SET_LOADING', false)
        expect(store.state.loading).toBe(false)
      })
    })
  })

  describe('Root Actions', () => {
    describe('setLoading', () => {
      it('should commit SET_LOADING mutation', async () => {
        await store.dispatch('setLoading', true)
        expect(store.state.loading).toBe(true)

        await store.dispatch('setLoading', false)
        expect(store.state.loading).toBe(false)
      })
    })
  })

  describe('Cart Module Integration', () => {
    describe('State', () => {
      it('should have empty items array initially', () => {
        expect(store.state.cart.items).toEqual([])
      })
    })

    describe('Getters', () => {
      it('should return cart items', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)

        expect(store.getters['cart/cartItems']).toHaveLength(1)
      })

      it('should return cart item count', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)

        expect(store.getters['cart/cartItemCount']).toBe(2)
      })

      it('should return cart total', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)

        expect(store.getters['cart/cartTotal']).toBe(200)
      })
    })

    describe('Mutations', () => {
      it('should add item to cart', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)

        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should increase quantity for existing item', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)

        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(2)
      })

      it('should remove item from cart', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/REMOVE_FROM_CART', 1)

        expect(store.state.cart.items).toHaveLength(0)
      })

      it('should update item quantity', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 5 })

        expect(store.state.cart.items[0].quantity).toBe(5)
      })

      it('should clear cart', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/CLEAR_CART')

        expect(store.state.cart.items).toHaveLength(0)
      })
    })

    describe('Actions', () => {
      it('should add to cart via action', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        await store.dispatch('cart/addToCart', product)

        expect(store.state.cart.items).toHaveLength(1)
      })

      it('should remove from cart via action', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        await store.dispatch('cart/removeFromCart', 1)

        expect(store.state.cart.items).toHaveLength(0)
      })

      it('should update quantity via action', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        await store.dispatch('cart/updateQuantity', { productId: 1, quantity: 3 })

        expect(store.state.cart.items[0].quantity).toBe(3)
      })

      it('should clear cart via action', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        await store.dispatch('cart/clearCart')

        expect(store.state.cart.items).toHaveLength(0)
      })
    })
  })

  describe('User Module Integration', () => {
    describe('State', () => {
      it('should have null currentUser initially', () => {
        expect(store.state.user.currentUser).toBeNull()
      })

      it('should have empty userList initially', () => {
        expect(store.state.user.userList).toEqual([])
      })
    })

    describe('Getters', () => {
      it('should return isLoggedIn status', () => {
        expect(store.getters['user/isLoggedIn']).toBe(false)

        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)

        expect(store.getters['user/isLoggedIn']).toBe(true)
      })

      it('should return currentUserId', () => {
        expect(store.getters['user/currentUserId']).toBeUndefined()

        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)

        expect(store.getters['user/currentUserId']).toBe(1)
      })

      it('should return userRole', () => {
        expect(store.getters['user/userRole']).toBeUndefined()

        const user = { id: 1, username: 'testuser', role: 'ADMIN' }
        store.commit('user/SET_CURRENT_USER', user)

        expect(store.getters['user/userRole']).toBe('ADMIN')
      })

      it('should check hasPermission correctly', () => {
        const adminUser = { id: 1, username: 'admin', role: 'ADMIN' }
        store.commit('user/SET_CURRENT_USER', adminUser)

        expect(store.getters['user/hasPermission']('MANAGER')).toBe(true)
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(true)

        const customerUser = { id: 2, username: 'customer', role: 'CUSTOMER' }
        store.commit('user/SET_CURRENT_USER', customerUser)

        expect(store.getters['user/hasPermission']('ADMIN')).toBe(false)
        expect(store.getters['user/hasPermission']('MANAGER')).toBe(false)
      })
    })

    describe('Mutations', () => {
      it('should set current user', () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)

        expect(store.state.user.currentUser).toEqual(user)
      })

      it('should set user list', () => {
        const users = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }]
        store.commit('user/SET_USER_LIST', users)

        expect(store.state.user.userList).toEqual(users)
      })

      it('should clear user', () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        store.commit('user/CLEAR_USER')

        expect(store.state.user.currentUser).toBeNull()
      })

      it('should update user balance', () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        store.commit('user/UPDATE_USER_BALANCE', 200)

        expect(store.state.user.currentUser.balance).toBe(200)
      })

      it('should update user points', () => {
        const user = { id: 1, username: 'testuser', loyaltyPoints: 50 }
        store.commit('user/SET_CURRENT_USER', user)
        store.commit('user/UPDATE_USER_POINTS', 100)

        expect(store.state.user.currentUser.loyaltyPoints).toBe(100)
      })
    })

    describe('Actions', () => {
      it('should login user', async () => {
        const user = { id: 1, username: 'testuser' }
        await store.dispatch('user/login', user)

        expect(store.state.user.currentUser).toEqual(user)
      })

      it('should logout user', async () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        await store.dispatch('user/logout')

        expect(store.state.user.currentUser).toBeNull()
      })

      it('should update balance', async () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        await store.dispatch('user/updateBalance', 50)

        expect(store.state.user.currentUser.balance).toBe(150)
      })

      it('should update points', async () => {
        const user = { id: 1, username: 'testuser', loyaltyPoints: 50 }
        store.commit('user/SET_CURRENT_USER', user)
        await store.dispatch('user/updatePoints', 30)

        expect(store.state.user.currentUser.loyaltyPoints).toBe(80)
      })
    })
  })

  describe('Cross-Module Integration', () => {
    it('should handle complete shopping workflow', async () => {
      const user = { id: 1, username: 'testuser', role: 'CUSTOMER', balance: 1000 }
      await store.dispatch('user/login', user)

      expect(store.getters['user/isLoggedIn']).toBe(true)

      const product1 = { id: 1, name: 'Product 1', price: 100 }
      const product2 = { id: 2, name: 'Product 2', price: 200, discountPrice: 150 }

      await store.dispatch('cart/addToCart', product1)
      await store.dispatch('cart/addToCart', product1)
      await store.dispatch('cart/addToCart', product2)

      expect(store.getters['cart/cartItemCount']).toBe(3)
      expect(store.getters['cart/cartTotal']).toBe(350)

      await store.dispatch('cart/updateQuantity', { productId: 1, quantity: 2 })

      expect(store.getters['cart/cartItemCount']).toBe(3)
      expect(store.getters['cart/cartTotal']).toBe(350)

      await store.dispatch('cart/removeFromCart', 2)

      expect(store.getters['cart/cartItemCount']).toBe(2)
      expect(store.getters['cart/cartTotal']).toBe(200)

      await store.dispatch('cart/clearCart')

      expect(store.getters['cart/cartItemCount']).toBe(0)

      await store.dispatch('user/logout')

      expect(store.getters['user/isLoggedIn']).toBe(false)
    })

    it('should handle loading state during operations', async () => {
      await store.dispatch('setLoading', true)
      expect(store.getters.isLoading).toBe(true)

      const product = { id: 1, name: 'Product 1', price: 100 }
      await store.dispatch('cart/addToCart', product)

      await store.dispatch('setLoading', false)
      expect(store.getters.isLoading).toBe(false)
    })

    it('should handle user role changes affecting permissions', async () => {
      const customerUser = { id: 1, username: 'customer', role: 'CUSTOMER' }
      await store.dispatch('user/login', customerUser)

      expect(store.getters['user/hasPermission']('ADMIN')).toBe(false)

      const adminUser = { id: 1, username: 'admin', role: 'ADMIN' }
      await store.dispatch('user/login', adminUser)

      expect(store.getters['user/hasPermission']('ADMIN')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle adding same product multiple times', async () => {
      const product = { id: 1, name: 'Product 1', price: 100 }
      
      for (let i = 0; i < 10; i++) {
        await store.dispatch('cart/addToCart', product)
      }

      expect(store.state.cart.items).toHaveLength(1)
      expect(store.state.cart.items[0].quantity).toBe(10)
      expect(store.getters['cart/cartTotal']).toBe(1000)
    })

    it('should handle removing non-existent product', async () => {
      const product = { id: 1, name: 'Product 1', price: 100 }
      await store.dispatch('cart/addToCart', product)

      await store.dispatch('cart/removeFromCart', 999)

      expect(store.state.cart.items).toHaveLength(1)
    })

    it('should handle updating quantity to minimum of 1', async () => {
      const product = { id: 1, name: 'Product 1', price: 100 }
      await store.dispatch('cart/addToCart', product)

      await store.dispatch('cart/updateQuantity', { productId: 1, quantity: 0 })

      expect(store.state.cart.items[0].quantity).toBe(1)

      await store.dispatch('cart/updateQuantity', { productId: 1, quantity: -5 })

      expect(store.state.cart.items[0].quantity).toBe(1)
    })

    it('should handle balance updates with undefined initial balance', async () => {
      const user = { id: 1, username: 'testuser' }
      await store.dispatch('user/login', user)

      await store.dispatch('user/updateBalance', 100)

      expect(store.state.user.currentUser.balance).toBe(100)
    })

    it('should handle points updates with undefined initial points', async () => {
      const user = { id: 1, username: 'testuser' }
      await store.dispatch('user/login', user)

      await store.dispatch('user/updatePoints', 50)

      expect(store.state.user.currentUser.loyaltyPoints).toBe(50)
    })

    it('should handle negative balance', async () => {
      const user = { id: 1, username: 'testuser', balance: 100 }
      await store.dispatch('user/login', user)

      await store.dispatch('user/updateBalance', -200)

      expect(store.state.user.currentUser.balance).toBe(-100)
    })

    it('should handle discount price in cart total', async () => {
      const product = { id: 1, name: 'Product 1', price: 100, discountPrice: 80 }
      await store.dispatch('cart/addToCart', product)
      await store.dispatch('cart/addToCart', product)

      expect(store.getters['cart/cartTotal']).toBe(160)
    })

    it('should ignore discount price when it is 0', async () => {
      const product = { id: 1, name: 'Product 1', price: 100, discountPrice: 0 }
      await store.dispatch('cart/addToCart', product)
      await store.dispatch('cart/addToCart', product)

      expect(store.getters['cart/cartTotal']).toBe(200)
    })
  })
})
