import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddToCartModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedSize) {
      alert('Please select a color and size');
      return;
    }

    const sizeInfo = selectedVariant.sizes?.find(s => s.size === selectedSize);
    if (!sizeInfo || sizeInfo.stock < quantity) {
      alert('Selected size is out of stock or insufficient quantity');
      return;
    }

    try {
      setLoading(true);
      await onAddToCart(selectedVariant._id, selectedSize, quantity);
      onClose();
      // Reset form
      setSelectedVariant(null);
      setSelectedSize('');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSizeInfo = selectedVariant?.sizes?.find(s => s.size === selectedSize);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Add to Cart</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <img
              src={product.images?.[0] || '/placeholder-shoe.jpg'}
              alt={product.title}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{product.title}</h4>
              <p className="text-gray-600 text-sm">{product.brand}</p>
              <p className="text-lg font-bold text-blue-600">
                {selectedSizeInfo ? `$${selectedSizeInfo.price}` : `$${product.price}`}
              </p>
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Color *
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants?.map((variant) => (
                <button
                  key={variant._id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedSize(''); // Reset size when color changes
                  }}
                  className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                    selectedVariant?._id === variant._id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {variant.color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          {selectedVariant && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Size *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {selectedVariant.sizes?.map((sizeInfo) => (
                  <button
                    key={sizeInfo.size}
                    onClick={() => setSelectedSize(sizeInfo.size)}
                    disabled={sizeInfo.stock === 0}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      sizeInfo.stock === 0
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : selectedSize === sizeInfo.size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{sizeInfo.size}</div>
                      {sizeInfo.stock === 0 ? (
                        <div className="text-xs text-red-500">Out</div>
                      ) : (
                        <div className="text-xs text-green-600">{sizeInfo.stock}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedSize && selectedSizeInfo && (
                <p className="text-sm text-gray-600 mt-2">
                  Price: <span className="font-semibold">${selectedSizeInfo.price}</span> • 
                  Stock: <span className="font-semibold">{selectedSizeInfo.stock} available</span>
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          {selectedSize && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedSizeInfo?.stock || 1, quantity + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || !selectedSize || loading}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
              !selectedVariant || !selectedSize
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : loading
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;