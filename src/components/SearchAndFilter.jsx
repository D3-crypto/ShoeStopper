import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const SearchAndFilter = ({ onFiltersChange, onSearchChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    colors: [],
    sizes: [],
    materials: [],
    types: [],
    gender: [],
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    colors: [],
    sizes: [],
    materials: [],
    types: [],
    priceRange: { min: 0, max: 1000 }
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get('/products/filters/options');
        setFilterOptions(response.data.filters);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await api.get(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearchChange(searchQuery);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    onSearchChange(suggestion.title);
  };

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...filters };
    
    if (filterType === 'minPrice' || filterType === 'maxPrice' || filterType === 'sortBy') {
      newFilters[filterType] = value;
    } else if (filterType === 'gender') {
      newFilters.gender = checked ? [value] : [];
    } else {
      if (checked) {
        newFilters[filterType] = [...filters[filterType], value];
      } else {
        newFilters[filterType] = filters[filterType].filter(item => item !== value);
      }
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      brands: [],
      categories: [],
      colors: [],
      sizes: [],
      materials: [],
      types: [],
      gender: [],
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'sortBy') return count;
      if (Array.isArray(value)) return count + value.length;
      if (value && value !== '') return count + 1;
      return count;
    }, 0);
  };

  return (
    <div className="search-and-filter">
      {/* Search Bar */}
      <div className="search-container" ref={suggestionsRef}>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search for shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-title">{suggestion.title}</div>
                  {suggestion.brand && (
                    <div className="suggestion-brand">{suggestion.brand}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Filter Toggle */}
      <div className="filter-controls">
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters ({getActiveFilterCount()})
        </button>
        
        {getActiveFilterCount() > 0 && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
        )}

        <select 
          value={filters.sortBy} 
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="sort-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Price Range */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  min={filterOptions.priceRange.min}
                  max={filterOptions.priceRange.max}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  min={filterOptions.priceRange.min}
                  max={filterOptions.priceRange.max}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="filter-section">
              <h4>Gender</h4>
              <div className="filter-options">
                {['men', 'women', 'unisex', 'kids'].map(gender => (
                  <label key={gender} className="filter-option">
                    <input
                      type="radio"
                      name="gender"
                      checked={filters.gender.includes(gender)}
                      onChange={(e) => handleFilterChange('gender', gender, e.target.checked)}
                    />
                    <span>{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            {filterOptions.brands.length > 0 && (
              <div className="filter-section">
                <h4>Brands</h4>
                <div className="filter-options scrollable">
                  {filterOptions.brands.map(brand => (
                    <label key={brand} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={(e) => handleFilterChange('brands', brand, e.target.checked)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {filterOptions.categories.length > 0 && (
              <div className="filter-section">
                <h4>Categories</h4>
                <div className="filter-options scrollable">
                  {filterOptions.categories.map(category => (
                    <label key={category} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => handleFilterChange('categories', category, e.target.checked)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {filterOptions.sizes.length > 0 && (
              <div className="filter-section">
                <h4>Sizes</h4>
                <div className="filter-options size-grid">
                  {filterOptions.sizes.sort((a, b) => parseFloat(a) - parseFloat(b)).map(size => (
                    <label key={size} className="filter-option size-option">
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size)}
                        onChange={(e) => handleFilterChange('sizes', size, e.target.checked)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {filterOptions.colors.length > 0 && (
              <div className="filter-section">
                <h4>Colors</h4>
                <div className="filter-options color-grid">
                  {filterOptions.colors.map(color => (
                    <label key={color} className="filter-option color-option">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={(e) => handleFilterChange('colors', color, e.target.checked)}
                      />
                      <span 
                        className="color-swatch"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      ></span>
                      <span className="color-name">{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {filterOptions.materials.length > 0 && (
              <div className="filter-section">
                <h4>Materials</h4>
                <div className="filter-options">
                  {filterOptions.materials.map(material => (
                    <label key={material} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.materials.includes(material)}
                        onChange={(e) => handleFilterChange('materials', material, e.target.checked)}
                      />
                      <span>{material}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Types */}
            {filterOptions.types.length > 0 && (
              <div className="filter-section">
                <h4>Types</h4>
                <div className="filter-options">
                  {filterOptions.types.map(type => (
                    <label key={type} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(e) => handleFilterChange('types', type, e.target.checked)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;