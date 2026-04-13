import { createStore } from 'vuex'
import cartModule from '@/store/modules/cart'

describe('Cart Store Module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        cart: {
          namespaced: true,
          state: {
            items: []
          },
          getters: cartModule.getters,
          mutations: cartModule.mutations,
          actions: cartModule.actions
        }
      }
    })
  })

  describe('State', () => {
    it('should have initial empty items array', () => {
      expect(store.state.cart.items).toEqual([])
    })
  })

  describe('Mutations', () => {
    describe('ADD_TO_CART', () => {
      it('should add new product to cart', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        
        store.commit('cart/ADD_TO_CART', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0]).toEqual({ ...product, quantity: 1 })
      })

      it('should increase quantity when product already exists', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(2)
      })

      it('should add different products separately', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100 }
        const product2 = { id: 2, name: 'Product 2', price: 200 }
        
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        
        expect(store.state.cart.items).toHaveLength(2)
        expect(store.state.cart.items[0].quantity).toBe(1)
        expect(store.state.cart.items[1].quantity).toBe(1)
      })

      it('should handle product with discount price', () => {
        const product = { id: 1, name: 'Product 1', price: 100, discountPrice: 80 }
        
        store.commit('cart/ADD_TO_CART', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].discountPrice).toBe(80)
      })
    })

    describe('REMOVE_FROM_CART', () => {
      it('should remove product from cart', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100, quantity: 2 }
        const product2 = { id: 2, name: 'Product 2', price: 200, quantity: 1 }
        store.commit('cart/ADD_TO_CART', { ...product1, quantity: undefined })
        store.commit('cart/ADD_TO_CART', { ...product2, quantity: undefined })
        
        store.commit('cart/REMOVE_FROM_CART', 1)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].id).toBe(2)
      })

      it('should not affect cart when removing non-existent product', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        
        store.commit('cart/REMOVE_FROM_CART', 999)
        
        expect(store.state.cart.items).toHaveLength(1)
      })

      it('should handle empty cart', () => {
        store.commit('cart/REMOVE_FROM_CART', 1)
        
        expect(store.state.cart.items).toHaveLength(0)
      })

      it('should remove correct item by id', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100 }
        const product2 = { id: 2, name: 'Product 2', price: 200 }
        const product3 = { id: 3, name: 'Product 3', price: 300 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        store.commit('cart/ADD_TO_CART', product3)
        
        store.commit('cart/REMOVE_FROM_CART', 2)
        
        expect(store.state.cart.items).toHaveLength(2)
        expect(store.state.cart.items.find(item => item.id === 2)).toBeUndefined()
      })
    })

    describe('UPDATE_QUANTITY', () => {
      it('should update quantity of existing product', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)
        
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 5 })
        
        expect(store.state.cart.items[0].quantity).toBe(5)
      })

      it('should set minimum quantity to 1', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 0 })
        
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should set minimum quantity to 1 for negative values', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: -5 })
        
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should not affect cart when updating non-existent product', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        
        store.commit('cart/UPDATE_QUANTITY', { productId: 999, quantity: 5 })
        
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should handle large quantity values', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 1000 })
        
        expect(store.state.cart.items[0].quantity).toBe(1000)
      })
    })

    describe('CLEAR_CART', () => {
      it('should clear all items from cart', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100 }
        const product2 = { id: 2, name: 'Product 2', price: 200 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        
        store.commit('cart/CLEAR_CART')
        
        expect(store.state.cart.items).toHaveLength(0)
      })

      it('should handle already empty cart', () => {
        store.commit('cart/CLEAR_CART')
        
        expect(store.state.cart.items).toHaveLength(0)
      })
    })
  })

  describe('Getters', () => {
    describe('cartItems', () => {
      it('should return cart items', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        
        const result = store.getters['cart/cartItems']
        
        expect(result).toEqual(store.state.cart.items)
      })

      it('should return empty array for empty cart', () => {
        const result = store.getters['cart/cartItems']
        
        expect(result).toEqual([])
      })
    })

    describe('cartItemCount', () => {
      it('should return total quantity of all items', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100 }
        const product2 = { id: 2, name: 'Product 2', price: 200 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        store.commit('cart/ADD_TO_CART', product2)
        store.commit('cart/ADD_TO_CART', product2)
        
        const result = store.getters['cart/cartItemCount']
        
        expect(result).toBe(5)
      })

      it('should return 0 for empty cart', () => {
        const result = store.getters['cart/cartItemCount']
        
        expect(result).toBe(0)
      })

      it('should handle single item', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        for (let i = 0; i < 5; i++) {
          store.commit('cart/ADD_TO_CART', product)
        }
        
        const result = store.getters['cart/cartItemCount']
        
        expect(result).toBe(5)
      })
    })

    describe('cartTotal', () => {
      it('should calculate total using regular price', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100, discountPrice: 0 }
        const product2 = { id: 2, name: 'Product 2', price: 200, discountPrice: 0 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        
        const result = store.getters['cart/cartTotal']
        
        expect(result).toBe(400)
      })

      it('should use discount price when available', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100, discountPrice: 80 }
        const product2 = { id: 2, name: 'Product 2', price: 200, discountPrice: 0 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        
        const result = store.getters['cart/cartTotal']
        
        expect(result).toBe(360)
      })

      it('should return 0 for empty cart', () => {
        const result = store.getters['cart/cartTotal']
        
        expect(result).toBe(0)
      })

      it('should handle mixed discount and regular prices', () => {
        const product1 = { id: 1, name: 'Product 1', price: 100, discountPrice: 80 }
        const product2 = { id: 2, name: 'Product 2', price: 200, discountPrice: 150 }
        const product3 = { id: 3, name: 'Product 3', price: 50, discountPrice: 0 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        for (let i = 0; i < 3; i++) {
          store.commit('cart/ADD_TO_CART', product3)
        }
        
        const result = store.getters['cart/cartTotal']
        
        expect(result).toBe(460)
      })

      it('should ignore discount price when it is 0', () => {
        const product = { id: 1, name: 'Product 1', price: 100, discountPrice: 0 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)
        
        const result = store.getters['cart/cartTotal']
        
        expect(result).toBe(200)
      })
    })
  })

  describe('Actions', () => {
    describe('addToCart', () => {
      it('should commit ADD_TO_CART mutation', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        
        await store.dispatch('cart/addToCart', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0]).toEqual({ ...product, quantity: 1 })
      })

      it('should handle multiple addToCart calls', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        
        await store.dispatch('cart/addToCart', product)
        await store.dispatch('cart/addToCart', product)
        
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(2)
      })
    })

    describe('removeFromCart', () => {
      it('should commit REMOVE_FROM_CART mutation', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)
        
        await store.dispatch('cart/removeFromCart', 1)
        
        expect(store.state.cart.items).toHaveLength(0)
      })
    })

    describe('updateQuantity', () => {
      it('should commit UPDATE_QUANTITY mutation', async () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)
        
        await store.dispatch('cart/updateQuantity', { productId: 1, quantity: 5 })
        
        expect(store.state.cart.items[0].quantity).toBe(5)
      })
    })

    describe('clearCart', () => {
      it('should commit CLEAR_CART mutation', async () => {
        const product1 = { id: 1, name: 'Product 1', price: 100 }
        const product2 = { id: 2, name: 'Product 2', price: 200 }
        store.commit('cart/ADD_TO_CART', product1)
        store.commit('cart/ADD_TO_CART', product2)
        
        await store.dispatch('cart/clearCart')
        
        expect(store.state.cart.items).toHaveLength(0)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete cart workflow', async () => {
      const product1 = { id: 1, name: 'Product 1', price: 100 }
      const product2 = { id: 2, name: 'Product 2', price: 200, discountPrice: 150 }
      
      await store.dispatch('cart/addToCart', product1)
      await store.dispatch('cart/addToCart', product2)
      await store.dispatch('cart/addToCart', product1)
      
      expect(store.getters['cart/cartItemCount']).toBe(3)
      expect(store.getters['cart/cartTotal']).toBe(350)
      
      await store.dispatch('cart/updateQuantity', { productId: 1, quantity: 3 })
      
      expect(store.getters['cart/cartItemCount']).toBe(4)
      expect(store.getters['cart/cartTotal']).toBe(450)
      
      await store.dispatch('cart/removeFromCart', 2)
      
      expect(store.getters['cart/cartItemCount']).toBe(3)
      expect(store.getters['cart/cartTotal']).toBe(300)
      
      await store.dispatch('cart/clearCart')
      
      expect(store.getters['cart/cartItemCount']).toBe(0)
      expect(store.getters['cart/cartTotal']).toBe(0)
    })
  })
})
