import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, User, LogOut, Menu, ChefHat, Settings } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { clearCart } from '../store/slices/cartSlice'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector(state => state.auth)
  const cartItems = useSelector(state => state.cart.items)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/auth/login')
  }

  const isCustomerRoute = location.pathname.startsWith('/customer')
  const isStaffRoute = location.pathname.startsWith('/staff')
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (!isCustomerRoute && !isStaffRoute && !isAdminRoute) {
    return null // Don't show navbar on auth pages
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ChefHat size={40} className="text-amber-600" />
              <span className="text-xl font-bold text-gray-900">Scan & Dine</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isCustomerRoute && (
              <>
                <Link
                  to="/customer/menu"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/customer/menu' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Menu
                </Link>
                <Link
                  to="/customer/cart"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/customer/cart' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  <ShoppingCart className="h-5 w-5 inline mr-1" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/customer/order-status"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/customer/order-status' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Order Status
                </Link>
              </>
            )}

            {isStaffRoute && (
              <Link
                to="/staff/dashboard"
                className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/staff/dashboard' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                  }`}
              >
                Dashboard
              </Link>
            )}

            {isAdminRoute && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/admin/dashboard' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/menu"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/admin/menu' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Menu
                </Link>
                <Link
                  to="/admin/tables"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/admin/tables' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Tables
                </Link>
                <Link
                  to="/admin/orders"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/admin/orders' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors relative ${location.pathname === '/admin/analytics' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                >
                  Analytics
                </Link>
              </>
            )}

            {/* User Menu */}
            {token && user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isCustomerRoute && cartItemCount > 0 && (
              <Link
                to="/customer/cart"
                className="relative mr-4 text-gray-700 hover:text-amber-600"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-amber-600 p-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isCustomerRoute && (
                <>
                  <Link
                    to="/customer/menu"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/customer/menu' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Menu
                  </Link>
                  <Link
                    to="/customer/cart"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/customer/cart' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart ({cartItemCount})
                  </Link>
                  <Link
                    to="/customer/order-status"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/customer/order-status' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Order Status
                  </Link>
                </>
              )}

              {isStaffRoute && (
                <Link
                  to="/staff/dashboard"
                  className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/staff/dashboard' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}              {isAdminRoute && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/admin/dashboard' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/menu"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/admin/menu' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Menu
                  </Link>
                  <Link
                    to="/admin/tables"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/admin/tables' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tables
                  </Link>
                  <Link
                    to="/admin/orders"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/admin/orders' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className={`block px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium relative ${location.pathname === '/admin/analytics' ? 'text-amber-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-600' : ''
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}

              {token && user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {user.name} ({user.role})
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 text-base font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="block px-3 py-2 bg-amber-600 text-white rounded-md text-base font-medium mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
