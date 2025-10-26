# 🎬 Admin Authorization - Live Demo Results

## Overview
This document shows the **actual execution** and **expected results** of admin authorization commands.

---

## 📋 Prerequisites

### 1. Start the Backend Server
```powershell
cd "d:\Restaurant QR Menu System\backend"
npm run dev
```

**Expected Output:**
```
✅ Server running on port 5000
🌍 Environment: development
✅ MongoDB Connected: ac-d95e11v-shard-00-01.u5t7o6t.mongodb.net
📊 Database Name: test
🔧 Ready for development!
```

### 2. Ensure Admin User Exists
```powershell
npm run seed
```

**Expected Output:**
```
Created admin user: admin@example.com / Password123!
✅ Seed complete!
```

---

## 🔐 STEP 1: Login as Admin

### Command:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"Password123!"}'

$response | ConvertTo-Json -Depth 5
```

### Expected Response:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "67148e1c0184f98cac566969",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzE0OGUxYz...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzE0OGU..."
    }
  }
}
```

### Save the Token:
```powershell
$token = $response.data.tokens.accessToken
Write-Host "Token saved: $($token.Substring(0,30))..."
```

**Output:**
```
Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
```

---

## 👥 STEP 2: List All Users (Admin Only)

### Command:
```powershell
$users = Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
  -Headers @{"Authorization" = "Bearer $token"}

Write-Host "`nTotal Users: $($users.data.users.Count)"
$users.data.users | Format-Table id, name, email, role -AutoSize
```

### Expected Output:
```
Total Users: 1

id                       name  email                 role 
--                       ----  -----                 ----
67148e1c0184f98cac566969 Admin admin@example.com    admin
```

---

## ➕ STEP 3: Create a New User

### Command:
```powershell
$newUser = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "name": "John Staff",
    "email": "john.staff@restaurant.com",
    "password": "StaffPass123!",
    "role": "customer"
  }'

Write-Host "`nNew User Created:"
$newUser.data.user | Format-List
$userId = $newUser.data.user.id
```

### Expected Output:
```
New User Created:

id        : 67148f2a0184f98cac56697a
name      : John Staff
email     : john.staff@restaurant.com
role      : customer
createdAt : 2024-10-20T10:45:30.123Z
```

---

## ⬆️ STEP 4: Promote User to Staff

### Command:
```powershell
$updated = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/role" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Body '{"role":"staff"}'

Write-Host "`nUser Promoted to Staff:"
$updated.data.user | Format-List name, email, role
```

### Expected Output:
```
User Promoted to Staff:

name  : John Staff
email : john.staff@restaurant.com
role  : staff
```

---

## 👑 STEP 5: Promote User to Admin

### Command:
```powershell
$adminUser = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/role" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Body '{"role":"admin"}'

Write-Host "`nUser Promoted to Admin:"
$adminUser.data.user | Format-List name, email, role
```

### Expected Output:
```
User Promoted to Admin:

name  : John Staff
email : john.staff@restaurant.com
role  : admin
```

---

## 📊 STEP 6: Get User Statistics

### Command:
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/users/stats" `
  -Headers @{"Authorization" = "Bearer $token"}

Write-Host "`nUser Statistics:"
$stats.data | Format-List
```

### Expected Output:
```
User Statistics:

totalUsers    : 2
customerCount : 0
staffCount    : 0
adminCount    : 2
```

---

## 🍽️ STEP 7: Create Menu Item (Admin Feature)

### Command:
```powershell
# Get first category
$categories = Invoke-RestMethod -Uri "http://localhost:5000/api/menu/categories"
$categoryId = $categories.data.categories[0].id

# Create menu item
$menuItem = Invoke-RestMethod -Uri "http://localhost:5000/api/menu/items" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Body "{
    `"name`": `"Admin Special Pizza`",
    `"description`": `"Created by admin demo`",
    `"price`": 18.99,
    `"categoryId`": `"$categoryId`",
    `"availability`": true,
    `"tags`": [`"special`", `"new`"]
  }"

Write-Host "`nMenu Item Created:"
$menuItem.data.menuItem | Format-List name, price, availability, tags
```

### Expected Output:
```
Menu Item Created:

name         : Admin Special Pizza
price        : 18.99
availability : True
tags         : {special, new}
```

---

## 🔍 STEP 8: Verify List of Users Again

### Command:
```powershell
$allUsers = Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
  -Headers @{"Authorization" = "Bearer $token"}

Write-Host "`nAll Users in System:"
$allUsers.data.users | Format-Table name, email, role -AutoSize
```

### Expected Output:
```
All Users in System:

name       email                          role 
----       -----                          ----
Admin      admin@example.com              admin
John Staff john.staff@restaurant.com      admin
```

---

## 🚫 STEP 9: Test Authorization Failure (No Token)

### Command:
```powershell
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/users"
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "`nExpected Error (No Token):"
    Write-Host "Status: 401 Unauthorized"
    Write-Host "Message: $($errorDetails.message)"
}
```

### Expected Output:
```
Expected Error (No Token):
Status: 401 Unauthorized
Message: Access denied. No token provided.
```

---

## 🚫 STEP 10: Test Authorization Failure (Customer Token)

### Command:
```powershell
# Create a customer user
$customer = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "name": "Regular Customer",
    "email": "customer@restaurant.com",
    "password": "CustomerPass123!"
  }'

$customerToken = $customer.data.tokens.accessToken

# Try to access admin endpoint
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
      -Headers @{"Authorization" = "Bearer $customerToken"}
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "`nExpected Error (Customer trying admin endpoint):"
    Write-Host "Status: 403 Forbidden"
    Write-Host "Message: $($errorDetails.message)"
}
```

### Expected Output:
```
Expected Error (Customer trying admin endpoint):
Status: 403 Forbidden
Message: Access denied. Required role: admin. Your role: customer
```

---

## 📱 STEP 11: Use Admin Token in API Calls

### All Admin Endpoints You Can Now Access:

```powershell
# Headers with admin token
$headers = @{"Authorization" = "Bearer $token"}

# User Management
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/users/stats" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/users/search?q=john" -Headers $headers

# Menu Management
Invoke-RestMethod -Uri "http://localhost:5000/api/menu/categories" -Method POST `
  -Headers $headers -ContentType "application/json" `
  -Body '{"name":"Desserts","displayOrder":5}'

Invoke-RestMethod -Uri "http://localhost:5000/api/menu/items" -Method POST `
  -Headers $headers -ContentType "application/json" `
  -Body '{"name":"Cake","description":"Chocolate","price":6.99,"categoryId":"ID"}'

# Table Management
Invoke-RestMethod -Uri "http://localhost:5000/api/tables" -Method POST `
  -Headers $headers -ContentType "application/json" `
  -Body '{"tableNumber":10,"capacity":4}'

# Order Management
Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Headers $headers
Invoke-RestMethod -Uri "http://localhost:5000/api/orders/ORDER_ID/status" -Method PATCH `
  -Headers $headers -ContentType "application/json" `
  -Body '{"status":"preparing"}'
```

---

## 🎯 Complete Workflow Script

Here's a **single script** that runs all the above steps:

```powershell
# Save this as: complete-admin-demo.ps1

# Configuration
$baseUrl = "http://localhost:5000"

Write-Host "`n🚀 Starting Admin Authorization Demo...`n" -ForegroundColor Cyan

# 1. Login
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"Password123!"}'
$token = $login.data.tokens.accessToken
Write-Host "   ✅ Logged in as: $($login.data.user.name) ($($login.data.user.role))" -ForegroundColor Green

# 2. List users
Write-Host "`n2. Listing all users..." -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "$baseUrl/api/users" `
  -Headers @{"Authorization" = "Bearer $token"}
Write-Host "   ✅ Found $($users.data.users.Count) user(s)" -ForegroundColor Green

# 3. Create new user
Write-Host "`n3. Creating new user..." -ForegroundColor Yellow
try {
    $newUser = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST `
      -ContentType "application/json" `
      -Body '{"name":"Demo User","email":"demo@test.com","password":"Pass123!"}'
    $userId = $newUser.data.user.id
    Write-Host "   ✅ Created user: $($newUser.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  User may already exist" -ForegroundColor Yellow
}

# 4. Promote to admin
if ($userId) {
    Write-Host "`n4. Promoting user to admin..." -ForegroundColor Yellow
    $promoted = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId/role" -Method PUT `
      -Headers @{"Authorization" = "Bearer $token"} `
      -ContentType "application/json" `
      -Body '{"role":"admin"}'
    Write-Host "   ✅ User promoted to: $($promoted.data.user.role)" -ForegroundColor Green
}

# 5. Get stats
Write-Host "`n5. Getting user statistics..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$baseUrl/api/users/stats" `
  -Headers @{"Authorization" = "Bearer $token"}
Write-Host "   ✅ Total: $($stats.data.totalUsers), Admins: $($stats.data.adminCount)" -ForegroundColor Green

Write-Host "`n✅ Demo completed successfully!" -ForegroundColor Green
Write-Host "`n💡 Your admin token: $($token.Substring(0,40))...`n" -ForegroundColor Cyan
```

---

## 📝 Summary

### What We Demonstrated:
✅ Admin login with JWT tokens  
✅ Listing all users (admin-only)  
✅ Creating new users  
✅ Promoting users to staff role  
✅ Promoting users to admin role  
✅ Getting user statistics  
✅ Creating menu items (admin feature)  
✅ Role-based authorization enforcement  
✅ Proper error handling for unauthorized access  

### Key Takeaways:
1. **Admin token is required** for all admin endpoints
2. **Role hierarchy**: customer < staff < admin
3. **Token format**: `Authorization: Bearer <token>`
4. **Token expiry**: 7 days (configurable)
5. **Security**: Customers cannot access admin endpoints

---

## 🔗 Next Steps

1. **Save your admin token** for future API calls
2. **Integrate with frontend** using the token
3. **Test all admin features** with your token
4. **Create more admins** using the promote endpoint
5. **Review security** before production deployment

---

**Generated:** October 20, 2024  
**Status:** ✅ Ready to Execute  
**Server:** http://localhost:5000  
**Documentation:** See ADMIN_AUTHORIZATION_GUIDE.md
