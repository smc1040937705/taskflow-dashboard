import { createStore } from 'vuex'
import cart from '../cart'

describe('cart module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        cart
      }
    })
  })

  it('should have initial state with empty items', () => {
    expect(store.state.cart.items).toEqual([])
  })

  describe('getters', () => {
    it('cartItems returns all items', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      expect(store.getters['cart/cartItems']).toHaveLength(1)
    })

    it('cartItemCount returns total quantity', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
      expect(store.getters['cart/cartItemCount']).toBe(3)
    })

    it('cartTotal calculates total price with discount', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100, discountPrice: 80 })
      store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
      expect(store.getters['cart/cartTotal']).toBe(280)
    })

    it('cartTotal uses regular price when no discount', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      expect(store.getters['cart/cartTotal']).toBe(100)
    })
  })

  describe('mutations', () => {
    it('ADD_TO_CART adds new product', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      expect(store.state.cart.items).toEqual([{ id: 1, name: 'Product 1', price: 100, quantity: 1 }])
    })

    it('ADD_TO_CART increases quantity for existing product', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      expect(store.state.cart.items).toEqual([{ id: 1, name: 'Product 1', price: 100, quantity: 2 }])
    })

    it('REMOVE_FROM_CART removes product', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/ADD_TO_CART', { id: 2, name: 'Product 2', price: 200 })
      store.commit('cart/REMOVE_FROM_CART', 1)
      expect(store.state.cart.items).toEqual([{ id: 2, name: 'Product 2', price: 200, quantity: 1 }])
    })

    it('UPDATE_QUANTITY updates product quantity', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 5 })
      expect(store.state.cart.items[0].quantity).toBe(5)
    })

    it('UPDATE_QUANTITY ensures minimum quantity is 1', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/UPDATE_QUANTITY', { productId: 1, quantity: 0 })
      expect(store.state.cart.items[0].quantity).toBe(1)
    })

    it('CLEAR_CART empties the cart', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.commit('cart/CLEAR_CART')
      expect(store.state.cart.items).toEqual([])
    })
  })

  describe('actions', () => {
    it('addToCart dispatches ADD_TO_CART mutation', () => {
      store.dispatch('cart/addToCart', { id: 1, name: 'Product 1', price: 100 })
      expect(store.state.cart.items).toHaveLength(1)
    })

    it('removeFromCart dispatches REMOVE_FROM_CART mutation', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.dispatch('cart/removeFromCart', 1)
      expect(store.state.cart.items).toHaveLength(0)
    })

    it('updateQuantity dispatches UPDATE_QUANTITY mutation', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.dispatch('cart/updateQuantity', { productId: 1, quantity: 3 })
      expect(store.state.cart.items[0].quantity).toBe(3)
    })

    it('clearCart dispatches CLEAR_CART mutation', () => {
      store.commit('cart/ADD_TO_CART', { id: 1, name: 'Product 1', price: 100 })
      store.dispatch('cart/clearCart')
      expect(store.state.cart.items).toEqual([])
    })
  })
})