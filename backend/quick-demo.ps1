# Simple Admin Demo - Run this after starting the server

$baseUrl = "http://localhost:5000"

Write-Host "`n🎯 QUICK ADMIN DEMO`n" -ForegroundColor Cyan

# 1. Login
Write-Host "→ Logging in as admin..." -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@example.com","password":"Password123!"}'
$token = $r.data.tokens.accessToken
Write-Host "✅ Logged in: $($r.data.user.name) - Role: $($r.data.user.role)`n" -ForegroundColor Green

# 2. List users
Write-Host "→ Listing users..." -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "$baseUrl/api/users" -Headers @{"Authorization"="Bearer $token"}
Write-Host "✅ Total users: $($users.data.users.Count)`n" -ForegroundColor Green
$users.data.users | Format-Table name, email, role -AutoSize

# 3. Get stats  
Write-Host "`n→ Getting statistics..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$baseUrl/api/users/stats" -Headers @{"Authorization"="Bearer $token"}
Write-Host "✅ Admins: $($stats.data.adminCount) | Staff: $($stats.data.staffCount) | Customers: $($stats.data.customerCount)`n" -ForegroundColor Green

Write-Host "✅ DEMO COMPLETE!" -ForegroundColor Green
Write-Host "`n💡 Admin Token:" -ForegroundColor Cyan
Write-Host $token
Write-Host "`nUse this token with: -Headers @{`"Authorization`"=`"Bearer `$token`"}`n"
