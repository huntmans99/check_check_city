# Check Check City 🍽️

A modern food delivery application built with Next.js, featuring user authentication, order management, and admin dashboards.

---

Features

###  Customer Features
Browse Menu: View available food items with images and descriptions
Shopping Cart: Add/remove items with real-time price calculation
User Accounts: Create account with phone, name, and address
Authentication: Secure login with phone + password
Password Reset: OTP-based password recovery via SMS (Vonage)
Order History: Track past orders with dates and statuses
Delivery: Select delivery location with dropdown menu
Payment on Delivery: COD option for all orders

###  Admin Features
Order Dashboard: View all incoming orders in real-time
Order Management: Update order status (Pending → Confirmed → Processing → Ready → Delivered)
Date Grouping: Orders organized by date with sticky headers for easy navigation
Auto-Refresh: Dashboard refreshes every 30 seconds automatically
Manual Refresh: Button to refresh orders on demand
Admin Authentication: Password-protected admin access

###  Security & Authentication
Phone + Password Login: Secure authentication with bcryptjs hashing (10 salt rounds)
SMS OTP: Two-factor password reset via Vonage SMS
Environment Variables: Secure credential management
localStorage: Client-side session persistence
Secret Protection: .env.local ignored in version control

---

Tech Stack

**Frontend:**
Next.js 15.5.9 with Turbopack for fast compilation
React 19 with modern hooks
TypeScript for type safety
Tailwind CSS for responsive styling
Framer Motion for smooth animations
Radix UI components for accessible UI

**Backend:**
Next.js API Routes for serverless backend
Supabase (PostgreSQL) for database
Vonage SMS API for OTP delivery
bcryptjs for password hashing

**State Management:**
React Context (CartProvider, UserProvider)
localStorage for persistence

**Deployment:**
Vercel for hosting and auto-deployment

---

Database Schema

### Users Table
```sql
id (UUID, PK)
phone (text, unique)
name (text)
address (text)
password (text, bcryptjs hashed)
created_at (timestamp)
```

### Orders Table
```sql
id (UUID, PK)
user_id (UUID, FK)
items (JSONB)
delivery_location (text)
status (text: pending, confirmed, processing, ready, delivered)
total_price (numeric)
created_at (timestamp)
updated_at (timestamp)
```

---

Quick Start

### Prerequisites
Node.js 18+ and npm
Supabase account
Vonage SMS account

### Installation
```bash
git clone https://github.com/huntmans99/check_check_city.git
cd check_check_city
npm install
```

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
ADMIN_PASSWORD=check123
VONAGE_API_KEY=your_key
VONAGE_API_SECRET=your_secret
VONAGE_SENDER_ID=CHECK CHECK CITY
```

### Run Development Server
```bash
npm run dev
```
Visit http://localhost:3000

---

Usage Guide

### For Customers
1. Create Account: Click "Create Account" on cart page
2. Login: Phone + password authentication
3. Browse Menu: View items and add to cart
4. Checkout: Select delivery location and confirm
5. Track Order: View order history and status

### For Admin
1. Visit `/admin`
2. Enter password: `check123`
3. View and manage orders in real-time
4. Update order status as items are prepared

---

Business Details

**Restaurant:** Check Check City  
**Location:** East Legon, Boundary Road, Accra  
**Phone:** +233 549 537 343 / +233 206 819 878  
**Payment:** Payment on Delivery (COD)

---

Build & Deploy

```bash
npm run build
npm start
```

Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

---

Performance

Build Time: 3.7 seconds (Turbopack)
Pages: 12 static pages
First Load: ~147 KB JS
Mobile: Fully responsive

---

License

MIT License - Open source project

---

**Built with joy for Check Check City**
