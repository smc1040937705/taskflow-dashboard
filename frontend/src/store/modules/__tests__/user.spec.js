import { createStore } from 'vuex'
import user from '../user'

describe('user module', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        user
      }
    })
  })

  it('should have initial state with null currentUser and empty userList', () => {
    expect(store.state.user.currentUser).toBeNull()
    expect(store.state.user.userList).toEqual([])
  })

  describe('getters', () => {
    it('isLoggedIn returns false when no user', () => {
      expect(store.getters['user/isLoggedIn']).toBe(false)
    })

    it('isLoggedIn returns true when user exists', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
      expect(store.getters['user/isLoggedIn']).toBe(true)
    })

    it('currentUserId returns user id', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
      expect(store.getters['user/currentUserId']).toBe(1)
    })

    it('currentUserId returns undefined when no user', () => {
      expect(store.getters['user/currentUserId']).toBeUndefined()
    })

    it('userRole returns user role', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'ADMIN' })
      expect(store.getters['user/userRole']).toBe('ADMIN')
    })

    it('hasPermission returns true for admin accessing customer resource', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'ADMIN' })
      expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(true)
    })

    it('hasPermission returns false for customer accessing admin resource', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', role: 'CUSTOMER' })
      expect(store.getters['user/hasPermission']('ADMIN')).toBe(false)
    })

    it('hasPermission returns false when no user', () => {
      expect(store.getters['user/hasPermission']('CUSTOMER')).toBe(false)
    })
  })

  describe('mutations', () => {
    it('SET_CURRENT_USER sets current user', () => {
      const userData = { id: 1, username: 'test', role: 'CUSTOMER' }
      store.commit('user/SET_CURRENT_USER', userData)
      expect(store.state.user.currentUser).toEqual(userData)
    })

    it('SET_USER_LIST sets user list', () => {
      const users = [{ id: 1, username: 'test1' }, { id: 2, username: 'test2' }]
      store.commit('user/SET_USER_LIST', users)
      expect(store.state.user.userList).toEqual(users)
    })

    it('CLEAR_USER clears current user', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
      store.commit('user/CLEAR_USER')
      expect(store.state.user.currentUser).toBeNull()
    })

    it('UPDATE_USER_BALANCE updates user balance', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', balance: 100 })
      store.commit('user/UPDATE_USER_BALANCE', 200)
      expect(store.state.user.currentUser.balance).toBe(200)
    })

    it('UPDATE_USER_BALANCE does nothing when no user', () => {
      store.commit('user/UPDATE_USER_BALANCE', 200)
      expect(store.state.user.currentUser).toBeNull()
    })

    it('UPDATE_USER_POINTS updates loyalty points', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', loyaltyPoints: 500 })
      store.commit('user/UPDATE_USER_POINTS', 800)
      expect(store.state.user.currentUser.loyaltyPoints).toBe(800)
    })

    it('UPDATE_USER_POINTS does nothing when no user', () => {
      store.commit('user/UPDATE_USER_POINTS', 500)
      expect(store.state.user.currentUser).toBeNull()
    })
  })

  describe('actions', () => {
    it('login dispatches SET_CURRENT_USER mutation', () => {
      const userData = { id: 1, username: 'test' }
      store.dispatch('user/login', userData)
      expect(store.state.user.currentUser).toEqual(userData)
    })

    it('logout dispatches CLEAR_USER mutation', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
      store.dispatch('user/logout')
      expect(store.state.user.currentUser).toBeNull()
    })

    it('updateBalance updates user balance correctly', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', balance: 100 })
      store.dispatch('user/updateBalance', 50)
      expect(store.state.user.currentUser.balance).toBe(150)
    })

    it('updateBalance handles null balance', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
      store.dispatch('user/updateBalance', 50)
      expect(store.state.user.currentUser.balance).toBe(50)
    })

    it('updatePoints updates loyalty points correctly', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test', loyaltyPoints: 100 })
      store.dispatch('user/updatePoints', 200)
      expect(store.state.user.currentUser.loyaltyPoints).toBe(300)
    })

    it('updatePoints handles null loyaltyPoints', () => {
      store.commit('user/SET_CURRENT_USER', { id: 1, username: 'test' })
      store.dispatch('user/updatePoints', 200)
      expect(store.state.user.currentUser.loyaltyPoints).toBe(200)
    })
  })
})