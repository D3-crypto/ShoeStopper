import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Plus, Minus, ArrowLeft, Share2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import TouchSizeSelector from '../components/TouchSizeSelector';
import ProductReviews from '../components/ProductReviews';
import RecentlyViewed from '../components/RecentlyViewed';
import SizeGuide from '../components/SizeGuide';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Fetch product details (backend returns product with variants in single response)
        const response = await productsAPI.getById(id);
        const data = response.data;
        
        // Extract product and variants from the response
        const { variants, ...productData } = data;
        setProduct(productData);
        setVariants(variants || []);

        // Set default selections
        if (variants && variants.length > 0) {
          const firstVariant = variants[0];
          setSelectedSize(firstVariant.size);
          setSelectedColor(firstVariant.color);
          setSelectedVariant(firstVariant);
        }

      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    updateSelectedVariant(size, selectedColor);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    updateSelectedVariant(selectedSize, color);
  };

  const updateSelectedVariant = (size, color) => {
    const variant = variants.find(v => v.size === size && v.color === color);
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select size and color');
      return;
    }

    if (selectedVariant.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const cartItem = {
      ...product,
      variant: selectedVariant,
      quantity: quantity,
      selectedSize,
      selectedColor,
      price: selectedVariant.price
    };

    addToCart(cartItem);
    toast.success(`${product.title} added to cart!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getAvailableColors = () => {
    return [...new Set(variants.map(v => v.color))];
  };

  const getColorsForSize = (size) => {
    return variants.filter(v => v.size === size).map(v => v.color);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this amazing product: ${product.title}`,
      url: window.location.href
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Product shared successfully!');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } catch (error) {
      // If sharing fails or is cancelled, try to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      } catch {
        console.error('Error sharing product:', error);
        toast.error('Unable to share product. Please copy the URL manually.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse">
            {/* Image Thumbnails */}
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 bg-gray-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-sm font-medium uppercase text-gray-200 cursor-pointer hover:bg-gray-700/60 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-25 shadow-md border border-gray-600 ${
                      selectedImage === index ? 'ring-2 ring-blue-500 bg-gray-700' : ''
                    }`}
                  >
                    <span className="sr-only">Image {index + 1}</span>
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-600 overflow-hidden">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-700/50">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {product.title}
              </h1>

              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl tracking-tight text-white font-bold">
                  {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(product.price)}
                </p>
              </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="text-base text-gray-700">{product.description}</p>
            </div>

            {/* Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-200">Categories</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            {variants.length > 0 && (
              <div className="mt-8">
                <TouchSizeSelector
                  variants={variants}
                  selectedSize={selectedSize}
                  onSizeSelect={handleSizeChange}
                  showStock={true}
                  layout="grid"
                />
              </div>
            )}

            {/* Color Selection */}
            {variants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-200">Color</h3>

                <div className="mt-4">
                  <div className="flex items-center space-x-3">
                    {getAvailableColors().map((color) => {
                      const isAvailable = getColorsForSize(selectedSize).includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          disabled={!isAvailable}
                          className={`group relative border rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium capitalize hover:bg-gray-700/60 focus:outline-none ${
                            selectedColor === color
                              ? 'bg-blue-600 border-transparent text-white hover:bg-blue-700'
                              : isAvailable
                              ? 'bg-gray-800/60 border-gray-600 text-gray-200 cursor-pointer'
                              : 'bg-gray-900/60 border-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-6">
                <p className={`text-sm ${selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedVariant.stock > 0 
                    ? `${selectedVariant.stock} in stock`
                    : 'Out of stock'
                  }
                </p>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-200">Quantity</h3>
              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={selectedVariant && quantity >= selectedVariant.stock}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mt-10 flex sm:flex-col1">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="max-w-xs flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>

              <button className="ml-4 py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Add to favorites</span>
              </button>

              <button 
                onClick={handleShare}
                className="ml-4 py-3 px-3 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Section */}
      {product && (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <SizeGuide product={product} />
        </div>
      )}

      {/* Product Reviews Section */}
      {product && (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <ProductReviews productId={id} />
        </div>
      )}

      {/* Recently Viewed Products */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <RecentlyViewed currentProductId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;