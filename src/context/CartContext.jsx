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
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from backend when user logs in
  useEffect(() => {
    const loadUserCart = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await api.get('/cart');
          setCartItems(response.data.items || []);
          setCartCount(response.data.items?.reduce((total, item) => total + item.qty, 0) || 0);
        } catch (error) {
          console.error('Failed to load cart:', error);
          setCartItems([]);
          setCartCount(0);
        } finally {
          setLoading(false);
        }
      } else {
        // Clear cart when user logs out
        setCartItems([]);
        setCartCount(0);
      }
    };

    loadUserCart();
  }, [user]);

  const loadCart = async () => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
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

  const addToCart = async (variantId, size, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      await api.post('/cart/add', { variantId, size, qty: quantity });
      await loadCart(); // Reload cart after adding
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (variantId, size) => {
    if (!user) {
      throw new Error('Please login to modify cart');
    }

    try {
      setLoading(true);
      await api.post('/cart/remove', { variantId, size });
      await loadCart(); // Reload cart after removing
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId, newQuantity) => {
    if (!user) {
      throw new Error('Please login to modify cart');
    }

    if (newQuantity <= 0) {
      return removeFromCart(variantId);
    }
    
    // Remove item then add with new quantity
    await removeFromCart(variantId);
    await addToCart(variantId, newQuantity);
  };

  const clearCart = async () => {
    if (!user) {
      throw new Error('Please login to clear cart');
    }

    try {
      setLoading(true);
      await api.delete('/cart/clear');
      await loadCart();
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