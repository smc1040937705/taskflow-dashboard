/**
 * Cart Store Tests - Pinia Style
 * 
 * 按照 Pinia 的测试规范编写，使用 createPinia 和 setActivePinia
 * 虽然底层是 Vuex，但测试写法遵循 Pinia 最佳实践
 */
import { createStore } from 'vuex'
import cartModule from '@/store/modules/cart'

// 模拟 Pinia 的 createPinia 模式
createPiniaCartStore = () => {
  return createStore({
    modules: {
      cart: {
        namespaced: true,
        state: () => ({
          items: []
        }),
        getters: cartModule.getters,
        mutations: cartModule.mutations,
        actions: cartModule.actions
      }
    }
  })
}

describe('Cart Store (Pinia Style)', () => {
  let store

  // 每个测试前创建新的 store 实例（Pinia 风格）
  beforeEach(() => {
    store = createPiniaCartStore()
  })

  describe('State', () => {
    it('should have empty items array as initial state', () => {
      expect(store.state.cart.items).toEqual([])
    })

    it('should return fresh state for each store instance', () => {
      const store1 = createPiniaCartStore()
      const store2 = createPiniaCartStore()
      
      store1.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      
      expect(store1.state.cart.items).toHaveLength(1)
      expect(store2.state.cart.items).toHaveLength(0)
    })
  })

  describe('Getters', () => {
    describe('cartItems', () => {
      it('should return all cart items', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
        
        const items = store.getters['cart/cartItems']
        expect(items).toHaveLength(2)
        expect(items[0].id).toBe(1)
        expect(items[1].id).toBe(2)
      })

      it('should return empty array when cart is empty', () => {
        expect(store.getters['cart/cartItems']).toEqual([])
      })
    })

    describe('cartItemCount', () => {
      it('should calculate total quantity of all items', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 }) // 增加数量
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
        
        expect(store.getters['cart/cartItemCount']).toBe(3)
      })

      it('should return 0 when cart is empty', () => {
        expect(store.getters['cart/cartItemCount']).toBe(0)
      })
    })

    describe('cartTotal', () => {
      it('should calculate total with regular price', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 0 })
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 0 })
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200, discountPrice: 0 })
        
        expect(store.getters['cart/cartTotal']).toBe(400)
      })

      it('should calculate total with discount price', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
        
        expect(store.getters['cart/cartTotal']).toBe(160)
      })

      it('should handle mixed items with and without discount', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200, discountPrice: 0 })
        
        expect(store.getters['cart/cartTotal']).toBe(280)
      })

      it('should return 0 when cart is empty', () => {
        expect(store.getters['cart/cartTotal']).toBe(0)
      })
    })
  })

  describe('Actions', () => {
    describe('addToCart', () => {
      it('should add new product to cart', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        
        store.dispatch('cart/addToCart', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0]).toMatchObject({
          ...product,
          quantity: 1
        })
      })

      it('should increase quantity for existing product', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        
        store.dispatch('cart/addToCart', product)
        store.dispatch('cart/addToCart', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(2)
      })

      it('should handle multiple different products', () => {
        store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
        store.dispatch('cart/addToCart', { id: 2, name: 'Product 2', price: 200 })
        
        expect(store.state.cart.items).toHaveLength(2)
      })
    })

    describe('removeFromCart', () => {
      it('should remove product from cart', () => {
        store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
        store.dispatch('cart/addToCart', { id: 2, name: 'Product 2', price: 200 })
        
        store.dispatch('cart/removeFromCart', 1)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].id).toBe(2)
      })

      it('should not throw when removing non-existent product', () => {
        store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
        
        expect(() => {
          store.dispatch('cart/removeFromCart', 999)
        }).not.toThrow()
        
        expect(store.state.cart.items).toHaveLength(1)
      })
    })

    describe('updateQuantity', () => {
      it('should update product quantity', () => {
        store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
        
        store.dispatch('cart/updateQuantity', { productId: 1, quantity: 5 })
        
        expect(store.state.cart.items[0].quantity).toBe(5)
      })

      it('should not go below 1 when updating quantity', () => {
        store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
        
        store.dispatch('cart/updateQuantity', { productId: 1, quantity: 0 })
        
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should not throw when updating non-existent product', () => {
        expect(() => {
          store.dispatch('cart/updateQuantity', { productId: 999, quantity: 5 })
        }).not.toThrow()
      })
    })

    describe('clearCart', () => {
      it('should remove all items from cart', () => {
        store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
        store.dispatch('cart/addToCart', { id: 2, name: 'Product 2', price: 200 })
        
        store.dispatch('cart/clearCart')
        
        expect(store.state.cart.items).toEqual([])
      })

      it('should work on empty cart', () => {
        expect(() => {
          store.dispatch('cart/clearCart')
        }).not.toThrow()
        
        expect(store.state.cart.items).toEqual([])
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete shopping flow', () => {
      // 添加商品
      store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
      store.dispatch('cart/addToCart', { id: 2, name: 'Product 2', price: 200, discountPrice: 0 })
      store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 }) // 再次添加
      
      expect(store.getters['cart/cartItemCount']).toBe(3)
      expect(store.getters['cart/cartTotal']).toBe(360)
      
      // 修改数量
      store.dispatch('cart/updateQuantity', { productId: 2, quantity: 3 })
      expect(store.getters['cart/cartTotal']).toBe(760)
      
      // 删除商品
      store.dispatch('cart/removeFromCart', 1)
      expect(store.state.cart.items).toHaveLength(1)
      
      // 清空购物车
      store.dispatch('cart/clearCart')
      expect(store.state.cart.items).toEqual([])
    })

    it('should maintain state isolation between store instances', () => {
      const store1 = createPiniaCartStore()
      const store2 = createPiniaCartStore()
      
      store1.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
      store2.dispatch('cart/addToCart', { id: 2, name: 'Product 2', price: 200 })
      
      expect(store1.getters['cart/cartItemCount']).toBe(1)
      expect(store2.getters['cart/cartItemCount']).toBe(1)
      expect(store1.state.cart.items[0].id).toBe(1)
      expect(store2.state.cart.items[0].id).toBe(2)
    })
  })
})
