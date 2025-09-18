import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const OrderDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      console.log('🔍 [ORDER DETAILS] Fetching order:', id);
      const response = await api.get(`/orders/my-orders`);
      const orders = response.data.orders || [];
      const foundOrder = orders.find(order => order._id === id);
      
      if (!foundOrder) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }
      
      setOrder(foundOrder);
      console.log('🔍 [ORDER DETAILS] Order loaded:', foundOrder.orderId);
    } catch (error) {
      console.error('❌ [ORDER DETAILS] Failed to fetch order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrderDetails();
  }, [isAuthenticated, fetchOrderDetails]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'processing':
      case 'confirmed':
        return <Clock className="w-6 h-6 text-blue-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order not found</h2>
            <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Orders</span>
          </button>
          
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.orderId?.slice(-8)?.toUpperCase() || order._id?.slice(-8)?.toUpperCase()}
                </h1>
                <p className="text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 ${getStatusColor(order.status)} mb-3`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status || 'Pending'}</span>
                </span>
                <div className="text-3xl font-bold text-gray-900">
                  ${order.totalAmount?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-6">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                <img
                  src={item.productId?.images?.[0] || '/placeholder-shoe.jpg'}
                  alt={item.productId?.name || 'Product'}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {item.productId?.name || 'Product Name'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                    <span>Quantity: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${(item.price * item.quantity).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${item.price} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <MapPin className="w-6 h-6" />
              <span>Delivery Address</span>
            </h2>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-gray-900">
                <p className="font-semibold text-lg mb-2">{order.deliveryAddress.name}</p>
                <p className="mb-1">{order.deliveryAddress.street}</p>
                <p className="mb-1">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                {order.deliveryAddress.phone && (
                  <p className="text-gray-600 mt-2">Phone: {order.deliveryAddress.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <CreditCard className="w-6 h-6" />
            <span>Payment Information</span>
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900 uppercase">
                  {order.payment?.method || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <p className="font-semibold text-gray-900">
                  {order.payment?.status || 'Pending'}
                </p>
              </div>
              {order.payment?.transactionId && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900">
                    {order.payment.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((entry, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                  {getStatusIcon(entry.status)}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{entry.status}</p>
                    <p className="text-sm text-gray-600">{formatDate(entry.at)}</p>
                    {entry.note && (
                      <p className="text-sm text-gray-700 mt-1">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;