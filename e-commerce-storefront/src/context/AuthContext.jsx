import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { cartService } from '../services/cartService'
import { wishlistService } from '../services/wishlistService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const refreshCart = useCallback(async () => {
    if (!authService.getToken()) {
      setCart(null)
      return null
    }
    const data = await cartService.list()
    setCart(data)
    return data
  }, [])

  const refreshWishlist = useCallback(async () => {
    if (!authService.getToken()) {
      setWishlistIds(new Set())
      return new Set()
    }
    const data = await wishlistService.list()
    const ids = new Set(data.items.map((item) => item.product.id))
    setWishlistIds(ids)
    return ids
  }, [])

  const loadSession = useCallback(async () => {
    const token = authService.getToken()
    if (!token) {
      setUser(null)
      setCart(null)
      setWishlistIds(new Set())
      setLoading(false)
      return
    }
    try {
      const me = await authService.me()
      setUser(me)
      await Promise.all([refreshCart(), refreshWishlist()])
    } catch {
      authService.logout()
      setUser(null)
      setCart(null)
      setWishlistIds(new Set())
    } finally {
      setLoading(false)
    }
  }, [refreshCart, refreshWishlist])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  const login = async (payload) => {
    const result = await authService.login(payload)
    authService.saveToken(result.access_token)
    setUser(result.user)
    await Promise.all([refreshCart(), refreshWishlist()])
    return result
  }

  const register = async (payload) => {
    const result = await authService.register(payload)
    authService.saveToken(result.access_token)
    setUser(result.user)
    await Promise.all([refreshCart(), refreshWishlist()])
    return result
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setCart(null)
    setWishlistIds(new Set())
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      cart,
      setCart,
      wishlistIds,
      setWishlistIds,
      loading,
      login,
      register,
      logout,
      refreshCart,
      refreshWishlist,
    }),
    [user, cart, wishlistIds, loading, refreshCart, refreshWishlist],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
