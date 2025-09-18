import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, Lock, Plus, Edit3, Smartphone, QrCode, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import qrCodeImage from '../assets/qr.png';

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
  const [onlinePaymentType, setOnlinePaymentType] = useState(''); // 'card' or 'upi'
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [showUPIQR, setShowUPIQR] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null); // Store current order for payment completion

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

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    // Only allow numbers for CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleOTPVerification = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!currentOrder) {
      toast.error('Order information not found');
      return;
    }
    
    console.log('� [OTP VERIFY] Verifying OTP for order:', currentOrder.orderId);
    setOtpLoading(true);
    
    try {
      // Simulate OTP verification (in real app, send to backend)
      if (otp === '123456') {
        console.log('✅ [OTP VERIFY] OTP verified successfully');
        
        // Complete the order by updating its status
        const response = await api.put(`/orders/${currentOrder.orderId}/complete`, {
          paymentStatus: 'completed',
          paymentMethod: 'card'
        });
        
        if (response.data.success) {
          toast.success('Payment successful! Order placed.');
          clearCart();
          setShowOTPInput(false);
          setCurrentOrder(null);
          navigate('/orders');
        }
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ [OTP VERIFY] Error:', error);
      toast.error('Payment verification failed');
    } finally {
      setOtpLoading(false);
      setOrderLoading(false);
    }
  };

  const handleUPIPaymentComplete = async () => {
    if (!currentOrder) {
      toast.error('Order information not found');
      return;
    }
    
    console.log('📱 [UPI COMPLETE] Completing UPI payment for order:', currentOrder.orderId);
    setOrderLoading(true);
    
    try {
      // Complete the order by updating its status
      const response = await api.put(`/orders/${currentOrder.orderId}/complete`, {
        paymentStatus: 'completed',
        paymentMethod: 'upi'
      });
      
      if (response.data.success) {
        toast.success('UPI payment successful! Order placed.');
        clearCart();
        setShowUPIQR(false);
        setCurrentOrder(null);
        navigate('/orders');
      }
    } catch (error) {
      console.error('❌ [UPI COMPLETE] Error:', error);
      toast.error('Payment completion failed');
    } finally {
      setOrderLoading(false);
    }
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

    // Validate card details if card payment is selected
    if (paymentMethod === 'card') {
      if (!cardDetails.cardholderName || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
      if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (cardDetails.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return;
      }
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

      console.log('📦 [PLACE ORDER] Order data:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('✅ [PLACE ORDER] API response:', response);
      
      if (response.data.success) {
        const { message, order } = response.data;
        
        if (paymentMethod === 'card') {
          console.log('💳 [CARD PAYMENT] Processing card payment for order:', order.orderId);
          setCurrentOrder(order); // Store order for payment completion
          toast.info('Processing card payment...');
          
          // Simulate sending OTP to email
          setTimeout(() => {
            toast.success('OTP sent to your registered email!');
            setShowOTPInput(true);
          }, 1000);
          
        } else if (paymentMethod === 'upi') {
          console.log('📱 [UPI PAYMENT] Processing UPI payment for order:', order.orderId);
          setCurrentOrder(order); // Store order for payment completion
          setShowUPIQR(true); // Show UPI QR code
          toast.info('Order created! Please complete UPI payment.');
          
        } else {
          // COD or other payment methods
          toast.success(message || 'Order placed successfully!');
          clearCart();
          navigate('/orders');
          setOrderLoading(false);
        }
      }
    } catch (error) {
      console.error('❌ [PLACE ORDER] Error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
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
                  
                  <div className="p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Online Payment</h3>
                        <p className="text-gray-600 text-sm">Card, UPI, Net Banking</p>
                      </div>
                    </div>
                    
                    {/* Online Payment Sub-options */}
                    <div className="ml-9 space-y-2">
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          paymentMethod === 'card'
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Credit/Debit Card</span>
                        </div>
                      </div>
                      
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                          paymentMethod === 'upi'
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">UPI Payment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card Details Form */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                  <div className="flex items-center text-white">
                    <div className="bg-white/20 rounded-full p-3 mr-4">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Card Details</h2>
                      <p className="text-blue-100">Enter your payment information</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={cardDetails.cardholderName}
                        onChange={handleCardDetailsChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardDetailsChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={cardDetails.expiryDate}
                          onChange={handleCardDetailsChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardDetailsChange}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                
                {/* OTP Input for Card Payment */}
                {showOTPInput && (
                  <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter OTP</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        An OTP has been sent to your registered email. Please enter it below.
                      </p>
                      <div className="flex gap-2 justify-center mb-4">
                        <input
                          type="text"
                          maxLength="6"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-40 px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        For demo purposes, use OTP: <span className="font-mono font-bold">123456</span>
                      </div>
                      <button
                        onClick={handleOTPVerification}
                        disabled={otp.length !== 6 || otpLoading}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                      >
                        {otpLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Verify & Complete Payment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* UPI QR Code for UPI Payment */}
                {showUPIQR && (
                  <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this QR code with any UPI app to complete your payment
                      </p>
                      <div className="flex justify-center mb-4">
                        <img 
                          src={qrCodeImage} 
                          alt="UPI QR Code" 
                          className="w-48 h-48 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-4">
                        Amount: ${getCartTotal().toFixed(2)}
                      </div>
                      <button
                        onClick={handleUPIPaymentComplete}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
                      >
                        <Check className="h-4 w-4" />
                        Payment Done
                      </button>
                    </div>
                  </div>
                )}
                
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