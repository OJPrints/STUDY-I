import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Demo accounts for testing different dashboards (kept for backward compatibility)
const DEMO_ACCOUNTS = {
  'student@demo.com': {
    id: 1,
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'student@demo.com',
    avatar: '',
    role: 'student',
    department: 'Computer Science'
  },
  'instructor@demo.com': {
    id: 2,
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'instructor@demo.com',
    avatar: '',
    role: 'instructor',
    department: 'Computer Science'
  },
  'ojterry@gmail.com': {
    id: 3,
    firstName: 'OJ',
    lastName: 'Terry',
    email: 'ojterry@gmail.com',
    avatar: '',
    role: 'admin',
    department: 'Platform Management'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(1247); // Demo user count

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Helper function to make API calls
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error('Server returned invalid JSON response');
        }
      } else {
        // If not JSON, get text and create error
        const text = await response.text();
        console.error('Non-JSON response:', text);

        // Handle rate limiting or other text responses
        if (text.includes('Too many')) {
          throw new Error('Too many attempts. Please try again later.');
        }

        throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call error:', error);

      // Handle specific error types
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        throw new Error('Server returned invalid response. Please try again.');
      }

      throw error;
    }
  };

  const login = async (email, password) => {
    setLoading(true);

    try {
      // First try real API login for production accounts
      try {
        const response = await apiCall('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (response.success) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('token', response.token);
          setLoading(false);
          toast.success('Logged in successfully!');
          return { success: true, user: response.user };
        }
      } catch (apiError) {
        // If API login fails, try demo accounts as fallback
        console.log('API login failed, trying demo accounts...');
      }

      // Fallback to demo accounts for backward compatibility
      if (DEMO_ACCOUNTS[email]) {
        // For your admin account, check the password
        if (email === 'ojterry@gmail.com' && password === 'terry2000') {
          const userData = DEMO_ACCOUNTS[email];
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', 'demo-token'); // Demo token
          setLoading(false);
          toast.success('Logged in successfully (Demo Mode)');
          return { success: true, user: userData };
        }
        // For other demo accounts, use default password
        else if (email !== 'ojterry@gmail.com' && password === 'password123') {
          const userData = DEMO_ACCOUNTS[email];
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', 'demo-token'); // Demo token
          setLoading(false);
          toast.success('Logged in successfully (Demo Mode)');
          return { success: true, user: userData };
        }
        // Wrong password for demo account
        else {
          setLoading(false);
          throw new Error('Invalid email or password');
        }
      }

      // If neither API nor demo login worked
      setLoading(false);
      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    setLoading(true);

    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        setUserCount(prev => prev + 1);
        toast.success('Registration successful!');
        setLoading(false);
        return { success: true, user: response.user };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      loading,
      demoAccounts: DEMO_ACCOUNTS,
      userCount,
      setUserCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 