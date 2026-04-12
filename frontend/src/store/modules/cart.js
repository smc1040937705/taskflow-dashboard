export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {
    cartItems: state => state.items,
    cartItemCount: state => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    cartTotal: state => {
      return state.items.reduce((sum, item) => {
        const price = item.discountPrice > 0 ? item.discountPrice : item.price
        return sum + (price * item.quantity)
      }, 0)
    }
  },
  mutations: {
    ADD_TO_CART(state, product) {
      const existing = state.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...product, quantity: 1 })
      }
    },
    REMOVE_FROM_CART(state, productId) {
      state.items = state.items.filter(item => item.id !== productId)
    },
    UPDATE_QUANTITY(state, { productId, quantity }) {
      const item = state.items.find(item => item.id === productId)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    },
    CLEAR_CART(state) {
      state.items = []
    }
  },
  actions: {
    addToCart({ commit }, product) {
      commit('ADD_TO_CART', product)
    },
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId)
    },
    updateQuantity({ commit }, payload) {
      commit('UPDATE_QUANTITY', payload)
    },
    clearCart({ commit }) {
      commit('CLEAR_CART')
    }
  }
}