import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchAndFilter from '../components/SearchAndFilter';
import api from '../utils/api';
import './BrandPage.css';

const BrandPage = () => {
  const { brandName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({});

  const fetchBrandProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/brand/${encodeURIComponent(brandName)}`, {
        params: {
          page: currentPage,
          sortBy,
          ...filters
        }
      });
      
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      setTotalProducts(response.data.pagination.totalProducts);
      setError('');
    } catch (err) {
      setError('Failed to load brand products');
      console.error('Error fetching brand products:', err);
    } finally {
      setLoading(false);
    }
  }, [brandName, currentPage, sortBy, filters]);

  useEffect(() => {
    fetchBrandProducts();
  }, [fetchBrandProducts]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // Fetch with new filters
    fetchBrandProductsWithFilters(newFilters);
  };

  const fetchBrandProductsWithFilters = async (appliedFilters) => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: {
          brand: brandName,
          page: 1,
          sortBy: appliedFilters.sortBy || sortBy,
          ...appliedFilters
        }
      });
      
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      setTotalProducts(response.data.pagination.totalProducts);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to filter products');
      console.error('Error filtering products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (searchQuery) => {
    const newFilters = { ...filters, q: searchQuery, brand: brandName };
    handleFiltersChange(newFilters);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="brand-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading {brandName} products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-page">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-info">
          <h1>{brandName}</h1>
          <p className="brand-description">
            Discover the latest collection from {brandName}. 
            {totalProducts > 0 && ` ${totalProducts} products available.`}
          </p>
        </div>
        
        {/* Brand Logo/Banner */}
        <div className="brand-banner">
          <img 
            src={`/brands/${brandName.toLowerCase()}-banner.jpg`}
            alt={`${brandName} collection`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filters */}
      <div className="brand-controls">
        <SearchAndFilter
          onFiltersChange={handleFiltersChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Products Grid */}
      <div className="brand-content">
        {loading ? (
          <div className="products-loading">
            <div className="loading-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="products-header">
              <div className="results-info">
                Showing {products.length} of {totalProducts} products
              </div>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <div className="products-grid">
              {products.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  showBrand={false} // Don't show brand since we're on brand page
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <div className="pagination-pages">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isVisible = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2);

                    if (!isVisible) {
                      return page === currentPage - 3 || page === currentPage + 3 ? (
                        <span key={page} className="pagination-ellipsis">...</span>
                      ) : null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products">
            <div className="no-products-content">
              <h3>No products found</h3>
              <p>
                We couldn't find any {brandName} products matching your criteria.
                Try adjusting your filters or search terms.
              </p>
              <button 
                onClick={() => {
                  setFilters({});
                  fetchBrandProducts();
                }}
                className="clear-filters-btn"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Brand Info Section */}
      <div className="brand-info-section">
        <div className="brand-story">
          <h2>About {brandName}</h2>
          <div className="brand-content-grid">
            <div className="brand-text">
              <p>
                {brandName} is committed to delivering high-quality footwear that combines 
                style, comfort, and durability. Our collection features the latest trends 
                and timeless classics that cater to every lifestyle.
              </p>
              <p>
                Whether you're looking for athletic shoes, casual sneakers, or formal footwear, 
                {brandName} has something for everyone. Each product is crafted with attention 
                to detail and made from premium materials.
              </p>
            </div>
            
            <div className="brand-features">
              <h3>Why Choose {brandName}?</h3>
              <ul>
                <li>Premium quality materials</li>
                <li>Comfortable fit and feel</li>
                <li>Latest fashion trends</li>
                <li>Durable construction</li>
                <li>Wide range of sizes</li>
                <li>Excellent customer reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;