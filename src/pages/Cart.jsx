import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Shield, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please sign in to proceed to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-gray-100">
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h1 className="text-4xl font-bold mb-4">
                Your cart is <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">empty</span>
              </h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Looks like you haven't added any shoes to your cart yet. 
                Discover our amazing collection and find your perfect pair!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg space-x-3"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Shopping Cart</span>
            </h1>
            <p className="text-xl text-gray-600">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {cartItems.map((item, index) => (
                  <div key={item._id} className={`p-8 ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <div className="text-3xl mb-1">👟</div>
                              <div className="text-xs font-medium">No Image</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between h-full">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900 mb-2">
                              <Link to={`/product/${item._id}`} className="hover:text-blue-600 transition-colors">
                                {item.title}
                              </Link>
                            </h3>
                            {item.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                              {formatPrice(item.price)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center bg-gray-100 rounded-2xl">
                                  <button
                                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                    className="p-3 hover:bg-gray-200 rounded-l-2xl transition-colors"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-6 py-3 font-semibold min-w-[3rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                    className="p-3 hover:bg-gray-200 rounded-r-2xl transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="flex items-center space-x-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-medium">Remove</span>
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-8">
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-3 text-blue-600 hover:text-blue-800 font-semibold text-lg group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg mb-4"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                </button>

                {!isAuthenticated && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Please sign in to complete your purchase
                    </p>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="text-xs text-gray-600">
                      <div className="text-2xl mb-1">🔒</div>
                      <div>Secure Payment</div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="text-2xl mb-1">🚚</div>
                      <div>Fast Delivery</div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="text-2xl mb-1">↩️</div>
                      <div>Easy Returns</div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="text-2xl mb-1">⭐</div>
                      <div>Top Quality</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
