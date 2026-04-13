import { createStore } from 'vuex'
import userModule from '@/store/modules/user'

describe('User Store Module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        user: {
          namespaced: true,
          state: {
            currentUser: null,
            userList: []
          },
          getters: userModule.getters,
          mutations: userModule.mutations,
          actions: userModule.actions
        }
      }
    })
  })

  describe('State', () => {
    it('should have initial null currentUser', () => {
      expect(store.state.user.currentUser).toBeNull()
    })

    it('should have initial empty userList array', () => {
      expect(store.state.user.userList).toEqual([])
    })
  })

  describe('Mutations', () => {
    describe('SET_CURRENT_USER', () => {
      it('should set current user', () => {
        const user = { id: 1, username: 'testuser', role: 'CUSTOMER' }
        
        store.commit('user/SET_CURRENT_USER', user)
        
        expect(store.state.user.currentUser).toEqual(user)
      })

      it('should replace existing user', () => {
        const user1 = { id: 1, username: 'olduser' }
        const user2 = { id: 2, username: 'newuser' }
        
        store.commit('user/SET_CURRENT_USER', user1)
        store.commit('user/SET_CURRENT_USER', user2)
        
        expect(store.state.user.currentUser).toEqual(user2)
      })

      it('should allow setting null', () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/SET_CURRENT_USER', null)
        
        expect(store.state.user.currentUser).toBeNull()
      })

      it('should handle user with all properties', () => {
        const user = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'ADMIN',
          balance: 1000,
          loyaltyPoints: 500
        }
        
        store.commit('user/SET_CURRENT_USER', user)
        
        expect(store.state.user.currentUser).toEqual(user)
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
        const users1 = [{ id: 1, username: 'olduser' }]
        const users2 = [{ id: 2, username: 'newuser' }]
        
        store.commit('user/SET_USER_LIST', users1)
        store.commit('user/SET_USER_LIST', users2)
        
        expect(store.state.user.userList).toEqual(users2)
      })

      it('should allow setting empty array', () => {
        const users = [{ id: 1, username: 'user1' }]
        store.commit('user/SET_USER_LIST', users)
        
        store.commit('user/SET_USER_LIST', [])
        
        expect(store.state.user.userList).toEqual([])
      })
    })

    describe('CLEAR_USER', () => {
      it('should clear current user', () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/CLEAR_USER')
        
        expect(store.state.user.currentUser).toBeNull()
      })

      it('should handle already null user', () => {
        store.commit('user/CLEAR_USER')
        
        expect(store.state.user.currentUser).toBeNull()
      })
    })

    describe('UPDATE_USER_BALANCE', () => {
      it('should update user balance', () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/UPDATE_USER_BALANCE', 200)
        
        expect(store.state.user.currentUser.balance).toBe(200)
      })

      it('should not throw error when currentUser is null', () => {
        expect(() => {
          store.commit('user/UPDATE_USER_BALANCE', 100)
        }).not.toThrow()
      })

      it('should handle zero balance', () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/UPDATE_USER_BALANCE', 0)
        
        expect(store.state.user.currentUser.balance).toBe(0)
      })

      it('should handle negative balance', () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/UPDATE_USER_BALANCE', -50)
        
        expect(store.state.user.currentUser.balance).toBe(-50)
      })
    })

    describe('UPDATE_USER_POINTS', () => {
      it('should update user loyalty points', () => {
        const user = { id: 1, username: 'testuser', loyaltyPoints: 50 }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/UPDATE_USER_POINTS', 100)
        
        expect(store.state.user.currentUser.loyaltyPoints).toBe(100)
      })

      it('should not throw error when currentUser is null', () => {
        expect(() => {
          store.commit('user/UPDATE_USER_POINTS', 50)
        }).not.toThrow()
      })

      it('should handle zero points', () => {
        const user = { id: 1, username: 'testuser', loyaltyPoints: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        
        store.commit('user/UPDATE_USER_POINTS', 0)
        
        expect(store.state.user.currentUser.loyaltyPoints).toBe(0)
      })
    })
  })

  describe('Getters', () => {
    describe('isLoggedIn', () => {
      it('should return true when user is logged in', () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        const result = store.getters['user/isLoggedIn']
        
        expect(result).toBe(true)
      })

      it('should return false when user is not logged in', () => {
        const result = store.getters['user/isLoggedIn']
        
        expect(result).toBe(false)
      })

      it('should return false when user is null', () => {
        store.commit('user/SET_CURRENT_USER', null)
        
        const result = store.getters['user/isLoggedIn']
        
        expect(result).toBe(false)
      })
    })

    describe('currentUserId', () => {
      it('should return user id when logged in', () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        const result = store.getters['user/currentUserId']
        
        expect(result).toBe(1)
      })

      it('should return undefined when not logged in', () => {
        const result = store.getters['user/currentUserId']
        
        expect(result).toBeUndefined()
      })
    })

    describe('userRole', () => {
      it('should return user role when logged in', () => {
        const user = { id: 1, username: 'testuser', role: 'ADMIN' }
        store.commit('user/SET_CURRENT_USER', user)
        
        const result = store.getters['user/userRole']
        
        expect(result).toBe('ADMIN')
      })

      it('should return undefined when not logged in', () => {
        const result = store.getters['user/userRole']
        
        expect(result).toBeUndefined()
      })
    })

    describe('hasPermission', () => {
      it('should return true when user has higher or equal role', () => {
        const user = { id: 1, username: 'testuser', role: 'ADMIN' }
        store.commit('user/SET_CURRENT_USER', user)
        
        const result = store.getters['user/hasPermission']('MANAGER')
        
        expect(result).toBe(true)
      })

      it('should return false when user has lower role', () => {
        const user = { id: 1, username: 'testuser', role: 'CUSTOMER' }
        store.commit('user/SET_CURRENT_USER', user)
        
        const result = store.getters['user/hasPermission']('ADMIN')
        
        expect(result).toBe(false)
      })

      it('should return false when user is not logged in', () => {
        const result = store.getters['user/hasPermission']('GUEST')
        
        expect(result).toBe(false)
      })

      it('should return true for same role', () => {
        const user = { id: 1, username: 'testuser', role: 'MANAGER' }
        store.commit('user/SET_CURRENT_USER', user)
        
        const result = store.getters['user/hasPermission']('MANAGER')
        
        expect(result).toBe(true)
      })

      it('should handle ADMIN role having all permissions', () => {
        const user = { id: 1, username: 'testuser', role: 'ADMIN' }
        store.commit('user/SET_CURRENT_USER', user)
        
        expect(store.getters['user/hasPermission']('ADMIN')).toBe(true)
        expect(store.getters['user/hasPermission']('MANAGER')).toBe(true)
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(true)
        expect(store.getters['user/hasPermission']('GUEST')).toBe(true)
      })

      it('should handle GUEST role having minimal permissions', () => {
        const user = { id: 1, username: 'testuser', role: 'GUEST' }
        store.commit('user/SET_CURRENT_USER', user)
        
        expect(store.getters['user/hasPermission']('ADMIN')).toBe(false)
        expect(store.getters['user/hasPermission']('MANAGER')).toBe(false)
        expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(false)
        expect(store.getters['user/hasPermission']('GUEST')).toBe(true)
      })
    })
  })

  describe('Actions', () => {
    describe('login', () => {
      it('should commit SET_CURRENT_USER mutation', async () => {
        const user = { id: 1, username: 'testuser' }
        
        await store.dispatch('user/login', user)
        
        expect(store.state.user.currentUser).toEqual(user)
      })

      it('should handle login with full user object', async () => {
        const user = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'CUSTOMER',
          balance: 1000,
          loyaltyPoints: 100
        }
        
        await store.dispatch('user/login', user)
        
        expect(store.state.user.currentUser).toEqual(user)
      })
    })

    describe('logout', () => {
      it('should commit CLEAR_USER mutation', async () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/logout')
        
        expect(store.state.user.currentUser).toBeNull()
      })
    })

    describe('updateBalance', () => {
      it('should update balance with positive amount', async () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/updateBalance', 50)
        
        expect(store.state.user.currentUser.balance).toBe(150)
      })

      it('should update balance with negative amount', async () => {
        const user = { id: 1, username: 'testuser', balance: 100 }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/updateBalance', -30)
        
        expect(store.state.user.currentUser.balance).toBe(70)
      })

      it('should handle undefined balance', async () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/updateBalance', 50)
        
        expect(store.state.user.currentUser.balance).toBe(50)
      })

      it('should throw when currentUser is null', async () => {
        try {
          await store.dispatch('user/updateBalance', 50)
          fail('Should have thrown an error')
        } catch (error) {
          expect(error).toBeDefined()
        }
      })
    })

    describe('updatePoints', () => {
      it('should update loyalty points with positive amount', async () => {
        const user = { id: 1, username: 'testuser', loyaltyPoints: 50 }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/updatePoints', 20)
        
        expect(store.state.user.currentUser.loyaltyPoints).toBe(70)
      })

      it('should update loyalty points with negative amount', async () => {
        const user = { id: 1, username: 'testuser', loyaltyPoints: 50 }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/updatePoints', -10)
        
        expect(store.state.user.currentUser.loyaltyPoints).toBe(40)
      })

      it('should handle undefined loyalty points', async () => {
        const user = { id: 1, username: 'testuser' }
        store.commit('user/SET_CURRENT_USER', user)
        
        await store.dispatch('user/updatePoints', 30)
        
        expect(store.state.user.currentUser.loyaltyPoints).toBe(30)
      })

      it('should throw when currentUser is null', async () => {
        try {
          await store.dispatch('user/updatePoints', 30)
          fail('Should have thrown an error')
        } catch (error) {
          expect(error).toBeDefined()
        }
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete user workflow', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        role: 'CUSTOMER',
        balance: 100,
        loyaltyPoints: 50
      }
      
      await store.dispatch('user/login', user)
      
      expect(store.getters['user/isLoggedIn']).toBe(true)
      expect(store.getters['user/currentUserId']).toBe(1)
      expect(store.getters['user/userRole']).toBe('CUSTOMER')
      
      await store.dispatch('user/updateBalance', 50)
      expect(store.state.user.currentUser.balance).toBe(150)
      
      await store.dispatch('user/updatePoints', 30)
      expect(store.state.user.currentUser.loyaltyPoints).toBe(80)
      
      await store.dispatch('user/logout')
      
      expect(store.getters['user/isLoggedIn']).toBe(false)
      expect(store.getters['user/currentUserId']).toBeUndefined()
    })

    it('should handle user list management', async () => {
      const users = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
      ]
      
      store.commit('user/SET_USER_LIST', users)
      
      expect(store.state.user.userList).toHaveLength(2)
      
      store.commit('user/SET_USER_LIST', [])
      
      expect(store.state.user.userList).toHaveLength(0)
    })

    it('should handle permission checks correctly', async () => {
      const adminUser = { id: 1, username: 'admin', role: 'ADMIN' }
      const customerUser = { id: 2, username: 'customer', role: 'CUSTOMER' }
      
      await store.dispatch('user/login', adminUser)
      expect(store.getters['user/hasPermission']('MANAGER')).toBe(true)
      
      await store.dispatch('user/login', customerUser)
      expect(store.getters['user/hasPermission']('MANAGER')).toBe(false)
    })
  })
})
