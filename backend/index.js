import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from "path";
import connectDB from "./config/db.js";
import corsConfig from "./config/cors.js";
import config from "./config/config.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { handleWebhook } from './controllers/paymentController.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(morgan('combined')); // Logging middleware
app.use(helmet()); // Basic security headers

// Basic rate limiter
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT.MAX_REQUESTS, // limit each IP
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(corsConfig); // CORS configuration
// Stripe webhook - must be before express.json() in middleware ordering to access raw body
// We mount it at /api/payments/webhook and use express.raw to preserve the raw bytes for signature verification.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => handleWebhook(req, res)
);
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍽️ Restaurant QR Menu System API is running!",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    database: "Connected",
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`
🚀 Server Status:
   ✅ Server running on port ${PORT}
   🌍 Environment: ${config.NODE_ENV}
   🔗 Frontend URL: ${config.FRONTEND_URL}
   📊 Database: ${config.MONGO_URI}
   ⏰ Started at: ${new Date().toISOString()}
   
📚 Available Endpoints:
   GET  /              - Health check
   GET  /api/health    - API health check
   
🔐 Authentication Endpoints:
   POST /api/auth/register           - Register new user
   POST /api/auth/login              - Login user
   POST /api/auth/logout             - Logout user
   POST /api/auth/refresh            - Refresh access token
   GET  /api/auth/me                 - Get current user profile
   POST /api/auth/forgot-password    - Request password reset
   POST /api/auth/reset-password     - Reset password
   POST /api/auth/change-password    - Change password
   POST /api/auth/send-verification  - Send email verification
   POST /api/auth/verify-email       - Verify email
   DELETE /api/auth/delete-account   - Delete account
   
👥 User Management Endpoints:
   GET  /api/users                   - Get all users (Admin)
   GET  /api/users/stats             - Get user statistics (Admin)
   GET  /api/users/search            - Search users (Admin)
   GET  /api/users/:id               - Get user by ID (Admin)
   PUT  /api/users/profile           - Update user profile
   PUT  /api/users/:id/role          - Update user role (Admin)
   PUT  /api/users/:id/deactivate    - Deactivate user (Admin)
   
🍽️ Menu Management Endpoints:
   GET  /api/menu/stats              - Get menu statistics (Admin)
   GET  /api/menu/categories         - Get all categories
   GET  /api/menu/categories/:id     - Get category by ID
   POST /api/menu/categories         - Create category (Admin)
   PUT  /api/menu/categories/:id     - Update category (Admin)
   DELETE /api/menu/categories/:id   - Delete category (Admin)
   GET  /api/menu/items              - Get all menu items
   GET  /api/menu/items/:id          - Get menu item by ID
   POST /api/menu/items              - Create menu item (Admin)
   PUT  /api/menu/items/:id          - Update menu item (Admin)
   DELETE /api/menu/items/:id        - Delete menu item (Admin)
   PATCH /api/menu/items/:id/availability - Update availability (Admin)
   PATCH /api/menu/items/:id/popularity   - Update popularity (Admin)
   POST /api/menu/items/:id/image    - Upload item image (Admin)
   DELETE /api/menu/items/:id/image  - Delete item image (Admin)
   POST /api/menu/categories/:id/image    - Upload category image (Admin)
   DELETE /api/menu/categories/:id/image  - Delete category image (Admin)
   
🔧 Ready for development!
  `);
});

export default app;