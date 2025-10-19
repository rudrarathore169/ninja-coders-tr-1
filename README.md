# 🍽️ Restaurant QR Menu System

## 📖 Project Overview
The **Restaurant QR Menu System**, also called **“Scan & Dine Lite”**, is a full-stack application designed to digitalize the dining experience.  
Customers can simply scan a **table-specific QR code** to view the restaurant’s menu, place orders, and track their order status in real-time.  
Staff and Admin users can manage orders, menus, tables, and customers through secure role-based dashboards.

---

## ✨ Key Features

### 👥 Roles & Authentication
- **Roles:** `Customer`, `Staff`, `Admin`
- **Authentication:** Secure email/password login using **bcrypt** and **JWT**
- **Role-Based Access Control (RBAC):** Protected routes for Admin and Staff
- **Guest Orders:** Customers can order as guests via table QR without login

### 📱 Customer Experience
- Scan QR → Open menu for that table
- Browse by **category**, **search**, and **availability**
- Add items to cart, modify quantities, and add notes
- Place orders and track status in real-time or via polling

### 🧑‍🍳 Staff Dashboard
- Live order queue with filter by status/table
- Update statuses: `Placed`, `Preparing`, `Ready`, `Served`, `Canceled`
- Optional sound alerts for new orders

### 👨‍💼 Admin Dashboard
- Manage menu categories and items (CRUD operations)
- Upload item images and change availability or prices
- Create and manage restaurant tables with QR generation
- Basic analytics: revenue, top items, and daily orders

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Axios, React Router, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT, bcrypt |
| **Utilities** | Multer, dotenv, CORS, Nodemon |
| **Version Control** | Git + GitHub |


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```
git clone https://github.com/<your-username>/restaurant-qr-menu-system.git
cd restaurant-qr-menu-system

cd backend
npm install


cd ../frontend
npm install

cd backend
npm run dev

cd frontend
npm start


```


---

