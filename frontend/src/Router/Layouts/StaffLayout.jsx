import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'

const StaffLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    // ✅ Use Redux logout action
    dispatch(logout())
    // ✅ Navigate with replace to prevent back button issues
    navigate('/auth/login', { replace: true })
  }
  
  const isActive = (path) => {
    return location.pathname === `/staff/${path}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-amber-50 to-amber-100 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/staff/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-amber-800"
            >
              <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>
              <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>
              <path d="m2.1 21.8 6.4-6.3"/>
              <path d="m19 5-7 7"/>
            </svg>
            <h1 className="text-2xl font-bold text-amber-900">Dine Lite</h1>
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              Staff
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              to="/staff/dashboard"
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                isActive('dashboard') || location.pathname.startsWith('/staff/order')
                  ? 'bg-amber-800 text-white shadow-lg scale-105'
                  : 'bg-white text-amber-900 hover:bg-amber-800 hover:text-white shadow-md'
              }`}
            >
              Orders
            </Link>

            {/* User Info & Logout */}
            <div className="ml-4 border-l-2 border-amber-300 pl-4 flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-amber-900">{user?.name}</p>
                <p className="text-xs text-amber-700">Staff Member</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded-full bg-white text-amber-900 hover:bg-red-600 hover:text-white shadow-md transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default StaffLayout