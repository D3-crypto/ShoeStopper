import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, X, Sliders } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../utils/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Filter states
  const [filters, setFilters] = useState({
    categories: [],
    search: searchParams.get('q') || ''
  });

  const categories = [
    { name: 'Running', color: 'from-blue-500 to-cyan-500' },
    { name: 'Sports', color: 'from-pink-500 to-purple-500' },
    { name: 'Casual', color: 'from-green-500 to-emerald-500' },
    { name: 'Classic', color: 'from-orange-500 to-red-500' },
    { name: 'Skateboarding', color: 'from-indigo-500 to-blue-500' },
    { name: 'Premium', color: 'from-gray-500 to-slate-500' },
    { name: 'Retro', color: 'from-cyan-500 to-blue-500' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        q: filters.search,  // Backend expects 'q' not 'search'
        category: filters.categories.join(','),  // Backend expects 'category' not 'categories'
        // Note: Backend doesn't support price filtering yet, would need to be added
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      search: ''
    });
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    return filters.categories.length + 
           (filters.search ? 1 : 0);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'oldest', label: 'Oldest First', icon: '📅' },
    { value: 'price-low', label: 'Price: Low to High', icon: '⬆️' },
    { value: 'price-high', label: 'Price: High to Low', icon: '⬇️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Discover <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Shoes</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {loading ? 'Loading amazing shoes...' : `Found ${products.length} perfect matches for you`}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Filter Button & Active Count */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Sliders className="w-5 h-5" />
                  <span>Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-white/20 text-white rounded-full text-xs px-2 py-1 font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Sort & View Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-md' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Filter */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Products
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Type to search..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Categories</h4>
                <div className="space-y-3">
                  {categories.map(category => (
                    <label key={category.name} className="flex items-center group cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.name)}
                          onChange={() => handleCategoryChange(category.name)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 ${
                          filters.categories.includes(category.name)
                            ? `bg-gradient-to-br ${category.color} border-transparent`
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}>
                          {filters.categories.includes(category.name) && (
                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="ml-3 text-gray-700 group-hover:text-blue-600 transition-colors font-medium">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(9)].map((_, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-3xl h-96"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">�</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No shoes found</h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  We couldn't find any shoes matching your criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
