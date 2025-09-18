import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, Lock, Plus, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Checkout = () => {
  console.log('🚀 [CHECKOUT] Component is mounting...');
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('Checkout Debug:', {
    isAuthenticated,
    authLoading,
    cartItemsLength: cartItems?.length || 0,
    cartItems: cartItems
  });
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to Cash on Delivery

  const fetchAddresses = useCallback(async () => {
    try {
      console.log('🔍 [CHECKOUT] Attempting to fetch addresses...');
      const response = await api.get('/users/addresses');
      console.log('✅ [CHECKOUT] Address response:', response);
      
      const userAddresses = response.data.addresses || [];
      console.log('📍 [CHECKOUT] User addresses:', userAddresses);
      setAddresses(userAddresses);
      
      // Auto-select default address or first address
      const defaultAddress = userAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        console.log('🎯 [CHECKOUT] Selected default address:', defaultAddress);
      } else if (userAddresses.length > 0) {
        setSelectedAddress(userAddresses[0]);
        console.log('🎯 [CHECKOUT] Selected first address:', userAddresses[0]);
      } else {
        console.log('📭 [CHECKOUT] No addresses found');
      }
    } catch (error) {
      console.error('❌ [CHECKOUT] Failed to fetch addresses:', error);
      console.error('❌ [CHECKOUT] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🔒 [CHECKOUT] Authentication error - redirecting to login');
        navigate('/login?redirect=/checkout');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, cartItems.length, navigate, fetchAddresses]);

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData({
      ...addressFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddAddress = async () => {
    if (!addressFormData.name || !addressFormData.street || !addressFormData.city || !addressFormData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/addresses', addressFormData);
      if (response.data.success) {
        toast.success('Address added successfully!');
        const newAddresses = response.data.addresses;
        setAddresses(newAddresses);
        
        // Select the newly added address
        const newAddress = newAddresses[newAddresses.length - 1];
        setSelectedAddress(newAddress);
        
        setShowAddressForm(false);
        setAddressFormData({
          name: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          variantId: item.variant?._id,
          quantity: item.quantity,
          price: item.variant?.price || item.price,
          size: item.selectedSize,
          color: item.selectedColor
        })),
        deliveryAddress: selectedAddress,
        paymentMethod,
        total: getCartTotal()
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Checkout
          </h1>
          <p className="text-gray-600 text-lg">Complete your order in just a few steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                <div className="flex items-center text-white">
                  <div className="bg-white/20 rounded-full p-3 mr-4">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Delivery Address</h2>
                    <p className="text-blue-100">Where should we deliver your order?</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        onClick={() => setSelectedAddress(address)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedAddress?._id === address._id
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{address.name}</h3>
                              {address.isDefault && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{address.phone}</p>
                            <p className="text-gray-700 mt-1">
                              {address.street}, {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 p-2">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No delivery addresses found</p>
                  </div>
                )}
                
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Address
                </button>

                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={addressFormData.name}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={addressFormData.phone}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="street"
                        placeholder="Street Address *"
                        value={addressFormData.street}
                        onChange={handleAddressInputChange}
                        className="md:col-span-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={addressFormData.city}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={addressFormData.state}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode *"
                        value={addressFormData.pincode}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="isDefault"
                            checked={addressFormData.isDefault}
                            onChange={handleAddressInputChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Set as default address</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleAddAddress}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      >
                        {loading ? 'Adding...' : 'Add Address'}
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
                <div className="flex items-center text-white">
                  <div className="bg-white/20 rounded-full p-3 mr-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Payment Method</h2>
                    <p className="text-green-100">Choose your preferred payment option</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      paymentMethod === 'cod'
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                        <p className="text-gray-600 text-sm">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-2 border-gray-200 rounded-xl opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-500">Online Payment</h3>
                        <p className="text-gray-400 text-sm">Coming soon - Card, UPI, Net Banking</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <div className="flex items-center text-white">
                  <div className="bg-white/20 rounded-full p-3 mr-4">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Order Summary</h2>
                    <p className="text-purple-100">Review your items</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={`${item._id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={item.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {item.selectedSize && item.selectedColor && ' • '}
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold">
                            ${((item.variant?.price || item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>${getCartTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || orderLoading || cartItems.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {orderLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Place Order
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" />
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;