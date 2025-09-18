import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.title} added to cart!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      console.log('❤️ [WISHLIST ADD] Adding product to wishlist:', product._id);
      await api.post('/wishlist/add', { productId: product._id });
      toast.success(`${product.title} added to wishlist!`, {
        position: "top-right",
        autoClose: 2000,
      });
      console.log('❤️ [WISHLIST ADD] Successfully added to wishlist');
    } catch (error) {
      console.error('❌ [WISHLIST ADD] Failed to add to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 overflow-hidden border border-gray-700 hover:border-gray-600 min-h-[480px] flex flex-col">
      <Link to={`/product/${product._id}`} className="flex-1 flex flex-col">
        <div className="relative overflow-hidden flex-shrink-0">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden relative">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">👟</div>
                  <div className="text-lg font-medium">No Image Available</div>
                </div>
              </div>
            )}
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
              {/* Quick Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                <button
                  onClick={handleAddToWishlist}
                  className="p-3 bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-700 hover:scale-110 transition-all duration-200 border border-gray-600"
                >
                  <Heart className="w-4 h-4 text-gray-300 hover:text-red-400" />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Badge */}
            {product.categories && product.categories.length > 0 && (
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <span className="bg-gray-800/90 backdrop-blur-sm text-gray-200 text-xs font-medium px-3 py-1 rounded-full border border-gray-600">
                  {product.categories[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-100 mb-2 text-lg line-clamp-2 group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>
          
          {product.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-4 mt-auto">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border border-blue-500/20"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
