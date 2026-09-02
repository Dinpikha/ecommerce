import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const { user, cart, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const cartCount = cart?.total_items || 0

  const closeMenus = () => {
    setMenuOpen(false)
    setAccountOpen(false)
    setSearchOpen(false)
  }

  const submitSearch = (event) => {
    event.preventDefault()
    const query = searchQuery.trim()
    closeMenus()
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 lg:gap-6 lg:px-8">
        <button
          className="rounded-full p-2 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={closeMenus}>
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          <span className="font-serif text-xl font-semibold">northstar</span>
        </Link>

        <nav
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } absolute left-0 top-16 w-full flex-col gap-4 border-b border-border bg-background px-5 py-5 lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <Link to="/" onClick={closeMenus} className="text-sm font-medium">
            Home
          </Link>
          <Link to="/products" onClick={closeMenus} className="text-sm font-medium">
            Shop
          </Link>

          <form
            onSubmit={submitSearch}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 lg:hidden"
          >
            <Search size={15} className="text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products"
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        </nav>

        <form
          onSubmit={submitSearch}
          className="mx-auto hidden max-w-md flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 lg:flex"
        >
          <Search size={16} className="text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2 lg:hidden"
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search size={19} />
          </button>

          {user ? (
            <>
              <Link to="/wishlist" aria-label="Wishlist" className="rounded-full p-2" onClick={closeMenus}>
                <Heart size={19} />
              </Link>
              <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2" onClick={closeMenus}>
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
                      onClick={closeMenus}
                    >
                      My Profile
                    </Link>
                    <Link
                      className="block rounded-xl p-3 hover:bg-muted"
                      to="/orders"
                      onClick={closeMenus}
                    >
                      My Orders
                    </Link>
                    <Link
                      className="block rounded-xl p-3 hover:bg-muted"
                      to="/wishlist"
                      onClick={closeMenus}
                    >
                      Wishlist
                    </Link>
                    <button
                      className="flex w-full gap-2 rounded-xl p-3 text-destructive hover:bg-muted"
                      onClick={() => {
                        logout()
                        closeMenus()
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
              <Link to="/login" className="rounded-full px-3 py-2 text-sm" onClick={closeMenus}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                onClick={closeMenus}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {searchOpen && (
        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 border-t border-border px-5 py-3 lg:hidden"
        >
          <Search size={16} className="text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm outline-none"
            autoFocus
          />
        </form>
      )}
    </header>
  )
}
