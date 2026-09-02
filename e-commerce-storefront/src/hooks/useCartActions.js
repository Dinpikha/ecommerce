import { useAuth } from '../context/AuthContext'
import { cartService } from '../services/cartService'

export function useCartActions() {
  const { user, setCart } = useAuth()

  const addToCart = async (product, quantity = 1) => {
    if (!user || !product?.id || product.stock === 0) return
    const updated = await cartService.add(product.id, quantity)
    setCart(updated)
    return updated
  }

  const updateQuantity = async (item, quantity) => {
    if (!item?.id) return
    const updated = await cartService.update(item.id, quantity)
    setCart(updated)
    return updated
  }

  const removeItem = async (item) => {
    if (!item?.id) return
    const updated = await cartService.remove(item.id)
    setCart(updated)
    return updated
  }

  return { addToCart, updateQuantity, removeItem }
}
