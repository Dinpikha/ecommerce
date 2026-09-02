import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, LogOut, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, cart, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const cartCount = cart?.total_items || 0

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button
          className="rounded-full p-2 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          <span className="font-serif text-xl font-semibold">northstar</span>
        </Link>

        <nav
          className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-16 w-full flex-col gap-5 border-b border-border bg-background px-5 py-5 lg:static lg:flex lg:w-auto lg:flex-row lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <Link to="/products" onClick={() => setMenuOpen(false)}>
            New in
          </Link>
          <Link to="/products?category=beauty" onClick={() => setMenuOpen(false)}>
            Beauty
          </Link>
          <Link to="/products?category=fragrances" onClick={() => setMenuOpen(false)}>
            Fragrances
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/products" aria-label="Search" className="rounded-full p-2">
            <Search size={19} />
          </Link>

          {user ? (
            <>
              <Link to="/wishlist" aria-label="Wishlist" className="rounded-full p-2">
                <Heart size={19} />
              </Link>
              <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2">
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-coral text-[10px] text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-label="Account"
                  className="rounded-full p-2"
                >
                  <UserRound size={19} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-11 w-44 rounded-2xl border border-border bg-card p-2 text-sm shadow-lg">
                    <Link
                      className="block rounded-xl p-3 hover:bg-muted"
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      className="block rounded-xl p-3 hover:bg-muted"
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      className="block rounded-xl p-3 hover:bg-muted"
                      to="/wishlist"
                      onClick={() => setAccountOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <button
                      className="flex w-full gap-2 rounded-xl p-3 text-destructive hover:bg-muted"
                      onClick={() => {
                        logout()
                        setAccountOpen(false)
                        window.location.href = '/login'
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-2 text-sm">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
