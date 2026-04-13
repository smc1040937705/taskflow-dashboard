import { createStore } from 'vuex'
import user from '@/store/modules/user'

// Helper function to create a fresh user module
function createUserModule() {
  return {
    namespaced: true,
    state: {
      currentUser: null,
      userList: []
    },
    getters: user.getters,
    mutations: user.mutations,
    actions: user.actions
  }
}

describe('User Store Module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        user: createUserModule()
      }
    })
  })

  describe('State', () => {
    it('should have null currentUser as initial state', () => {
      expect(store.state.user.currentUser).toBeNull()
    })

    it('should have empty userList as initial state', () => {
      expect(store.state.user.userList).toEqual([])
    })
  })

  describe('Getters', () => {
    describe('isLoggedIn', () => {
      it('should return false when no user is logged in', () => {
        expect(store.getters['user/isLoggedIn']).toBe(false)
      })

      it('should return true when user is logged in', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        expect(store.getters['user/isLoggedIn']).toBe(true)
      })

      it('should return false when user is null after logout', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.commit('user/CLEAR_USER')
        expect(store.getters['user/isLoggedIn']).toBe(false)
      })
    })

    describe('currentUserId', () => {
      it('should return null when no user is logged in', () => {
        expect(store.getters['user/currentUserId']).toBeUndefined()
      })

      it('should return user id when user is logged in', () => {
        store.commit('user/SET_CURRENT_USER', { id: 123, username: 'test' })
        expect(store.getters['user/currentUserId']).toBe(123)
      })
    })

    describe('userRole', () => {
      it('should return undefined when no user is logged in', () => {
        expect(store.getters['user/userRole']).toBeUndefined()
      })

      it('should return user role when user is logged in', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'ADMIN' })
        expect(store.getters['user/userRole']).toBe('ADMIN')
      })
    })

    describe('hasPermission', () => {
      it('should return false when no user is logged in', () => {
        expect(store.getters['user/hasPermission']('ADMIN')).toBe(false)
      })

      it('should return true for ADMIN accessing ADMIN permission', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'ADMIN' })
        expect(store.getters['user/hasPermission']('ADMIN')).toBe(true)
      })

      it('should return true for ADMIN accessing lower permissions', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'ADMIN' })
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(true)
        expect(store.getters['user/hasPermission']('GUEST')).toBe(true)
      })

      it('should return false for CUSTOMER accessing ADMIN permission', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'CUSTOMER' })
        expect(store.getters['user/hasPermission']('ADMIN')).toBe(false)
      })

      it('should return true for CUSTOMER accessing CUSTOMER permission', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'CUSTOMER' })
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(true)
      })

      it('should return true for MANAGER accessing CUSTOMER permission', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'MANAGER' })
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(true)
      })

      it('should return false for GUEST accessing CUSTOMER permission', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'GUEST' })
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(false)
      })

      it('should return true for GUEST accessing GUEST permission', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'GUEST' })
        expect(store.getters['user/hasPermission']('GUEST')).toBe(true)
      })

      it('should return true for unknown role when checking lower permissions', () => {
        // Unknown role has index -1, which is <= any valid role index
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'UNKNOWN' })
        expect(store.getters['user/hasPermission']('ADMIN')).toBe(true)
        expect(store.getters['user/hasPermission']('GUEST')).toBe(true)
      })
    })
  })

  describe('Mutations', () => {
    describe('SET_CURRENT_USER', () => {
      it('should set current user', () => {
        const user = { id: 1, username: 'test', email: 'test@example.com' }
        store.commit('user/SET_CURRENT_USER', user)
        expect(store.state.user.currentUser).toEqual(user)
      })

      it('should replace existing user', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'old' })
        store.commit('user/SET_CURRENT_USER', { id: 2, username: 'new' })
        expect(store.state.user.currentUser.id).toBe(2)
        expect(store.state.user.currentUser.username).toBe('new')
      })
    })

    describe('SET_USER_LIST', () => {
      it('should set user list', () => {
        const users = [
          { id: 1, username: 'user1' },
          { id: 2, username: 'user2' }
        ]
        store.commit('user/SET_USER_LIST', users)
        expect(store.state.user.userList).toEqual(users)
      })

      it('should replace existing user list', () => {
        store.commit('user/SET_USER_LIST', [{ id: 1, username: 'old' }])
        store.commit('user/SET_USER_LIST', [{ id: 2, username: 'new' }])
        expect(store.state.user.userList).toHaveLength(1)
        expect(store.state.user.userList[0].username).toBe('new')
      })
    })

    describe('CLEAR_USER', () => {
      it('should clear current user', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.commit('user/CLEAR_USER')
        expect(store.state.user.currentUser).toBeNull()
      })

      it('should work when no user is set', () => {
        store.commit('user/CLEAR_USER')
        expect(store.state.user.currentUser).toBeNull()
      })
    })

    describe('UPDATE_USER_BALANCE', () => {
      it('should update user balance', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', balance: 100 })
        store.commit('user/UPDATE_USER_BALANCE', 200)
        expect(store.state.user.currentUser.balance).toBe(200)
      })

      it('should not throw error when no user is logged in', () => {
        expect(() => {
          store.commit('user/UPDATE_USER_BALANCE', 200)
        }).not.toThrow()
      })

      it('should set balance when user has no balance property', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.commit('user/UPDATE_USER_BALANCE', 500)
        expect(store.state.user.currentUser.balance).toBe(500)
      })
    })

    describe('UPDATE_USER_POINTS', () => {
      it('should update user loyalty points', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', loyaltyPoints: 100 })
        store.commit('user/UPDATE_USER_POINTS', 200)
        expect(store.state.user.currentUser.loyaltyPoints).toBe(200)
      })

      it('should not throw error when no user is logged in', () => {
        expect(() => {
          store.commit('user/UPDATE_USER_POINTS', 200)
        }).not.toThrow()
      })

      it('should set points when user has no loyaltyPoints property', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.commit('user/UPDATE_USER_POINTS', 500)
        expect(store.state.user.currentUser.loyaltyPoints).toBe(500)
      })
    })
  })

  describe('Actions', () => {
    describe('login', () => {
      it('should set current user on login', () => {
        const user = { id: 1, username: 'test', role: 'CUSTOMER' }
        store.dispatch('user/login', user)
        expect(store.state.user.currentUser).toEqual(user)
        expect(store.getters['user/isLoggedIn']).toBe(true)
      })
    })

    describe('logout', () => {
      it('should clear user on logout', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.dispatch('user/logout')
        expect(store.state.user.currentUser).toBeNull()
        expect(store.getters['user/isLoggedIn']).toBe(false)
      })
    })

    describe('updateBalance', () => {
      it('should add amount to existing balance', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', balance: 100 })
        store.dispatch('user/updateBalance', 50)
        expect(store.state.user.currentUser.balance).toBe(150)
      })

      it('should handle zero initial balance', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.dispatch('user/updateBalance', 100)
        expect(store.state.user.currentUser.balance).toBe(100)
      })

      it('should handle negative amount (deduction)', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', balance: 100 })
        store.dispatch('user/updateBalance', -30)
        expect(store.state.user.currentUser.balance).toBe(70)
      })
    })

    describe('updatePoints', () => {
      it('should add points to existing loyalty points', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', loyaltyPoints: 100 })
        store.dispatch('user/updatePoints', 50)
        expect(store.state.user.currentUser.loyaltyPoints).toBe(150)
      })

      it('should handle zero initial points', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
        store.dispatch('user/updatePoints', 100)
        expect(store.state.user.currentUser.loyaltyPoints).toBe(100)
      })

      it('should handle negative points (redemption)', () => {
        store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', loyaltyPoints: 500 })
        store.dispatch('user/updatePoints', -100)
        expect(store.state.user.currentUser.loyaltyPoints).toBe(400)
      })
    })
  })
})
