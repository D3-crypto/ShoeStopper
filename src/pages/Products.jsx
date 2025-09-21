import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, X, Sliders } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchAndFilter from '../components/SearchAndFilter';
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
        q: filters.search,
        category: filters.categories.join(','),
      };

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

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const getActiveFiltersCount = () => {
    return filters.categories.length + (filters.search ? 1 : 0);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'oldest', label: 'Oldest First', icon: '📅' },
    { value: 'price-low', label: 'Price: Low to High', icon: '⬆️' },
    { value: 'price-high', label: 'Price: High to Low', icon: '⬇️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Discover <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Perfect Shoes</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {loading ? 'Loading amazing shoes...' : `Found ${products.length} perfect matches for you`}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-gray-700/50">
            {/* Advanced Search and Filter Component */}
            <div className="mb-6">
              <SearchAndFilter 
                onFiltersChange={(newFilters) => setFilters(newFilters)}
                onSearch={handleSearch}
                initialFilters={filters}
              />
            </div>
            
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
                    className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
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
                    className="appearance-none bg-gray-800/60 backdrop-blur-sm border-2 border-gray-600 rounded-2xl px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm text-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-800/60 rounded-2xl p-1 border border-gray-600">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
            <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-gray-700/50 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 text-gray-300 hover:text-red-400 hover:bg-red-900/50 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Filter */}
              <div className="mb-8">
                <label className="block font-semibold text-gray-200 mb-3 text-lg">
                  Search Products
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Type to search..."
                  className="w-full px-4 py-3 bg-gray-800/60 border-2 border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-200 mb-4 text-lg">Categories</h4>
                <div className="space-y-3">
                  {categories.map(category => (
                    <label key={category.name} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.name)}
                        onChange={() => handleCategoryChange(category.name)}
                        className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 bg-gradient-to-r ${category.color} text-white shadow-md group-hover:shadow-lg group-hover:scale-105`}>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded-3xl h-96 border border-gray-700"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-12 shadow-lg border border-gray-700/50">
                  <h3 className="text-2xl font-bold text-gray-200 mb-4">No products found</h3>
                  <p className="text-gray-400 mb-8">Try adjusting your filters or search terms</p>
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-6"
              }>
                {products.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                  />
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