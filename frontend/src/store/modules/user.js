export default {
  namespaced: true,
  state: {
    currentUser: null,
    userList: []
  },
  getters: {
    isLoggedIn: state => !!state.currentUser,
    currentUserId: state => state.currentUser?.id,
    userRole: state => state.currentUser?.role,
    hasPermission: state => (permission) => {
      if (!state.currentUser) return false
      const roles = ['ADMIN', 'MANAGER', 'CUSTOMER', 'GUEST']
      const userRoleIndex = roles.indexOf(state.currentUser.role)
      const requiredRoleIndex = roles.indexOf(permission)
      return userRoleIndex <= requiredRoleIndex
    }
  },
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
    },
    SET_USER_LIST(state, users) {
      state.userList = users
    },
    CLEAR_USER(state) {
      state.currentUser = null
    },
    UPDATE_USER_BALANCE(state, amount) {
      if (state.currentUser) {
        state.currentUser.balance = amount
      }
    },
    UPDATE_USER_POINTS(state, points) {
      if (state.currentUser) {
        state.currentUser.loyaltyPoints = points
      }
    }
  },
  actions: {
    login({ commit }, user) {
      commit('SET_CURRENT_USER', user)
    },
    logout({ commit }) {
      commit('CLEAR_USER')
    },
    updateBalance({ commit, state }, amount) {
      const newBalance = (state.currentUser.balance || 0) + amount
      commit('UPDATE_USER_BALANCE', newBalance)
    },
    updatePoints({ commit, state }, points) {
      const newPoints = (state.currentUser.loyaltyPoints || 0) + points
      commit('UPDATE_USER_POINTS', newPoints)
    }
  }
}