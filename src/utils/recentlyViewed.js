// Utility functions for recently viewed products

// Add product to localStorage for guest users
export const addToLocalRecentlyViewed = (product) => {
  try {
    const recent = localStorage.getItem('recentlyViewed');
    let recentArray = recent ? JSON.parse(recent) : [];
    
    // Remove if already exists
    recentArray = recentArray.filter(item => item._id !== product._id);
    
    // Add to beginning
    recentArray.unshift(product);
    
    // Keep only last 20
    recentArray = recentArray.slice(0, 20);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentArray));
  } catch (error) {
    console.error('Error saving to localStorage recently viewed:', error);
  }
};

// Get recently viewed from localStorage
export const getLocalRecentlyViewed = (limit = 20) => {
  try {
    const recent = localStorage.getItem('recentlyViewed');
    if (recent) {
      const parsed = JSON.parse(recent);
      return parsed.slice(0, limit);
    }
  } catch (error) {
    console.error('Error parsing localStorage recently viewed:', error);
  }
  return [];
};

// Clear recently viewed from localStorage
export const clearLocalRecentlyViewed = () => {
  try {
    localStorage.removeItem('recentlyViewed');
  } catch (error) {
    console.error('Error clearing localStorage recently viewed:', error);
  }
};