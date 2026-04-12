import { createStore } from 'vuex'
import cart from './modules/cart'
import user from './modules/user'

export default createStore({
  state: {
    loading: false
  },
  getters: {
    isLoading: state => state.loading
  },
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status
    }
  },
  actions: {
    setLoading({ commit }, status) {
      commit('SET_LOADING', status)
    }
  },
  modules: {
    cart,
    user
  }
})