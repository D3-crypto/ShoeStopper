import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';
import api from '../utils/api';

const RecentlyViewed = ({ limit = 8, showTitle = true }) => {
  const { user } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    } else {
      // For non-logged users, try to get from localStorage
      const localRecent = getLocalRecentlyViewed();
      setRecentlyViewed(localRecent);
      setLoading(false);
    }
  }, [user]);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/user/recently-viewed');
      setRecentlyViewed(response.data.products.slice(0, limit));
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      // Fallback to localStorage for guests
      const localRecent = getLocalRecentlyViewed();
      setRecentlyViewed(localRecent);
    } finally {
      setLoading(false);
    }
  };

  const getLocalRecentlyViewed = () => {
    try {
      const recent = localStorage.getItem('recentlyViewed');
      if (recent) {
        const parsed = JSON.parse(recent);
        return parsed.slice(0, limit);
      }
    } catch (error) {
      console.error('Error parsing localStorage recently viewed:', error);
    }
    return [];
  };

  const clearRecentlyViewed = () => {
    if (user) {
      // Clear from backend for logged users
      api.delete('/products/user/recently-viewed').catch(console.error);
    } else {
      // Clear from localStorage for guests
      localStorage.removeItem('recentlyViewed');
    }
    setRecentlyViewed([]);
  };

  if (loading) {
    return (
      <div className="recently-viewed-loading">
        <div className="loading-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="recently-viewed-section">
      {showTitle && (
        <div className="section-header">
          <h3>Recently Viewed</h3>
          <button 
            className="clear-recent-btn"
            onClick={clearRecentlyViewed}
            title="Clear recently viewed"
          >
            Clear All
          </button>
        </div>
      )}
      
      <div className="recently-viewed-grid">
        {recentlyViewed.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            showQuickActions={false}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;