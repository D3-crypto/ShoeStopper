import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ShoeStopper
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your ultimate destination for premium footwear. We curate the finest collection 
              of shoes that blend style, comfort, and quality for every lifestyle.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-gray-300 hover:text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-gray-300 hover:text-white hover:bg-blue-400 transition-all duration-300 transform hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-xl">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-6 text-xl">Need Help?</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Customer Support
                </Link>
              </li>
              <li>
                <span className="text-gray-300">
                  Email: support@shoestopper.com
                </span>
              </li>
              <li>
                <span className="text-gray-300">
                  Phone: +1 (555) 123-SHOE
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 ShoeStopper. All rights reserved. Made with ❤️ for shoe lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
