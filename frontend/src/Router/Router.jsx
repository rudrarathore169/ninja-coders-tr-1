import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import ProtectedRoute from './ProtectedRoute'

import AdminLayout from "./Layouts/AdminLayout"
import StaffLayout from "./Layouts/StaffLayout"
import AuthLayout from "./Layouts/AuthLayout"
import CustomerLayout from "./Layouts/CustomerLayout"

// Customer pages
import CustomerMenu from "./Customer/CustomerMenu"
import CustomerItemDetail from "./Customer/CustomerItemDetail"
import CustomerCart from "./Customer/CustomerCart"
import CustomerOrderStatus from "./Customer/CustomerOrderStatus"

// Staff pages
import StaffDashboard from "./Staff/StaffDashboard"
import StaffOrderDetail from "./Staff/StaffOrderDetail"

// Admin pages
import AdminDashboard from "./Admin/AdminDashboard"
import AdminMenuManagement from "./Admin/AdminMenuManagement"
import AdminTableManagement from "./Admin/AdminTableManagement"
import AdminAllOrders from "./Admin/AdminAllOrders"
import AdminOrderDetail from "./Admin/AdminOrderDetail"
import AdminAnalytics from "./Admin/AdminAnalytics"

// Auth pages
import Login from "./Auth/Login"
import Signup from "./Auth/Signup"

const Router = createBrowserRouter([
  // Root redirect - Now goes to menu instead of dashboard
  {
    path: "/",
    element: <Navigate to="/customer/menu" replace />
  },

  // Customer Routes
  {
    path: "/customer",
    element: <CustomerLayout />,
    children: [
      // Redirect /customer to /customer/menu
      {
        path: "",
        element: <Navigate to="/customer/menu" replace />
      },
      {
        path: "menu",
        element: <CustomerMenu />
      },
      {
        path: "item/:id",
        element: <CustomerItemDetail />
      },
      {
        path: "cart",
        element: <CustomerCart />
      },
      {
        path: "order-status",
        element: <CustomerOrderStatus />
      }
    ]
  },


  // Staff Routes - PROTECTED (Staff Only)
  {
    path: "/staff",
    element: (
      <ProtectedRoute allowedRoles={['staff', 'admin']}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/staff/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <StaffDashboard />
      },
      {
        path: "order/:id",
        element: <StaffOrderDetail />
      }
    ]
  },

  // Admin Routes - PROTECTED (Admin Only)
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <AdminDashboard />
      },
      {
        path: "menu",
        element: <AdminMenuManagement />
      },
      {
        path: "tables",
        element: <AdminTableManagement />
      },
      {
        path: "orders",
        element: <AdminAllOrders />
      },
      {
        path: "order/:id",
        element: <AdminOrderDetail />
      },
      {
        path: "analytics",
        element: <AdminAnalytics />
      }
    ]
  },

  // Auth Routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />
      },
      {
        path: "signup",
        element: <Signup />
      }
    ]
  },

  // Update Router.jsx to support QR code landing
  {
    path: "/m/:qrSlug",  // QR code lands here
    element: <CustomerLayout />,
    children: [
      {
        path: "",
        element: <CustomerMenu />  // Auto-loads menu with table context
      }
    ]
  },

  // 404 Fallback
  {
    path: "*",
    element: (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    )
  }
])

export default Router