import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, ArrowRight, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      console.log('📋 [ORDERS] Fetching user orders...');
      const response = await api.get('/orders/my-orders');
      console.log('📋 [ORDERS] Response:', response);
      setOrders(response.data.orders || []);
      console.log('📋 [ORDERS] Orders loaded:', response.data.orders?.length || 0);
    } catch (error) {
      console.error('❌ [ORDERS] Failed to fetch orders:', error);
      console.error('❌ [ORDERS] Error details:', error.response?.data);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
      case 'confirmed':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
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
            My Orders
          </h1>
          <p className="text-gray-600">Track your order history and status</p>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Looks like you haven't placed any orders yet. 
                Discover our amazing collection and place your first order!
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mx-auto"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order._id?.slice(-8)?.toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status || 'Pending'}</span>
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      ${order.totalAmount?.toLocaleString() || 'N/A'}
                    </div>
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order.items?.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.productId?.images?.[0] || '/placeholder-shoe.jpg'}
                        alt={item.productId?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.productId?.name || 'Product Name'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} • ${item.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {order.items?.length > 2 && (
                    <p className="text-sm text-gray-600 italic">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                {order.address && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{order.address.name}</p>
                      <p>{order.address.street}</p>
                      <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                      {order.address.phone && <p>Phone: {order.address.phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {orders.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/products')}
              className="bg-white/70 backdrop-blur-xl border border-white/20 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;