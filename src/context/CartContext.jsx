import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Generate or get session ID for anonymous users
  useEffect(() => {
    const getSessionId = async () => {
      if (!user) {
        let storedSessionId = localStorage.getItem('cartSessionId');
        if (!storedSessionId) {
          try {
            const response = await api.post('/cart/session');
            storedSessionId = response.data.sessionId;
            localStorage.setItem('cartSessionId', storedSessionId);
          } catch (error) {
            console.error('Failed to generate session ID:', error);
          }
        }
        setSessionId(storedSessionId);
      } else {
        // Clear session ID when user logs in
        localStorage.removeItem('cartSessionId');
        setSessionId(null);
      }
    };

    getSessionId();
  }, [user]);

  // Load cart from backend when session/user changes
  useEffect(() => {
    if (user || sessionId) {
      loadCart();
    }
  }, [user, sessionId]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const params = {};
      if (!user && sessionId) {
        params.sessionId = sessionId;
      }
      
      const config = {
        params,
        headers: {}
      };
      
      if (!user && sessionId) {
        config.headers['X-Session-Id'] = sessionId;
      }

      const response = await api.get('/cart', config);
      setCartItems(response.data.items || []);
      setCartCount(response.data.items?.reduce((total, item) => total + item.qty, 0) || 0);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (variantId, quantity = 1) => {
    try {
      setLoading(true);
      const requestData = { variantId, qty: quantity };
      const config = { headers: {} };
      
      if (!user && sessionId) {
        config.headers['X-Session-Id'] = sessionId;
      }

      await api.post('/cart/add', requestData, config);
      await loadCart(); // Reload cart after adding
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (variantId) => {
    try {
      setLoading(true);
      const requestData = { variantId };
      const config = { headers: {} };
      
      if (!user && sessionId) {
        config.headers['X-Session-Id'] = sessionId;
      }

      await api.post('/cart/remove', requestData, config);
      await loadCart(); // Reload cart after removing
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(variantId);
    }
    
    // Remove item then add with new quantity
    await removeFromCart(variantId);
    await addToCart(variantId, newQuantity);
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      // Remove all items one by one
      for (const item of cartItems) {
        await removeFromCart(item.variantId._id);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.qty * item.variantId.price);
    }, 0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};