import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AddToCartModal from './AddToCartModal';
import './MobileProductCard.css';

const MobileProductCard = ({ product, showBrand = true, layout = 'grid' }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  const currentVariant = product.variants?.[selectedVariant] || product.variants?.[0];
  const images = currentVariant?.images || ['/placeholder-shoe.jpg'];
  const colors = product.variants?.map(v => v.color) || [];
  const hasMultipleImages = images.length > 1;

  const checkWishlistStatus = useCallback(async () => {
    try {
      const response = await api.get('/wishlist');
      const wishlistItems = response.data.items || [];
      setIsInWishlist(wishlistItems.some(item => item.product._id === product._id));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  }, [product._id]);

  useEffect(() => {
    if (user && product._id) {
      checkWishlistStatus();
    }
  }, [user, product._id, checkWishlistStatus]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Show login modal or redirect
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product._id}`);
        setIsInWishlist(false);
      } else {
        await api.post('/wishlist', { productId: product._id });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Open modal for variant/size selection
    setShowAddToCartModal(true);
  };

  const handleModalAddToCart = async (variantId, size, quantity) => {
    try {
      await addToCart(variantId, size, quantity);
      toast.success(`${product.title} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const handleColorChange = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariant(index);
    setCurrentImageIndex(0);
  };

  // Touch handlers for image swipe
  const handleTouchStart = (e) => {
    if (hasMultipleImages) {
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !hasMultipleImages) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next image
        setCurrentImageIndex(prev => 
          prev >= images.length - 1 ? 0 : prev + 1
        );
      } else {
        // Swipe right - previous image
        setCurrentImageIndex(prev => 
          prev <= 0 ? images.length - 1 : prev - 1
        );
      }
    }
    setTouchStart(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = () => {
    const totalStock = currentVariant?.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
    if (totalStock === 0) return 'out-of-stock';
    if (totalStock <= 5) return 'low-stock';
    return 'in-stock';
  };

  const stockStatus = getStockStatus();

  return (
    <div className={`mobile-product-card ${layout}`}>
      <Link to={`/product/${product._id}`} className="product-link">
        {/* Image Container */}
        <div 
          className="image-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="image-wrapper">
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className={`product-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {!imageLoaded && (
              <div className="image-skeleton">
                <div className="skeleton-animation"></div>
              </div>
            )}
          </div>

          {/* Image indicators */}
          {hasMultipleImages && (
            <div className="image-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            className={`wishlist-btn ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          {/* Stock Badge */}
          <div className={`stock-badge ${stockStatus}`}>
            {stockStatus === 'out-of-stock' && 'Out of Stock'}
            {stockStatus === 'low-stock' && 'Low Stock'}
            {stockStatus === 'in-stock' && 'In Stock'}
          </div>

          {/* Discount Badge */}
          {product.discount && product.discount > 0 && (
            <div className="discount-badge">
              -{product.discount}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          {showBrand && product.brand && (
            <Link 
              to={`/brand/${encodeURIComponent(product.brand)}`}
              className="brand-link"
              onClick={(e) => e.stopPropagation()}
            >
              {product.brand}
            </Link>
          )}

          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          {product.reviews?.averageRating && (
            <div className="rating-container">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < Math.floor(product.reviews.averageRating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">
                ({product.reviews.totalReviews || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="price-container">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="discounted-price">
                  {formatPrice(product.price * (1 - product.discount / 100))}
                </span>
                <span className="original-price">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="price">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Color Options */}
          {colors.length > 1 && (
            <div className="color-options">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className={`color-option ${index === selectedVariant ? 'active' : ''}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={(e) => handleColorChange(index, e)}
                  aria-label={`Select ${color} color`}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className={`quick-add-btn ${stockStatus === 'out-of-stock' ? 'disabled' : ''}`}
            onClick={handleQuickAdd}
            disabled={stockStatus === 'out-of-stock'}
          >
            {stockStatus === 'out-of-stock' ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </Link>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        product={product}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default MobileProductCard;