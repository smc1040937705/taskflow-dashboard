import { createStore } from 'vuex'
import cart from '@/store/modules/cart'

// Helper function to create a fresh cart module
function createCartModule() {
  return {
    namespaced: true,
    state: {
      items: []
    },
    getters: cart.getters,
    mutations: cart.mutations,
    actions: cart.actions
  }
}

describe('Cart Store Module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        cart: createCartModule()
      }
    })
  })

  describe('State', () => {
    it('should have empty items array as initial state', () => {
      expect(store.state.cart.items).toEqual([])
    })
  })

  describe('Getters', () => {
    it('cartItems should return all items in cart', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, quantity: 1 })
      expect(store.getters['cart/cartItems']).toHaveLength(1)
    })

    it('cartItemCount should return total quantity of all items', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
      expect(store.getters['cart/cartItemCount']).toBe(3)
    })

    it('cartItemCount should return 0 when cart is empty', () => {
      expect(store.getters['cart/cartItemCount']).toBe(0)
    })

    it('cartTotal should calculate total with regular price', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 0 })
      store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 2 })
      expect(store.getters['cart/cartTotal']).toBe(200)
    })

    it('cartTotal should calculate total with discount price', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
      store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 2 })
      expect(store.getters['cart/cartTotal']).toBe(160)
    })

    it('cartTotal should return 0 when cart is empty', () => {
      expect(store.getters['cart/cartTotal']).toBe(0)
    })

    it('cartTotal should handle mixed items with and without discount', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
      store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200, discountPrice: 0 })
      store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 2 })
      store.commit('cart/UPDATE_QUANTITY', { productId: 2, quantity: 3 })
      expect(store.getters['cart/cartTotal']).toBe(160 + 600)
    })
  })

  describe('Mutations', () => {
    describe('ADD_TO_CART', () => {
      it('should add new product to cart', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should increase quantity when adding existing product', () => {
        const product = { id: 1, name: 'Product 1', price: 100 }
        store.commit('cart/ADD_TO_CART', product)
        store.commit('cart/ADD_TO_CART', product)
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].quantity).toBe(2)
      })

      it('should add multiple different products', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
        expect(store.state.cart.items).toHaveLength(2)
      })
    })

    describe('REMOVE_FROM_CART', () => {
      it('should remove product from cart', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/REMOVE_FROM_CART', 1)
        expect(store.state.cart.items).toHaveLength(0)
      })

      it('should not affect other products when removing one', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
        store.commit('cart/REMOVE_FROM_CART', 1)
        expect(store.state.cart.items).toHaveLength(1)
        expect(store.state.cart.items[0].id).toBe(2)
      })

      it('should handle removing non-existent product gracefully', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/REMOVE_FROM_CART', 999)
        expect(store.state.cart.items).toHaveLength(1)
      })
    })

    describe('UPDATE_QUANTITY', () => {
      it('should update quantity of existing item', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 5 })
        expect(store.state.cart.items[0].quantity).toBe(5)
      })

      it('should not update quantity for non-existent item', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/UPDATE_QUANTITY', { productId: 999, quantity: 5 })
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should set minimum quantity to 1', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 0 })
        expect(store.state.cart.items[0].quantity).toBe(1)
      })

      it('should set minimum quantity to 1 when negative value provided', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: -5 })
        expect(store.state.cart.items[0].quantity).toBe(1)
      })
    })

    describe('CLEAR_CART', () => {
      it('should remove all items from cart', () => {
        store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
        store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
        store.commit('cart/CLEAR_CART')
        expect(store.state.cart.items).toEqual([])
      })

      it('should work on empty cart', () => {
        store.commit('cart/CLEAR_CART')
        expect(store.state.cart.items).toEqual([])
      })
    })
  })

  describe('Actions', () => {
    it('addToCart should commit ADD_TO_CART mutation', () => {
      const product = { id: 1, name: 'Product 1', price: 100 }
      store.dispatch('cart/addToCart', product)
      expect(store.state.cart.items).toHaveLength(1)
    })

    it('removeFromCart should commit REMOVE_FROM_CART mutation', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.dispatch('cart/removeFromCart', 1)
      expect(store.state.cart.items).toHaveLength(0)
    })

    it('updateQuantity should commit UPDATE_QUANTITY mutation', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.dispatch('cart/updateQuantity', { productId: 1, quantity: 5 })
      expect(store.state.cart.items[0].quantity).toBe(5)
    })

    it('clearCart should commit CLEAR_CART mutation', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.dispatch('cart/clearCart')
      expect(store.state.cart.items).toEqual([])
    })
  })
})
