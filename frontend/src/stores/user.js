import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null)
  const userList = ref([])

  // Getters
  const isLoggedIn = computed(() => !!currentUser.value)
  const currentUserId = computed(() => currentUser.value?.id)
  const userRole = computed(() => currentUser.value?.role)
  
  const hasPermission = computed(() => (permission) => {
    if (!currentUser.value) return false
    const roles = ['ADMIN', 'MANAGER', 'CUSTOMER', 'GUEST']
    const userRoleIndex = roles.indexOf(currentUser.value.role)
    const requiredRoleIndex = roles.indexOf(permission)
    return userRoleIndex <= requiredRoleIndex
  })

  // Actions
  function login(user) {
    currentUser.value = user
  }

  function logout() {
    currentUser.value = null
  }

  function updateBalance(amount) {
    if (currentUser.value) {
      const newBalance = (currentUser.value.balance || 0) + amount
      currentUser.value.balance = newBalance
    }
  }

  function updatePoints(points) {
    if (currentUser.value) {
      const newPoints = (currentUser.value.loyaltyPoints || 0) + points
      currentUser.value.loyaltyPoints = newPoints
    }
  }

  function setUserList(users) {
    userList.value = users
  }

  return {
    currentUser,
    userList,
    isLoggedIn,
    currentUserId,
    userRole,
    hasPermission,
    login,
    logout,
    updateBalance,
    updatePoints,
    setUserList
  }
})
