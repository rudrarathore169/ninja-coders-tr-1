# 🔧 Environment Setup Instructions

## 📋 Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

## 🚀 Quick Setup

### 1. Create Environment File
Create a `.env` file in the `backend` directory with the following variables:

```bash
# Copy the example file
cp .env.example .env
```

### 2. Required Environment Variables

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/restaurant_qr_menu

# JWT Configuration (IMPORTANT: Change these in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_this_in_production
JWT_REFRESH_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payment Gateway Configuration (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run index

# Production mode
npm start
```

## 🔐 Security Notes

### JWT Secrets
- **NEVER** use default JWT secrets in production
- Generate strong, random secrets (minimum 32 characters)
- Use different secrets for access and refresh tokens

### Database Security
- Use strong passwords for MongoDB
- Enable authentication in production
- Use MongoDB Atlas for production deployments

### Environment Variables
- Never commit `.env` files to version control
- Use different configurations for development, staging, and production
- Rotate secrets regularly

## 🗄️ Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `restaurant_qr_menu`

### MongoDB Atlas (Recommended for Production)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

## ✅ Verification

After setup, verify everything works:

1. **Server Health Check**
   ```bash
   curl http://localhost:5000/
   ```

2. **API Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Database Connection**
   - Check console logs for MongoDB connection success
   - Should see: `✅ MongoDB Connected: localhost`

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string
   - Check firewall settings

3. **JWT Secret Missing**
   - Ensure JWT_SECRET is set in `.env`
   - Restart server after adding environment variables

## 📝 Development Tips

- Use `npm run index` for development (auto-restart with nodemon)
- Check logs in console for debugging
- Use Postman or similar tools to test API endpoints
- Keep `.env` file secure and never commit it

## 🔄 Next Steps

After environment setup is complete:
1. ✅ Environment Setup & Configuration (Current)
2. 🔄 Middleware Implementation
3. 🔄 Authentication System
4. 🔄 API Endpoints Implementation
5. 🔄 Testing & Validation
