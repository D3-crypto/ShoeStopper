# 👟 ShoeStopper Frontend

Modern React e-commerce application for ShoeStopper shoe store with responsive design and professional user experience.

## 🌐 Live Demo

**Website**: [https://d3-crypto.github.io/ShoeStopper](https://d3-crypto.github.io/ShoeStopper)

## ⚠️ Important Notice - Demo Payment System

**This application demonstrates an e-commerce interface with simulated payment processing. It does NOT handle real payments or process actual transactions.**

**Demo Payment Features:**
- Simulated card payment with demo OTP (`123456`)
- Mock UPI payment with fake QR code
- Cash on Delivery (COD) works as expected
- All payments are for demonstration only
- No real money is processed

**For Production Use:** Integration with real payment gateways like Stripe, Razorpay, or PayPal would be required.

## ✨ Key Features

### Shopping Experience
- Product catalog with advanced filtering (category, color, size, price)
- Dynamic product cards with hover effects and quick actions
- Product detail pages with image galleries and variant selection
- Shopping cart with quantity management and real-time totals
- Wishlist functionality for saving favorite items
- Newsletter subscription with email validation

### User Authentication
- Secure login and registration with OTP verification
- User profiles with order history and address management
- Password recovery with email-based reset
- Session management with automatic token refresh

### Checkout & Orders
- Multi-step checkout with address selection
- **Demo payment methods** (COD, simulated Card/UPI) - *Not real payment processing*
- Order tracking with real-time status updates
- Order history with detailed receipts
- Email confirmations for all order events

### Design & User Experience
- Modern UI design with gradient themes and animations
- Fully responsive design for desktop, tablet, and mobile
- Professional branding with consistent color scheme
- Intuitive navigation with search functionality
- Loading states and error handling

## 🏗️ Technology Stack

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: CSS3 with modern features
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/D3-crypto/ShoeStopper.git
cd ShoeStopper
npm install
```

### Environment Setup
```bash
# Create .env file
VITE_API_URL=http://localhost:4000/api  # Development
# VITE_API_URL=https://shoestopper-backend.onrender.com/api  # Production
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx       # Navigation and user menu
│   ├── Footer.jsx       # Site footer with newsletter signup
│   ├── ProductCard.jsx  # Product display component
│   └── AuthModal.jsx    # Login/registration modal
├── pages/              # Route components
│   ├── Home.jsx        # Landing page with featured products
│   ├── Products.jsx    # Product catalog with filtering
│   ├── ProductDetail.jsx # Individual product pages
│   ├── Cart.jsx        # Shopping cart management
│   ├── Checkout.jsx    # Order placement and payment
│   ├── Orders.jsx      # Order history and tracking
│   ├── Profile.jsx     # User account management
│   └── Contact.jsx     # Contact information
├── context/            # React Context providers
│   ├── AuthContext.jsx # User authentication state
│   └── CartContext.jsx # Shopping cart state
├── utils/              # Utility functions
│   └── api.js          # API communication
└── assets/             # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## 🔗 Integration

- **Backend API**: ShoeStopper REST API
- **Email Service**: Newsletter and order confirmations
- **Payment Demo**: Simulated payment gateway for demonstration purposes only