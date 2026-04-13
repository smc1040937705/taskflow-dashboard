import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])

  // Getters
  const cartItems = computed(() => items.value)
  
  const cartItemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const cartTotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price
      return sum + (price * item.quantity)
    }, 0)
  })

  // Actions
  function addToCart(product) {
    const existing = items.value.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(item => item.id !== productId)
  }

  function updateQuantity({ productId, quantity }) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    cartItems,
    cartItemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
