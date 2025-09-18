import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Eye, EyeOff, Shield, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  
  // Address management state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      // Load user addresses and orders count
      fetchAddresses();
      fetchOrdersCount();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const fetchOrdersCount = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrdersCount(response.data.orders?.length || 0);
    } catch (error) {
      console.error('Failed to fetch orders count:', error);
    }
  };

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
        setAddresses(response.data.addresses);
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

  const handleEditAddress = (address) => {
    setEditingAddress(address._id);
    setAddressFormData(address);
    setShowAddressForm(true);
  };

  const handleUpdateAddress = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/users/addresses/${editingAddress}`, addressFormData);
      if (response.data.success) {
        toast.success('Address updated successfully!');
        setAddresses(response.data.addresses);
        setShowAddressForm(false);
        setEditingAddress(null);
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
      toast.error(error.response?.data?.error || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setLoading(true);
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      if (response.data.success) {
        toast.success('Address deleted successfully!');
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setIsEditing(false);
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600 font-medium">
                        {user.verified ? 'Verified Account' : 'Unverified Account'}
                      </span>
                    </div>
                  </div>
                </div>
                {!isEditing && !isChangingPassword && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl transition-all duration-300 ${
                        isEditing 
                          ? 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                      }`}
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={true} // Email typically shouldn't be editable
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl cursor-not-allowed"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Contact support to change your email address</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl transition-all duration-300 ${
                        isEditing 
                          ? 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                          : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                {!isChangingPassword && !isEditing && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter current password"
                      />
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter new password"
                      />
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Confirm new password"
                      />
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? 'Changing...' : 'Change Password'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Address Management Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Shipping Addresses</h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Add Address
                  </button>
                )}
              </div>

              {/* Address List */}
              {addresses.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {addresses.map((address) => (
                    <div key={address._id} className="border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{address.name}</h4>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                          <p className="text-gray-700">{address.street}</p>
                          <p className="text-gray-700">{address.city}, {address.state} - {address.pincode}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No addresses saved yet</p>
                  <p className="text-sm">Add your first shipping address to proceed with orders</p>
                </div>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={addressFormData.name}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={addressFormData.phone}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={addressFormData.street}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="House no, Building name, Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressFormData.city}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={addressFormData.state}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={addressFormData.pincode}
                        onChange={handleAddressInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="PIN Code"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressFormData.isDefault}
                          onChange={handleAddressInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Set as default address</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setAddressFormData({
                          name: '',
                          phone: '',
                          street: '',
                          city: '',
                          state: '',
                          pincode: '',
                          isDefault: false
                        });
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold text-gray-900">{ordersCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-full text-left p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700 font-semibold"
                >
                  View Orders
                </button>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="w-full text-left p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors text-purple-700 font-semibold"
                >
                  Manage Addresses
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full text-left p-3 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors text-green-700 font-semibold"
                >
                  Wishlist
                </button>
                <button 
                  onClick={() => navigate('/products')}
                  className="w-full text-left p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-colors text-orange-700 font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
