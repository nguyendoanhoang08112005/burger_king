import { create } from 'zustand'

// Generates a deterministic unique key for cart items based on selections
const generateItemKey = (productId, size, toppings) => {
  const toppingIds = toppings ? toppings.map(t => t.id).sort().join(',') : ''
  return `${productId}-${size}-${toppingIds}`
}

export const useCartStore = create((set, get) => ({
  cartItems: JSON.parse(localStorage.getItem('hk_cart')) || [],
  coupon: JSON.parse(localStorage.getItem('hk_coupon')) || null,

  addItem: (product, size = 'S', toppings = [], quantity = 1) => {
    const cartItems = [...get().cartItems]
    const key = generateItemKey(product.id, size, toppings)

    const existingIndex = cartItems.findIndex(item => item.id === key)

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += quantity
    } else {
      cartItems.push({
        id: key,
        product,
        size,
        toppings,
        quantity
      })
    }

    localStorage.setItem('hk_cart', JSON.stringify(cartItems))
    set({ cartItems })
  },

  removeItem: (itemId) => {
    const cartItems = get().cartItems.filter(item => item.id !== itemId)
    localStorage.setItem('hk_cart', JSON.stringify(cartItems))
    set({ cartItems })
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }

    const cartItems = get().cartItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    )

    localStorage.setItem('hk_cart', JSON.stringify(cartItems))
    set({ cartItems })
  },

  clearCart: () => {
    localStorage.removeItem('hk_cart')
    localStorage.removeItem('hk_coupon')
    set({ cartItems: [], coupon: null })
  },

  applyCoupon: (coupon) => {
    localStorage.setItem('hk_coupon', JSON.stringify(coupon))
    set({ coupon })
  },

  removeCoupon: () => {
    localStorage.removeItem('hk_coupon')
    set({ coupon: null })
  },

  getCartTotals: (deliveryType = 'delivery') => {
    const { cartItems, coupon } = get()
    
    // Calculate raw items subtotal
    const subtotal = cartItems.reduce((sum, item) => {
      // Base product price (use sale_price if present)
      let price = parseFloat(item.product.sale_price ?? item.product.base_price)

      // Size extra charge
      const sizeModel = item.product.sizes?.find(s => s.size === item.size)
      if (sizeModel) {
        price += parseFloat(sizeModel.extra_price)
      }

      // Toppings charge
      const toppingsPrice = item.toppings.reduce((tSum, t) => tSum + parseFloat(t.price), 0)
      
      return sum + (price + toppingsPrice) * item.quantity
    }, 0)

    // Calculate product discount savings (base_price vs sale_price differences)
    const productSavings = cartItems.reduce((sum, item) => {
      if (item.product.sale_price && parseFloat(item.product.sale_price) < parseFloat(item.product.base_price)) {
        const diff = parseFloat(item.product.base_price) - parseFloat(item.product.sale_price)
        return sum + diff * item.quantity
      }
      return sum;
    }, 0)

    // Calculate coupon discount
    let couponDiscount = 0
    const baseShippingFee = deliveryType === 'pickup' || subtotal >= 300000 ? 0 : 15000

    if (coupon) {
      if (coupon.type === 'fixed') {
        couponDiscount = Math.min(parseFloat(coupon.value), subtotal)
      } else if (coupon.type === 'percent') {
        couponDiscount = (subtotal * (parseFloat(coupon.value) / 100))
        // Apply max_discount if specified
        if (coupon.max_discount) {
          couponDiscount = Math.min(couponDiscount, parseFloat(coupon.max_discount))
        }
      } else if (coupon.type === 'free_ship') {
        couponDiscount = baseShippingFee
      }
    }

    const shippingFee = baseShippingFee
    const total = Math.max(0, subtotal - couponDiscount + shippingFee)

    return {
      subtotal,
      productSavings,
      couponDiscount,
      shippingFee,
      totalSavings: productSavings + couponDiscount,
      total
    }
  }
}))
