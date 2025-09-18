import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishlistItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log('❤️ [WISHLIST REMOVE] Removing product from wishlist:', productId);
      await api.post('/wishlist/remove', { productId });
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
      console.log('❤️ [WISHLIST REMOVE] Successfully removed from wishlist');
    } catch (error) {
      console.error('❌ [WISHLIST REMOVE] Failed to remove from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = async (item) => {
    try {
      // For now, add the first available variant
      const variant = item.productId.variants?.[0];
      if (!variant) {
        toast.error('No variants available for this product');
        return;
      }

      await api.post('/cart/add', {
        userId: 'user123', // This should come from user context
        variantId: variant._id,
        qty: 1
      });
      
      toast.success('Added to cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
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
            My Wishlist
          </h1>
          <p className="text-gray-600">Your saved favorites</p>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Heart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Looks like you haven't saved any shoes to your wishlist yet. 
                Discover our amazing collection and save your favorites!
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
          /* Wishlist Items */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((item) => (
              <div key={item._id} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.images?.[0] || '/placeholder-shoe.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold text-gray-900">
                      ${item.variants?.[0]?.price?.toLocaleString() || 'N/A'}
                    </div>
                    {item.variants?.[0]?.discountedPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        ${item.variants[0].discountedPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => navigate(`/product/${item.productId._id}`)}
                      className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
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

export default Wishlist;