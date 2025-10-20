# Admin Authorization Guide
**Restaurant QR Menu System - Backend**

---

## 🔐 How to Authorize an Admin

There are **4 methods** to create or authorize an admin user in your system:

---

## Method 1: Using the Seed Script (Easiest) ✅ **RECOMMENDED**

The seed script automatically creates an admin user.

### Steps:
```bash
cd "d:\Restaurant QR Menu System\backend"
npm run seed
```

### Default Admin Credentials:
```
Email: admin@example.com
Password: Password123!
```

### What it does:
- Creates an admin user if one doesn't exist
- If the admin already exists, it skips creation
- Also creates sample menu items and tables

---

## Method 2: Register with Admin Role (Direct) 

You can directly register a user with admin role using the registration endpoint.

### API Request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "superadmin@restaurant.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

### PowerShell Version:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Super Admin","email":"superadmin@restaurant.com","password":"SecurePassword123!","role":"admin"}'
```

### Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "67148e1c0184f98cac566999",
      "name": "Super Admin",
      "email": "superadmin@restaurant.com",
      "role": "admin",
      "createdAt": "2024-10-20T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Note:
⚠️ **Security Warning:** In production, you should NOT allow users to register with admin role via public API. Remove the `role` parameter from registration or add server-side validation.

---

## Method 3: Upgrade Existing User to Admin (Secure) ✅ **RECOMMENDED FOR PRODUCTION**

Promote an existing customer/staff user to admin role.

### Prerequisites:
1. You must be logged in as an existing admin
2. You need the user ID of the person to promote

### Steps:

#### 1. Login as existing admin:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!"
  }'
```

#### 2. Get the user ID you want to promote:
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 3. Update their role to admin:
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID_HERE/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

### PowerShell Version:
```powershell
# 1. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"Password123!"}'

$token = $loginResponse.data.tokens.accessToken

# 2. List users
$users = Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
  -Headers @{"Authorization" = "Bearer $token"}

# 3. Update role (replace USER_ID with actual ID)
Invoke-RestMethod -Uri "http://localhost:5000/api/users/USER_ID/role" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Body '{"role":"admin"}'
```

### Response:
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "user": {
      "id": "67148e1c0184f98cac566998",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "createdAt": "2024-10-15T10:00:00.000Z",
      "updatedAt": "2024-10-20T10:30:00.000Z"
    }
  }
}
```

---

## Method 4: Direct Database Access (Emergency)

If you lose admin access or need to manually create an admin.

### Using MongoDB Compass or Shell:

#### 1. Connect to your MongoDB:
```
mongodb+srv://Admin:YOUR_PASSWORD@mern-project.u5t7o6t.mongodb.net/test
```

#### 2. Find the database (usually `test` or your project name)

#### 3. Run this MongoDB command:
```javascript
// Hash the password first (you can use online bcrypt tool or Node.js REPL)
// For password "AdminPass123!": 
// $2b$12$xyz... (use bcrypt.hash in Node.js)

db.users.insertOne({
  name: "Emergency Admin",
  email: "emergency@admin.com",
  passwordHash: "$2b$12$HASH_FROM_BCRYPT_HERE",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### Generate Password Hash in Node.js:
```javascript
// Run in terminal:
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 12).then(console.log)"
```

---

## 🎯 Quick Start Guide

### For First-Time Setup:
1. **Run the seed script** (creates admin@example.com)
   ```bash
   npm run seed
   ```

2. **Login as admin**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Password123!"}'
   ```

3. **Save the access token** from the response

4. **Use the token** in all admin API requests:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

---

## 🔑 Available User Roles

Your system has **3 roles**:

| Role | Permissions | Description |
|------|-------------|-------------|
| **customer** | - View menu<br>- Place orders<br>- View their own orders | Default role for new users |
| **staff** | - All customer permissions<br>- View all orders<br>- Update order status<br>- View all tables | Restaurant staff members |
| **admin** | - All staff permissions<br>- Manage users<br>- Manage menu<br>- Manage tables<br>- Change user roles<br>- Full system access | System administrators |

---

## 🛡️ Admin Capabilities

Once logged in as admin, you can:

### 1. User Management:
- **View all users:** `GET /api/users`
- **View user details:** `GET /api/users/:id`
- **Change user role:** `PUT /api/users/:id/role`
- **Deactivate user:** `PUT /api/users/:id/deactivate`
- **View user statistics:** `GET /api/users/stats`
- **Search users:** `GET /api/users/search?q=email`

### 2. Menu Management:
- **Create categories:** `POST /api/menu/categories`
- **Update categories:** `PUT /api/menu/categories/:id`
- **Delete categories:** `DELETE /api/menu/categories/:id`
- **Create menu items:** `POST /api/menu/items`
- **Update menu items:** `PUT /api/menu/items/:id`
- **Delete menu items:** `DELETE /api/menu/items/:id`
- **Upload images:** `POST /api/menu/items/:id/image`
- **Update availability:** `PATCH /api/menu/items/:id/availability`
- **Update popularity:** `PATCH /api/menu/items/:id/popularity`

### 3. Table Management:
- **Create tables:** `POST /api/tables`
- **Update tables:** `PUT /api/tables/:id`
- **Delete tables:** `DELETE /api/tables/:id`
- **Generate QR codes:** Automatic on table creation

### 4. Order Management:
- **View all orders:** `GET /api/orders`
- **View order details:** `GET /api/orders/:id`
- **Update order status:** `PATCH /api/orders/:id/status`

---

## 🔒 Security Best Practices

### For Development:
✅ Use the seed script to create test admin
✅ Keep default passwords in .env (not in code)
✅ Use strong passwords even in development

### For Production:
⚠️ **IMPORTANT:** Implement these security measures:

1. **Remove role from registration:**
   ```javascript
   // In authController.js, change:
   const { name, email, password, role = 'customer' } = req.body;
   
   // To:
   const { name, email, password } = req.body;
   const role = 'customer'; // Always default to customer
   ```

2. **Require super admin for role changes:**
   - Create a `superadmin` role
   - Only super admins can create other admins

3. **Add email verification:**
   - Require email verification before activating accounts
   - Especially for admin accounts

4. **Add 2FA for admins:**
   - Implement two-factor authentication
   - Require for all admin accounts

5. **Audit logging:**
   - Log all admin actions
   - Track who changed what and when

6. **Change default credentials:**
   ```bash
   # Update admin password immediately after first login
   curl -X POST http://localhost:5000/api/auth/change-password \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "oldPassword": "Password123!",
       "newPassword": "NewSecurePassword123!@#"
     }'
   ```

---

## 🧪 Testing Admin Authorization

### Test Admin Endpoints:

```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Test admin-only endpoint (list all users)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"

# 3. Test changing user role
curl -X PUT http://localhost:5000/api/users/USER_ID/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"staff"}'

# 4. Test creating menu item
curl -X POST http://localhost:5000/api/menu/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "description": "Test Description",
    "price": 9.99,
    "categoryId": "CATEGORY_ID"
  }'
```

---

## 📝 Common Issues & Solutions

### Issue 1: "Access denied. Required role: admin"
**Solution:** You're not logged in as admin. Login with admin credentials first.

### Issue 2: "User with this email already exists"
**Solution:** The email is already registered. Login instead or use a different email.

### Issue 3: "You cannot change your own role"
**Solution:** Admins cannot demote themselves. Use another admin account or database access.

### Issue 4: Token expired
**Solution:** Use the refresh token endpoint to get a new access token:
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## 🎬 Quick Demo Script

Here's a complete workflow to set up and test admin authorization:

```bash
# 1. Start the server
cd "d:\Restaurant QR Menu System\backend"
npm run dev

# 2. Create admin (in new terminal)
npm run seed

# 3. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'
# Save the accessToken from response

# 4. Test admin access
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Create a regular user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Staff",
    "email": "john@staff.com",
    "password": "StaffPass123!"
  }'
# Save the user ID from response

# 6. Promote user to staff
curl -X PUT http://localhost:5000/api/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"staff"}'

# 7. Verify the change
curl http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📚 Additional Resources

- **Middleware:** `backend/middleware/roleMiddleware.js` - Role checking logic
- **Auth Controller:** `backend/controllers/authController.js` - Authentication logic
- **User Controller:** `backend/controllers/userController.js` - User management
- **User Model:** `backend/models/User.js` - User schema with roles

---

## ✅ Summary

**Easiest Method for Development:**
```bash
npm run seed  # Creates admin@example.com / Password123!
```

**Secure Method for Production:**
1. Manually create first admin via database
2. Login as that admin
3. Create other admins via `/api/users/:id/role` endpoint
4. Remove role parameter from registration endpoint

**Your admin is now ready to manage the entire restaurant system!** 🎉
