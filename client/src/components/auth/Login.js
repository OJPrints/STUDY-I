import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGraduationCap, FaUserGraduate, FaUserTie, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(data.email, data.password);
      if (result && result.success) {
        navigate('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/STUDYI.png" alt="STUDY-i" />
              <span>STUDY-i</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue learning</p>
          </div>

          {/* Demo Accounts Info */}
          <div className="demo-accounts">
            <h3>Demo Accounts</h3>
            <p>Use these accounts to test different dashboards:</p>
            <div className="demo-account-list">
              <div className="demo-account">
                <div className="demo-account-icon">
                  <FaUserGraduate />
                </div>
                <div className="demo-account-info">
                  <strong>Student Dashboard</strong>
                  <span>Email: student@demo.com</span>
                  <span>Password: any password</span>
                </div>
              </div>
              <div className="demo-account">
                <div className="demo-account-icon">
                  <FaUserTie />
                </div>
                <div className="demo-account-info">
                  <strong>Instructor Dashboard</strong>
                  <span>Email: instructor@demo.com</span>
                  <span>Password: any password</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FaEnvelope />
                Email Address
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            {error && (
              <div className="error-message global-error">
                {error}
              </div>
            )}

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" {...register('remember')} />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-auth">
            <button className="btn btn-outline btn-full">
              Continue with Google
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="auth-illustration"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="illustration-content">
            <h2>Transform Your Learning Journey</h2>
            <p>
              Access personalized content, engage in real-time discussions, and 
              collaborate with peers and instructors in your department.
            </p>
            <div className="illustration-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaGraduationCap />
                </div>
                <span>Personalized Dashboard</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaEnvelope />
                </div>
                <span>Real-time Chat</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaLock />
                </div>
                <span>Secure Access</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 