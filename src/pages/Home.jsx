import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, Star, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../utils/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getAll({ featured: 'true' });
        setFeaturedProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    {
      name: "Men's Collection",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/categories/men",
      description: "Discover premium men's footwear"
    },
    {
      name: "Women's Collection",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/categories/women",
      description: "Elegant styles for every occasion"
    },
    {
      name: "Athletic & Sports",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/categories/sports",
      description: "Performance meets style"
    },
    {
      name: "Casual Comfort",
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      link: "/categories/casual",
      description: "Everyday comfort redefined"
    }
  ];

  const features = [
    {
      icon: <Truck className="w-12 h-12" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Secure Payment",
      description: "256-bit SSL encryption for safe transactions",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: "Premium Quality",
      description: "Handpicked shoes from trusted brands",
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                  <Sparkles className="w-5 h-5 mr-3 text-blue-400" />
                  <span className="text-blue-300 font-medium">New Collection 2025</span>
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-black leading-tight">
                  <span className="text-white">Step Into</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Excellence
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Discover the perfect blend of style, comfort, and innovation. Our curated collection features the world's finest footwear.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-flex items-center justify-center"
                >
                  Shop Now
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/categories"
                  className="group border-2 border-gray-600 bg-gray-800/30 backdrop-blur-sm text-gray-200 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-700/40 hover:border-gray-500 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Explore Categories
                  <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative z-20">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Premium Shoes"
                    className="w-full h-96 object-cover rounded-2xl"
                  />
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-6 -left-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-2xl z-30">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-blue-100 text-sm">Happy Customers</div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow-2xl z-30">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-purple-100 text-sm">Premium Styles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Discover Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Collections</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From athletic performance to elegant sophistication, find your perfect style in our expertly curated categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl hover:border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {category.description}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    <span className="inline-flex items-center text-blue-400 font-semibold">
                      Explore Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 relative">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA0NCA0NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyMiIgY3k9IjIyIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                Featured <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Products</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Handpicked selections from our premium collection, featuring the latest trends and timeless classics
              </p>
            </div>
            <Link
              to="/products"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center"
            >
              View All Collection
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded-3xl h-96 border border-gray-700"></div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No featured products available at the moment.</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`grid gap-10 ${
                featuredProducts.length === 1 
                  ? 'grid-cols-1 max-w-md' 
                  : featuredProducts.length === 2 
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl' 
                  : featuredProducts.length === 3 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl'
              }`}>
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center mt-16 lg:hidden">
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              View All Products
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ShoeStopper?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of style, quality, and service that sets us apart
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl hover:border-gray-600/50 transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="relative text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="relative text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 via-gray-900 to-black relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8">
                Our <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Story</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  Founded with a passion for exceptional footwear, ShoeStopper began as a simple idea: 
                  everyone deserves shoes that make them feel confident and comfortable.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide, curating the finest 
                  collection of shoes from emerging designers to established brands.
                </p>
                <p>
                  Our commitment goes beyond just selling shoes - we're building a community of 
                  style enthusiasts who value quality, comfort, and authentic expression.
                </p>
              </div>
              <div className="flex items-center space-x-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">50K+</div>
                  <div className="text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">1000+</div>
                  <div className="text-gray-400">Styles Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">99%</div>
                  <div className="text-gray-400">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Our Store"
                  className="w-full h-96 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8">
              Stay in the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Loop</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed">
              Be the first to discover new arrivals, exclusive offers, and style inspiration
            </p>
            
            <div className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300 text-lg"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-6">
                No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
