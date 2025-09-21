import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './CartRecovery.css';

const CartRecovery = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [error, setError] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const fetchAbandonedCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cart-recovery/recover/${token}`);
      setCartData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAbandonedCart();
    }
  }, [token, fetchAbandonedCart]);

  const handleItemToggle = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleRestoreCart = async () => {
    if (!user) {
      toast.info('Please log in to restore your cart');
      navigate('/auth');
      return;
    }

    try {
      setRestoring(true);
      const response = await api.post(`/cart-recovery/restore/${token}`);
      
      toast.success(`Cart restored! ${response.data.itemsAdded} items added to your cart`);
      
      if (response.data.itemsSkipped.length > 0) {
        response.data.itemsSkipped.forEach(item => {
          toast.warn(`${item.name}: ${item.reason}`);
        });
      }

      navigate('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore cart');
    } finally {
      setRestoring(false);
    }
  };

  const handleAddSelectedToCart = () => {
    const selectedCartItems = cartData.cartItems.filter((_, index) => 
      selectedItems.has(index) && cartData.cartItems[index].available
    );

    selectedCartItems.forEach(item => {
      addToCart({
        productId: item.product._id,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      });
    });

    toast.success(`${selectedCartItems.length} items added to cart!`);
    navigate('/cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiscountCode = () => {
    const daysSinceCreated = Math.floor((new Date() - new Date(cartData.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated >= 3) {
      return { code: 'LASTCHANCE15', discount: 15 };
    } else if (daysSinceCreated >= 1) {
      return { code: 'COMEBACK10', discount: 10 };
    }
    return null;
  };

  const selectedTotal = cartData?.cartItems
    .filter((_, index) => selectedItems.has(index) && cartData.cartItems[index].available)
    .reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0) || 0;

  if (loading) {
    return (
      <div className="cart-recovery">
        <div className="loading-container">
          <div className="loading-spinner">Loading your saved cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-recovery">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!cartData) {
    return (
      <div className="cart-recovery">
        <div className="error-container">
          <h2>Cart Not Found</h2>
          <p>This cart link has expired or is invalid.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const discountOffer = getDiscountCode();
  const availableItems = cartData.cartItems.filter(item => item.available);
  const unavailableItems = cartData.cartItems.filter(item => !item.available);

  return (
    <div className="cart-recovery">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="recovery-header">
          <h1>Welcome Back! 👋</h1>
          <p>We saved your cart from {formatDate(cartData.createdAt)}</p>
          
          {discountOffer && (
            <div className="discount-banner">
              <div className="discount-content">
                <h3>🎉 Special Welcome Back Offer!</h3>
                <p>Get <strong>{discountOffer.discount}% off</strong> your cart with code: <strong>{discountOffer.code}</strong></p>
                <small>Use this code at checkout to save ${(selectedTotal * discountOffer.discount / 100).toFixed(2)}!</small>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="cart-content">
          
          {/* Available Items */}
          {availableItems.length > 0 && (
            <div className="available-items">
              <h2>Available Items ({availableItems.length})</h2>
              <div className="items-grid">
                {cartData.cartItems.map((item, index) => {
                  if (!item.available) return null;
                  
                  const isSelected = selectedItems.has(index);
                  const priceChanged = item.currentPrice !== item.price;
                  
                  return (
                    <div key={index} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                      <div className="item-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleItemToggle(index)}
                        />
                      </div>
                      
                      <div className="item-image">
                        <img
                          src={item.product.images?.[0] || '/placeholder-shoe.jpg'}
                          alt={item.product.name}
                        />
                      </div>
                      
                      <div className="item-details">
                        <h3>{item.product.name}</h3>
                        <p>Size: {item.size} | Quantity: {item.quantity}</p>
                        
                        <div className="price-info">
                          {priceChanged ? (
                            <>
                              <span className="current-price">{formatPrice(item.currentPrice)}</span>
                              <span className="old-price">{formatPrice(item.price)}</span>
                              <span className="price-change">
                                {item.currentPrice > item.price ? '↑' : '↓'}
                              </span>
                            </>
                          ) : (
                            <span className="price">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unavailable Items */}
          {unavailableItems.length > 0 && (
            <div className="unavailable-items">
              <h2>No Longer Available ({unavailableItems.length})</h2>
              <div className="items-grid unavailable">
                {cartData.cartItems.map((item, index) => {
                  if (item.available) return null;
                  
                  return (
                    <div key={index} className="cart-item unavailable">
                      <div className="item-image">
                        <img
                          src={item.product.images?.[0] || '/placeholder-shoe.jpg'}
                          alt={item.product.name}
                        />
                        <div className="unavailable-overlay">Out of Stock</div>
                      </div>
                      
                      <div className="item-details">
                        <h3>{item.product.name}</h3>
                        <p>Size: {item.size} | Quantity: {item.quantity}</p>
                        <p className="unavailable-text">This item is no longer available</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cart Summary */}
          {availableItems.length > 0 && (
            <div className="cart-summary">
              <div className="summary-content">
                <h3>Cart Summary</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Selected Items:</span>
                    <span>{selectedItems.size}</span>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedTotal)}</span>
                  </div>
                  {discountOffer && (
                    <div className="summary-row discount">
                      <span>Discount ({discountOffer.discount}%):</span>
                      <span>-{formatPrice(selectedTotal * discountOffer.discount / 100)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>
                      {discountOffer 
                        ? formatPrice(selectedTotal * (1 - discountOffer.discount / 100))
                        : formatPrice(selectedTotal)
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {user ? (
              <button
                onClick={handleRestoreCart}
                disabled={restoring || selectedItems.size === 0}
                className="btn-primary restore-btn"
              >
                {restoring ? 'Restoring Cart...' : `Restore ${selectedItems.size} Items to Cart`}
              </button>
            ) : (
              <button
                onClick={handleAddSelectedToCart}
                disabled={selectedItems.size === 0}
                className="btn-primary add-btn"
              >
                Add {selectedItems.size} Items to Cart
              </button>
            )}
            
            <button
              onClick={() => navigate('/products')}
              className="btn-secondary"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartRecovery;