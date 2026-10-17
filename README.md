# Modern Full-Stack E-Commerce Platform

A production-ready, responsive e-commerce web application built with **React 19**, **Vite**, and **Tailwind CSS**, integrated with a live **Node.js / Express / MongoDB** REST API backend. Designed with clean typography, soft-neutral aesthetics, seamless shopping workflows, live count synchronization, and a secure administrative suite.

---

## 🌐 Live Deployments & Repository Links

- **Live Frontend**: [https://ecomerce-frontend-pi02.onrender.com/](https://ecomerce-frontend-pi02.onrender.com/)
- **Live Backend API**: [https://ecomerce2-backend-2.onrender.com/api/v1](https://ecomerce2-backend-2.onrender.com/api/v1)
- **Frontend GitHub Repository**: [https://github.com/mohammedmujahid258/ecomerce-frontend](https://github.com/mohammedmujahid258/ecomerce-frontend)

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | Fast HMR, optimized production chunks, modern hook architecture |
| **Styling & UI Tokens** | Tailwind CSS + Modern Design System | Clean white & soft-slate neutrals (`#f8fafc`, `#ffffff`), dark typography (`#0f172a`), subtle micro-interactions |
| **Routing** | React Router DOM v7 | Declarative nested routing, role-based Protected Routes, URL search params synchronization |
| **HTTP Client** | Axios | Configured with automatic `Authorization: Bearer <token>` injection and graceful fallbacks |
| **State Synchronization** | Custom Event Emitter (`storeEvents`) | Real-time Cart and Wishlist badge count updates and toast notifications across decoupled components |
| **Backend Integration** | Express.js & MongoDB (Render) | Live REST API consumption for catalog, orders, reviews, addresses, and user profiles |

---

## ✨ Key Features

### 1. Modern Homepage
- **Announcement Bar**: Configurable store message for free delivery thresholds and authentic warranty.
- **Professional Navigation Bar**: Sticky header with logo, dynamic search input, quick links, live animated Cart & Wishlist counters, and user profile drawer.
- **Hero Showcase**: Compelling headline, promotional highlights, and direct Call to Action ("Shop Now").
- **Selected Products Grid**: Highlights top catalog products with instant Add-to-Cart and Wishlist toggling.
- **Shop by Category**: Curated category cards (Smartphones, Fashion, Footwear, Eyewear, Audio) dynamically linked to catalog filters.
- **Trending & Best Sellers**: Dynamically ranked by rating and product availability.
- **Special Offers**: Value-focused showcases highlighting items under ₹1,000.
- **Recently Viewed Products**: Client-side browsing history stored safely in `localStorage` and synced with catalog data.
- **Trust & Security Badges**: Authentic messaging emphasizing verified reviews, secure SSL checkout, and genuine guarantees.
- **Comprehensive Footer**: Quick category links, customer support contacts, and accepted payment options.

### 2. Product Catalog, Search & Filtering
- **Dynamic Category Pills**: Auto-computed from backend product categories ("All", "Smartphones", "Clothing", etc.).
- **URL-Driven Search**: Search queries sync bidirectionally with URL parameters for shareable search results.
- **Price Range & Stock Filters**: Instant client-side filtering by budget thresholds and in-stock toggle.
- **Smart Sorting**: Sort by price (low-to-high, high-to-low), customer rating, or newest additions.
- **Pagination & Load More**: Responsive grid layout with lazy pagination for seamless browsing.
- **Graceful Image Fallbacks**: Fallback SVG placeholder ensures no broken images ever disrupt the shopping experience.

### 3. Product Details & Verified Reviews
- **Multi-Angle Gallery**: Interactive thumbnail viewer with zoom support and smooth image switching.
- **Dynamic Stock Badges**: Real-time stock status with disabled purchase triggers when inventory is zero.
- **Quantity Selector**: Enforces positive integers and respects backend inventory caps.
- **Verified Purchase Reviews**: Full review system fetching live customer reviews (`GET /reviews/:id`) with rating stars, verified buyer tags, and review creation for customers who purchased the item.
- **Related Recommendations**: Dynamic carousel displaying products from the same category.

### 4. Cart, Wishlist & Checkout
- **Persistent Cart**: Synchronized with `GET /cart` and `PUT /cart` with real-time quantity adjustments and item removals.
- **Dynamic Cost Breakdown**: Transparent subtotal calculation, free shipping eligibility tracker (free shipping over ₹999), and order total.
- **Interactive Wishlist**: Dedicated saved items view with one-click "Move to Cart" action and real-time badge updates.
- **Checkout Flow**: Multi-field address form validation, coupon code verification (`POST /coupons/apply`), and payment method selection (Cash on Delivery & Razorpay gateway options).
- **Duplicate Order Prevention**: Submitting state disables buttons to eliminate accidental multiple charges.

### 5. Customer Account & Order Tracking
- **Authentication**: JWT-based authentication with form validation, role detection, and secure `localStorage` token management.
- **Order History (`/orders`)**: Chronological listing of past purchases with status pills (Pending, Shipped, Delivered), item breakdowns, and delivery summaries.
- **Profile Management (`/profile`)**: View and update customer details and view account badges.

### 6. Administration Suite (`/admin`)
- **Protected Admin Routes**: Dual-layer security requiring `role: "admin"` backend verification and a master administrative PIN.
- **Dashboard Overview**: Quick KPIs and shortcuts for inventory, order fulfillment, and user accounts.
- **Inventory Management (`/admin/products`)**: Add, edit, and delete products with image upload support (`multipart/form-data`) and live search.
- **Order Fulfillment (`/admin/orders`)**: Real-time status filter tabs and status update dropdown (`PATCH /orders/:id/status`).
- **User Directory (`/admin/all/users`)**: Searchable customer and admin directory.

---

## 📁 Project Structure

```text
ecomerce-frontend/
├── public/                 # Static assets & icons
├── src/
│   ├── Components/         # Reusable UI components
│   │   ├── AdminRoute.jsx         # Dual-layer admin authentication wrapper
│   │   ├── AnnouncementBar.jsx    # Top store notification bar
│   │   ├── CategoryCard.jsx       # Category showcase card
│   │   ├── EmptyState.jsx         # Accessible empty state display
│   │   ├── ErrorState.jsx         # Graceful error state with retry callback
│   │   ├── Footer.jsx             # Comprehensive multi-column footer
│   │   ├── LoadingSkeleton.jsx    # Shimmer loading skeleton cards & spinners
│   │   ├── Navbar.jsx             # Responsive navigation with dynamic badges
│   │   ├── ProductActions.jsx     # Reusable Add to Cart & Wishlist buttons
│   │   ├── ProductCard.jsx        # Product display card with stock/discount tags
│   │   ├── ProductGrid.jsx        # Responsive catalog grid container
│   │   ├── ProductImage.jsx       # Image with graceful SVG fallback
│   │   └── ToastContainer.jsx     # Global toast feedback notifications
│   ├── Pages/              # Page views
│   │   ├── AdminDashboard.jsx     # Admin operations hub
│   │   ├── AdminOrders.jsx        # Fulfillment & order status update table
│   │   ├── Adminproduct.jsx       # Product inventory CRUD management
│   │   ├── AdminUsers.jsx         # Registered customer directory
│   │   ├── Cart.jsx               # Shopping bag with quantity adjustments
│   │   ├── Checkout.jsx           # Address validation, coupons & payment
│   │   ├── Home.jsx               # 10-section homepage
│   │   ├── Login.jsx              # Customer & admin authentication
│   │   ├── Orders.jsx             # Customer purchase tracking
│   │   ├── Product.jsx            # Search, filter, and catalog browsing
│   │   ├── ProductDetails.jsx     # Product specifications, gallery & reviews
│   │   ├── Profile.jsx            # User profile management
│   │   ├── Register.jsx           # User registration
│   │   └── Wishlist.jsx           # Saved items collection
│   ├── utils/
│   │   └── cartWishlistEvents.js  # Global event dispatcher for counts & toasts
│   ├── api.js              # Centralized Axios instance with environment fallback
│   ├── App.jsx             # Router definition and route protection
│   ├── index.css           # Global typography, color tokens, and utility classes
│   └── main.jsx            # React root entry point
├── .env.example            # Environment template
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory (or configure environment variables in your deployment host like Render):

```env
# URL to your deployed or local Express backend API
VITE_API_BASE_URL=https://ecomerce2-backend-2.onrender.com/api/v1
```

If `VITE_API_BASE_URL` is omitted, the application automatically defaults to the production backend on Render.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x+

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/mohammedmujahid258/ecomerce-frontend.git
cd ecomerce-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Quality Checks & Build
```bash
# Run ESLint (enforces React 19 hooks and rules with 0 errors)
npm run lint

# Build production bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 🛡️ Security & Quality Standards

- **Zero Hardcoded Secrets**: Secrets, keys, and tokens are strictly kept out of code.
- **Defensive Error Handling**: All network requests contain try-catch-finally guards with user-friendly retry states.
- **Strict Lint Compliance**: Adheres to `eslint-plugin-react-hooks` with 0 errors and 0 warnings.
- **Role Verification**: Admin routes verify user role via backend profile endpoint, preventing client-side role tampering.

---

## 👨‍💻 Author & Portfolio

- **Developer**: Mohammed Mujahid
- **GitHub**: [@mohammedmujahid258](https://github.com/mohammedmujahid258)
- **Project**: Resume-Ready Full-Stack E-Commerce Platform
