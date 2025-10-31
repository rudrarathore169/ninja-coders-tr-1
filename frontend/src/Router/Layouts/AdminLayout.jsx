import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut, Menu, ChefHat, BarChart3, Settings, ClipboardList, Coffee, Grid } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/auth/login', { replace: true })
  }

  const isActive = (path) => {
    return location.pathname === `/admin/${path}` ||
      (path === 'orders' && location.pathname.startsWith('/admin/order/'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex items-center space-x-2">
                <ChefHat size={40} className="text-amber-600" />
                <span className="text-xl font-bold text-gray-900">Scan & Dine</span>
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                  Admin
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className={`text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('dashboard') ? 'text-amber-600' : ''
                  }`}
              >
                <Settings className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/admin/orders"
                className={`text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('orders') ? 'text-amber-600' : ''
                  }`}
              >
                <ClipboardList className="h-4 w-4" />
                Orders
              </Link>
              <Link
                to="/admin/menu"
                className={`text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('menu') ? 'text-amber-600' : ''
                  }`}
              >
                <Coffee className="h-4 w-4" />
                Menu
              </Link>
              <Link
                to="/admin/tables"
                className={`text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('tables') ? 'text-amber-600' : ''
                  }`}
              >
                <Grid className="h-4 w-4" />
                Tables
              </Link>
              <Link
                to="/admin/analytics"
                className={`text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('analytics') ? 'text-amber-600' : ''
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full capitalize">
                    Admin
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
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
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
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ClipboardList className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  to="/admin/menu"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Coffee className="h-4 w-4" />
                  Menu
                </Link>
                <Link
                  to="/admin/tables"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Grid className="h-4 w-4" />
                  Tables
                </Link>
                <Link
                  to="/admin/analytics"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-amber-600 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {user?.name} (Administrator)
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 text-base font-medium w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout