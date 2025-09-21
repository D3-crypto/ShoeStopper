import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    size: '',
    fit: 'true_to_size'
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page: currentPage, sort: sortBy }
      });
      
      setReviews(response.data.reviews);
      setRatingDistribution(response.data.ratingDistribution);
      setTotalReviews(response.data.totalReviews);
      setTotalPages(response.data.totalPages);
      
      // Calculate average rating
      if (response.data.ratingDistribution.length > 0) {
        const totalRatings = response.data.ratingDistribution.reduce((sum, dist) => sum + dist.count, 0);
        const weightedSum = response.data.ratingDistribution.reduce((sum, dist) => sum + (dist._id * dist.count), 0);
        setAverageRating((weightedSum / totalRatings).toFixed(1));
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, currentPage, fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to submit a review');
      return;
    }

    try {
      await api.post('/reviews', {
        productId,
        ...reviewForm
      });
      
      setShowReviewForm(false);
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
        size: '',
        fit: 'true_to_size'
      });
      
      fetchReviews(); // Refresh reviews
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      setError('Please login to mark reviews as helpful');
      return;
    }

    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      
      // Update the review in the list
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, helpful: response.data.helpful }
          : review
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update helpful status');
    }
  };

  const renderStars = (rating, size = 'medium') => {
    const sizeClass = size === 'large' ? 'star-large' : size === 'small' ? 'star-small' : 'star-medium';
    
    return (
      <div className={`stars ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={star <= rating ? 'star filled' : 'star'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    return (
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map(rating => {
          const dist = ratingDistribution.find(d => d._id === rating);
          const count = dist ? dist.count : 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="rating-bar">
              <span className="rating-label">{rating} ★</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="rating-count">({count})</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        
        <div className="reviews-summary">
          <div className="average-rating">
            <div className="rating-number">{averageRating}</div>
            {renderStars(Math.round(averageRating), 'large')}
            <div className="total-reviews">Based on {totalReviews} reviews</div>
          </div>
          
          {renderRatingDistribution()}
        </div>
        
        <div className="reviews-actions">
          <button 
            className="write-review-btn"
            onClick={() => setShowReviewForm(true)}
            disabled={!user}
          >
            {user ? 'Write a Review' : 'Login to Write Review'}
          </button>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-form-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="review-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Write a Review</h4>
              <button onClick={() => setShowReviewForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="review-title">Review Title *</label>
                <input
                  id="review-title"
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  required
                  maxLength={100}
                  placeholder="Summarize your review"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="review-comment">Your Review *</label>
                <textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  maxLength={1000}
                  rows={4}
                  placeholder="Tell others about your experience with this product"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="review-size">Size Purchased</label>
                  <input
                    id="review-size"
                    type="text"
                    value={reviewForm.size}
                    onChange={(e) => setReviewForm({ ...reviewForm, size: e.target.value })}
                    placeholder="e.g., 9, 9.5, 10"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="review-fit">How does it fit?</label>
                  <select
                    id="review-fit"
                    value={reviewForm.fit}
                    onChange={(e) => setReviewForm({ ...reviewForm, fit: e.target.value })}
                  >
                    <option value="runs_small">Runs Small</option>
                    <option value="true_to_size">True to Size</option>
                    <option value="runs_large">Runs Large</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </button>
                <button type="submit">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.userId?.name || 'Anonymous'}</span>
                  {review.verified && <span className="verified-badge">Verified Purchase</span>}
                </div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="review-rating">
                {renderStars(review.rating, 'small')}
                <span className="review-title">{review.title}</span>
              </div>
              
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
              
              <div className="review-details">
                {review.size && <span className="review-size">Size: {review.size}</span>}
                <span className="review-fit">
                  Fit: {review.fit === 'runs_small' ? 'Runs Small' : 
                        review.fit === 'runs_large' ? 'Runs Large' : 'True to Size'}
                </span>
              </div>
              
              <div className="review-actions">
                <button 
                  className="helpful-btn"
                  onClick={() => handleHelpful(review._id)}
                  disabled={!user}
                >
                  👍 Helpful ({review.helpful || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="reviews-pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;