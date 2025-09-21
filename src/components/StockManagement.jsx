import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StockNotification = ({ productId, variantId, size, color, onNotificationSet }) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleNotifyMe = async () => {
    if (!user) {
      setMessage('Please login to receive stock notifications');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/products/${productId}/variants/${variantId}/notify`);
      setIsSubscribed(true);
      setMessage('You will be notified when this item is back in stock!');
      if (onNotificationSet) onNotificationSet();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to set notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-notification">
      {!isSubscribed ? (
        <button 
          className="notify-me-btn"
          onClick={handleNotifyMe}
          disabled={loading || !user}
        >
          {loading ? 'Setting up...' : `Notify when ${size} in ${color} is available`}
        </button>
      ) : (
        <div className="notification-set">
          ✓ You'll be notified when available
        </div>
      )}
      {message && (
        <div className={`notification-message ${isSubscribed ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

const StockIndicator = ({ stock, lowStockThreshold = 5 }) => {
  const getStockStatus = () => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getStockMessage = () => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= lowStockThreshold) return `Only ${stock} left!`;
    return 'In Stock';
  };

  const stockStatus = getStockStatus();
  
  return (
    <div className={`stock-indicator ${stockStatus}`}>
      <span className="stock-dot"></span>
      <span className="stock-text">{getStockMessage()}</span>
    </div>
  );
};

const SizeSelector = ({ 
  variants, 
  selectedSize, 
  selectedColor, 
  onSizeChange, 
  productId,
  showStockInfo = true 
}) => {
  const [stockStatus, setStockStatus] = useState({});

  useEffect(() => {
    if (variants && selectedColor) {
      const colorVariants = variants.filter(v => v.color === selectedColor);
      const status = {};
      
      colorVariants.forEach(variant => {
        status[variant.size] = {
          stock: variant.stock,
          variantId: variant._id,
          inStock: variant.stock > 0
        };
      });
      
      setStockStatus(status);
    }
  }, [variants, selectedColor]);

  const handleSizeClick = (size) => {
    if (stockStatus[size]?.inStock) {
      onSizeChange(size);
    }
  };

  if (!variants || !selectedColor) {
    return <div>Please select a color first</div>;
  }

  const availableSizes = Object.keys(stockStatus).sort((a, b) => parseFloat(a) - parseFloat(b));

  return (
    <div className="size-selector">
      <h4>Size</h4>
      <div className="size-options">
        {availableSizes.map(size => {
          const sizeData = stockStatus[size];
          const isSelected = selectedSize === size;
          const isAvailable = sizeData?.inStock;
          
          return (
            <div key={size} className="size-option-container">
              <button
                className={`size-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
                onClick={() => handleSizeClick(size)}
                disabled={!isAvailable}
                title={!isAvailable ? 'Out of stock' : `Size ${size}`}
              >
                {size}
                {showStockInfo && sizeData && sizeData.stock <= 5 && sizeData.stock > 0 && (
                  <span className="low-stock-badge">{sizeData.stock}</span>
                )}
              </button>
              
              {!isAvailable && selectedColor && (
                <StockNotification
                  productId={productId}
                  variantId={sizeData?.variantId}
                  size={size}
                  color={selectedColor}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {selectedSize && stockStatus[selectedSize] && (
        <div className="selected-size-info">
          <StockIndicator stock={stockStatus[selectedSize].stock} />
        </div>
      )}
    </div>
  );
};

const StockChecker = ({ productId, onStockUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState(null);

  const checkStock = async (variantId) => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}/variants/${variantId}/stock`);
      setStockData(response.data);
      if (onStockUpdate) onStockUpdate(response.data);
    } catch (error) {
      console.error('Error checking stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    checkStock,
    loading,
    stockData
  };
};

// Main export components
export { StockIndicator, StockNotification, SizeSelector, StockChecker };

// Default export for main stock management
const StockManagement = ({ 
  product, 
  variants, 
  selectedSize, 
  selectedColor, 
  onSizeChange,
  onColorChange 
}) => {
  const [availableColors, setAvailableColors] = useState([]);

  useEffect(() => {
    if (variants) {
      const colors = [...new Set(variants.map(v => v.color))];
      setAvailableColors(colors);
    }
  }, [variants]);

  const getVariantStock = (color, size) => {
    const variant = variants?.find(v => v.color === color && v.size === size);
    return variant ? variant.stock : 0;
  };

  return (
    <div className="stock-management">
      {/* Color Selector */}
      <div className="color-selector">
        <h4>Color</h4>
        <div className="color-options">
          {availableColors.map(color => {
            const hasStock = variants?.some(v => v.color === color && v.stock > 0);
            const isSelected = selectedColor === color;
            
            return (
              <button
                key={color}
                className={`color-option ${isSelected ? 'selected' : ''} ${!hasStock ? 'out-of-stock' : ''}`}
                onClick={() => hasStock && onColorChange(color)}
                disabled={!hasStock}
                title={color}
              >
                <span 
                  className="color-swatch"
                  style={{ backgroundColor: color.toLowerCase() }}
                ></span>
                <span className="color-name">{color}</span>
                {!hasStock && <span className="out-of-stock-overlay">✕</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      {selectedColor && (
        <SizeSelector
          variants={variants}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={onSizeChange}
          productId={product._id}
          showStockInfo={true}
        />
      )}

      {/* Overall Stock Status */}
      {selectedSize && selectedColor && (
        <div className="variant-stock-status">
          <StockIndicator stock={getVariantStock(selectedColor, selectedSize)} />
        </div>
      )}
    </div>
  );
};

export default StockManagement;