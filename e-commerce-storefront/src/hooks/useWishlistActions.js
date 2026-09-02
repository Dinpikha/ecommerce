import { useAuth } from '../context/AuthContext'
import { wishlistService } from '../services/wishlistService'

export function useWishlistActions() {
  const { wishlistIds, setWishlistIds } = useAuth()

  const toggleWishlist = async (product) => {
    if (!product?.id) return
    const inWishlist = wishlistIds.has(product.id)
    const data = inWishlist
      ? await wishlistService.remove(product.id)
      : await wishlistService.add(product.id)
    setWishlistIds(new Set(data.items.map((item) => item.product.id)))
    return data
  }

  const removeFromWishlist = async (productId) => {
    const data = await wishlistService.remove(productId)
    setWishlistIds(new Set(data.items.map((item) => item.product.id)))
    return data
  }

  return { toggleWishlist, removeFromWishlist }
}
