import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:4000/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      });
      
      const { user: userData, tokens, token: directToken, access: directAccess } = response.data;
      
      // Handle different response formats
      let finalToken;
      if (tokens && tokens.access) {
        finalToken = tokens.access; // New format: { tokens: { access: "...", refresh: "..." } }
      } else if (directToken) {
        finalToken = directToken; // Format: { token: "...", user: {...} }
      } else if (directAccess) {
        finalToken = directAccess; // Format: { access: "...", refresh: "..." }
      }
      
      if (!finalToken) {
        throw new Error('No access token received');
      }
      
      setToken(finalToken);
      localStorage.setItem('token', finalToken);
      
      if (userData) {
        setUser(userData);
      } else {
        // Fallback: set basic user info
        setUser({ 
          email: email, 
          name: 'User',
          authenticated: true 
        });
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/signup', {
        name,
        email,
        password,
        phone
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
