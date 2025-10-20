# Admin Authorization Demo Script
# This script demonstrates the complete admin workflow

Write-Host "`n🚀 ADMIN AUTHORIZATION DEMO - Restaurant QR Menu System" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:5000"
$adminEmail = "admin@example.com"
$adminPassword = "Password123!"

Write-Host "`n⚙️  Configuration:" -ForegroundColor Yellow
Write-Host "   Base URL: $baseUrl"
Write-Host "   Admin Email: $adminEmail"
Write-Host "   Admin Password: $adminPassword"

# Step 1: Check server health
Write-Host "`n`n📡 STEP 1: Checking Server Health..." -ForegroundColor Green
Write-Host "-" * 70
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.message)"
    Write-Host "   Database: $($health.database)"
} catch {
    Write-Host "❌ Server is not running! Please start it first:" -ForegroundColor Red
    Write-Host "   cd 'd:\Restaurant QR Menu System\backend'"
    Write-Host "   npm run dev"
    exit 1
}

# Step 2: Login as Admin
Write-Host "`n`n🔐 STEP 2: Logging in as Admin..." -ForegroundColor Green
Write-Host "-" * 70
try {
    $loginBody = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "`n   👤 User Details:"
    Write-Host "      ID: $($loginResponse.data.user.id)"
    Write-Host "      Name: $($loginResponse.data.user.name)"
    Write-Host "      Email: $($loginResponse.data.user.email)"
    Write-Host "      Role: $($loginResponse.data.user.role)" -ForegroundColor Yellow
    
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "`n   🔑 Access Token: $($token.Substring(0,30))..." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Login failed! Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Tip: Run 'npm run seed' to create the admin user"
    exit 1
}

# Step 3: List all users (Admin only)
Write-Host "`n`n👥 STEP 3: Listing All Users (Admin Only)..." -ForegroundColor Green
Write-Host "-" * 70
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $users = Invoke-RestMethod -Uri "$baseUrl/api/users" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Retrieved $($users.data.users.Count) user(s):" -ForegroundColor Green
    foreach ($user in $users.data.users) {
        $roleColor = switch ($user.role) {
            "admin" { "Red" }
            "staff" { "Yellow" }
            "customer" { "White" }
        }
        Write-Host "`n   📋 User $($users.data.users.IndexOf($user) + 1):"
        Write-Host "      ID: $($user.id)"
        Write-Host "      Name: $($user.name)"
        Write-Host "      Email: $($user.email)"
        Write-Host "      Role: $($user.role)" -ForegroundColor $roleColor
    }
} catch {
    Write-Host "❌ Failed to list users: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Create a new regular user
Write-Host "`n`n➕ STEP 4: Creating a New Regular User..." -ForegroundColor Green
Write-Host "-" * 70
try {
    $newUserBody = @{
        name = "John Staff"
        email = "john.staff@restaurant.com"
        password = "StaffPass123!"
        role = "customer"
    } | ConvertTo-Json

    $newUser = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $newUserBody
    
    $newUserId = $newUser.data.user.id
    
    Write-Host "✅ New user created successfully!" -ForegroundColor Green
    Write-Host "   ID: $newUserId"
    Write-Host "   Name: $($newUser.data.user.name)"
    Write-Host "   Email: $($newUser.data.user.email)"
    Write-Host "   Role: $($newUser.data.user.role)"
    
} catch {
    if ($_.Exception.Message -match "400") {
        Write-Host "⚠️  User already exists, using existing user..." -ForegroundColor Yellow
        # Get existing user
        $existingUsers = Invoke-RestMethod -Uri "$baseUrl/api/users" `
            -Method GET `
            -Headers $headers
        $newUserId = $existingUsers.data.users[0].id
    } else {
        Write-Host "❌ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 5: Promote user to Staff role
Write-Host "`n`n⬆️  STEP 5: Promoting User to Staff Role..." -ForegroundColor Green
Write-Host "-" * 70
if ($newUserId) {
    try {
        $roleBody = @{
            role = "staff"
        } | ConvertTo-Json

        $updateRole = Invoke-RestMethod -Uri "$baseUrl/api/users/$newUserId/role" `
            -Method PUT `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $roleBody
        
        Write-Host "✅ User role updated successfully!" -ForegroundColor Green
        Write-Host "   User ID: $($updateRole.data.user.id)"
        Write-Host "   Name: $($updateRole.data.user.name)"
        Write-Host "   New Role: $($updateRole.data.user.role)" -ForegroundColor Yellow
        
    } catch {
        Write-Host "❌ Failed to update role: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Promote user to Admin role
Write-Host "`n`n👑 STEP 6: Promoting User to Admin Role..." -ForegroundColor Green
Write-Host "-" * 70
if ($newUserId) {
    try {
        $roleBody = @{
            role = "admin"
        } | ConvertTo-Json

        $updateRole = Invoke-RestMethod -Uri "$baseUrl/api/users/$newUserId/role" `
            -Method PUT `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $roleBody
        
        Write-Host "✅ User promoted to Admin!" -ForegroundColor Green
        Write-Host "   User ID: $($updateRole.data.user.id)"
        Write-Host "   Name: $($updateRole.data.user.name)"
        Write-Host "   New Role: $($updateRole.data.user.role)" -ForegroundColor Red
        
    } catch {
        Write-Host "❌ Failed to promote to admin: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 7: Get user statistics (Admin only)
Write-Host "`n`n📊 STEP 7: Getting User Statistics (Admin Only)..." -ForegroundColor Green
Write-Host "-" * 70
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/users/stats" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ User Statistics:" -ForegroundColor Green
    Write-Host "   Total Users: $($stats.data.totalUsers)"
    Write-Host "   Customers: $($stats.data.customerCount)"
    Write-Host "   Staff: $($stats.data.staffCount)"
    Write-Host "   Admins: $($stats.data.adminCount)"
    
} catch {
    Write-Host "❌ Failed to get statistics: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 8: Test Admin capabilities - Create a menu item
Write-Host "`n`n🍽️  STEP 8: Testing Admin Capabilities - Creating Menu Item..." -ForegroundColor Green
Write-Host "-" * 70
try {
    # First, get or create a category
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/menu/categories" -Method GET
    
    if ($categories.data.categories.Count -gt 0) {
        $categoryId = $categories.data.categories[0].id
        Write-Host "   Using existing category: $($categories.data.categories[0].name)"
        
        $menuItemBody = @{
            name = "Admin Special Pizza"
            description = "Created by admin user via API"
            price = 18.99
            categoryId = $categoryId
            availability = $true
            tags = @("special", "admin-created")
        } | ConvertTo-Json

        $menuItem = Invoke-RestMethod -Uri "$baseUrl/api/menu/items" `
            -Method POST `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $menuItemBody
        
        Write-Host "✅ Menu item created successfully!" -ForegroundColor Green
        Write-Host "   ID: $($menuItem.data.menuItem.id)"
        Write-Host "   Name: $($menuItem.data.menuItem.name)"
        Write-Host "   Price: `$$($menuItem.data.menuItem.price)"
        Write-Host "   Category: $($menuItem.data.menuItem.category.name)"
    } else {
        Write-Host "⚠️  No categories available. Skipping menu item creation." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "⚠️  Menu item creation skipped or failed" -ForegroundColor Yellow
}

# Summary
Write-Host "`n`n" + "=" * 70 -ForegroundColor Cyan
Write-Host "✅ DEMO COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan

Write-Host "`n📝 Summary of Admin Capabilities Demonstrated:" -ForegroundColor Cyan
Write-Host "   ✅ Login as admin user"
Write-Host "   ✅ List all users in the system"
Write-Host "   ✅ Create new users"
Write-Host "   ✅ Promote users to staff role"
Write-Host "   ✅ Promote users to admin role"
Write-Host "   ✅ View user statistics"
Write-Host "   ✅ Create menu items (admin-only feature)"

Write-Host "`n🔑 Your Admin Access Token (save this for API calls):" -ForegroundColor Yellow
Write-Host $token

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   - Use the token above for authenticated API requests"
Write-Host "   - Add 'Authorization: Bearer <token>' header to your requests"
Write-Host "   - Token expires in 7 days (configurable in .env)"
Write-Host "   - Use refresh token if access token expires"

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Full Guide: backend\ADMIN_AUTHORIZATION_GUIDE.md"
Write-Host "   - Quick Ref: backend\ADMIN_QUICK_REF.md"
Write-Host "   - Review Report: backend\BACKEND_REVIEW_REPORT.md"

Write-Host "`n" + "=" * 70 -ForegroundColor Cyan
Write-Host ""
