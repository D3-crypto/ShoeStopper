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
    const sizeClass = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-sm' : 'text-lg';
    
    return (
      <div className={`flex items-center gap-1 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-white mb-4">Rating Distribution</h4>
        {[5, 4, 3, 2, 1].map(rating => {
          const dist = ratingDistribution.find(d => d._id === rating);
          const count = dist ? dist.count : 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-yellow-400 w-8">{rating} ★</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-gray-300 text-sm w-8">({count})</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-700/50">
        <div className="text-center text-gray-300">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-700/50">
      <div className="mb-8">
        <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Customer Reviews
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{averageRating}</div>
              {renderStars(Math.round(averageRating), 'large')}
              <div className="text-gray-300 mt-2">Based on {totalReviews} reviews</div>
            </div>
          </div>
          
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
            {renderRatingDistribution()}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            onClick={() => setShowReviewForm(true)}
            disabled={!user}
          >
            {user ? 'Write a Review' : 'Login to Write Review'}
          </button>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800/60 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

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
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-600">
            <p className="text-gray-300 text-lg">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{review.userId?.name || 'Anonymous'}</span>
                  {review.verified && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="text-gray-400 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                {renderStars(review.rating, 'small')}
                <span className="font-medium text-white">{review.title}</span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 leading-relaxed">{review.comment}</p>
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                {review.size && (
                  <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                    Size: {review.size}
                  </span>
                )}
                <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full">
                  Fit: {review.fit === 'runs_small' ? 'Runs Small' : 
                        review.fit === 'runs_large' ? 'Runs Large' : 'True to Size'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <button 
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
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