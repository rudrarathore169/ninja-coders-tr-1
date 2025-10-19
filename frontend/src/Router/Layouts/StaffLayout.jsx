import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const StaffLayout = () => {
  const location = useLocation()
  
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
          </Link>

          <div className="flex gap-3">
            <Link 
              to="/staff/dashboard"
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                isActive('dashboard')
                  ? 'bg-amber-800 text-white shadow-lg scale-105'
                  : 'bg-white text-amber-900 hover:bg-amber-800 hover:text-white shadow-md'
              }`}
            >
              Dashboard
            </Link>
            
            <Link 
              to="/staff/order/:id"
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                location.pathname.startsWith('/staff/order')
                  ? 'bg-amber-800 text-white shadow-lg scale-105'
                  : 'bg-white text-amber-900 hover:bg-amber-800 hover:text-white shadow-md'
              }`}
            >
              Order Details
            </Link>
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