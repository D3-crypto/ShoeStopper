import React, { useState, useEffect } from 'react';
import './TouchSizeSelector.css';

const TouchSizeSelector = ({ 
  variants, 
  selectedSize, 
  onSizeSelect, 
  showStock = true,
  layout = 'grid' // 'grid' or 'horizontal'
}) => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [sizeStock, setSizeStock] = useState({});

  useEffect(() => {
    if (variants && variants.length > 0) {
      // Collect all unique sizes and their stock info
      const sizesMap = new Map();
      
      variants.forEach(variant => {
        // Handle new structure: variants with sizes array
        if (variant.sizes && variant.sizes.length > 0) {
          variant.sizes.forEach(sizeInfo => {
            const size = sizeInfo.size;
            const stock = sizeInfo.stock || 0;
            
            if (sizesMap.has(size)) {
              sizesMap.set(size, sizesMap.get(size) + stock);
            } else {
              sizesMap.set(size, stock);
            }
          });
        }
        // Handle old structure: individual size/color variants
        else if (variant.size && variant.stock !== undefined) {
          const size = variant.size;
          const stock = variant.stock || 0;
          
          if (sizesMap.has(size)) {
            sizesMap.set(size, sizesMap.get(size) + stock);
          } else {
            sizesMap.set(size, stock);
          }
        }
      });

      // Convert to arrays and sort numerically where possible
      const sizes = Array.from(sizesMap.keys()).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      });

      const stockInfo = {};
      sizesMap.forEach((stock, size) => {
        stockInfo[size] = stock;
      });

      setAvailableSizes(sizes);
      setSizeStock(stockInfo);
    } else {
      setAvailableSizes([]);
      setSizeStock({});
    }
  }, [variants]);

  const handleSizeClick = (size) => {
    const stock = sizeStock[size] || 0;
    if (stock > 0) {
      onSizeSelect(size);
    }
  };

  const getSizeStatus = (size) => {
    const stock = sizeStock[size] || 0;
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getSizeLabel = (size) => {
    if (!showStock) return size;
    
    const stock = sizeStock[size] || 0;
    if (stock === 0) return `${size}`;
    if (stock <= 5) return `${size}`;
    return size;
  };

  if (availableSizes.length === 0) {
    return (
      <div className="touch-size-selector">
        <div className="no-sizes-message">
          No sizes available
        </div>
      </div>
    );
  }

  return (
    <div className={`touch-size-selector ${layout}`}>
      <div className="size-selector-header">
        <h3>Select Size</h3>
        {selectedSize && (
          <span className="selected-size-info">
            Selected: <strong>{selectedSize}</strong>
          </span>
        )}
      </div>

      <div className={`sizes-container ${layout}`}>
        {availableSizes.map(size => {
          const status = getSizeStatus(size);
          const isSelected = selectedSize === size;
          const isAvailable = status !== 'out-of-stock';

          return (
            <button
              key={size}
              className={`size-button ${status} ${isSelected ? 'selected' : ''} ${layout}`}
              onClick={() => handleSizeClick(size)}
              disabled={!isAvailable}
              aria-label={`Size ${size} ${isAvailable ? 'available' : 'out of stock'}`}
            >
              <span className="size-text">{getSizeLabel(size)}</span>
              
              {showStock && (
                <span className="stock-indicator">
                  {status === 'out-of-stock' && (
                    <span className="stock-status out">Out</span>
                  )}
                  {status === 'low-stock' && (
                    <span className="stock-status low">Low</span>
                  )}
                  {status === 'in-stock' && (
                    <span className="stock-status in">✓</span>
                  )}
                </span>
              )}

              {/* Touch feedback overlay */}
              <div className="touch-feedback"></div>
            </button>
          );
        })}
      </div>

      {/* Size Guide Link */}
      <div className="size-guide-link">
        <button 
          className="size-guide-btn"
          onClick={() => {
            // Trigger size guide modal/component
            const sizeGuideEvent = new CustomEvent('openSizeGuide');
            window.dispatchEvent(sizeGuideEvent);
          }}
        >
          📏 Size Guide
        </button>
      </div>

      {/* Stock Legend */}
      {showStock && (
        <div className="stock-legend">
          <div className="legend-item">
            <span className="legend-indicator in-stock"></span>
            <span>In Stock</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator low-stock"></span>
            <span>Low Stock</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator out-of-stock"></span>
            <span>Out of Stock</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouchSizeSelector;