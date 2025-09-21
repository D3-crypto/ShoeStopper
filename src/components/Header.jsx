import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="bg-gray-900/95 backdrop-blur-lg shadow-2xl sticky top-0 z-50 border-b border-gray-700/60">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-blue-400 transition-all duration-300">
              ShoeStopper
            </Link>

            {/* Search bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search for your perfect shoes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-12 py-3 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-600/50 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300 group-hover:bg-gray-700/50"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right side icons */}
            <div className="flex items-center space-x-2">
              {/* Cart icon - always visible */}
              <Link to="/cart" className="relative p-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/wishlist" className="p-3 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200">
                      <Heart className="w-6 h-6" />
                    </Link>
                    <div className="relative group">
                      <button className="flex items-center space-x-2 p-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200">
                        <User className="w-6 h-6" />
                        <span className="hidden lg:block font-medium text-white">{user?.name}</span>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 border border-gray-700/50">
                        <Link to="/profile" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                          <ShoppingCart className="w-4 h-4 mr-3" />
                          My Orders
                        </Link>
                        <div className="border-t border-gray-600/50 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-3 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-600/50 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-400 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700/50 py-4 bg-gray-800/95 backdrop-blur-md">
              <div className="flex flex-col space-y-2">
                {/* Cart - always visible */}
                <Link
                  to="/cart"
                  className="flex items-center space-x-3 p-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({cartCount})</span>
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-3 p-3 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span>Wishlist</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="p-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
