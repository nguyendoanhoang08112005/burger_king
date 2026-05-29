# 🍔 Hamburger King — Premium Full-Stack E-Commerce Platform

Welcome to **Hamburger King**, a state-of-the-art Full-Stack E-Commerce Platform designed for a premium gourmet burger chain. Featuring an elegant, high-contrast, modern Light Theme, this application is optimized for visual excellence, responsive ease of use, and rich micro-interactions.

The entire system is powered by a high-performance **monorepo architecture**, combining a fast **React 19 + Tailwind CSS v4** client and a robust **Laravel 12 + Sanctum** RESTful backend API.

---

## 🚀 Technology Stack

### 💻 Frontend (Client)
* **Core**: React 19 & Vite (with `@tailwindcss/vite` plugin compilation).
* **Styling**: Tailwind CSS v4 tailored into a custom, high-fidelity light theme:
  * **Unified Typography**: 100% standardized on **DM Sans** (bold, geometric, fluid sizing) for maximum legibility.
  * **Harmonious Palette**: Warm Cream background (`#FFFAF5`), pure white surfaces, deep charcoal text (`#1A1A1A`), energetic brand red (`#D62300`), and golden accent yellow (`#FFC72C`).
* **State Management**: **Zustand** for blazing-fast shopping cart, local UI drawer toggle, and global notifications state.
* **Server State & Data Fetching**: **React Query (TanStack Query) v5** and **Axios** for clean caching, automated retries, and REST integrations.
* **Navigation**: **React Router v7** for clean, seamless view transitions.
* **Icons & Charts**: **Lucide React** for smooth micro-vectors, and **Recharts** for elegant administrative analytics.

### ⚙️ Backend (API Server)
* **Core Framework**: **Laravel 12.x** with optimized PHP 8.2+ execution patterns.
* **Authentication**: **Laravel Sanctum** providing lightweight, secure token-based stateful authentication.
* **Permissions & Roles**: **Spatie Laravel Permission** enforcing role security boundaries (`customer`, `staff`, `admin`).
* **Caching & Queue**: **Redis** for blazingly fast session management, application caching, and high-throughput queues.
* **Queue Monitor**: **Laravel Horizon** for full control and dashboard tracking of Redis queues.
* **Database**: **MySQL 8.0** with fully-typed schema migrations and performance seeding.

### 🌐 Integrations & Services
* **Real-time Sync**: **Pusher Channels** for server-to-client websocket updates (live order tracking, notification broadcasts).
* **Media Storage**: **Laravel Storage** mapped to Cloudinary/AWS S3 for seamless, fast product image delivery.
* **Email System**: **Mailtrap / SMTP** integration for developer verification and order emails.
* **Payment Gateways**: Fully mock-integrated **VNPay**, **Momo**, and cash-on-delivery (**COD**) portals.

---

## 🎯 Extensive Feature Breakdown

### 🛒 1. Customer Storefront Portal

#### A. Interactive Gourmet Menu & Catalog
* **Fluid Hero Section**: Bold fluid clamp typography showcasing the signature "BURGER LỬA HỒNG" (Flame-Grilled Burger) banner with smooth micro-animations.
* **Category Navigation**: Seamless filter tabs (Burgers, Sides, Drinks, Combos) styled with modern hover states.
* **Product Detail Overlays**: Interactive modals detailing calorie profiles, customizable ingredients, size selectors, and automatic add-to-cart handlers.

#### B. High-Fidelity Shopping Cart & Drawer
* **Live Calculation**: Interactive calculations of product costs, hot deal savings, coupon deductions, shipping fees, and grand total.
* **Discount Code Engine**: Real-time code check validation with instant feedback alerts.
* **Client-side Persistence**: Full cart synchronization driven by Zustand state stores.

#### C. Wizard-Driven 3-Step Checkout
* **Step 1: Contact Details**: Validation of recipient name, phone, and delivery notes.
* **Step 2: Delivery vs. Pickup Choice**:
  * **Delivery mode**: Integrated with the user's custom Address Book.
  * **Self-pickup mode**: Showcases selected branches, addresses, and operations.
* **Step 3: Payment Hub**: Modern visual select system choosing between Momo, VNPay (simulating banking checkout), and COD (Cash on Delivery).

#### D. Personal Account & Loyalty Dashboard
* **Profile Manager**: Clean, comfortable forms to update credentials, profile name, and telephone numbers.
* **Loyalty Points Widget**: Live tracker tracking accumulated points and details of transactions (earning points from purchases or redeeming them).
* **Interactive Address Book**: CRUD engine to manage shipping profiles (set default recipient, labels, street address, ward, and district).
* **Live Notification Center**: Soft alerts and broadcast history driven by websocket connections.
* **Product Wishlist**: Instant toggling to bookmark items, complete with inline quick-add-to-cart functionality.
* **Real-time Order Tracker**: Visually dynamic progress map tracking steps from preparation to delivery.

---

### 👑 2. Administrative & Staff Dashboard

#### A. Business Intelligence Analytics
* **Total Sales Tracker**: Custom metric widgets feeding off real-time transaction aggregates.
* **Operational Monitoring**: Displays counter cards for pending orders, active registered users, and live product catalog counts.
* **Data Visualization**: Charts mapping sales metrics for business reviews.

#### B. Workspace Order Processing Panel
* **Live Order Desk**: Table tracking user purchase history, times, details, and totals.
* **Actionable Status Dropdowns**: Instant updates triggering Pusher websocket events (Pending ➔ Confirmed ➔ Preparing ➔ Delivering ➔ Delivered ➔ Cancelled).

#### C. Shelf Product CRUD Management
* **Interactive Form**: Input fields to upload thumbnail URLs, assign product categories, set standard prices, and describe calorie information.
* **Live Shelving**: Delete or update products directly, propagating changes to the customer storefront menu instantly.

#### D. Interactive Coupon Engine
* **Flexible Discounts**: Setup codes for percentage discounts, flat fee reductions, or free shipping.
* **Usage Controls**: Enforce minimum spending thresholds, limit uses per coupon, and set validity boundaries.

---

## 📂 Project Architecture

The codebase is organized as a clean **Monorepo** structure:

```
hamburger_king/
├── backend/            # Laravel 12 API Server
│   ├── app/            # Application logic (Controllers, Models, Middlewares)
│   ├── config/         # System configurations
│   ├── database/       # Migrations, seeders, and factories
│   └── routes/         # API Endpoint definitions
├── frontend/           # React 19 Single Page Application (Vite)
│   ├── public/         # Static assets (Favicons, images)
│   └── src/            # Client source code
│       ├── api/        # Axios API handlers
│       ├── assets/     # Global styling elements
│       ├── store/      # Zustand state engines
│       └── App.jsx     # Main client router & views
├── package.json        # Root script setup
└── README.md           # Project documentation
```

---

## 🛠️ Installation & Setup Guide

### 📋 Prerequisites
Ensure your local system matches the following software environments:
* **PHP**: `^8.2` or higher
* **Composer**: `^2.2`
* **Node.js**: `^18.0` or higher (equipped with `npm` or `yarn`)
* **Database**: **MySQL 8.0**
* **Cache/Queue Manager**: **Redis**

---

### 1. Repository Setup & Dependencies
Clone the repository and run the root installation helper to configure both workspaces:

```bash
# Clone the repository
git clone https://github.com/your-username/hamburger_king.git
cd hamburger_king

# Install all monorepo dependencies (Frontend & Concurrent runner)
npm run install:all
```

---

### 2. Backend API Setup
Navigate to the `/backend` directory to establish dependencies, environments, and databases:

```bash
cd backend

# Install Composer packages
composer install

# Configure environment files
copy .env.example .env

# Generate security key
php artisan key:generate
```

Configure your `.env` variables to match your system specs:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hamburger_king
DB_USERNAME=root
DB_PASSWORD=your_secure_password

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Migrate the database tables and trigger the seeding engine to load categories, products, and admin users:

```bash
php artisan migrate --seed
```

---

### 3. Frontend App Setup
Configure your client environment variable inside `/frontend` if needed:

```bash
cd ../frontend
copy .env.example .env.local
```

Ensure the API base URL matches your local server:
```ini
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## ⚡ Running the Applications

Rather than maintaining separate terminal workspaces, you can easily run both the Laravel API backend and the React SPA frontend concurrently from the root directory with a single command:

```bash
# From the repository root
npm run dev
```

This starts:
* **Backend API**: Running on [http://localhost:8000](http://localhost:8000)
* **Frontend SPA**: Running on [http://localhost:5173](http://localhost:5173)

---

## 📦 Production Bundling

To test and compile the React application for high-performance static hosting, execute the bundler in the `/frontend` workspace:

```bash
cd frontend
npm run build
```

This compiles your client-side files into the `dist/` folder, utilizing strict tree-shaking and CSS asset optimization for maximum speed and SEO efficiency.
