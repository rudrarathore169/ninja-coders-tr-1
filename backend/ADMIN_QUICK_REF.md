# Admin Quick Reference Card

## 🚀 Create First Admin (Easiest)

```bash
npm run seed
```

**Credentials:** `admin@example.com` / `Password123!`

---

## 🔐 Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'
```

**Save the `accessToken` from response!**

---

## 👥 Manage Users (Admin Only)

### List All Users
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Change User Role (customer → staff → admin)
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

**Valid roles:** `customer`, `staff`, `admin`

---

## 🍽️ Admin Endpoints

### Menu Management
- `POST /api/menu/categories` - Create category
- `POST /api/menu/items` - Create menu item
- `PUT /api/menu/items/:id` - Update menu item
- `DELETE /api/menu/items/:id` - Delete menu item
- `POST /api/menu/items/:id/image` - Upload image

### Table Management
- `POST /api/tables` - Create table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### User Management
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Change user role
- `PUT /api/users/:id/deactivate` - Deactivate user

### Order Management
- `GET /api/orders` - View all orders
- `PATCH /api/orders/:id/status` - Update order status

---

## 🎯 Available Roles

| Role | Access Level |
|------|-------------|
| **customer** | View menu, place orders, view own orders |
| **staff** | + View all orders, update order status |
| **admin** | + Full system access, manage users, menu, tables |

---

## ⚡ PowerShell Commands

### Login & Save Token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"Password123!"}'

$token = $response.data.tokens.accessToken
```

### List Users
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
  -Headers @{"Authorization" = "Bearer $token"}
```

### Promote User to Admin
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/USER_ID/role" `
  -Method PUT -ContentType "application/json" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Body '{"role":"admin"}'
```

---

## 🔒 Security Notes

⚠️ **For Production:**
1. Change default admin password immediately
2. Remove `role` parameter from registration
3. Implement email verification
4. Add 2FA for admin accounts
5. Enable audit logging

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "Access denied" | Not logged in as admin - login first |
| "Invalid token" | Token expired - use refresh token |
| "Cannot change own role" | Use another admin account |

---

**Full Guide:** See `ADMIN_AUTHORIZATION_GUIDE.md`
