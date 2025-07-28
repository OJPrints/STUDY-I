import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaGraduationCap,
  FaBuilding,
  FaUserTie
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: 'student',
      label: 'Student',
      icon: <FaGraduationCap />,
      description: 'Access course materials and participate in discussions'
    },
    {
      value: 'instructor',
      label: 'Instructor',
      icon: <FaUserTie />,
      description: 'Upload content and manage course discussions'
    }
  ];

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
            <h1>Create Account</h1>
            <p>Join our learning community and start your educational journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaUser />
                  First Name
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter your first name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaUser />
                  Last Name
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter your last name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName.message}</span>
                )}
              </div>
            </div>

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
                <FaBuilding />
                Department
              </label>
              <select
                className={`form-input ${errors.department ? 'error' : ''}`}
                {...register('department', {
                  required: 'Department is required',
                })}
              >
                <option value="">Select your department</option>
                <option value="computer-science">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="business">Business</option>
                <option value="arts">Arts & Humanities</option>
                <option value="science">Natural Sciences</option>
                <option value="medicine">Medicine</option>
                <option value="law">Law</option>
                <option value="education">Education</option>
              </select>
              {errors.department && (
                <span className="error-message">{errors.department.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-selection">
                {roles.map((role) => (
                  <label key={role.value} className="role-option">
                    <input
                      type="radio"
                      value={role.value}
                      {...register('role', {
                        required: 'Please select a role',
                      })}
                    />
                    <div className="role-content">
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-info">
                        <h4>{role.label}</h4>
                        <p>{role.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <span className="error-message">{errors.role.message}</span>
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
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
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

            <div className="form-group">
              <label className="form-label">
                <FaLock />
                Confirm Password
              </label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword.message}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('agreeToTerms', {
                    required: 'You must agree to the terms and conditions',
                  })}
                />
                <span className="checkmark"></span>
                I agree to the{' '}
                <Link to="/terms" className="auth-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="auth-link">
                  Privacy Policy
                </Link>
              </label>
              {errors.agreeToTerms && (
                <span className="error-message">{errors.agreeToTerms.message}</span>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
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
            <h2>Join Our Learning Community</h2>
            <p>
              Connect with peers, access personalized content, and engage in 
              meaningful discussions that enhance your learning experience.
            </p>
            <div className="illustration-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaGraduationCap />
                </div>
                <span>Personalized Learning</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaBuilding />
                </div>
                <span>Department Discussions</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaUserTie />
                </div>
                <span>Expert Instructors</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 