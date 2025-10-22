import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Optional: Add a top banner or logo */}
      <Outlet />
    </div>
  )
}

export default AuthLayout