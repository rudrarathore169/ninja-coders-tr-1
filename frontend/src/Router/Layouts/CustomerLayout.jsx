import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../Components/Navbar'

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default CustomerLayout
